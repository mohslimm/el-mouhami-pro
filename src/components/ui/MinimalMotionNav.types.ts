export type NavVariant = 'dark-closed' | 'dark-open' | 'light-closed' | 'light-open'

export interface MinimalMotionNavProps {
  className?: string
  showClock?: boolean
  initialVariant?: NavVariant
}
