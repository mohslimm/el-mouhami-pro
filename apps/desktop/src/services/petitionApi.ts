import { z } from 'zod'

/**
 * Schéma Zod de validation de la requête juridique structurée
 */
export const PetitionStructureSchema = z.object({
  petitionType: z.string(),
  jurisdiction: z.string(),
  chamber: z.string(),
  clientName: z.string(),
  defendantName: z.string(),
  dossierNumber: z.string(),
  phone: z.string(),
  facts: z.array(z.string()),
  legalBasis: z.array(z.string()),
  requests: z.array(z.string()),
})

export type StructuredPetition = z.infer<typeof PetitionStructureSchema>

export interface ApiGeneratePetitionParams {
  maskedText: string
  petitionType: 'divorce' | 'foncier' | 'commercial' | 'penal' | 'administratif'
  lang?: 'ar' | 'fr'
}

export interface ApiGeneratePetitionResult {
  success: boolean
  data?: StructuredPetition
  error?: string
  isFallbackTemplate?: boolean
}

/**
 * Appel API Cloud Proxy pour structurer le texte anonymisé via LLM (Structured Outputs)
 */
export async function sendMaskedTextToCloudProxy(
  params: ApiGeneratePetitionParams
): Promise<ApiGeneratePetitionResult> {
  const { maskedText, petitionType, lang = 'ar' } = params

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    // Tentative d'appel à l'API Cloud Proxy
    const response = await fetch('/api/generate-petition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maskedText,
        petitionType,
        lang,
      }),
      signal: controller.signal,
    }).catch(() => null)

    clearTimeout(timeoutId)

    if (response && response.ok) {
      const json = await response.json()
      const validated = PetitionStructureSchema.parse(json)
      return { success: true, data: validated, isFallbackTemplate: false }
    }

    // Générateur de modèles juridiques selon la chambre قضائية المختصة
    // REMARQUE : isFallbackTemplate signale explicitement à l'interface qu'il s'agit d'un gabarit générique (mode dégradé sans backend AI)
    const mockStructuredData: StructuredPetition = getChamberTemplate(petitionType, lang)

    return { success: true, data: mockStructuredData, isFallbackTemplate: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la structuration cloud',
    }
  }
}

/**
 * Construit un modèle juridique structuré et conforme aux règles CPCA selon la chambre demandée
 */
