// aiActions.ts
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (AI ACTION & SEARCH CATALOG)
// Catalogue d'actions fermé, typé et résolveur d'intentions bilingue (FR/AR)
// ─────────────────────────────────────────────────────────────────────────────

export type ActionRiskLevel = 'low' | 'medium' | 'high'

export interface ActionParamSpec {
  name: string
  type: 'string' | 'number' | 'date'
  required: boolean
  labelFr: string
  labelAr: string
}

export interface ActionDefinition {
  id: string
  descriptionFr: string
  descriptionAr: string
  riskLevel: ActionRiskLevel
  requiresConfirmation: boolean
  params: ActionParamSpec[]
}

// ─── CATALOGUE FERMÉ D'ACTIONS DE CONFIANCE ───
export const AI_ACTIONS_CATALOG: Record<string, ActionDefinition> = {
  navigate_to: {
    id: 'navigate_to',
    descriptionFr: "Naviguer vers un module de l'application (Dossiers, Agenda, Finances, Scanner, CPCA)",
    descriptionAr: "الانتقال إلى إحدى وحدات التطبيق (الملفات، الأجندة، الأتعاب، الماسح الضوئي، حساب CPCA)",
    riskLevel: 'low',
    requiresConfirmation: false,
    params: [
      { name: 'target', type: 'string', required: true, labelFr: 'Module Cible', labelAr: 'الوحدة Target' },
    ],
  },
  open_dossier: {
    id: 'open_dossier',
    descriptionFr: 'Ouvrir la fiche détaillée d’un dossier par référence ou nom du client',
    descriptionAr: 'فتح الملف القضائي المفصل بواسطة رقم الجدول أو اسم الموكل',
    riskLevel: 'low',
    requiresConfirmation: false,
    params: [
      { name: 'query', type: 'string', required: true, labelFr: 'Référence ou Client', labelAr: 'رقم الملف أو الموكل' },
    ],
  },
  create_rdv: {
    id: 'create_rdv',
    descriptionFr: 'Programmer un rendez-vous ou fixer une audience au cabinet',
    descriptionAr: 'برمجة موعد استشارة أو تثبيت جلسة بمقر المكتب',
    riskLevel: 'medium',
    requiresConfirmation: true,
    params: [
      { name: 'client', type: 'string', required: true, labelFr: 'Nom du Client / Partie', labelAr: 'اسم الموكل / الطرف' },
      { name: 'date', type: 'date', required: true, labelFr: 'Date prévue', labelAr: 'تاريخ الموعد' },
      { name: 'heure', type: 'string', required: true, labelFr: 'Heure', labelAr: 'التوقيت' },
      { name: 'motif', type: 'string', required: false, labelFr: 'Motif de consultation', labelAr: 'سبب الموعد' },
    ],
  },
  launch_scan: {
    id: 'launch_scan',
    descriptionFr: 'Ouvrir le Hub de Numérisation Epson pour un dossier spécifié',
    descriptionAr: 'تشغيل مركز الماسح الضوئي إبسون لملف قضائي محدد',
    riskLevel: 'low',
    requiresConfirmation: false,
    params: [
      { name: 'dossier_ref', type: 'string', required: false, labelFr: 'N° Rôle Greffe', labelAr: 'رقم الجدول' },
    ],
  },
  generate_quittance: {
    id: 'generate_quittance',
    descriptionFr: "Émettre un وصل سداد (quittance d'honoraires officielle)",
    descriptionAr: 'إصدار وصل سداد الأتعاب الرسمية (Loi 13-07 Art. 23)',
    riskLevel: 'high',
    requiresConfirmation: true,
    params: [
      { name: 'client', type: 'string', required: true, labelFr: 'Nom du Client', labelAr: 'اسم الموكل' },
      { name: 'montant', type: 'number', required: true, labelFr: 'Montant en Dinars (DA)', labelAr: 'المبلغ بالدينار' },
      { name: 'motif', type: 'string', required: false, labelFr: 'Objet des Honoraires', labelAr: 'سبب السداد' },
    ],
  },
  calculate_cpca_deadline: {
    id: 'calculate_cpca_deadline',
    descriptionFr: 'Calculer le délai légal CPCA (Art. 304, 327, 336, 354, 405)',
    descriptionAr: 'حساب المهلة القانونية والآجال وفق CPCA (المواد 304، 327، 336، 354، 405)',
    riskLevel: 'low',
    requiresConfirmation: false,
    params: [
      { name: 'type_procedure', type: 'string', required: true, labelFr: 'Procédure CPCA', labelAr: 'نوع الإجراء' },
      { name: 'date_notification', type: 'date', required: true, labelFr: 'Date de Signification', labelAr: 'تاريخ التبليغ' },
    ],
  },
}

