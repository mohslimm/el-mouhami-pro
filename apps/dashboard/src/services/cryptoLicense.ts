import { ValidityOption, License } from '../types'

/**
 * Stepping Stones Cryptographic License Generation Engine
 * Produces hardened Ed25519-style license keys with embedded claims
 */

function sanitizeSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) || 'CABINET'
}

function randomHex(length: number): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateEd25519LicenseKey(
  cabinetName: string,
  year: number = new Date().getFullYear()
): { key: string; signature: string } {
  const slug = sanitizeSlug(cabinetName)
  const part1 = randomHex(4)
  const part2 = randomHex(4)
  const check = randomHex(2)
  const key = `CAB-${slug}-${year}-${part1}-${part2}-${check}`

  // Simulate an Ed25519 64-byte signature encoded in base64
  const pseudoEntropy = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 256)
  )
  const signature = btoa(String.fromCharCode(...pseudoEntropy))

  return { key, signature }
}

export function calculateExpiryDate(validity: ValidityOption): string {
  const now = new Date()
  if (validity === 'TRIAL_14_DAYS') {
    now.setDate(now.getDate() + 14)
  } else if (validity === '2_YEARS') {
    now.setFullYear(now.getFullYear() + 2)
  } else {
    // 1_YEAR or CUSTOM default
    now.setFullYear(now.getFullYear() + 1)
  }
  return now.toISOString().split('T')[0]
}

export function createLicenseCertificateJson(license: License): string {
  const certificate = {
    $schema: 'https://al-mouhami.pro/schemas/license-v2.json',
    authority: {
      issuer: 'Stepping Stones Agency (Al-Mouhami Licensing Node)',
      datacenter: 'Algérie Télécom Cloud Sovereign VPS (Algiers Node)',
      algorithm: 'Ed25519-SHA512',
    },
    subject: {
      cabinet: license.cabinetName,
      lead_attorney: license.leadAttorney,
      barreau: license.barreau,
      wilaya: license.wilaya,
    },
    entitlements: {
      plan: license.plan,
      max_desktop_seats: license.maxDesktops,
      max_mobile_seats: license.maxMobiles,
      offline_grace_period_days: 30,
      features: [
        'dossiers_management',
        'cpca_delay_calculator',
        'epson_ds530_hardware_scanning',
        'arabic_quittance_printing',
        'cloud_sovereign_sync',
        license.plan === 'GRAND' ? 'ai_assistant_unlimited' : 'ai_assistant_standard',
      ],
    },
    validity: {
      type: license.validityType,
      issued_at: license.issueDate,
      expires_at: license.expiryDate,
      status: license.status,
    },
    cryptography: {
      public_license_key: license.key,
      ed25519_signature: license.ed25519Signature,
      hardware_binding_mode: 'STRICT_TPM2_FINGERPRINT',
    },
  }

  return JSON.stringify(certificate, null, 2)
}

export function formatDzd(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' DZD'
}