function getChamberTemplate(
  petitionType: 'divorce' | 'foncier' | 'commercial' | 'penal' | 'administratif',
  lang: 'ar' | 'fr'
): StructuredPetition {
  const isAr = lang === 'ar'

  switch (petitionType) {
    case 'foncier':
      return {
        petitionType: 'foncier',
        jurisdiction: isAr ? 'محكمة بئر خادم - القسم العقاري' : 'Tribunal de Bir Khadem - Chambre Foncière',
        chamber: isAr ? 'قسم الشؤون العقارية' : 'Chambre Foncière',
        clientName: isAr ? 'المدعي: (محدد في الملف)' : 'Demandeur: (Spécifié dans le dossier)',
        defendantName: isAr ? 'المدعى عليه: (محدد في الملف)' : 'Défendeur: (Spécifié dans le dossier)',
        dossierNumber: '[DOSSIER_1]',
        phone: '[TEL_1]',
        facts: [
          isAr
            ? `حيث أن الموكل يملك القطعة الأرضية ذات الملكية المشهرة تحت رقم [DOSSIER_1] بتاريخ [DATE_1].`
            : `Attendu que le client est propriétaire de la parcelle immatriculée sous le N° [DOSSIER_1] en date du [DATE_1].`,
          isAr
            ? `حيث أن المدعى عليه قام بالتعدي والحيازة بدون سند قانوني على المساحة المحددة بالخبرة.`
            : `Attendu que le défendeur empiète sans titre légal sur la superficie délimitée par expertise.`,
          isAr
            ? `حيث تم إخطار المدعى عليه عبر الهاتف رقم [TEL_1] قصد الإخلاء دون جدوى.`
            : `Attendu que les sommations d'évacuer adressées au [TEL_1] sont restées infructueuses.`,
        ],
        legalBasis: [
          isAr ? 'طبقا لأحكام المواد 812 وما يليها من القانون المدني الجزائري.' : 'Conformément aux articles 812 et suivants du Code Civil algérien.',
          isAr ? 'وطبقا لأحكام المواد 511 وما يليها من قانون الإجراءات المدنية والإدارية (CPCA 08-09).' : 'Conformément aux articles 511 et suivants du CPCA.',
        ],
        requests: [
          isAr ? 'الإشهاد بصحة الملكية العقارية للموكل.' : 'Constater le droit de propriété inaliénable du demandeur.',
          isAr ? 'الأمر بإخلاء المدعى عليه من الأماكن وطرد كل شاغل بإذنه تحت غرامة تهديدية 10.000 د.ج عن كل يوم تأخير.' : "Ordonner l'expulsion du défendeur sous astreinte de 10.000 DA par jour de retard.",
          isAr ? 'تحميل المدعى عليه المصاريف القضائية.' : 'Mettre les dépens à la charge du défendeur.',
        ],
      }

    case 'commercial':
      return {
        petitionType: 'commercial',
        jurisdiction: isAr ? 'محكمة بئر مراد رايس - القسم التجاري' : 'Tribunal de Bir Mourad Raïs - Chambre Commerciale',
        chamber: isAr ? 'القسم التجاري' : 'Chambre Commerciale',
        clientName: isAr ? 'شركة الطالبة: (محددة في الملف)' : 'Société Demanderesse: (Spécifié dans le dossier)',
        defendantName: isAr ? 'الشركة المدعى عليها: (محددة في الملف)' : 'Société Défenderesse: (Spécifiée dans le dossier)',
        dossierNumber: '[DOSSIER_1]',
        phone: '[TEL_1]',
        facts: [
          isAr
            ? `حيث أن العارض توريد بضائع ومعدات للشركة المدعى عليها بموجب العقد رقم [DOSSIER_1].`
            : `Attendu que la requérante a livré des marchandises selon contrat N° [DOSSIER_1].`,
          isAr
            ? `حيث أن الفواتير المستحقة بتاريخ [DATE_1] بقيت غير مسددة رغم الإعذار الرسمي.`
            : `Attendu que les factures échues le [DATE_1] demeurent impayées malgré mise en demeure.`,
        ],
        legalBasis: [
          isAr ? 'طبقا لأحكام المادة 551 وما يليها من القانون التجاري الجزائري.' : 'Conformément aux articles 551 et suivants du Code de Commerce.',
          isAr ? 'وطبقا لأحكام قانون الإجراءات المدنية والإدارية.' : 'Conformément aux dispositions du CPCA (Loi 08-09).',
        ],
        requests: [
          isAr ? 'إلزام الشركة المدعى عليها بدفع مبلغ الدين التجاري كاملاً.' : 'Condamner la défenderesse au paiement intégral de la créance commerciale.',
          isAr ? 'الحكم بتعويض قدره 500.000 د.ج عن الأضرار الناجمة عن التأخير.' : 'Condamner au paiement de 500.000 DA à titre de dommages-intérêts.',
        ],
      }

    case 'penal':
      return {
        petitionType: 'penal',
        jurisdiction: isAr ? 'محكمة سيدي امحمد - قسم الجنح' : 'Tribunal de Sidi M’Hamed - Chambre Correctionnelle',
        chamber: isAr ? 'قسم الجنح والمخالفات' : 'Chambre Correctionnelle',
        clientName: isAr ? 'الطرف المدني: (محدد في الملف)' : 'Partie Civile: (Spécifié dans le dossier)',
        defendantName: isAr ? 'المتهم: (محدد في الملف)' : 'Prévenu: (Spécifié dans le dossier)',
        dossierNumber: '[DOSSIER_1]',
        phone: '[TEL_1]',
        facts: [
          isAr
            ? `حيث أن المتهم تسبب في إصابات وخسائر للضحية بموجب المحضر رقم [DOSSIER_1].`
            : `Attendu que le prévenu est poursuivi selon le procès-verbal N° [DOSSIER_1].`,
          isAr
            ? `حيث تبين من الشهادة الطبية بتاريخ [DATE_1] العجز الكلي المؤقت عن العمل.`
            : `Attendu que le certificat médical du [DATE_1] établit une incapacité temporaire.`,
        ],
        legalBasis: [
          isAr ? 'طبقا لأحكام المواد 264 و380 من قانون العقوبات الجزائري.' : 'Conformément aux articles 264 et 380 du Code Pénal algérien.',
          isAr ? 'وطبقا لأحكام قانون الإجراءات الجزائية.' : 'Conformément au Code de Procédure Pénale.',
        ],
        requests: [
          isAr ? 'التأسس كطرف مدني في الدعوى العمومية.' : 'Se constituer partie civile dans la procédure pénale.',
          isAr ? 'الحكم بتعويض مدني شامل وجبر الأضرار.' : 'Condamner au versement de dommages-intérêts légaux.',
        ],
      }

    case 'administratif':
      return {
        petitionType: 'administratif',
        jurisdiction: isAr ? 'المحكمة الإدارية بالجزائر' : "Tribunal Administratif d'Alger",
        chamber: isAr ? 'الغرفة الإدارية الأولى' : 'Chambre Administrative',
        clientName: isAr ? 'المدعي: (محدد في الملف)' : 'Requérant: (Spécifié dans le dossier)',
        defendantName: isAr ? 'الجهة الإدارية المدعى عليها' : "Administration Défenderesse",
        dossierNumber: '[DOSSIER_1]',
        phone: '[TEL_1]',
        facts: [
          isAr
            ? `حيث أن القرار الإداري الصادر بتاريخ [DATE_1] مشوب بعيب تجاوز السلطة.`
            : `Attendu que la décision administrative du [DATE_1] est entachée d'excès de pouvoir.`,
        ],
        legalBasis: [
          isAr ? 'طبقا لأحكام المادة 800 وما يليها من قانون الإجراءات المدنية والإدارية.' : 'Conformément aux articles 800 et suivants du CPCA.',
        ],
        requests: [
          isAr ? 'إلغاء القرار الإداري المطعون فيه لكافة الآثار القانونية.' : "Annuler la décision administrative attaquée avec toutes conséquences de droit.",
        ],
      }

    case 'divorce':
    default:
      return {
        petitionType: 'divorce',
        jurisdiction: isAr ? 'محكمة بئر خادم - غرفة الأحوال الشخصية' : 'Tribunal de Bir Khadem - Chambre du Statut Personnel',
        chamber: isAr ? 'غرفة شؤون الأسرة' : 'Chambre des Affaires Familiales',
        clientName: isAr ? 'المدعية: (محددة في الملف)' : 'Demandeur(se): (Spécifié dans le dossier)',
        defendantName: isAr ? 'المدعى عليه: (محدد في الملف)' : 'Défendeur: (Spécifié dans le dossier)',
        dossierNumber: '[DOSSIER_1]',
        phone: '[TEL_1]',
        facts: [
          isAr
            ? `حيث أن الطرفين متزوجان بموجب عقد زواج رسمي مسجل بتاريخ [DATE_1].`
            : `Attendu que les parties sont mariées sous acte officiel enregistré en date du [DATE_1].`,
          isAr
            ? `حيث أن الحياة الزوجية أصبحت مستحيلة بسبب الخلافات المستمرة والمبينة في الشكوى رقم [DOSSIER_1].`
            : `Attendu que la vie commune est devenue impossible en raison des différends enregistrés sous la référence [DOSSIER_1].`,
          isAr
            ? `حيث تم التواصل مع الطالبة عبر الهاتف رقم [TEL_1] لتأكيد الوقائع.`
            : `Attendu que le contact a été établi via le numéro [TEL_1] pour confirmation des faits.`,
        ],
        legalBasis: [
          isAr ? 'طبقا لأحكام المواد 48، 49، و53 من قانون الأسرة الجزائري.' : 'Conformément aux articles 48, 49, et 53 du Code de la Famille algérien.',
          isAr ? 'وطبقا لأحكام قانون الإجراءات المدنية والإدارية (CPCA 08-09).' : 'Conformément aux dispositions du CPCA (Loi 08-09).',
        ],
        requests: [
          isAr ? 'الإشهاد بأن طلب التطليق قائم على أسس قانونية سليمة.' : 'Constater que la demande de divorce est légalement fondée.',
          isAr ? 'الحكم بالتطليق بين الزوجين مع حفظ كافة الحقوق المادية والشرعية.' : 'Prononcer le divorce avec préservation des droits légaux.',
          isAr ? 'تحميل المدعى عليه المصاريف القضائية.' : 'Mettre les dépens à la charge du défendeur.',
        ],
      }
  }
}

