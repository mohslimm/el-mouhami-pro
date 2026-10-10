import React, { useState } from 'react'
import {
  Radio,
  Send,
  Bell,
  Sparkles,
  AlertCircle,
  Wrench,
  CheckCircle2,
  Users,
  Smartphone,
  Monitor,
  Eye,
  History,
} from 'lucide-react'
import { MetricCard } from '../ui/MetricCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { BroadcastMessage } from '../../types'

interface BroadcastCenterViewProps {
  broadcasts: BroadcastMessage[]
  onPublishBroadcast: (newBroadcast: BroadcastMessage) => void
}

export const BroadcastCenterView: React.FC<BroadcastCenterViewProps> = ({
  broadcasts,
  onPublishBroadcast,
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<BroadcastMessage['type']>('UPDATE')
  const [target, setTarget] = useState<BroadcastMessage['target']>('ALL')
  const [versionTag, setVersionTag] = useState('v1.2.5-stable')
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false)

  // Aggregates
  const totalBroadcasts = broadcasts.length
  const activeBroadcasts = broadcasts.filter((b) => b.status === 'ACTIVE').length
  const totalReach = broadcasts.reduce((acc, b) => acc + b.reachCount, 0)

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return

    const newMsg: BroadcastMessage = {
      id: `bc-${Date.now()}`,
      title,
      content,
      type,
      target,
      versionTag: type === 'UPDATE' ? versionTag : undefined,
      publishedAt: 'À l\'instant',
      status: 'ACTIVE',
      reachCount:
        target === 'ALL'
          ? 82
          : target === 'BARREAU_ALGER'
          ? 36
          : target === 'BARREAU_ORAN'
          ? 22
          : 44,
    }

    onPublishBroadcast(newMsg)
    setTitle('')
    setContent('')
    setIsSuccessFeedback(true)
    setTimeout(() => setIsSuccessFeedback(false), 3500)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Annonces Diffusées"
          value={totalBroadcasts}
          subtitle="Mises à jour logicielles & alertes barreaux"
          icon={<Radio className="w-5 h-5 text-[#E8C77A]" />}
          accentColor="#C39B57"
        />

        <MetricCard
          title="Bannières Actives en Ligne"
          value={activeBroadcasts}
          subtitle="Visibles actuellement sur desktop & mobile"
          icon={<Bell className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          accentColor="#10B981"
        />

        <MetricCard
          title="Cabinets Atteints en Direct"
          value={`${totalReach} réceptions`}
          subtitle="Instantanéité via WebSockets Sovereign"
          icon={<Users className="w-5 h-5 text-blue-400" />}
          iconBgColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
          accentColor="#3B82F6"
        />
      </div>

      {/* Main Grid: Composer & Real-time Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Broadcast Composer */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0D0F1D] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-serif-luxury flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#E8C77A]" />
                Rédacteur de Notification Push & Mise à Jour
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Diffusion en temps réel sur les écrans d'accueil des avocats et secrétaires
              </p>
            </div>
            {isSuccessFeedback && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-3.5 h-3.5" /> Diffusé avec succès !
              </span>
            )}
          </div>

          <form onSubmit={handlePublish} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 mb-1 font-medium">Type d'Annonce</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as BroadcastMessage['type'])}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none"
                >
                  <option value="UPDATE">Mise à Jour Logicielle (Téléchargement)</option>
                  <option value="LEGAL_ALERT">Alerte Juridique & Barreau</option>
                  <option value="MAINTENANCE">Maintenance Datacenter</option>
                  <option value="INFO">Notification Générale</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">Ciblage Destinataires</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as BroadcastMessage['target'])}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none"
                >
                  <option value="ALL">Tous les Cabinets (Algérie entière)</option>
                  <option value="BARREAU_ALGER">Barreau d'Alger uniquement</option>
                  <option value="BARREAU_ORAN">Barreau d'Oran uniquement</option>
                  <option value="PRO_TIER">Formules PRO & GRAND uniquement</option>
                </select>
              </div>
            </div>

            {type === 'UPDATE' && (
              <div>
                <label className="block text-white/60 mb-1 font-medium">Tag de Version Déployé</label>
                <input
                  type="text"
                  placeholder="Ex: v1.2.5-stable"
                  value={versionTag}
                  onChange={(e) => setVersionTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none font-mono-code"
                />
              </div>
            )}

            <div>
              <label className="block text-white/60 mb-1 font-medium">Titre du Message</label>
              <input
                type="text"
                required
                placeholder="Ex: Mise à jour v1.2.5 : Compatibilité Scanners & Délais CPCA 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-medium">Corps de l'Annonce</label>
              <textarea
                required
                rows={4}
                placeholder="Détaillez les nouveautés, correctifs ou consignes pour les confrères..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                type="submit"
                icon={<Send className="w-4 h-4" />}
              >
                Diffuser Immédiatement sur le Réseau
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview in Lawyer's App */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0D0F1D] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#E8C77A]" />
              Aperçu en Temps Réel sur le Poste Avocat
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <Monitor className="w-3.5 h-3.5" /> Desktop & <Smartphone className="w-3.5 h-3.5" /> Mobile
            </div>
          </div>

          <p className="text-[11px] text-white/50">
            Voici la bannière luxueuse qui s'affichera instantanément en haut de l'écran du logiciel
            chez l'avocat :
          </p>

          {/* Luxury Banner Mockup */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#121526] via-[#1a1f38] to-[#121526] border border-[#C39B57]/50 shadow-[0_4px_20px_rgba(195,155,87,0.2)] space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C39B57]/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {type === 'UPDATE' ? (
                  <Sparkles className="w-4 h-4 text-[#E8C77A] animate-spin" />
                ) : type === 'LEGAL_ALERT' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                ) : type === 'MAINTENANCE' ? (
                  <Wrench className="w-4 h-4 text-blue-400" />
                ) : (
                  <Bell className="w-4 h-4 text-[#E8C77A]" />
                )}
                <span className="text-[11px] font-bold text-[#E8C77A] tracking-wide uppercase font-serif-luxury">
                  {type === 'UPDATE'
                    ? `Mise à Jour Disponible (${versionTag || 'v1.2.5'})`
                    : type === 'LEGAL_ALERT'
                    ? 'Alerte Juridique Officielle'
                    : type === 'MAINTENANCE'
                    ? 'Information Maintenance'
                    : 'Notification Al-Mouhami Pro'}
                </span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#C39B57]/20 text-[#E8C77A] font-mono-code font-bold">
                {target === 'ALL'
                  ? 'Tous Cabinets'
                  : target === 'BARREAU_ALGER'
                  ? 'Barreau d\'Alger'
                  : target === 'BARREAU_ORAN'
                  ? 'Barreau d\'Oran'
                  : 'Pro & Grand'}
              </span>
            </div>

            <div className="text-xs font-semibold text-white">
              {title || 'Titre de la nouvelle mise à jour logicielle'}
            </div>

            <div className="text-[11px] text-white/70 leading-relaxed">
              {content ||
                'Cliquez sur "Installer la mise à jour" pour synchroniser automatiquement les nouveaux barèmes et pilotes de scanner sur votre poste.'}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px]">
              <span className="text-white/40">Éditeur : Stepping Stones Agency HQ</span>
              <span className="px-2 py-0.5 rounded bg-[#C39B57] text-[#080911] font-bold">
                Installer (1-Clic)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* History of Past Broadcasts */}
      <div className="rounded-2xl bg-[#0D0F1D] border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-[#111425]/40 flex items-center justify-between">
          <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#E8C77A]" />
            Historique des Diffusions & Taux de Réception
          </div>
          <span className="text-[11px] text-white/40">{broadcasts.length} annonces archivées</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#111425]/60 text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Titre / Sujet</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Cible</th>
                <th className="py-3 px-4 font-semibold text-center">Version Tag</th>
                <th className="py-3 px-4 font-semibold">Date d'Envoi</th>
                <th className="py-3 px-4 font-semibold text-center">Taux Réception</th>
                <th className="py-3 px-4 font-semibold text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div>{b.title}</div>
                    <div className="text-[11px] text-white/50 font-normal line-clamp-1">
                      {b.content}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {b.type === 'UPDATE' ? (
                      <Badge variant="approved">Mise à Jour</Badge>
                    ) : b.type === 'LEGAL_ALERT' ? (
                      <Badge variant="expiring">Alerte Barreau</Badge>
                    ) : b.type === 'MAINTENANCE' ? (
                      <Badge variant="cyan">Maintenance</Badge>
                    ) : (
                      <Badge variant="default">Information</Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-white/70">
                    {b.target === 'ALL'
                      ? 'Tous Cabinets'
                      : b.target === 'BARREAU_ALGER'
                      ? 'Barreau Alger'
                      : b.target === 'BARREAU_ORAN'
                      ? 'Barreau Oran'
                      : 'Formules Pro & Grand'}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono-code text-[#E8C77A]">
                    {b.versionTag || '—'}
                  </td>

                  <td className="py-3.5 px-4 text-white/60">{b.publishedAt}</td>

                  <td className="py-3.5 px-4 text-center font-mono-code font-bold text-emerald-400">
                    {b.reachCount} cabinets
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {b.status === 'ACTIVE' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        En Direct
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40 border border-white/10">
                        Archivé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