export interface IntentResolutionResult {
  type: 'search' | 'action' | 'unknown'
  confidence: number
  action_id: string | null
  search_query: string | null
  search_scope: 'dossiers' | 'audiences' | 'finances' | 'documents' | 'all' | null
  params: Record<string, any>
  explanationFr: string
  explanationAr: string
}

// ─── CLASSIFICATEUR ET RÉSOLVEUR D'INTENTIONS (FR / AR) ───
export function resolveIntent(rawPrompt: string, lang: 'fr' | 'ar'): IntentResolutionResult {
  const p = rawPrompt.trim().toLowerCase()
  if (!p) {
    return {
      type: 'unknown',
      confidence: 0,
      action_id: null,
      search_query: null,
      search_scope: null,
      params: {},
      explanationFr: 'Veuillez saisir ou dicter une commande.',
      explanationAr: 'يرجى كتابة أو إملاء أمر جديد.',
    }
  }

  // 1. ACTION CHECK: Generate Quittance / Émettre quittance
  if (p.includes('quittance') || p.includes('وصل') || p.includes('سداد') || p.includes('أتعاب') || p.includes('recu') || p.includes('reçu')) {
    const amountMatch = p.match(/(\d[\d\s,.]{2,})/)?.[1]?.replace(/\s/g, '')
    const montant = amountMatch ? parseInt(amountMatch, 10) : 50000

    let client = 'بن علي عبد القادر'
    if (p.includes('بن علي') || p.includes('benali')) client = 'بن علي عبد القادر'
    else if (p.includes('كمال') || p.includes('kamel')) client = 'بن عيسى كمال'
    else if (p.includes('رضا') || p.includes('reda')) client = 'بن محمد رضا'

    return {
      type: 'action',
      confidence: 0.95,
      action_id: 'generate_quittance',
      search_query: null,
      search_scope: null,
      params: {
        client,
        montant: isNaN(montant) ? 50000 : montant,
        motif: lang === 'ar' ? 'أتعاب مرافعة واستشارة قانونية' : 'Honoraires de plaidoirie et consultation',
      },
      explanationFr: `Préparation de l'émission d'une quittance d'honoraires de ${montant} DA pour ${client}.`,
      explanationAr: `تحضير إصدار وصل سداد بمبلغ ${montant} د.ج للموكل ${client}.`,
    }
  }

  // 2. ACTION CHECK: Create RDV / Program rdv / Fixer audience
  if (p.includes('rdv') || p.includes('rendez-vous') || p.includes('موعد') || p.includes('جلسة') || p.includes('اجتماع') || p.includes('برمجة')) {
    const today = new Date().toISOString().split('T')[0] ?? '2026-08-27'
    let client = 'بن محمد رضا'
    if (p.includes('رضا') || p.includes('reda')) client = 'بن محمد رضا'
    else if (p.includes('كمال') || p.includes('kamel')) client = 'بن عيسى كمال'
    else if (p.includes('بن علي') || p.includes('benali')) client = 'بن علي عبد القادر'

    return {
      type: 'action',
      confidence: 0.92,
      action_id: 'create_rdv',
      search_query: null,
      search_scope: null,
      params: {
        client,
        date: today,
        heure: '10:00',
        motif: lang === 'ar' ? 'استشارة قانونية وتأصيل عريضة' : 'Consultation juridique et préparation de dossier',
      },
      explanationFr: `Fixation d'un rendez-vous avec ${client} pour le ${today} à 10:00.`,
      explanationAr: `تثبيت موعد استشارة مع ${client} بتاريخ ${today} على الساعة 10:00.`,
    }
  }

  // 3. ACTION CHECK: Launch Scan Epson / Numériser
  if (p.includes('scan') || p.includes('scanner') || p.includes('numériser') || p.includes('مسح') || p.includes('إبسون') || p.includes('epson')) {
    return {
      type: 'action',
      confidence: 0.9,
      action_id: 'launch_scan',
      search_query: null,
      search_scope: null,
      params: { dossier_ref: '24/00412' },
      explanationFr: "Lancement du Hub de Numérisation Epson pour le dossier en cours.",
      explanationAr: "تشغيل مركز الماسح الضوئي إبسون للملف الحالي.",
    }
  }

  // 4. ACTION CHECK: Calculate CPCA / حساب المواعيد
  if (p.includes('cpca') || p.includes('délai') || p.includes('calculer') || p.includes('حساب') || p.includes('أجل') || p.includes('مهلة')) {
    const today = new Date().toISOString().split('T')[0] ?? '2026-08-27'
    return {
      type: 'action',
      confidence: 0.91,
      action_id: 'calculate_cpca_deadline',
      search_query: null,
      search_scope: null,
      params: {
        type_procedure: 'appel_civil',
        date_notification: today,
      },
      explanationFr: "Calcul des délais d'appel et de pourvoi en cassation CPCA.",
      explanationAr: "حساب مهلة الاستئناف والطعن بالنقض وفق قانون CPCA.",
    }
  }

  // 5. ACTION CHECK: Navigation
  if (p.includes('aller à') || p.includes('ouvrir module') || p.includes('انتقل') || p.includes('انتقال') || p.includes('توجه')) {
    let target = 'overview'
    if (p.includes('dossier') || p.includes('ملفات') || p.includes('قضايا')) target = 'dossiers'
    else if (p.includes('finances') || p.includes('comptabilité') || p.includes('أتعاب') || p.includes('وصل')) target = 'finances'
    else if (p.includes('scan') || p.includes('epson') || p.includes('ماسح')) target = 'epson_scan'
    else if (p.includes('agenda') || p.includes('rdv') || p.includes('مواعيد') || p.includes('جلسات')) target = 'appointments'
    else if (p.includes('cpca') || p.includes('مواعيد')) target = 'cpca'

    return {
      type: 'action',
      confidence: 0.94,
      action_id: 'navigate_to',
      search_query: null,
      search_scope: null,
      params: { target },
      explanationFr: `Navigation immédiate vers la section ${target}.`,
      explanationAr: `الانتقال الفوري إلى قسم ${target}.`,
    }
  }

  // 6. SEARCH CHECK: Chercher / Rechercher / بحث / عرض
  const searchScope: 'dossiers' | 'audiences' | 'finances' | 'documents' | 'all' =
    p.includes('dossier') || p.includes('ملف') ? 'dossiers' :
    p.includes('audience') || p.includes('rdv') || p.includes('جلسة') || p.includes('موعد') ? 'audiences' :
    p.includes('finance') || p.includes('honoraires') || p.includes('أتعاب') ? 'finances' :
    p.includes('scan') || p.includes('document') || p.includes('وثيقة') ? 'documents' : 'all'

  // If prompt has content, default to structured search if no high-risk action was explicitly matched
  const cleanSearchQuery = p
    .replace(/(chercher|rechercher|trouver|afficher|بحث|عرض|عن|في)/g, '')
    .trim()

  return {
    type: 'search',
    confidence: 0.88,
    action_id: null,
    search_query: cleanSearchQuery || rawPrompt,
    search_scope: searchScope,
    params: {},
    explanationFr: `Recherche dans la base du cabinet (${searchScope}) : "${cleanSearchQuery || rawPrompt}".`,
    explanationAr: `البحث في قاعدة بيانات المكتب (${searchScope}): "${cleanSearchQuery || rawPrompt}".`,
  }
}

