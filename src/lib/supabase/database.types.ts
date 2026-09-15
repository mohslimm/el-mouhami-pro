// Ce fichier est généré automatiquement par :
// npm run db:types (supabase gen types typescript)
// Ne pas modifier manuellement.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'client'
          nom: string
          prenom: string
          telephone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'client'
          nom: string
          prenom: string
          telephone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'client'
          nom?: string
          prenom?: string
          telephone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      disponibilites: {
        Row: {
          id: string
          date_debut: string
          date_fin: string
          recurrence: 'none' | 'weekly' | 'biweekly' | 'monthly'
          actif: boolean
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          date_debut: string
          date_fin: string
          recurrence?: 'none' | 'weekly' | 'biweekly' | 'monthly'
          actif?: boolean
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          date_debut?: string
          date_fin?: string
          recurrence?: 'none' | 'weekly' | 'biweekly' | 'monthly'
          actif?: boolean
          notes?: string | null
        }
      }
      dossiers: {
        Row: {
          id: string
          client_id: string
          reference: string
          titre: string
          type_affaire: 'civil' | 'penal' | 'commercial' | 'famille' | 'immobilier' | 'travail' | 'administratif' | 'autre' | null
          statut: 'ouvert' | 'en_cours' | 'suspendu' | 'cloture'
          tribunal: string | null
          numero_role: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          reference?: string
          titre: string
          type_affaire?: 'civil' | 'penal' | 'commercial' | 'famille' | 'immobilier' | 'travail' | 'administratif' | 'autre' | null
          statut?: 'ouvert' | 'en_cours' | 'suspendu' | 'cloture'
          tribunal?: string | null
          numero_role?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          titre?: string
          type_affaire?: 'civil' | 'penal' | 'commercial' | 'famille' | 'immobilier' | 'travail' | 'administratif' | 'autre' | null
          statut?: 'ouvert' | 'en_cours' | 'suspendu' | 'cloture'
          tribunal?: string | null
          numero_role?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      rendez_vous: {
        Row: {
          id: string
          client_id: string
          dossier_id: string | null
          disponibilite_id: string | null
          date_debut: string
          date_fin: string
          motif: string
          statut: 'en_attente' | 'confirme' | 'annule' | 'termine' | 'no_show'
          notes_internes: string | null
          lien_annulation: string | null
          rappel_envoye: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          dossier_id?: string | null
          disponibilite_id?: string | null
          date_debut: string
          date_fin: string
          motif: string
          statut?: 'en_attente' | 'confirme' | 'annule' | 'termine' | 'no_show'
          notes_internes?: string | null
          lien_annulation?: string | null
          rappel_envoye?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          statut?: 'en_attente' | 'confirme' | 'annule' | 'termine' | 'no_show'
          notes_internes?: string | null
          rappel_envoye?: boolean
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          dossier_id: string
          uploade_par: string
          nom_original: string
          nom_stockage: string
          chemin_bucket: string
          taille_bytes: number
          type_mime: string
          type_document: 'identite' | 'acte' | 'jugement' | 'contrat' | 'correspondance' | 'preuve' | 'formulaire' | 'autre' | null
          description: string | null
          chiffre: boolean
          created_at: string
        }
        Insert: {
          id?: string
          dossier_id: string
          uploade_par: string
          nom_original: string
          nom_stockage: string
          chemin_bucket: string
          taille_bytes: number
          type_mime: string
          type_document?: 'identite' | 'acte' | 'jugement' | 'contrat' | 'correspondance' | 'preuve' | 'formulaire' | 'autre' | null
          description?: string | null
          chiffre?: boolean
          created_at?: string
        }
        Update: {
          description?: string | null
          type_document?: 'identite' | 'acte' | 'jugement' | 'contrat' | 'correspondance' | 'preuve' | 'formulaire' | 'autre' | null
        }
      }
      journal_acces: {
        Row: {
          id: string
          document_id: string
          accede_par: string
          action: 'lecture' | 'telechargement' | 'upload' | 'suppression'
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          accede_par: string
          action: 'lecture' | 'telechargement' | 'upload' | 'suppression'
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: never
      }
      contacts: {
        Row: {
          id: string
          type: 'client' | 'confrere' | 'tribunal' | 'greffe' | 'expert' | 'autre'
          nom: string
          prenom: string | null
          organisation: string | null
          telephone: string | null
          telephone2: string | null
          email: string | null
          adresse: string | null
          wilaya: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type?: 'client' | 'confrere' | 'tribunal' | 'greffe' | 'expert' | 'autre'
          nom: string
          prenom?: string | null
          organisation?: string | null
          telephone?: string | null
          telephone2?: string | null
          email?: string | null
          adresse?: string | null
          wilaya?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: 'client' | 'confrere' | 'tribunal' | 'greffe' | 'expert' | 'autre'
          nom?: string
          prenom?: string | null
          organisation?: string | null
          telephone?: string | null
          telephone2?: string | null
          email?: string | null
          adresse?: string | null
          wilaya?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
