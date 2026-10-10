import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { OverviewCockpitView } from './components/views/OverviewCockpitView'
import { LicenseManagerView } from './components/views/LicenseManagerView'
import { PaymentApprovalQueueView } from './components/views/PaymentApprovalQueueView'
import { ClientsDirectoryView } from './components/views/ClientsDirectoryView'
import { InfrastructureTelemetryView } from './components/views/InfrastructureTelemetryView'
import { IssueLicenseModal } from './components/modals/IssueLicenseModal'
import { ReceiptViewerModal } from './components/modals/ReceiptViewerModal'
import { ResetFingerprintModal } from './components/modals/ResetFingerprintModal'
import { LicenseDetailsModal } from './components/modals/LicenseDetailsModal'
import { ToastContainer, ToastMessage } from './components/ui/Toast'
import {
  NavigationTab,
  License,
  OfflinePayment,
  LawFirmClient,
  HardwareSeat,
  PLAN_CONFIGS,
} from './types'
import {
  INITIAL_LICENSES,
  INITIAL_OFFLINE_PAYMENTS,
  INITIAL_CLIENTS,
  INITIAL_WILAYA_STATS,
  SOVEREIGN_VPS_TELEMETRY,
} from './data/mockData'
import { generateEd25519LicenseKey, calculateExpiryDate, formatDzd } from './services/cryptoLicense'

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Core domain states
  const [licenses, setLicenses] = useState<License[]>(INITIAL_LICENSES)
  const [payments, setPayments] = useState<OfflinePayment[]>(INITIAL_OFFLINE_PAYMENTS)
  const [clients, setClients] = useState<LawFirmClient[]>(INITIAL_CLIENTS)
  const [wilayaStats] = useState(INITIAL_WILAYA_STATS)
  const [telemetry, setTelemetry] = useState(SOVEREIGN_VPS_TELEMETRY)

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] =
    useState<OfflinePayment | null>(null)
  const [resetFingerprintTarget, setResetFingerprintTarget] = useState<{
    client: LawFirmClient
    seat: HardwareSeat
  } | null>(null)
  const [inspectLicenseTarget, setInspectLicenseTarget] = useState<License | null>(null)

  // Toasts notification system
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}`,
      title,
      description,
      type,
    }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
    }, 4500)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Refresh telemetry & counts
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setTelemetry((prev) => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 8) + 24,
        dbLatencyMs: Number((Math.random() * 0.4 + 1.2).toFixed(1)),
        activeWebSocketConnections: 64 + Math.floor(Math.random() * 4),
      }))
      addToast(
        'Télémétrie actualisée',
        'Connexion directe au VPS Algérie Télécom établie (1.4 ms).',
        'info'
      )
    }, 600)
  }

  // License issuance handler
  const handleIssueLicense = (newLicense: License) => {
    setLicenses((prev) => [newLicense, ...prev])

    // Create client entry if not present
    setClients((prev) => {
      const exists = prev.some((c) => c.cabinetName === newLicense.cabinetName)
      if (!exists) {
        const newClient: LawFirmClient = {
          id: `client-${Date.now()}`,
          cabinetName: newLicense.cabinetName,
          leadAttorney: newLicense.leadAttorney,
          barreau: newLicense.barreau,
          wilaya: newLicense.wilaya,
          phone: 'Non renseigné',
          email: 'contact@cabinet.dz',
          plan: newLicense.plan,
          licenseKey: newLicense.key,
          licenseExpiry: newLicense.expiryDate,
          maxDesktops: newLicense.maxDesktops,
          maxMobiles: newLicense.maxMobiles,
          desktopsUsed: 0,
          mobilesUsed: 0,
          joinedDate: newLicense.issueDate,
          status: 'ACTIVE',
          seats: [],
        }
        return [newClient, ...prev]
      }
      return prev
    })

    addToast(
      'Licence émise avec succès !',
      `Clé ${newLicense.key} générée pour ${newLicense.cabinetName}`,
      'success'
    )
  }

  // License extension handler
  const handleExtendLicense = (licenseId: string, daysToAdd: number) => {
    setLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id === licenseId) {
          const currentExpiry = new Date(lic.expiryDate)
          currentExpiry.setDate(currentExpiry.getDate() + daysToAdd)
          const newExpiryStr = currentExpiry.toISOString().split('T')[0]
          return {
            ...lic,
            expiryDate: newExpiryStr,
            status: 'ACTIVE',
          }
        }
        return lic
      })
    )
    addToast(
      'Licence prolongée',
      `Validité étendue de +${daysToAdd} jours avec succès.`,
      'success'
    )
  }

  // Toggle Suspend
  const handleToggleSuspendLicense = (licenseId: string) => {
    setLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id === licenseId) {
          const newStatus = lic.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
          return { ...lic, status: newStatus }
        }
        return lic
      })
    )
    addToast('Statut de licence mis à jour', undefined, 'info')
  }

  // Revoke license
  const handleRevokeLicense = (licenseId: string) => {
    if (confirm('Êtes-vous sûr de vouloir révoquer définitivement cette clé de licence ?')) {
      setLicenses((prev) =>
        prev.map((lic) =>
          lic.id === licenseId ? { ...lic, status: 'EXPIRED' } : lic
        )
      )
      addToast('Licence révoquée', 'La clé a été marquée comme expirée.', 'error')
    }
  }

  // Approve payment
  const handleApprovePayment = (payment: OfflinePayment) => {
    // 1. Mark payment as approved
    setPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? { ...p, status: 'APPROVED', reviewedAt: new Date().toISOString() }
          : p
      )
    )

    // 2. Generate or renew license for this lawyer
    const { key, signature } = generateEd25519LicenseKey(payment.cabinetName)
    const newLicense: License = {
      id: `lic-${Date.now()}`,
      key,
      cabinetName: payment.cabinetName,
      leadAttorney: payment.leadAttorney,
      barreau: payment.barreau,
      wilaya: payment.barreau,
      plan: payment.plan,
      validityType: payment.validity,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: calculateExpiryDate(payment.validity),
      maxDesktops: PLAN_CONFIGS[payment.plan].maxDesktops,
      maxMobiles: PLAN_CONFIGS[payment.plan].maxMobiles,
      activeDesktops: 0,
      activeMobiles: 0,
      status: 'ACTIVE',
      ed25519Signature: signature,
      notes: `Validé après vérification bordereau ${payment.transactionRef}`,
      lastVerifiedAt: 'Activation immédiate confirmée',
    }

    setLicenses((prev) => [newLicense, ...prev])

    addToast(
      'Paiement validé & Licence activée !',
      `Versement de ${formatDzd(payment.amountDzd)} confirmé. Clé ${key} émise pour ${payment.cabinetName}.`,
      'success'
    )
  }

  // Reject payment
  const handleRejectPayment = (payment: OfflinePayment, reason: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? {
              ...p,
              status: 'REJECTED',
              reviewedAt: new Date().toISOString(),
              rejectionReason: reason,
            }
          : p
      )
    )
    addToast(
      'Bordereau rejeté',
      `Le paiement de ${payment.cabinetName} a été refusé (${reason}).`,
      'error'
    )
  }

  // Reset fingerprint
  const handleConfirmResetFingerprint = (
    client: LawFirmClient,
    seat: HardwareSeat,
    reason: string
  ) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === client.id) {
          const updatedSeats = c.seats.filter((s) => s.id !== seat.id)
          const newDesktopsUsed =
            seat.type === 'DESKTOP' ? Math.max(0, c.desktopsUsed - 1) : c.desktopsUsed
          const newMobilesUsed =
            seat.type === 'MOBILE' ? Math.max(0, c.mobilesUsed - 1) : c.mobilesUsed
          return {
            ...c,
            seats: updatedSeats,
            desktopsUsed: newDesktopsUsed,
            mobilesUsed: newMobilesUsed,
          }
        }
        return c
      })
    )

    addToast(
      'Empreinte matérielle réinitialisée !',
      `Siège libéré pour ${client.cabinetName} (${seat.deviceName}). Motif : ${reason}`,
      'success'
    )
  }

  // Trigger manual snapshot
  const handleTriggerManualBackup = () => {
    addToast(
      'Snapshot souverain initié',
      'Sauvegarde chiffrée AES-256 en cours d\'écriture sur le stockage Algérie Télécom.',
      'info'
    )
  }

  // Export report
  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Cabinet,Barreau,Plan,Statut,Cle,Expiration\n' +
      licenses
        .map(
          (l) =>
            `"${l.id}","${l.cabinetName}","${l.barreau}","${l.plan}","${l.status}","${l.key}","${l.expiryDate}"`
        )
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `al-mouhami-rapport-licences-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast('Rapport exporté', 'Fichier CSV généré avec succès.', 'success')
  }

  const pendingPaymentsCount = payments.filter((p) => p.status === 'PENDING').length
  const expiringLicensesCount = licenses.filter(
    (l) => l.status === 'EXPIRING_SOON'
  ).length

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080911] text-[#F0EDE8]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingPaymentsCount={pendingPaymentsCount}
        expiringLicensesCount={expiringLicensesCount}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Bar */}
        <Header
          currentTab={currentTab}
          onOpenIssueLicense={() => setIsIssueModalOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExportReport={handleExportReport}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {currentTab === 'overview' && (
            <OverviewCockpitView
              licenses={licenses}
              payments={payments}
              wilayaStats={wilayaStats}
              onNavigateTab={setCurrentTab}
              onOpenIssueModal={() => setIsIssueModalOpen(true)}
            />
          )}

          {currentTab === 'licenses' && (
            <LicenseManagerView
              licenses={licenses}
              onOpenIssueModal={() => setIsIssueModalOpen(true)}
              onExtendLicense={handleExtendLicense}
              onToggleSuspendLicense={handleToggleSuspendLicense}
              onRevokeLicense={handleRevokeLicense}
              onInspectLicense={(lic) => setInspectLicenseTarget(lic)}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentApprovalQueueView
              payments={payments}
              onOpenReceiptViewer={(p) => setSelectedPaymentForReceipt(p)}
              onApprovePayment={handleApprovePayment}
              onRejectPayment={handleRejectPayment}
            />
          )}

          {currentTab === 'directory' && (
            <ClientsDirectoryView
              clients={clients}
              onOpenResetFingerprint={(client, seat) =>
                setResetFingerprintTarget({ client, seat })
              }
            />
          )}

          {currentTab === 'telemetry' && (
            <InfrastructureTelemetryView
              telemetry={telemetry}
              onTriggerBackup={handleTriggerManualBackup}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <IssueLicenseModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onIssueLicense={handleIssueLicense}
      />

      <ReceiptViewerModal
        isOpen={!!selectedPaymentForReceipt}
        payment={selectedPaymentForReceipt}
        onClose={() => setSelectedPaymentForReceipt(null)}
        onApprove={handleApprovePayment}
        onReject={handleRejectPayment}
      />

      <ResetFingerprintModal
        isOpen={!!resetFingerprintTarget}
        client={resetFingerprintTarget?.client || null}
        seat={resetFingerprintTarget?.seat || null}
        onClose={() => setResetFingerprintTarget(null)}
        onConfirmReset={handleConfirmResetFingerprint}
      />

      <LicenseDetailsModal
        isOpen={!!inspectLicenseTarget}
        license={inspectLicenseTarget}
        onClose={() => setInspectLicenseTarget(null)}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
