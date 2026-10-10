# ⚖️ El-Mouhami Pro — Mobile Courtroom Companion
## Compagnon d'Audience Mosaïque & Hors-Ligne (Barreau d'Alger)

> **Application Mobile Réactive & Locale Première (Offline-First)** spécialement conçue pour les avocats plaidants et collaborateurs en déplacement dans les couloirs du **Tribunal de Sidi M'hamed**, de la **Cour d'Alger (Ruisseau)**, de **Bab El Oued**, et de **Bir Mourad Raïs**.

---

## 🏛️ 1. Vision & Architecture

Dans la pratique judiciaire algérienne (*الممارسة القضائية الميدانية*), les avocats sont confrontés à des sous-sols et des salles d'audience où la couverture réseau 4G/5G est quasi inexistante.

**El-Mouhami Pro Mobile** résout ce défi grâce à une **architecture Local-First** :
- **Base de données locale (SQLite / Async Cache)** : Toutes les audiences du jour, dossiers actifs et contacts sont mis en cache localement au départ du cabinet.
- **File d'attente de mutations FIFO hors-ligne (`MutationQueue`)** : Chaque mise à jour (décision de mise en délibéré, renvoi d'audience, mémo vocal, note de plaidoirie) est enregistrée instantanément en local avec un statut `pending_sync`. Dès que l'avocat retrouve du réseau dans le hall ou sort du tribunal, la file est déchargée automatiquement vers le **VPS souverain du cabinet à Alger**.
- **Bilinguisme intégral Français / Arabe (RTL)** : Terminologie judiciaire conforme au Code de Procédure Civile et Administrative (CPCA).
- **Design Prestige Quiet Luxury** : Palette Dark Obsidian (`#0B0D17`, `#121526`) et Laiton Chaud / Or Brossé (`#C39B57`), garantissant une lisibilité maximale même sous les éclairages intenses des couloirs de tribunal.

---

## 📱 2. Écrans & Fonctionnalités

### Screen 1 : Connexion Sécurisée & Couplage QR Code Bureau
- **Déverrouillage biométrique** : Simulation FaceID / TouchID / Empreinte digitale reliée à l'Enclave Sécurisée du terminal.
- **Scanner le QR Code du Bureau** : Pointez la caméra vers l'application Desktop (`apps/desktop`) pour appairer le smartphone et transférer les clés de session et le cache des audiences en 1 seconde.
- **Code PIN d'urgence** : Accès de secours pour les collaborateurs du cabinet.

### Screen 2 : Agenda Judiciaire & Audiences du Jour (جدول جلسات اليوم)
- **Conçu pour marcher vite dans les couloirs** : Grands numéros de rôle en surbrillance (ex: **RÔLE 04**, **RÔLE 11**, **RÔLE 23**).
- **Filtres instantanés** : Toutes, En attente, Délibéré (*تاريخ النطق*), Renvoyé (*تأجيل للاطلاع*), Plaidée (*تمت المرافعة*).
- **Actions rapides 1-Tap sur chaque carte d'audience** :
  - `تأجيل للاطلاع` (Renvoyé pour réplique avec date auto).
  - `تاريخ النطق` (Mise en délibéré pour jugement).
  - `تمت المرافعة` (Plaidoirie effectuée au fond).
  - `Consigner Décision` : Modal complet avec sélection des motifs judiciaires standard algériens (*تأجيل لتقديم المذكرات الجوابية*, *تأجيل لإجراء خبرة*, *حجز القضية للنطق بالحكم*).

### Screen 3 : Registre des Dossiers de Poche (سجل القضايا الميداني)
- Recherche instantanée par nom de client, numéro de rôle, juridiction ou partie adverse.
- **Boutons directs 1-Tap Téléphone & WhatsApp** : Appelez ou envoyez un message au client directement depuis le couloir d'audience sans chercher son numéro.
- Enjeu financier du litige chiffré en **Dinars Algériens (DZD)**.
- Prise de notes de terrain synchronisée en local.

