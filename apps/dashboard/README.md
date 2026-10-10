# 👑 Stepping Stones Agency — Master Owner Cockpit (Al-Mouhami Pro)

> **Super-Admin Operational Dashboard & Sovereign Licensing Authority**  
> **Brand Identity:** Stepping Stones Luxury Dark Gold (`#080911`, `#111425`, `#C39B57`, `#E8C77A`, `#10B981`)  
> **Target Audience:** Agency Executive & Operations Command (Abdelhadi Hammaz & Partners)  
> **Stack:** Vite + React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons  

---

## 🌟 Executive Capabilities & Views

### 1. Overview & ARR Revenue Cockpit (`OverviewCockpitView.tsx`)
- **Total ARR:** 4,850,000 DZD (MRR: ~404,166 DZD / mois)
- **Active Paying Cabinets:** 58 Law Firms (+6 nouveaux ce mois, rétention 96.2%)
- **Active 14-Day Free Trials:** 24 Cabinets (Taux de conversion 71.4%)
- **Pending Offline Payments:** 3 Bordereaux CCP/Virements à valider
- **Wilaya & Barreau Distribution:** Interactive visual breakdown across Alger, Oran, Constantine, Sétif, Blida, Annaba, Tlemcen, etc.
- **Plan Segmentation:** SOLO (35,000 DZD), PRO (85,000 DZD), GRAND CABINET (180,000 DZD).

### 2. License Key Generator & Manager (`LicenseManagerView.tsx`)
- **Form to issue new annual license keys:**
  - Input Cabinet Name, Lead Attorney, Barreau, Plan, Validity (1 an, 2 ans, Essai 14 jours, Personnalisé), Max Desktops, Max Mobiles.
  - **Instant Cryptographic Generation:** Ed25519-style license keys (`CAB-SLIMANI-2026-9A4F-7B21-88`) with simulated base64 digital signature.
- **Table of Issued Licenses:**
  - Status pills (Active, Expiring Soon, Suspended, Expired, Trial).
  - **1-Click Actions:** Prolonger (+1 an / +30 jours), Suspendre / Réactiver, Révoquer, Copier Clé, Inspecter le Certificat JSON V2 officiel.

### 3. Offline Payment Approval Queue (`PaymentApprovalQueueView.tsx`)
- **Queue for CCP & Bank Wire Slips:**
  - Law firm contact, amount in DZD, bank/post slip number, submission date.
  - **Receipt Image Viewer:** Interactive modal with zoom in/out, rotate, reset, and full-screen preview.
  - **1-Click Actions:**
    - `[ ✔ Valider & Activer ]` — Automatically approves payment, generates an Ed25519 license key, and registers the firm.
    - `[ ❌ Rejeter ]` — Modal with structured rejection reasons (Illegible slip, Amount mismatch, Missing official bank stamp).

### 4. Client Law Firms & Hardware Fingerprints Directory (`ClientsDirectoryView.tsx`)
- **Directory of registered law practices** (Cabinet Me Slimani, Me Benali, Me Khelil, etc.).
- **Hardware Machine Seats:**
  - Desktops (e.g. 2/3) and Mobiles (e.g. 1/3) tracked by TPM 2.0 hardware hash (`HW-D4F8-7A19-E302-881A`).
  - Device names, OS (Windows 11 Pro, macOS Sonoma, Android 14), IP address, last sync timestamp.
- **1-Click Hardware Fingerprint Reset:**
  - Allows an attorney who purchases a new laptop or wipes Windows to release their hardware seat with one click and administrative audit trail.

### 5. Infrastructure & Sovereign VPS Telemetry (`InfrastructureTelemetryView.tsx`)
- **Algérie Télécom Cloud Sovereign VPS:**
  - Datacenter Algiers (Ben Aknoun Node) • 16 vCPU AMD EPYC (28% charge)
  - 14.8 Go / 64 Go RAM ECC DDR4
  - 142.4 Go / 500 Go NVMe SSD RAID10
  - 99.98% Uptime (148 jours)
  - 64 Cabinets synchronisés en direct via WebSockets TLS 1.3
  - PostgreSQL 16.3 + pgvector (1.4 ms latence de réplication)
  - Sauvegardes nocturnes AES-256 (Dernier snapshot validé à 03:00 UTC+1)

---

## 🚀 How to Run

### From the Monorepo Root:
```bash
# Start Dashboard dev server (runs on http://127.0.0.1:5174)
npm run dashboard:dev

# Build for production (TypeScript check + Vite bundle)
npm run dashboard:build

# Preview production build
npm run dashboard:preview
```

### Directly inside `apps/dashboard`:
```bash
cd apps/dashboard
npm run dev
npm run build
npm run preview
```
