/**
 * Service Local de Génération de Fichiers Word (.docx)
 * Exécution 100% côté client / desktop local (Faible empreinte mémoire - 0 LLM local).
 */

export interface PetitionDocumentData {
  petitionType: string
  jurisdiction: string
  chamber: string
  clientName: string
  defendantName: string
  dossierNumber: string
  phone: string
  facts: string[]
  legalBasis: string[]
  requests: string[]
  [key: string]: unknown
}

/**
 * Échappe les caractères spéciaux HTML (&, <, >, ", ') pour éviter tout plantage ou HTML corrompu dans MS Word
 */
function escapeHtml(str: unknown): string {
  if (typeof str !== 'string') return String(str ?? '')
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Génère le fichier Word et déclenche le téléchargement local ou l'enregistrement via Electron/Web.
 */
export async function generateWordDocument(
  hydratedData: PetitionDocumentData,
  fileName: string = 'Requete_Juridique.doc'
): Promise<{ success: boolean; error?: string }> {
  try {
    const htmlContent = buildHtmlForWordDocument(hydratedData)
    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword;charset=utf-8',
    })

    const finalFileName = fileName.endsWith('.doc') ? fileName : `${fileName.replace(/\.docx$/, '')}.doc`
    triggerLocalDownload(blob, finalFileName)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la génération du fichier Word',
    }
  }
}

/**
 * Déclenche le téléchargement local du fichier généré sur la machine de l'avocat
 */
function triggerLocalDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Construit un document HTML stylisé compatible Microsoft Word avec mise en page juridique algérienne
 */
function buildHtmlForWordDocument(data: PetitionDocumentData): string {
  const isArabic = data.jurisdiction.includes('محكمة') || data.jurisdiction.includes('غرفة')

  const factsList = Array.isArray(data.facts)
    ? data.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')
    : `<li>${escapeHtml(data.facts)}</li>`

  const legalList = Array.isArray(data.legalBasis)
    ? data.legalBasis.map((basis) => `<li>${escapeHtml(basis)}</li>`).join('')
    : `<li>${escapeHtml(data.legalBasis)}</li>`

  const requestsList = Array.isArray(data.requests)
    ? data.requests.map((req) => `<li>${escapeHtml(req)}</li>`).join('')
    : `<li>${escapeHtml(data.requests)}</li>`

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <title>${escapeHtml(data.petitionType)}</title>
  <style type="text/css">
    body {
      font-family: 'Traditional Arabic', 'Amiri', 'Times New Roman', serif;
      font-size: 14pt;
      line-height: 1.6;
      direction: ${isArabic ? 'rtl' : 'ltr'};
      text-align: ${isArabic ? 'right' : 'left'};
      padding: 2cm;
      color: #1a1a1a;
    }
    .header {
      text-align: center;
      font-weight: bold;
      font-size: 16pt;
      margin-bottom: 24pt;
      border-bottom: 2px solid #c5a059;
      padding-bottom: 12pt;
      color: #1a1200;
    }
    .meta-box {
      border: 1px solid #c5a059;
      background-color: #faf8f5;
      padding: 12pt;
      margin-bottom: 18pt;
      border-radius: 4pt;
    }
    .section-title {
      font-weight: bold;
      font-size: 15pt;
      color: #855e19;
      margin-top: 18pt;
      margin-bottom: 8pt;
      border-bottom: 1.5pt solid #c5a059;
      padding-bottom: 4pt;
    }
    ul, ol {
      margin-top: 4pt;
      margin-bottom: 12pt;
    }
    li {
      margin-bottom: 6pt;
    }
    .footer {
      margin-top: 36pt;
      text-align: ${isArabic ? 'left' : 'right'};
      font-weight: bold;
      color: #1a1200;
    }
  </style>
</head>
<body>
  <div class="header">
    الجمهورية الجزائرية الديمقراطية الشعبية<br/>
    ${escapeHtml(data.jurisdiction)}<br/>
    ${escapeHtml(data.chamber)}
  </div>

  <div class="meta-box">
    <strong>رقم الملف / القضية:</strong> ${escapeHtml(data.dossierNumber)}<br/>
    <strong>الطرف المدعي:</strong> ${escapeHtml(data.clientName)} (هاتف: ${escapeHtml(data.phone)})<br/>
    <strong>الطرف المدعى عليه:</strong> ${escapeHtml(data.defendantName)}
  </div>

  <div class="section-title">أولاً: الوقائع والأسباب (البيانات)</div>
  <ul>
    ${factsList}
  </ul>

  <div class="section-title">ثانياً: الأسانيد القانونية</div>
  <ul>
    ${legalList}
  </ul>

  <div class="section-title">ثالثاً: الطلبات القضائية</div>
  <ol>
    ${requestsList}
  </ol>

  <div class="footer">
    عن المدعي / محاميه المعتمد<br/>
    مكتب الأستاذ نور الدين سليماني<br/>
    محامي لدى المحكمة العليا ومجلس الدولة<br/>
    التوقيع والختم: ___________
  </div>
</body>
</html>`
}

