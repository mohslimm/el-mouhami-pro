import type { SttAPI } from '../../electron/preload'

declare global {
  interface Window {
    sttAPI?: SttAPI
  }
}
