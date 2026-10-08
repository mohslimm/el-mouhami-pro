import type { Database } from './database.types'

// Alias pratiques pour les Row types de chaque table
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Disponibilite = Database['public']['Tables']['disponibilites']['Row']
export type Dossier = Database['public']['Tables']['dossiers']['Row']
export type RendezVous = Database['public']['Tables']['rendez_vous']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type JournalAcces = Database['public']['Tables']['journal_acces']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']

// Types Insert
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type DisponibiliteInsert = Database['public']['Tables']['disponibilites']['Insert']
export type DossierInsert = Database['public']['Tables']['dossiers']['Insert']
export type RendezVousInsert = Database['public']['Tables']['rendez_vous']['Insert']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type JournalAccesInsert = Database['public']['Tables']['journal_acces']['Insert']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']

// Types Update
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type DossierUpdate = Database['public']['Tables']['dossiers']['Update']
export type RendezVousUpdate = Database['public']['Tables']['rendez_vous']['Update']

// Enums utilitaires
export type UserRole = Profile['role']
export type RendezVousStatut = RendezVous['statut']
export type DossierStatut = Dossier['statut']
export type TypeAffaire = NonNullable<Dossier['type_affaire']>
export type TypeDocument = NonNullable<Document['type_document']>
export type TypeContact = Contact['type']
export type JournalAction = JournalAcces['action']
export type RecurrenceType = Disponibilite['recurrence']
