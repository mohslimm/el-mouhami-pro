/**
 * Design System Tokens — Cabinet Slimani (Quiet Luxury)
 * 
 * Tokens définissent la palette, l'espacement, la typographie.
 * Utilisez ces tokens plutôt que des valeurs hardcodées.
 * 
 * CSS vars disponibles via src/index.css :root
 * Classes Tailwind définies via @apply dans src/index.css
 */

export const designTokens = {
  /* Couleurs — Backgrounds */
  colors: {
    backgrounds: {
      void: 'var(--bg-void)',           // #060610 — Arrière-plan éloigné
      primary: 'var(--bg-primary)',     // #0B0D17 — Arrière-plan principal
      surface: 'var(--bg-surface)',     // #121526 — Surface de travail
      elevated: 'var(--bg-elevated)',   // #1A1D2E — Cartes, panneaux
      card: 'var(--bg-card)',           // #161929 — Cartes individuelles
    },

    /* Accent primaire — Or/Laiton */
    accent: {
      300: 'var(--gold-300)',           // #E8C77A — Clair, highlights
      400: 'var(--gold-400)',           // #D4B06A — Secondaire
      500: 'var(--gold-500)',           // #C39B57 — Principal
      glow: 'var(--gold-glow)',         // rgba(...) — Lueur subtile
    },

    /* Texte */
    text: {
      primary: 'var(--text-primary)',       // #F0EDE8 — Texte principal
      secondary: 'var(--text-secondary)',   // rgba(..., 0.80) — Texte secondaire
      muted: 'var(--text-muted)',           // rgba(..., 0.50) — Hints, captions
    },

    /* Bordures */
    borders: {
      subtle: 'var(--border-subtle)',       // rgba(255, 255, 255, 0.08)
      medium: 'var(--border-medium)',       // rgba(255, 255, 255, 0.12)
      gold: 'var(--border-gold)',           // rgba(195, 155, 87, 0.35)
    },

    /* Sémantiques */
    semantic: {
      success: 'var(--success)',   // #34D399 — Succès
      danger: 'var(--danger)',     // #F87171 — Erreur
      warning: 'var(--warning)',   // #FBBF24 — Avertissement
    },
  },

  /* Espacement — 4px base grid */
  spacing: {
    xs: 'var(--gap-xs)',   // 4px
    sm: 'var(--gap-sm)',   // 8px
    md: 'var(--gap-md)',   // 16px
    lg: 'var(--gap-lg)',   // 24px
    xl: 'var(--gap-xl)',   // 32px
  },

  /* Typographie — Classes Tailwind + inline */
  typography: {
    h1: 'text-h1',              // Cormorant Garamond, 3rem, light, wide tracking
    h2: 'text-h2',              // Cormorant Garamond, 1.875rem, light, wide tracking
    h3: 'text-h3',              // Outfit, 1.25rem, semibold
    body: 'text-body',          // Outfit, 1rem, regular, relaxed leading
    label: 'text-label',        // Outfit, 0.75rem, uppercase, wide tracking
    caption: 'text-caption',    // Outfit, 0.75rem
    code: 'font-mono text-sm',  // JetBrains Mono
  },

  /* Rayons de bordure */
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
  },

  /* Ombres */
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)',
    lg: '0 16px 40px rgba(0, 0, 0, 0.5)',
  },

  /* Transitions */
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
  },
} as const

/**
 * Classe helpers — Chaînes de className prêtes à l'emploi
 * Utilisez-les dans des composants réutilisables
 */
export const componentClasses = {
  button: {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  },

  input: 'input',

  card: {
    default: 'card',
    widget: 'widget-card',
    metric: 'metric-card',
  },

  nav: {
    button: 'nav-btn',
    buttonActive: 'nav-btn active',
  },

  text: {
    h1: 'text-h1',
    h2: 'text-h2',
    h3: 'text-h3',
    body: 'text-body',
    label: 'text-label',
    caption: 'text-caption',
  },
} as const

/**
 * RTL Helper — À utiliser pour conditionner des styles RTL
 * Exemple: className={`ml-4 ${isRtl ? 'rtl:mr-4' : ''}`}
 */
export const rtlClasses = {
  margin: {
    left: 'ltr:ml-4 rtl:mr-4',
    right: 'ltr:mr-4 rtl:ml-4',
  },
  padding: {
    left: 'ltr:pl-3 rtl:pr-3',
    right: 'ltr:pr-3 rtl:pl-3',
  },
  justify: {
    start: 'ltr:justify-start rtl:justify-end',
    end: 'ltr:justify-end rtl:justify-start',
  },
} as const

/**
 * Utilité : Fusion de tokens pour créer des variants
 */
export const createButtonVariant = (bg: string, text: string, border: string) => ({
  background: `var(${bg})`,
  color: `var(${text})`,
  border: `1px solid var(${border})`,
})

/**
 * Exemple d'utilisation :
 *
 * // Dans un composant
 * import { designTokens, componentClasses } from '@/design-tokens'
 *
 * <div style={{ gap: designTokens.spacing.lg }}>
 *   <h2 className={componentClasses.text.h2}>Titre</h2>
 *   <button className={componentClasses.button.primary}>Action</button>
 * </div>
 */
