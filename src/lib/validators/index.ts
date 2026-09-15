import { z } from 'zod'

// ── Schémas de validation partagés — Cabinet Slimani ────────

// Numéro de téléphone algérien
const ALGERIAN_PHONE_REGEX = /^(0[567]\d{8}|0[1-4]\d{7})$/
const phoneSchema = z.string().regex(ALGERIAN_PHONE_REGEX, 'Numéro de téléphone algérien invalide')

// ── Rendez-vous ─────────────────────────────────────────────
export const RendezVousPublicSchema = z.object({
  disponibilite_id: z.string().min(1, 'Identifiant de créneau invalide'),
  date_debut: z.string().datetime({ offset: true }),
  date_fin: z.string().datetime({ offset: true }),
  nom: z.string().min(2, 'Minimum 2 caractères').max(80),
  prenom: z.string().min(2, 'Minimum 2 caractères').max(80),
  email: z.string().email('Email invalide'),
  telephone: phoneSchema,
  motif: z.string().min(10, 'Décrivez votre demande en au moins 10 caractères').max(500),
})

export type RendezVousPublicInput = z.infer<typeof RendezVousPublicSchema>

// ── Contact ─────────────────────────────────────────────────
export const ContactSchema = z.object({
  nom: z.string().min(2).max(80),
  email: z.string().email('Email invalide'),
  sujet: z.string().min(3).max(120),
  message: z.string().min(10, 'Message trop court').max(2000),
})

export type ContactInput = z.infer<typeof ContactSchema>

// ── Auth ────────────────────────────────────────────────────
export const MagicLinkSchema = z.object({
  email: z.string().email('Email invalide'),
})

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

// ── Upload document ─────────────────────────────────────────
const MAX_FILE_SIZE_MB = 20
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const DocumentUploadSchema = z.object({
  dossier_id: z.string().uuid(),
  nom_original: z.string().min(1).max(255),
  taille_bytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, `Taille maximum : ${MAX_FILE_SIZE_MB} Mo`),
  type_mime: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG, WEBP, DOC, DOCX' }),
  }),
  type_document: z.enum([
    'identite', 'acte', 'jugement', 'contrat', 'correspondance',
    'preuve', 'formulaire', 'autre',
  ]).optional(),
  description: z.string().max(500).optional(),
})

export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>

// ── Disponibilité (admin) ────────────────────────────────────
export const DisponibiliteSchema = z.object({
  date_debut: z.string().datetime({ offset: true }),
  date_fin: z.string().datetime({ offset: true }),
  recurrence: z.enum(['none', 'weekly', 'biweekly', 'monthly']).default('none'),
  notes: z.string().max(500).optional(),
}).refine(data => new Date(data.date_fin) > new Date(data.date_debut), {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['date_fin'],
})

// ── Dossier (admin) ─────────────────────────────────────────
export const DossierSchema = z.object({
  client_id: z.string().uuid(),
  titre: z.string().min(3).max(200),
  type_affaire: z.enum([
    'civil', 'penal', 'commercial', 'famille',
    'immobilier', 'travail', 'administratif', 'autre',
  ]).optional(),
  tribunal: z.string().max(200).optional(),
  numero_role: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
})

// ── Contact (admin carnet) ───────────────────────────────────
export const ContactEntrySchema = z.object({
  type: z.enum(['client', 'confrere', 'tribunal', 'greffe', 'expert', 'autre']),
  nom: z.string().min(2).max(100),
  prenom: z.string().max(80).optional(),
  organisation: z.string().max(200).optional(),
  telephone: phoneSchema.optional(),
  telephone2: phoneSchema.optional(),
  email: z.string().email().optional().or(z.literal('')),
  adresse: z.string().max(500).optional(),
  wilaya: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
})
