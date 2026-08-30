# Cabinet Slimani — Al-Mouhami Pro Desktop (المحامي برو V3.0)

> **Offline-First Desktop ERP & LegalTech Platform for Algerian Law Firms**  
> *Developed for Me Noureddine Slimani — Lawyer Admitted to the Supreme Court & Council of State (Algiers Bar Association)*

---

## 📋 Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Technology Stack](#3-technology-stack)
- [4. Project Structure](#4-project-structure)
- [5. Installation & Setup](#5-installation--setup)
- [6. Usage & Operating Modes](#6-usage--operating-modes)
- [7. Comprehensive Features Guide](#7-comprehensive-features-guide)
- [8. API Documentation & Cloud Proxy](#8-api-documentation--cloud-proxy)
- [9. Database Schema & Data Models](#9-database-schema--data-models)
- [10. Authentication & Security Architecture](#10-authentication--security-architecture)
- [11. Configuration & Environment Variables](#11-configuration--environment-variables)
- [12. Development & Code Quality Guide](#12-development--code-quality-guide)
- [13. Build & Deployment Pipeline](#13-build--deployment-pipeline)
- [14. Troubleshooting & Hardware Diagnostics](#14-troubleshooting--hardware-diagnostics)
- [15. Third-Party Dependencies & Integrations](#15-third-party-dependencies--integrations)
- [16. Known Issues, Technical Debt & Roadmap](#16-known-issues-technical-debt--roadmap)
- [17. Complete End-to-End System Workflow](#17-complete-end-to-end-system-workflow)
- [⚡ Quick Start Guide](#-quick-start-guide)

---

## 1. Project Overview

### What the Project Does
**Cabinet Slimani — Al-Mouhami Pro Desktop (المحامي برو V3.0)** is an enterprise-grade, offline-first desktop management and LegalTech application specifically engineered for Algerian legal practice. It consolidates case file tracking across Algerian judicial jurisdictions, procedural deadline calculation according to the Algerian Civil and Administrative Procedure Code (CPCA), hardware document scanning via high-speed USB scanners (Epson DS-530 / Canon), legal fee accounting with official receipt issuance (وصل سداد الأتعاب), and privacy-preserving AI legal petition drafting.

### Core Objectives & Problems Solved
1. **Procedural Deadline Compliance**: Prevents forfeiture of legal rights (سقوط الحق) by computing statutory deadlines (Articles 304, 327, 336, 354 CPCA) with automatic weekend (Friday/Saturday) prorogation rules (Article 405 CPCA).
2. **Professional Secrecy & PII Protection**: Protects client confidentiality by performing **100% in-memory data anonymization** on local hardware before transmitting non-sensitive petition structures to cloud LLM proxies.
3. **Hardware USB Integration**: Eliminates manual scanning friction by directly driving Epson WorkForce DS-530 II and Canon scanners via `naps2.console.exe` CLI, WIA, and TWAIN drivers, generating OCR-ready PDF/A files directly into an arborescent Electronic Document Management (GED) vault.
4. **Law 13-07 Fee Compliance**: Automates legal fee tracking and prints standardized official payment receipts (وصل سداد الأتعاب) compliant with Article 23 of Algerian Law 13-07 governing the legal profession.
5. **Offline Reliability**: Guarantees uninterrupted operation in courtrooms or areas with poor internet connectivity using persistent local storage (Zustand + `localStorage`) backed by a background FIFO synchronization queue (`syncQueue`) that automatically syncs with Supabase once network connection is restored.
6. **Bilingual Workflow**: Native support for Arabic and French with dynamic LTR/RTL layout switching and judicial terminology tuned for Algerian courts (Tribunal de Sidi M'Hamed, Bir Khadem, Bab El Oued, Cour d'Alger, Cour Suprême, Conseil d'État).

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ELECTRON MAIN PROCESS                                  │
│                                                                                        │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐  │
│  │   Electron Main Window │   │   Hardware Bridge     │   │   Local STT Manager      │  │
│  │   (Security Hardened) │   │ (NAPS2 CLI / WIA /    │   │ (Offline Audio Chunking  │  │
│  │   Context Isolation   │   │  PowerShell CIM Query)│   │  & Session Isolation)    │  │
│  └───────────┬───────────┘   └───────────┬───────────┘   └────────────┬─────────────┘  │
└──────────────┼───────────────────────────┼────────────────────────────┼────────────────┘
               │ ContextBridge IPC         │ Node child_process         │ IPC Events
               ▼                           ▼                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                RENDERER PROCESS (VITE + REACT 19)                      │
│                                                                                        │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐  │
│  │   Quiet Luxury UI     │   │  Zustand Master Store │   │  In-Memory Anonymizer    │  │
│  │  (Bento Grid, Admin   │   │(Dossiers, Rdvs, Vault,│   │(Censorship of PII, NIN,  │  │
│  │   Layout, RTL/LTR)    │   │  FIFO Sync Queue)     │   │ Phones, Case References) │  │
│  └───────────┬───────────┘   └───────────┬───────────┘   └────────────┬─────────────┘  │
└──────────────┼───────────────────────────┼────────────────────────────┼────────────────┘
               │                           │                            │
               │ Fetch (JSON)              │ FIFO Replay                │ Masked Payload
               ▼                           ▼                            ▼
┌──────────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐  │
│   Cloud Proxy API        │   │   Supabase Postgres   │   │ Document Generator       │  │
│ (/api/generate-petition) │   │ (Database & Cloud     │   │ (Client-side MS Word     │  │
│ LLM Structured Outputs   │   │  Sync Service)        │   │  .doc / .docx Engine)    │  │
└──────────────────────────┘   └───────────────────────┘   └──────────────────────────┘  │
```

### Process Communication & Layer Roles
- **Electron Main Process (`electron/main.ts`)**:
  - Manages the BrowserWindow lifecycle, enforces CSP policies, and checks real-time network connectivity to `google.com`/Supabase every 10 seconds.
  - Controls hardware scanner execution via `exec()` calling `extraResources/naps2.console.exe` or WIA/TWAIN PowerShell scripts.
  - Implements `LocalSttManager` (`electron/sttEngine.ts`) for offline audio chunking and real-time speech transcription event dispatching.
  - Enforces local security by restricting file opening (`shell:open-path`) exclusively to safe document extensions (`.pdf`, `.docx`, `.doc`, `.jpg`, `.png`, `.tiff`, `.txt`, `.csv`, `.rtf`).
- **Electron Preload Layer (`electron/preload.ts`)**:
  - Safely exposes context bridges (`window.electronAPI` and `window.sttAPI`) via `contextBridge.exposeInMainWorld` while keeping Node.js integration disabled and sandbox enabled.
- **Frontend Renderer Layer (`src/`)**:
  - Built with React 19, Vite, and Zustand. Handles UI rendering, user interaction, CPCA calculations, financial tracking, and AI intent classification.
- **Offline Sync Layer (`src/services/syncEngine.ts`)**:
  - Listens to Electron network status events. When online, chronologically processes pending FIFO mutations stored in `syncQueue` and uploads them to Supabase.

---

## 3. Technology Stack

### Core Frameworks & Runtime
- **Desktop Runtime**: Electron `v44.0.0`
- **Frontend Library**: React `v19.0.0`
- **Build Tool & Dev Server**: Vite `v8.2.2` (`@vitejs/plugin-react`)
- **Language**: TypeScript `v5.5.0` (Strict Mode)

### State Management & Navigation
- **Global State**: Zustand `v5.0.0` with `persist` middleware (`createJSONStorage` -> `localStorage`)
- **Client Routing**: React Router DOM `v6.22.0` (`HashRouter` for Electron file protocol compatibility)

### Styling, UI & Design System
- **CSS Engine**: Tailwind CSS `v4.3.3` (`@tailwindcss/vite`)
- **Animations**: Framer Motion `v11.18.2`
- **Iconography**: Lucide React `v0.441.0`
- **Typography**: Google Fonts (*Cormorant Garamond* for display headings, *Outfit* for UI body, *IBM Plex Sans Arabic* for Arabic text, *JetBrains Mono* for codes/numbers)
- **Custom UI Components**: Custom MagicUI components (`NumberTicker`, `BorderBeam`, `ShimmerButton`, `Particles`, `FileTree`, `BlurFade`, `Spotlight`)

### Backend, Database & Validation
- **Cloud Database & Storage**: Supabase JS Client `v2.45.0` (`@supabase/supabase-js`)
- **Validation**: Zod `v3.23.0`
- **Date Utility**: `date-fns` `v3.6.0`

### Hardware & Packaging Tools
- **Scanner Driver Engine**: NAPS2 Command Line Console (`extraResources/naps2.console.exe`), WIA 2.0 / TWAIN Windows CIM API
- **Packager & Installer**: `electron-builder` `v26.15.3` (NSIS target for Windows)
- **Dev Utilities**: `concurrently` `v10.0.4`, `wait-on` `v9.1.0`

---

## 4. Project Structure

```
noureddineslimani-desktop/
├── .gitignore                      # Git ignore file rules
├── .oxlintrc.json                  # Oxlint linter rules
├── README.md                       # Project technical documentation (this file)
├── dist/                           # Compiled frontend web assets (Vite build output)
├── dist-app/                       # Executable & installer build output (electron-builder)
├── dist-electron/                  # Compiled main process TypeScript output
├── electron/                       # Electron Main Process codebase
│   ├── main.ts                     # Main process entry, IPC handlers, network loop, scanner CLI
│   ├── preload.ts                  # Secure ContextBridge IPC bridge (electronAPI, sttAPI)
│   ├── sttEngine.ts                # Local Speech-to-Text session and audio buffer manager
│   └── tsconfig.json               # TypeScript configuration for Electron main code
├── extraResources/                 # Bundled binary resources packaged with Electron installer
│   └── naps2.console.exe           # NAPS2 CLI binary for USB hardware scanner control
├── index.html                      # HTML entry point with CSP header and Google Fonts link
├── package.json                    # Project manifest, npm scripts, and electron-builder config
├── public/                         # Static assets
│   ├── icon.ico                    # Windows application icon
│   └── wasl.png                    # Official receipt template image (وصل سداد الأتعاب)
├── src/                            # React 19 Frontend source code
│   ├── components/
│   │   ├── Layout.tsx              # Root Layout wrapper handling LTR/RTL direction state
│   │   ├── admin/                  # Cabinet Slimani Admin Modules
│   │   │   ├── AdminAiModule.tsx   # Legal AI Hub with Mode A (Write) & Mode B (Search/Act)
│   │   │   ├── AdminCpcaModule.tsx # CPCA legal deadline calculator & Art. 405 prorogation
│   │   │   ├── AdminDossiersModule.tsx # Case management registry & judicial follow-up
│   │   │   ├── AdminEpsonScanModule.tsx# Scanner hardware hub & GED arborescent explorer
│   │   │   ├── AdminFinancesModule.tsx  # Accounting, fee balance & official receipt generator
│   │   │   ├── AdminLayout.tsx     # Master layout, luxury sidebar, header clock & sync bar
│   │   │   ├── AdminOverviewModule.tsx  # Master Dashboard (Bento Grid, CPCA alerts, KPIs)
│   │   │   ├── AdminRdvModule.tsx  # Court hearings schedule & appointment calendar
│   │   │   └── ai/
│   │   │       ├── ListenAndWriteMode.tsx # Dictation, PII masking & Word .docx export
│   │   │       └── SearchAndActMode.tsx   # Natural language command catalog executor
│   │   └── ui/                     # Reusable UI Atoms and Modals
│   │       ├── ArabicQuittanceModal.tsx # Law 13-07 official receipt printable modal
│   │       ├── CommandPalette.tsx       # Quick navigation & search palette (⌘K)
│   │       ├── DictationButton.tsx      # Speech-to-text recording button component
│   │       ├── EpsonScanModal.tsx       # Quick scan modal launcher
│   │       ├── Icon.tsx                 # Dynamic Lucide icon wrapper
│   │       ├── StatusBadge.tsx          # Status indicator badge component
│   │       ├── analytics/               # Financial charts & analytics widgets
│   │       ├── magicui/                 # MagicUI design system components
│   │       └── motion/                  # Framer Motion animation helpers
│   ├── design-tokens.ts            # Antigravity Quiet Luxury color, font, & styling tokens
│   ├── index.css                   # Tailwind v4 import & custom CSS custom properties
│   ├── lib/                        # Core utilities & API helpers
│   │   ├── aiActions.ts            # Closed catalog of AI actions & intent resolution
│   │   ├── utils.ts                # Tailwind class merge helper (`cn`)
│   │   ├── supabase/               # Supabase JS client, schema types, & server stubs
│   │   └── validators/             # Shared Zod validation schemas
│   ├── main.tsx                    # React application root entry point & HashRouter
│   ├── pages/                      # Page components routing to Admin modules
│   │   ├── Calendar.tsx            # Route wrapper for AdminRdvModule
│   │   ├── Contacts.tsx            # Route wrapper for Contacts directory
│   │   ├── Cpca.tsx                # Route wrapper for AdminCpcaModule
│   │   ├── Dashboard.tsx           # Route wrapper for AdminOverviewModule
│   │   └── Documents.tsx           # Route wrapper for AdminDossiersModule
│   ├── services/                   # Application domain services
│   │   ├── anonymizer.ts           # 100% local PII masking & unmasking engine
│   │   ├── documentGenerator.ts    # Client-side MS Word (.doc/.docx) petition builder
│   │   ├── petitionApi.ts          # Structured petition API client & chamber fallback templates
│   │   └── syncEngine.ts           # Offline-to-online FIFO synchronization engine
│   ├── stores/                     # Zustand state management
│   │   └── adminStore.ts           # Master store (Dossiers, Rdvs, Vault, Petitions, Queue)
│   └── types/                      # TypeScript ambient type definitions (`stt.d.ts`)
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # Root TypeScript compiler options
├── tsconfig.app.json               # Frontend React TypeScript compiler options
├── tsconfig.node.json              # Vite/Node TypeScript compiler options
└── vite.config.ts                  # Vite bundler configuration & path aliases (`@/`)
```

---

## 5. Installation & Setup

### Prerequisites
Before running or building the application, ensure you have installed:
1. **Node.js**: `v20.x` or `v22.x` (LTS recommended)
2. **npm**: `v10.x` or higher
3. **Operating System**: Windows 10 / 11 (required for USB hardware scanning via `naps2.console.exe` and WIA/TWAIN drivers). Linux / macOS can run the frontend interface in browser/dev mode.
4. **NAPS2 Console**: Provided automatically in `extraResources/naps2.console.exe`.
5. **Epson / Canon Drivers**: Epson WorkForce DS-530 II scanner drivers (WIA/TWAIN) installed on the Windows host machine.

### Installation Commands

```bash
# 1. Clone the repository
git clone https://github.com/stepping-stones-agency/cabinet-slimani-desktop.git
cd cabinet-slimani-desktop

# 2. Install dependencies
npm install

# 3. Verify NAPS2 CLI binary exists
ls extraResources/naps2.console.exe
```

### Environment Configuration
Create a `.env` file in the root directory (optional for local mock mode; required for Supabase cloud sync):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# LLM Cloud Proxy Endpoint (Optional)
VITE_CLOUD_PROXY_URL=https://your-cloud-proxy.com/api/generate-petition
```

---

## 6. Usage & Operating Modes

### Running Locally

#### Option A: Running Full Desktop App (Recommended for Testing Scanners & Electron IPC)
```bash
npm run app:dev
```
*This command compiles the Electron main process, boots the Vite dev server on `http://localhost:5173`, waits for it to launch, and launches Electron.*

#### Option B: Running Web UI Only in Browser (For UI Development)
```bash
npm run dev
```
*Access the Web UI at `http://localhost:5173`.*

### Main Workflows
1. **Dashboard & Alerts Review**: View urgent CPCA procedural deadlines, active case metrics, and today's court hearings.
2. **Case Management (`سجل القضايا`)**: Add, edit, or search cases across courts, update case statuses, and manage associated client documents.
3. **USB Scanning (`الماسح الضوئي`)**: Connect an Epson DS-530 II scanner via USB, select the target case, choose resolution (e.g. 300 DPI ADF Duplex), enable OCR/Deskew, and click **Lancer le Scan USB**.
4. **CPCA Deadline Calculation (`حساب المواعيد`)**: Select procedural type (e.g. Appeal, Cassation, Opposition, Référé), input the court notification date (تاريخ التبليغ), and receive the exact statutory expiration date taking into account Article 405 weekend prorogations.
5. **Fee Tracking & Receipt Printing (`الأتعاب والوصل`)**: Track agreed fees and payments; generate and print official Law 13-07 payment receipts (وصل سداد الأتعاب).
6. **AI Dictation & Petition Generation (`المساعد الذكي`)**:
   - **Mode A (Écoute & Rédaction)**: Record audio dictation or paste raw text. The application censors PII, structures facts and legal demands into a compliant petition, unmasks client details locally, and exports a formatted `.docx` file for MS Word.
   - **Mode B (Recherche & Action)**: Type or dictate commands in natural Arabic/French to navigate, search cases, fix appointments, or generate quittances.

---

## 7. Comprehensive Features Guide

### 1. CPCA Procedural Deadline Engine (`AdminCpcaModule.tsx`)
Calculates statutory time limits governed by Algerian civil and administrative procedure law:
- **Art. 336 CPCA**: Civil/Land 1st instance judgment appeal (30 days).
- **Art. 354 CPCA**: Supreme Court / Council of State Pourvoi en Cassation (60 days / 2 months).
- **Art. 327 CPCA**: Opposition against in-absentia (غيابي) judgment (10 days).
- **Art. 304 CPCA**: Appeal against emergency injunction (أمر استعجالي) (15 days).
- **Automatic Prorogation (Art. 405/406 CPCA)**: If the final day of a deadline falls on a Friday or Saturday (official Algerian weekend), the deadline is automatically extended to the first subsequent business day (Sunday).

### 2. Epson & Hardware Document Scanning (`AdminEpsonScanModule.tsx`)
- Executes background CLI commands via `naps2.console.exe`:
  ```bash
  naps2.console.exe --output "userData/scans/Scan_Piece_123456.pdf" --driver wia --device "Epson WorkForce DS-530 II" --dpi 300 --duplex --enableocr --deskew
  ```
- Detects attached WIA/TWAIN hardware devices dynamically via PowerShell CIM query:
  ```powershell
  Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'Image' -or $_.Name -like '*Scanner*' -or $_.Name -like '*Epson*' }
  ```
- Integrates an arborescent GED File Explorer (`FileTree`) to organize scanned files by court jurisdiction (Cour Suprême, Cour d'Alger, etc.).

### 3. Fee Tracking & Law 13-07 Payment Receipts (`AdminFinancesModule.tsx` & `ArabicQuittanceModal.tsx`)
- Computes total agreed fees, received provisions, and outstanding balances.
- Generates printable official payment receipts (وصل سداد الأتعاب) featuring:
  - Office letterhead (الأستاذ نور الدين سليماني - محام لدى المحكمة العليا ومجلس الدولة).
  - Law 13-07 Article 23 legal compliance notice.
  - Unique receipt serial number, client name, case role number, payment amount in DZD, and fee motif.
  - Formatted print stylesheet (`@media print`) rendering on top of `public/wasl.png`.

### 4. Privacy-Preserving AI Dictation & Document Export (`ListenAndWriteMode.tsx`, `anonymizer.ts`, `documentGenerator.ts`)
- **Speech-to-Text Pipeline**: Captures audio input via browser `MediaRecorder` or Electron `LocalSttManager`.
- **Local Anonymization (`anonymizer.ts`)**: Censors sensitive PII before network transmission using targeted regex:
  - Phone numbers (`+213`, `05`, `06`, `07`, `021`, `023`, `031`, `041`) -> `[TEL_1]`
  - Dossier / Role numbers (`24/00412`, `1234/2026`) -> `[DOSSIER_1]`
  - Dates (`JJ/MM/AAAA`) -> `[DATE_1]`
  - National Identification Numbers (18-digit NIN) -> `[NIN_1]`
  - Known party names -> `[NOM_1]`
- **Structured Output & Fallback**: Sends anonymized text to `/api/generate-petition`. If offline or unavailable, generates fallback legal templates tailored to the selected chamber (Foncière, Commerciale, Pénal, Statut Personnel, Administratif).
- **Client-Side Word Generation (`documentGenerator.ts`)**: Re-hydrates PII back into the structured response and creates an HTML-encoded `.doc` / `.docx` file complete with traditional Algerian judicial headers (الجمهورية الجزائرية الديمقراطية الشعبية) for instant editing in MS Word.

### 5. Natural Language Intent & Action Catalog (`SearchAndActMode.tsx`, `aiActions.ts`)
- Classifies user voice/text commands into structured actions:
  - `navigate_to`: Swaps active application tabs.
  - `open_dossier`: Searches and opens case files.
  - `create_rdv`: Schedules court hearings or consultations (Medium Risk -> confirmation prompt).
  - `launch_scan`: Launches the Epson scanner interface.
  - `generate_quittance`: Prepares an official receipt (High Risk -> confirmation prompt).
  - `calculate_cpca_deadline`: Calculates statutory deadlines.
- Stores execution history in `localStorage` audit logs (`logAiAction`).

---

## 8. API Documentation & Cloud Proxy

### Cloud LLM Proxy Endpoint
The application interacts with an external Cloud Proxy for legal text structuring.

#### `POST /api/generate-petition`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "maskedText": "حيث أن الموكل [NOM_1] يملك العقار بموجب العقد [DOSSIER_1]...",
  "petitionType": "foncier",
  "lang": "ar"
}
```

**Response Body (JSON - Validated by Zod `PetitionStructureSchema`):**
```json
{
  "petitionType": "foncier",
  "jurisdiction": "محكمة بئر خادم - القسم العقاري",
  "chamber": "قسم الشؤون العقارية",
  "clientName": "[NOM_1]",
  "defendantName": "المدعى عليه: (محدد في الملف)",
  "dossierNumber": "[DOSSIER_1]",
  "phone": "[TEL_1]",
  "facts": [
    "حيث أن الموكل يملك القطعة الأرضية ذات الملكية المشهرة تحت رقم [DOSSIER_1]...",
    "حيث أن المدعى عليه قام بالتعدي والحيازة بدون سند قانوني..."
  ],
  "legalBasis": [
    "طبقا لأحكام المواد 812 وما يليها من القانون المدني الجزائري.",
    "وطبقا لأحكام المواد 511 وما يليها من قانون الإجراءات المدنية والإدارية (CPCA)."
  ],
  "requests": [
    "الإشهاد بصحة الملكية العقارية للموكل.",
    "الأمر بإخلاء المدعى عليه من الأماكن وتحميله المصاريف القضائية."
  ]
}
```

*Note: If the cloud endpoint fails or is offline, `petitionApi.ts` catches the network error and automatically returns a local chamber fallback template with `isFallbackTemplate: true`.*

---

## 9. Database Schema & Data Models

The database is built on Supabase (PostgreSQL). Below are the primary tables defined in `src/lib/supabase/database.types.ts`:

```mermaid
erdiagram
    profiles ||--o{ dossiers : "manages"
    profiles ||--o{ disponibilites : "creates"
    profiles ||--o{ contacts : "creates"
    dossiers ||--o{ rendez_vous : "has"
    dossiers ||--o{ documents : "contains"
    documents ||--o{ journal_acces : "logs"

    profiles {
        uuid id PK
        enum role "admin | client"
        string nom
        string prenom
        string telephone
        string avatar_url
        timestamp created_at
    }

    dossiers {
        uuid id PK
        uuid client_id FK
        string reference "N° Rôle Greffe (e.g. 24/00412)"
        string titre
        enum type_affaire "civil | penal | commercial | famille | immobilier | travail | administratif"
        enum statut "ouvert | en_cours | suspendu | cloture"
        string tribunal
        string numero_role
        text notes
        timestamp created_at
    }

    rendez_vous {
        uuid id PK
        uuid client_id FK
        uuid dossier_id FK
        timestamp date_debut
        timestamp date_fin
        string motif
        enum statut "en_attente | confirme | annule | termine | no_show"
        text notes_internes
        boolean rappel_envoye
    }

    documents {
        uuid id PK
        uuid dossier_id FK
        uuid uploade_par FK
        string nom_original
        string nom_stockage
        string chemin_bucket
        number taille_bytes
        string type_mime
        enum type_document "identite | acte | jugement | contrat | correspondance | preuve"
        boolean chiffre
    }

    contacts {
        uuid id PK
        enum type "client | confrere | tribunal | greffe | expert | autre"
        string nom
        string prenom
        string organisation
        string telephone
        string email
        string wilaya
    }
```

---

## 10. Authentication & Security Architecture

1. **Local Hardening & IPC Sandbox**:
   - `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`.
   - Renderer cannot execute arbitrary system binaries directly; all hardware actions are gated behind validated IPC handles in `electron/main.ts`.
2. **File Path Whitelisting**:
   - IPC handler `shell:open-path` enforces a strict extension whitelist (`.pdf`, `.docx`, `.doc`, `.jpg`, `.jpeg`, `.png`, `.tiff`, `.tif`, `.txt`, `.csv`, `.rtf`). Executable scripts (`.exe`, `.bat`, `.ps1`, `.vbs`) are strictly blocked.
3. **Professional Secrecy (Local PII Anonymization)**:
   - Dictated text is anonymized in-memory prior to any HTTP request. Real names, NINs, phone numbers, and case references never reach cloud LLM servers. Re-hydration occurs exclusively on the user's desktop client.
4. **Content Security Policy (CSP)**:
   - `index.html` implements strict CSP headers limiting script execution sources, font downloads (`fonts.googleapis.com`), and network socket origins (`*.supabase.co`).
5. **Action Risk Confirmation**:
   - High-risk actions (such as generating financial quittances or altering court dates) require explicit user confirmation before execution.

---

## 11. Configuration & Environment Variables

| Variable | Type | Required | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | String | Optional | `https://demo-cabinet-slimani.supabase.co` | Base URL for Supabase backend project. |
| `VITE_SUPABASE_ANON_KEY` | String | Optional | *(Demo JWT Token)* | Supabase Anonymous API key for client authentication. |
| `VITE_CLOUD_PROXY_URL` | String | Optional | `/api/generate-petition` | Endpoint URL for the legal LLM cloud proxy service. |

---

## 12. Development & Code Quality Guide

### Coding Standards
- **TypeScript Strict Mode**: Fully enabled (`strict: true`). Avoid `any` or `@ts-ignore`.
- **UI Component Structure**: Keep components memoized (`memo()`), modular, and responsive.
- **RTL / LTR Internationalization**: Always use dynamic direction wrappers (`dir={lang === 'ar' ? 'rtl' : 'ltr'}`).
- **State Modifications**: Never mutate Zustand state directly; use store setter functions.
- **Cleanup**: Always return cleanup handlers in `useEffect` hooks (clearing intervals, unsubscribing listeners).

### Common Utility Commands

```bash
# Run Vite Dev Server (Web view)
npm run dev

# Run Full Electron Desktop Application
npm run app:dev

# Run Oxlint / ESLint checking
npm run lint

# Preview Production Build
npm run preview
```

---

## 13. Build & Deployment Pipeline

### Compilation Steps
1. **TypeScript Type Check**: `tsc` validates all code types.
2. **Vite Frontend Build**: `vite build` bundles React components into the `dist/` folder with relative path resolution (`base: './'`).
3. **Electron Main Compilation**: `tsc -p electron/tsconfig.json` compiles main process TypeScript files into `dist-electron/`.
4. **Electron Builder Assembly**: `electron-builder` packages compiled frontend and main process assets, along with `extraResources/naps2.console.exe`, into a standalone Windows installer.

### Production Packaging Command

```bash
npm run app:build
```

### Electron Builder Target Output
- **Installer Format**: NSIS Executable (`.exe`)
- **Output Directory**: `dist-app/`
- **Product Name**: `Cabinet Slimani`
- **Application ID**: `dz.cabinet-slimani.desktop`
- **Bundled Resources**: `extraResources/naps2.console.exe` copied to `process.resourcesPath/extraResources/`.

---

## 14. Troubleshooting & Hardware Diagnostics

### 1. NAPS2 CLI Fails or No PDF Generated
- **Symptom**: Clicking "Scan" results in error: *"NAPS2 s'est terminé sans erreur mais aucun fichier n'a été produit"*.
- **Cause**: The scanner is turned off, disconnected from USB, or the driver name specified in options does not match the connected hardware.
- **Solution**: Check USB cable connection. Run `powershell -Command "Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'Image' }"` to confirm Windows detects the scanner. Ensure driver selection is set to **NAPS2 CLI** or **WIA**.

### 2. Electron Fails to Boot in Development Mode
- **Symptom**: `npm run app:dev` fails with `wait-on` timeout.
- **Cause**: Port 5173 is occupied by another Vite instance.
- **Solution**: Kill existing Node processes (`taskkill /F /IM node.exe` on Windows) and rerun `npm run app:dev`.

### 3. File Failed Security Check
- **Symptom**: Clicking a file in the scanner vault shows error: *"Sécurité : L'extension .exe n'est pas autorisée"*.
- **Cause**: The user attempted to open an unwhitelisted file extension.
- **Solution**: Only document formats (`.pdf`, `.docx`, `.jpg`, `.png`, etc.) are permitted for desktop preview.

---

## 15. Third-Party Dependencies & Integrations

| Dependency | Purpose | Integration Details |
| :--- | :--- | :--- |
| **NAPS2 CLI (`naps2.console.exe`)** | USB Scanner Hardware Control | Executed via Node `child_process.exec()` with flags (`--driver`, `--dpi`, `--duplex`, `--enableocr`, `--deskew`). |
| **@supabase/supabase-js** | Cloud Synchronization & DB | Real-time database sync, profile management, document bucket access. |
| **Framer Motion** | Desktop UI Animations | Smooth module transitions, modal animations, and bento grid entrance effects. |
| **Lucide React** | Application Iconography | Hardware icons, procedural badges, navigation indicators. |
| **Zod** | Data Validation | Validates LLM structured responses (`PetitionStructureSchema`) and form inputs. |
| **Microsoft Word (HTML format)** | Document Generation | Generates styled `.doc` files rendered in Traditional Arabic font with Algerian judicial headers. |

---

## 16. Known Issues, Technical Debt & Roadmap

### Known Issues & Current Limitations
1. **Local STT Simulation**: The STT manager in `electron/sttEngine.ts` buffers audio chunks and simulates partial text emission. Production deployment should connect to a local Whisper C++ instance or Web Speech API.
2. **Cloud Proxy Fallback**: When `/api/generate-petition` is unreachable, local chamber fallback templates generate generic structure (`isFallbackTemplate: true`).
3. **Sync Queue In-Memory Simulation**: `syncEngine.ts` simulates network latency (`setTimeout`). In production, this maps to explicit Supabase table `.upsert()` queries.

### Future Roadmap
- [ ] Direct integration with local Whisper.cpp executable for 100% offline Arabic (Algerian Darija) speech recognition.
- [ ] Advanced OCR text extraction and indexing within the GED File Explorer.
- [ ] Multi-attorney workspace synchronization via Supabase Realtime channels.

---

## 17. Complete End-to-End System Workflow

```
[ User Action: Dictates legal case facts in Arabic/French ]
                          │
                          ▼
[ Step 1: STT Engine captures audio chunks & transcribes text ]
                          │
                          ▼
[ Step 2: Local Anonymizer censors names, NIN, phones & dossier #s ]
                          │
                          ▼
[ Step 3: Anonymized payload sent to Cloud Proxy / Local Template ]
                          │
                          ▼
[ Step 4: LLM returns structured JSON (Facts, Legal Basis, Requests) ]
                          │
                          ▼
[ Step 5: Local Unmasker replaces tokens with original client PII ]
                          │
                          ▼
[ Step 6: Document Generator creates MS Word (.doc/.docx) file ]
                          │
                          ▼
[ Step 7: Epson Scanner captures physical evidence via NAPS2 CLI ]
                          │
                          ▼
[ Step 8: CPCA Engine calculates appeal deadlines with Art. 405 prorogation ]
                          │
                          ▼
[ Step 9: Finance Module generates official Law 13-07 Fee Receipt ]
                          │
                          ▼
[ Step 10: Sync Engine queues state offline & syncs to Supabase on connect ]
```

---

## ⚡ Quick Start Guide

Want to get the project running as quickly as possible? Follow these 3 simple steps:

```bash
# Step 1: Clone repository & install dependencies
git clone https://github.com/stepping-stones-agency/cabinet-slimani-desktop.git
cd cabinet-slimani-desktop
npm install

# Step 2: Launch full Electron Desktop Application
npm run app:dev

# Step 3: Explore key modules
# - Navigate tabs: Tableau de bord, Registre des Affaires, Hub Numérisation, Calculateur CPCA, Assistant IA DZ
# - Press ⌘K / Ctrl+K to open the Command Palette
```

---
*Cabinet Slimani — Al-Mouhami Pro Desktop V3.0 | Stepping Stones Agency*
"# el-mouhami-pro" 