// ─── JOURNALISATION LOCALE DES ACTIONS EXÉCUTÉES PAR L'ASSISTANT ───
export interface AiAuditLogEntry {
  id: string
  timestamp: string
  action_id: string
  riskLevel: ActionRiskLevel
  params: Record<string, any>
  status: 'executed' | 'cancelled'
}

const AI_AUDIT_KEY = 'al_mouhami_ai_audit_logs'

export function logAiAction(entry: Omit<AiAuditLogEntry, 'id' | 'timestamp'>): AiAuditLogEntry {
  const newLog: AiAuditLogEntry = {
    ...entry,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }

  try {
    const existingStr = localStorage.getItem(AI_AUDIT_KEY)
    const existing: AiAuditLogEntry[] = existingStr ? JSON.parse(existingStr) : []
    const updated = [newLog, ...existing].slice(0, 50) // Garder les 50 dernières actions
    localStorage.getItem(AI_AUDIT_KEY)
    localStorage.setItem(AI_AUDIT_KEY, JSON.stringify(updated))
  } catch (_e) {
    // Audit storage fallback
  }

  return newLog
}

export function getAiAuditLogs(): AiAuditLogEntry[] {
  try {
    const str = localStorage.getItem(AI_AUDIT_KEY)
    return str ? JSON.parse(str) : []
  } catch (_e) {
    return []
  }
}
