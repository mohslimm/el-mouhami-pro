# El-Mouhami Pro — Application Mobile

## Présentation
Application mobile compagnon pour les avocats et collaborateurs du cabinet en déplacement (audiences, tribunaux, consultations extérieures).

## Stack Prévue
- **Framework** : React Native (Expo)
- **Base locale (Offline-First)** : WatermelonDB ou SQLite local
- **Synchronisation** : Sync en tâche de fond vers l'instance souveraine Supabase (VPS Algérie Télécom)
- **Logique partagée** : Consomme `@el-mouhami/shared` (délais CPCA, validations Zod, modèles de données)