### Screen 4 : Mémos Vocaux & Transcription des Décisions (المذكرات الصوتية)
- Enregistreur vocal rapide à la sortie immédiate de la salle d'audience.
- Visualiseur d'onde sonore et minuteur en direct.
- **Transcription IA Juridique DZ intégrée** : Génère automatiquement la synthèse écrite en arabe ou en français avec les mentions légales indispensables.
- Tags automatiques (#SidiMhamed, #Role14, #Délibéré).

### Screen 5 : Urgences Judiciaires & Énaaba (دليل المساعدين والزملاء)
- **Huissiers de Justice (محضرون قضائيون)** : Coordonnées et circonscriptions (Sidi M'hamed, Alger Centre, Bir Mourad Raïs, El Biar).
- **Confrères pour Énaaba (الزملاء - الإنابة القضائية)** : Liste des confrères présents dans les salles d'audience le matin même.
- **Générateur 1-Tap de Fiche d'Énaaba** : Sélectionne l'audience en conflit, génère le mandat de représentation confraternelle formaté et le transmet via **WhatsApp / SMS** en 1 clic.

### Header Offline-First permanent
- **Badge d'état temps réel** :
  - `🟢 Connecté au VPS Alger (24ms) — Base locale à jour`
  - `🔴 Hors-Ligne (Tribunal) — X mutations en attente`
- **Bouton d'émulation réseau (4G / Salle)** : Permet de tester instantanément le basculement hors-ligne / en-ligne.
- **Commutateur de langue FR / العربية** : Inversement bidirectionnel dynamique de l'interface (RTL / LTR).

---

## 🚀 3. Installation & Lancement

### Prérequis
- Node.js >= 18 (Recommandé: Node v20 ou v22)
- npm ou yarn
- Application **Expo Go** (sur votre smartphone iOS ou Android) ou un émulateur

### Démarrage depuis la racine du monorepo
```bash
# Lancement de l'environnement Expo
npm run mobile:start

# Ou directement pour Android
npm run mobile:android

# Ou pour iOS
npm run mobile:ios

# Ou sur navigateur Web
npm run mobile:web
```

### Démarrage direct depuis `apps/mobile`
```bash
cd apps/mobile
npm run start
```

### Vérification TypeScript
```bash
npm run typecheck
# Sortie : 0 erreur
```

---

## 📁 4. Structure des Fichiers

```
apps/mobile/
├── assets/                       # Icônes et écrans de splash
├── src/
│   ├── components/               # Composants UI modulaires
│   │   ├── CaseDetailModal.tsx   # Fiche dossier détaillée (Appel & WhatsApp)
│   │   ├── EnaabaModal.tsx       # Mandat de délégation d'audience
│   │   ├── HearingOutcomeModal.tsx# Enregistrement du mémos de délibéré/renvoi
│   │   └── OfflineStatusHeader.tsx# Header statut VPS Alger & switch hors-ligne
│   ├── i18n/
│   │   └── translations.ts       # Dictionnaires bilingues FR & AR (vocabulaire CPCA)
│   ├── navigation/
│   │   └── BottomTabBar.tsx      # Barre de navigation Warm Brass & Obsidian
│   ├── screens/
│   │   ├── LoginQrScreen.tsx     # Écran 1 : Biométrie & Scan QR Bureau
│   │   ├── TodayHearingsScreen.tsx # Écran 2 : Audiences du Jour & Rôles
│   │   ├── PocketCasesScreen.tsx # Écran 3 : Dossiers de Poche
│   │   ├── VoiceNotesScreen.tsx  # Écran 4 : Mémos Vocaux & Transcription IA
│   │   └── JudicialContactsScreen.tsx # Écran 5 : Contacts & Substitutions
│   ├── storage/
│   │   ├── db.ts                 # Gestionnaire SQLite / Cache & Queue FIFO
│   │   └── mockData.ts           # Données réalistes Tribunaux d'Alger
│   ├── stores/
│   │   └── useAppStore.ts        # Store global Zustand réactif & offline-first
│   ├── theme/
│   │   ├── colors.ts             # Palette Obsidian Void & Or Brossé
│   │   └── typography.ts         # Échelle typographique lisible
│   └── App.tsx                   # Point d'entrée principal avec Safe Area & Status Bar
├── app.json                      # Configuration Expo (permissions micro, caméra, biométrie)
├── index.ts                      # Enregistrement du root component Expo
├── package.json                  # Dépendances Expo, React Native, Zustand, Lucide
├── tsconfig.json                 # Configuration TypeScript stricte
└── README.md                     # Documentation complète
```

---

## 🔒 5. Sécurité & Conformité Déontologique
Conformément aux règles du **Barreau d'Alger** et de la loi relative à la profession d'avocat :
1. Aucun nom ou dossier n'est transmis à des serveurs tiers non souverains.
2. La file d'attente de synchronisation communique exclusivement via TLS chiffré avec l'instance Supabase auto-hébergée sur VPS algérien.
3. Le stockage local sur le terminal utilise le chiffrement matériel natif du système d'exploitation.
