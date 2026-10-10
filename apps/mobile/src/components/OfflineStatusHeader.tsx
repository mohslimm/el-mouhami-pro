import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wifi, WifiOff, RefreshCw, Globe, Server } from 'lucide-react-native';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';

export const OfflineStatusHeader: React.FC = () => {
  const {
    language,
    setLanguage,
    syncStatus,
    toggleNetworkSimulation,
    triggerManualSync,
    session,
  } = useAppStore();

  const t = translations[language];
  const isArabic = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <View style={styles.container}>
      {/* Top Banner: Cabinet Brand & Language */}
      <View style={[styles.topRow, isArabic && styles.rtlRow]}>
        <View style={styles.cabinetBadge}>
          <Text style={styles.cabinetTitle}>
            {isArabic ? 'مكتب الأستاذ ن. سليماني' : 'Cabinet Me N. Slimani'}
          </Text>
          <Text style={styles.barreauText}>
            {isArabic ? 'نقابة محامي الجزائر' : "Barreau d'Alger"}
          </Text>
        </View>

        <View style={[styles.headerActions, isArabic && styles.rtlRow]}>
          <TouchableOpacity
            style={styles.langButton}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Globe size={13} color={colors.gold.primary} />
            <Text style={styles.langText}>{language === 'fr' ? 'العربية' : 'Français'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Network / VPS Connectivity Status Bar */}
      <View
        style={[
          styles.statusBar,
          syncStatus.isOnline ? styles.statusBarOnline : styles.statusBarOffline,
          isArabic && styles.rtlRow,
        ]}
      >
        <TouchableOpacity
          style={[styles.statusInfo, isArabic && styles.rtlRow]}
          onPress={toggleNetworkSimulation}
          activeOpacity={0.8}
        >
          {syncStatus.isOnline ? (
            <View style={styles.iconWithPulse}>
              <View style={styles.onlineDot} />
              <Wifi size={14} color={colors.status.emerald} />
            </View>
          ) : (
            <View style={styles.iconWithPulse}>
              <View style={styles.offlineDot} />
              <WifiOff size={14} color={colors.status.ruby} />
            </View>
          )}

          <View style={styles.statusTextContainer}>
            <Text
              style={[
                styles.statusTitle,
                { color: syncStatus.isOnline ? colors.status.emerald : colors.status.ruby },
              ]}
            >
              {syncStatus.isOnline
                ? `${t.sync.connected} (${syncStatus.serverPingMs}ms)`
                : `${t.sync.offline}`}
            </Text>
            <Text style={styles.statusSubtitle}>
              {syncStatus.pendingMutationsCount > 0
                ? `${syncStatus.pendingMutationsCount} ${t.sync.pendingCount}`
                : syncStatus.isOnline
                ? `${t.sync.allSynced} • ${syncStatus.lastSyncedAt}`
                : 'Stockage SQLite local actif'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Sync Trigger / Mode Switch */}
        <View style={[styles.syncActions, isArabic && styles.rtlRow]}>
          {syncStatus.pendingMutationsCount > 0 && syncStatus.isOnline && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={triggerManualSync}
              activeOpacity={0.7}
            >
              <RefreshCw size={12} color={colors.text.inverse} />
              <Text style={styles.syncButtonText}>Sync ({syncStatus.pendingMutationsCount})</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.networkToggle}
            onPress={toggleNetworkSimulation}
            activeOpacity={0.7}
          >
            <Server size={11} color={colors.gold.light} />
            <Text style={styles.networkToggleText}>
              {syncStatus.isOnline ? '4G' : 'Salle'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  cabinetBadge: {
    flexDirection: 'column',
  },
  cabinetTitle: {
    color: colors.gold.light,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  barreauText: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
  },
  langText: {
    color: colors.gold.light,
    fontSize: 11,
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBarOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusBarOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  iconWithPulse: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.emerald,
  },
  offlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.ruby,
  },
  statusTextContainer: {
    flexDirection: 'column',
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusSubtitle: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  syncActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncButtonText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
  networkToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  networkToggleText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
  },
});
