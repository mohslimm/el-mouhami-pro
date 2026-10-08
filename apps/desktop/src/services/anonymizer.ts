/**
 * Service d'Anonymisation et de Masquage Local (Censure PII - Secret Professionnel)
 * Conçu pour tourner 100% en mémoire locale sur machines à faibles ressources (<2 Go RAM).
 * Version: 3.0.1 (Clean Unicode Escapes)
 */

export interface KnownParty {
  name: string
  role?: 'client' | 'defendant' | 'other'
}

export interface AnonymizationMapping {
  [token: string]: string
}

export interface MaskResult {
  maskedText: string
  mapping: AnonymizationMapping
  stats: {
    phonesCount: number
    dossiersCount: number
    datesCount: number
    ninCount: number
    namesCount: number
  }
}

/**
 * Expression Régulières optimisées pour le contexte juridique algérien
 */
const REGEX_PATTERNS = {
  // Numéros de téléphone algériens: +213 X XX XX XX XX, 05/06/07XX XX XX XX, 021/023/031/041 XX XX XX
  phone: /(?:\+213|0)(?:[5-7]\d{8}|[2-4]\d{7})/g,

  // Numéros de dossier / Rôle greffe: 24/0015, 1234/2026, 2026/Q-1234, 00412/24
  dossier: /\b(?:\d{2,5}\/\d{2,4}|\d{4}\/[A-Z]-\d{3,5})\b/gi,

  // Dates: JJ/MM/AAAA, JJ-MM-AAAA, AAAA-MM-JJ
  date: /\b(?:\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})\b/g,

  // Numéro d'Identification National (NIN algérien - 18 chiffres)
  nin: /\b\d{18}\b/g,
}

const ARABIC_RANGE = /[\u0600-\u06FF]/

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeArabicForMatch(value: string): string {
  return value
    .replace(/[\u064B-\u0652\u0670]/g, '') // tashkeel
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Masque les noms de personnes connus (parties du dossier) par correspondance explicite.
 * REMARQUE ARCHITECTURALE : Il s'agit d'un masquage déterministe ciblé sur les parties connues du dossier,
 * et non d'une reconnaissance générale d'entités (NER). Cela évite les faux positifs et faux négatifs des regex.
 */
function maskKnownNames(
  text: string,
  knownParties: KnownParty[],
  mapping: Record<string, string>
): { text: string; count: number } {
  let result = text
  let count = 0
  const sorted = [...knownParties]
    .filter((p) => p.name && p.name.trim().length >= 2)
    .sort((a, b) => b.name.length - a.name.length)

  for (const party of sorted) {
    const name = party.name.trim()
    const isArabicName = ARABIC_RANGE.test(name)
    if (isArabicName) {
      if (normalizeArabicForMatch(result).includes(normalizeArabicForMatch(name))) {
        const pattern = new RegExp(escapeRegExp(name), 'g')
        if (pattern.test(result)) {
          count++
          const token = `[NOM_${count}]`
          mapping[token] = name
          result = result.replace(pattern, token)
        }
      }
    } else {
      const pattern = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'gi')
      if (pattern.test(result)) {
        count++
        const token = `[NOM_${count}]`
        mapping[token] = name
        result = result.replace(pattern, token)
      }
    }
  }
  return { text: result, count }
}

/**
 * Masque les données sensibles (PII & Noms de parties connues) dans le texte dicté avant tout envoi cloud.
 */
export function maskSensitiveData(text: string, knownParties: KnownParty[] = []): MaskResult {
  if (!text || text.trim() === '') {
    return {
      maskedText: '',
      mapping: {},
      stats: { phonesCount: 0, dossiersCount: 0, datesCount: 0, ninCount: 0, namesCount: 0 },
    }
  }

  const mapping: AnonymizationMapping = {}
  let maskedText = text

  let phonesCount = 0
  let dossiersCount = 0
  let datesCount = 0
  let ninCount = 0

  // 1. Masquage des numéros de téléphone
  maskedText = maskedText.replace(REGEX_PATTERNS.phone, (match) => {
    phonesCount++
    const token = `[TEL_${phonesCount}]`
    mapping[token] = match
    return token
  })

  // 2. Masquage des numéros de dossier
  maskedText = maskedText.replace(REGEX_PATTERNS.dossier, (match) => {
    dossiersCount++
    const token = `[DOSSIER_${dossiersCount}]`
    mapping[token] = match
    return token
  })

  // 3. Masquage des dates
  maskedText = maskedText.replace(REGEX_PATTERNS.date, (match) => {
    datesCount++
    const token = `[DATE_${datesCount}]`
    mapping[token] = match
    return token
  })

  // 4. Masquage des NIN
  maskedText = maskedText.replace(REGEX_PATTERNS.nin, (match) => {
    ninCount++
    const token = `[NIN_${ninCount}]`
    mapping[token] = match
    return token
  })

  // 5. Masquage des noms de parties connues
  const { text: textWithMaskedNames, count: namesCount } = maskKnownNames(maskedText, knownParties, mapping)
  maskedText = textWithMaskedNames

  return {
    maskedText,
    mapping,
    stats: {
      phonesCount,
      dossiersCount,
      datesCount,
      ninCount,
      namesCount,
    },
  }
}

/**
 * Ré-hydrate le JSON structuré renvoyé par l'API cloud en remplaçant les tokens par les vraies valeurs sensibles.
 */
export function unmaskData<T>(data: T, mapping: AnonymizationMapping): T {
  if (!data || Object.keys(mapping).length === 0) {
    return data
  }

  const replaceTokensInString = (str: string): string => {
    let result = str
    for (const [token, originalValue] of Object.entries(mapping)) {
      result = result.split(token).join(originalValue)
    }
    return result
  }

  const traverseAndUnmask = (val: unknown): unknown => {
    if (typeof val === 'string') {
      return replaceTokensInString(val)
    }

    if (Array.isArray(val)) {
      return val.map((item) => traverseAndUnmask(item))
    }

    if (val !== null && typeof val === 'object') {
      const obj = val as Record<string, unknown>
      const newObj: Record<string, unknown> = {}
      for (const key of Object.keys(obj)) {
        newObj[key] = traverseAndUnmask(obj[key])
      }
      return newObj
    }

    return val
  }

  return traverseAndUnmask(data) as T
}

