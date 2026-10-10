# 🏛️ Cabinet Slimani — Al-Mouhami Pro Desktop
## Architecture & Operational Expansion Proposal (Algerian Legal Practice ERP)

> **Document Type:** Product Architecture & Feature Scope Proposal  
> **Prepared for:** Abdelhadi Hammaz (L'piks) & Partners — Stepping Stones Agency  
> **Target Entity:** Cabinet Me Noureddine Slimani (Avocat Agréé à la Cour Suprême et au Conseil d'État — Barreau d'Alger)  
> **Version:** 3.1-PROPOSAL  
> **Date:** October 2026  

---

## 1. Executive Summary

### Current System Status
The application currently covers **~70% of the operational surface area** required by an Algerian law practice. The following core modules have been fully implemented, verified, and elevated to the **Quiet Luxury / Prestige** aesthetic standard (`#121526` obsidian glass, `#C39B57` warm brass, full Arabic RTL bidi compliance, 0 native unstyled controls):

1. **Tableau de Bord Exécutif (`AdminOverviewModule`)** — KPI cards, daily calendar brief, revenue summary, quick actions.
2. **Registre Général des Dossiers (`AdminDossiersModule`)** — Active case tracking, jurisdiction tags, case status badges, slide-over detail drawer.
3. **Agenda & Audiences Judiciaires (`AdminRdvModule`)** — Court hearing schedule, client consultations, chamber assignments, timeline views.
4. **Suivi Comptable & Finances (`AdminFinancesModule`)** — Legal fees, retainers (*تسبيق / provision*), balances, DZD currency formatting.
5. **Calculateur de Délais CPCA (`AdminCpcaModule`)** — Statutory deadlines (Articles 304, 327, 336, 354), Art. 404 distance extensions, Art. 405 weekend (Fri/Sat) and Algerian national holiday prorogation engine.
6. **Hub Numérisation Epson DS-530 II (`EpsonScanModal` & `AdminEpsonScanModule`)** — Hardware USB scanning via NAPS2/WIA, OCR extraction, live laser visualizer, automatic GED vault archiving.
7. **Assistant IA Juridique DZ (`AdminAiModule`)** — Mode A (Voice dictation & CPCA petition drafting), Mode B (Interactive statutory legal research).
8. **Palette de Commandes Universelle (`CommandPalette`)** — `Ctrl+K` quick search across dossiers, hearings, scanned PDFs, and system navigation.
9. **Universal Interactive Reset (`index.css`)** — Global `cursor: pointer` on all buttons, links, and interactive elements.

---

## 2. The Missing 30%: Critical Real-World Legal Practice Gaps

In Algerian court practice (*الممارسة القضائية الميدانية*), an attorney's work extends significantly beyond case intake and courtroom pleading. Three operational bottlenecks currently have no dedicated software workflow:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CABINET SLIMANI — EXPANSION MATRIX                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
       ┌───────────────────────────────────┼───────────────────────────────────┐
       ▼                                   ▼                                   ▼
 [ MODULE A ]                        [ MODULE B ]                        [ MODULE C ]
Annuaire Judiciaire &              Hub Exécution &                      Répertoire des Décisions
Délégations (الإنابة القضائية)     Expertises Judiciaires               & Archives Physiques
─────────────────────────          ──────────────────────               ────────────────────────
• Huissiers de Justice             • Suivi de la Grosse (الصيغة)        • Registre des Arrêts & Jugements
• Experts Judiciaires Agréés       • Délai de sommation (15 jours)      • Classement boîte & rayon
• Confrères (Barreau d'Alger)      • Consignation d'expertise           • Base de précédents du cabinet
• Fiche d'Énaaba (1-Click Print)   • Visite des lieux (المعاينة)        • Export statistiques annuelles
```

---

### Gap 1: Judicial Directory & Hearing Delegation (دليل المساعدين القضائيين وجدول الإنابة)
* **The Reality:** The current `Contacts.tsx` page is a blank placeholder. A trial lawyer interacts daily with court bailiffs, court-appointed experts, colleagues, and court clerks.
* **The Operational Bottleneck:** When Me Slimani has two overlapping hearings on a Thursday morning (e.g. *Tribunal de Sidi M'hamed* and *Cour d'Alger*), he must delegate one hearing to an associate or a colleague. Today, this requires manually handwriting an *Énaaba* slip.
* **The Proposed Solution:** Turn `Contacts.tsx` into an **Annuaire Judiciaire & Énaaba Hub**:
  1. **Huissiers de Justice (محضرون قضائيون):** Categorized by judicial circonscription (*اختصاص محاكم الجزائر، بئر مراد رايس، الدار البيضاء، البليدة...*) with phone, address, and ongoing task counters.
  2. **Experts Judiciaires (الخبراء المعتمدون):** Filtered by domain (Foncier/عقاري, Comptable/محاسبي, Médical/طبي, Bâtiment/بناء, Automobile/حوادث).
  3. **Confrères & Avocats (الزملاء المحامون):** Direct directory of colleagues for court representation.
  4. **1-Click Énaaba Slip Generator (ورقة الإنابة القضائية):** Instant button to generate, preview, and print a formal delegation form containing: Case Role Number, Chamber, Judge, and explicit instruction (*طلب تأجيل للاطلاع / إيداع المذكرة الجوابية / التجهيز للحكم*).

---

### Gap 2: Bailiff Execution & Court Appraisals (محضرون قضائيون وتنفيذ الأحكام والخبرات)
* **The Reality:** 
  * Winning a case is useless if enforcement fails. Post-judgment enforcement (*التنفيذ الجبري ومحاضر التكليف بالوفاء والحجز*) has strict procedural countdowns (e.g., the 15-day voluntary compliance window under CPCA).
  * Over 60% of Algerian civil, real estate (*foncier*), commercial, and labor cases pass through an interlocutory order for an expert survey (*حكم تمهيدي بإجراء خبرة*).
* **The Operational Bottleneck:** Missing the expert deposit deadline (*أمانة الخبير لدى كتابة الضبط*) or missing the 10-day window to file post-expertise conclusions (*مذكرة بعد الخبرة*) can result in losing the case.
* **The Proposed Solution:** A dedicated **Hub Exécution & Expertises Judiciaires**:
  1. **Pipeline Exécution:**
     * Status of the Enforceable Copy (*سحب النسخة التنفيذية / La Grosse*).
     * Assigned Bailiff (*المحضر القضائي المكلف*).
     * Service of process date (*تاريخ محضر التبليغ الرسمي*).
     * 15-day statutory countdown to enforcement (*مهلة الوفاء 15 يوماً*).
     * Outcome: Full payment (*استيفاء المبلغ*), Asset seizure (*حجز تنفيذي*), or Non-execution report (*محضر امتناع*).
  2. **Pipeline Expertises:**
     * Interlocutory judgment date (*تاريخ الحكم التمهيدي*).
     * Expert fee consignation deadline (*أجل دفع مصاريف الخبير*).
     * Field inspection date and location (*حضور المعاينة الميدانية*).
     * Filing of final report & 10-day countdown for counter-pleadings (*إيداع تقرير الخبرة ومذكرة بعد الخبرة*).

---

### Gap 3: Physical Archive & Final Judgments Vault (سجل الأحكام والقرارات والأرشيف الفيزيائي)
* **The Reality:** Once a dispute receives a final judgment or Supreme Court decree (*قرار المحكمة العليا*), it moves from "active" to "archived".
* **The Operational Bottleneck:** Finding a physical file from 2021 when a client returns requires knowing the exact physical storage location.
* **The Proposed Solution:** 
  * Tagging closed cases with **Physical Archival Metadata**: Room (*القاعة*), Cabinet Shelf (*الرف*), Box Number (*رقم العلبة*).
  * Landmark rulings repository (*سوابق واجتهادات كسبها المكتب*) for rapid re-citation by the AI assistant in future briefs.

---

### Gap 4: Official Fee Quittance Modal (`ArabicQuittanceModal.tsx`)
* **The Current State:** The sidebar hardware button *"إصدار وصل سداد رسمي"* opens `ArabicQuittanceModal.tsx`, but this modal still uses outdated raw inline styles (`style={{ ... }}`) rather than Tailwind and the Quiet Luxury design tokens.
* **The Proposed Solution:** Complete modernization matching `EpsonScanModal` (obsidian glass, `<BorderBeam />`, bilingual currency spelled out in Arabic words, thermal/A4 print engine compliant with Article 23 of Law 13-07).

---

## 3. Recommended UI & Architecture Map

Here is how these features will sit within the desktop application interface:

```
MAIN DESKTOP WINDOW
│
├── 📑 SIDEBAR NAVIGATION
│   ├── [1] Tableau de Bord (Overview)
│   ├── [2] Registre des Affaires (Dossiers) ────► [Includes case-level Execution & Expertise tabs]
│   ├── [3] Hub Exécution & Expertises ─────────► [NEW DEDICATED PAGE: Bailiffs & Court Surveys]
│   ├── [4] Agenda & Audiences (Appointments) ──► [Includes Hearing Delegation / Énaaba filter]
│   ├── [5] Annuaire Judiciaire (Contacts) ─────► [REVAMPED: Huissiers, Experts, Confrères, Courts]
│   ├── [6] Suivi Comptable (Finances)
│   ├── [7] Hub Numérisation GED (Epson DS-530)
│   ├── [8] Assistant IA DZ (AI Legal Suite)
│   └── [9] Calculateur CPCA (Procedural Delays)
│
└── 🛠️ SIDEBAR HARDWARE DOCK
    ├── [A] Epson Scanner Direct Modal (EpsonScanModal.tsx) ─────────── [✔ Completed]
    ├── [B] Official Fee Quittance Modal (ArabicQuittanceModal.tsx) ──── [Ready to Polish]
    └── [C] 1-Click Delegation Slip Modal (Fiche d'Énaaba) ──────────── [New]
```

---

## 4. Phased Implementation Roadmap

### Phase 1: High-Impact Essentials (Fast Delivery)
1. **Modernize `ArabicQuittanceModal.tsx`**: Upgrade to Quiet Luxury obsidian dark, remove all inline styles, add Algerian Bar print formatting.
2. **Transform `Contacts.tsx` into the Judicial Directory**:
   - 4 Tabs: Huissiers, Experts, Confrères, Courts.
   - Built-in **1-Click Énaaba Slip Generator** (printable court substitution slip).

### Phase 2: Litigation Workflows
3. **Build the Dedicated `AdminExecutionModule.tsx`**:
   - Tracking bailiff enforcements (La Grosse, 15-day voluntary delay).
   - Tracking court expertises (deposit deadlines, inspection meetings, post-report briefs).
4. **Link Execution & Expertise directly into Case Details Drawer** (`AdminDossiersModule.tsx`).

### Phase 3: Long-Term Value & Archiving
5. **Physical Archive Vault**:
   - Shelf and box location tracking for closed files.
   - Supreme Court precedent library for firm reuse.

---

## 5. Decision Checklist for Abdelhadi & Partner

Please review these three key questions to align on scope:

| # | Question | Recommended Choice | Your Decision |
|---|---|---|---|
| **Q1** | **Judicial Directory (`Contacts.tsx`):** Should it be a standalone top-level sidebar tab? | **YES** — An attorney searches bailiffs, experts, and courts independently of specific cases. | `[  ]` Yes<br>`[  ]` No |
| **Q2** | **Bailiff & Expertise Tracking:** Should it have its own dedicated page on the sidebar, or only live inside individual case files? | **Both (Hybrid)** — A dedicated overview dashboard for office-wide deadlines + case-specific tabs in the drawer. | `[  ]` Hybrid (Recommended)<br>`[  ]` Inside Cases only |
| **Q3** | **Next Action:** Should we immediately polish the **Quittance Modal (`ArabicQuittanceModal.tsx`)** or start building the **Judicial Directory (`Contacts.tsx`)**? | **Quittance Modal first** (completes the sidebar hardware tools), then **Judicial Directory**. | `[  ]` Quittance Modal first<br>`[  ]` Directory first |

---

*Document generated and committed to the repository for review.*
