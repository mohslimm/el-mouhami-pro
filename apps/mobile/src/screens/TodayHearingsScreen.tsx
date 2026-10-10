import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Scale,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Gavel,
  Layers,
} from 'lucide-react-native';
import { CourtHearing, HearingOutcomeStatus } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';
import { OfflineStatusHeader } from '../components/OfflineStatusHeader';
import { HearingOutcomeModal } from '../components/HearingOutcomeModal';

export const TodayHearingsScreen: React.FC = () => {
  const {
    language,
    hearings,
    searchQuery,
    setSearchQuery,
    hearingFilter,
    setHearingFilter,
    updateHearingOutcome,
  } = useAppStore();

  const t = translations[language];
  const isArabic = language === 'ar';

  const [selectedHearing, setSelectedHearing] = useState<CourtHearing | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filter hearings based on search & status filter
  const filteredHearings = hearings.filter((h) => {
    const matchesFilter =
      hearingFilter === 'all' ? true : h.status === hearingFilter;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesFilter;

    const matchesQuery =
      h.roleNumber.toString().includes(query) ||
      h.caseNumber.toLowerCase().includes(query) ||
      h.clientName.toLowerCase().includes(query) ||
      h.opposingParty.toLowerCase().includes(query) ||
      h.courtroom.toLowerCase().includes(query) ||
      h.judge.toLowerCase().includes(query) ||
      h.chamber.toLowerCase().includes(query) ||
      h.jurisdiction.toLowerCase().includes(query);

    return matchesFilter && matchesQuery;
  });

  const handleOpenOutcome = (hearing: CourtHearing) => {
    setSelectedHearing(hearing);
    setModalVisible(true);
  };

  const handleQuickStatus = async (hearing: CourtHearing, status: HearingOutcomeStatus) => {
    let note = '';
    let nextDate = '2026-10-24';
    if (status === 'deliberation') {
      note = isArabic ? 'حجز القضية للنطق بالحكم' : 'Mise en délibéré pour prononcé du jugement';
    } else if (status === 'postponed') {
      note = isArabic ? 'تأجيل للاطلاع وتبادل المذكرات' : 'Renvoyé pour réplique et communication de pièces';
    } else if (status === 'pleaded') {
      note = isArabic ? 'تمت المرافعة جاهز' : 'Plaidoirie effectuée au fond';
    }
    await updateHearingOutcome(hearing.id, status, note, nextDate, note);
  };

  const getStatusBadge = (status: HearingOutcomeStatus) => {
    switch (status) {
      case 'deliberation':
        return {
          label: isArabic ? 'تاريخ النطق' : 'Délibéré',
          bg: colors.status.blueGlow,
          text: colors.status.blue,
          border: 'rgba(59, 130, 246, 0.4)',
        };
      case 'postponed':
        return {
          label: isArabic ? 'تأجيل للاطلاع' : 'Renvoyé',
          bg: colors.status.amberGlow,
          text: colors.status.amber,
          border: 'rgba(245, 158, 11, 0.4)',
        };
      case 'pleaded':
        return {
          label: isArabic ? 'تمت المرافعة' : 'Plaidée',
          bg: colors.status.emeraldGlow,
          text: colors.status.emerald,
          border: 'rgba(16, 185, 129, 0.4)',
        };
      default:
        return {
          label: isArabic ? 'في الانتظار' : 'En attente',
          bg: colors.surfaceElevated,
          text: colors.text.muted,
          border: colors.cardBorder,
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineStatusHeader />

      <View style={styles.container}>
        {/* Title & Fast Stats Bar */}
        <View style={[styles.titleSection, isArabic && styles.rtlRow]}>
          <View>
            <Text style={styles.screenTitle}>
              {isArabic ? t.hearings.titleAr : t.hearings.title}
            </Text>
            <Text style={styles.screenSubtitle}>{t.hearings.subtitle}</Text>
          </View>
          <View style={styles.statsBadge}>
            <Text style={styles.statsCount}>{filteredHearings.length}</Text>
            <Text style={styles.statsLabel}>{t.hearings.stats.total}</Text>
          </View>
        </View>

        {/* High-Visibility Search Input */}
        <View style={[styles.searchContainer, isArabic && styles.rtlRow]}>
          <Search size={18} color={colors.gold.primary} />
          <TextInput
            style={[styles.searchInput, isArabic && styles.rtlText]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.hearings.searchPlaceholder}
            placeholderTextColor={colors.text.muted}
          />
        </View>

        {/* Corridor Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={[styles.filterContainer, isArabic && styles.rtlRow]}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              hearingFilter === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setHearingFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                hearingFilter === 'all' && styles.filterChipTextActive,
              ]}
            >
              {t.hearings.filterAll} ({hearings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              hearingFilter === 'pending' && styles.filterChipActive,
            ]}
            onPress={() => setHearingFilter('pending')}
          >
            <Text
              style={[
                styles.filterChipText,
                hearingFilter === 'pending' && styles.filterChipTextActive,
              ]}
            >
              {t.hearings.filterPending}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              hearingFilter === 'deliberation' && styles.filterChipActive,
            ]}
            onPress={() => setHearingFilter('deliberation')}
          >
            <Text
              style={[
                styles.filterChipText,
                hearingFilter === 'deliberation' && styles.filterChipTextActive,
              ]}
            >
              {t.hearings.filterDeliberation}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              hearingFilter === 'postponed' && styles.filterChipActive,
            ]}
            onPress={() => setHearingFilter('postponed')}
          >
            <Text
              style={[
                styles.filterChipText,
                hearingFilter === 'postponed' && styles.filterChipTextActive,
              ]}
            >
              {t.hearings.filterPostponed}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              hearingFilter === 'pleaded' && styles.filterChipActive,
            ]}
            onPress={() => setHearingFilter('pleaded')}
          >
            <Text
              style={[
                styles.filterChipText,
                hearingFilter === 'pleaded' && styles.filterChipTextActive,
              ]}
            >
              {t.hearings.filterPleaded}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Hearings List — Designed for Walking Fast */}
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredHearings.map((h) => {
            const badge = getStatusBadge(h.status);

            return (
              <View key={h.id} style={styles.hearingCard}>
                {/* Top Bar: Big Role Number & Courtroom */}
                <View style={[styles.cardHeader, isArabic && styles.rtlRow]}>
                  {/* Big Role Number Pill for Glancing While Walking */}
                  <View style={styles.roleBox}>
                    <Text style={styles.rolePrefixText}>
                      {isArabic ? 'رول' : 'RÔLE'}
                    </Text>
                    <Text style={styles.roleNumberText}>
                      {h.roleNumber < 10 ? `0${h.roleNumber}` : h.roleNumber}
                    </Text>
                  </View>

                  <View style={styles.headerMeta}>
                    <View style={[styles.jurisdictionRow, isArabic && styles.rtlRow]}>
                      <MapPin size={12} color={colors.gold.primary} />
                      <Text style={styles.jurisdictionText}>
                        {isArabic ? h.jurisdictionAr : h.jurisdiction}
                      </Text>
                    </View>
                    <Text style={styles.courtroomBadge}>
                      {h.courtroom} • {isArabic ? h.chamberAr : h.chamber}
                    </Text>
                    <Text style={styles.judgeName}>
                      {t.hearings.judgePrefix}: {h.judge}
                    </Text>
                  </View>

                  {/* Status Indicator */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Case & Parties */}
                <View style={styles.partiesSection}>
                  <Text style={styles.caseNumberText}>
                    {h.caseNumber}
                  </Text>
                  <Text style={styles.clientNameText} numberOfLines={1}>
                    {t.hearings.client}: <Text style={styles.boldText}>{h.clientName}</Text>
                  </Text>
                  <Text style={styles.adversaryText} numberOfLines={1}>
                    c/ {h.opposingParty} {h.opposingCounsel ? `(${h.opposingCounsel})` : ''}
                  </Text>
                </View>

                {/* Outcome Notes Preview if any */}
                {h.outcomeNotes ? (
                  <View style={styles.outcomeNotesBox}>
                    <Text style={styles.outcomeNotesText} numberOfLines={2}>
                      📝 {h.outcomeNotes}
                    </Text>
                    {h.nextHearingDate && (
                      <Text style={styles.nextDateText}>
                        📅 {t.hearings.outcomeModal.nextDate} {h.nextHearingDate}
                      </Text>
                    )}
                  </View>
                ) : null}

                {/* Fast Action Buttons Bar */}
                <View style={[styles.actionsRow, isArabic && styles.rtlRow]}>
                  {/* Quick Postpone */}
                  <TouchableOpacity
                    style={[
                      styles.quickActionBtn,
                      h.status === 'postponed' && styles.quickActionBtnActiveAmber,
                    ]}
                    onPress={() => handleQuickStatus(h, 'postponed')}
                  >
                    <Text style={styles.quickActionText}>
                      {t.hearings.actions.postponeShort}
                    </Text>
                  </TouchableOpacity>

                  {/* Quick Deliberation */}
                  <TouchableOpacity
                    style={[
                      styles.quickActionBtn,
                      h.status === 'deliberation' && styles.quickActionBtnActiveBlue,
                    ]}
                    onPress={() => handleQuickStatus(h, 'deliberation')}
                  >
                    <Text style={styles.quickActionText}>
                      {t.hearings.actions.deliberationShort}
                    </Text>
                  </TouchableOpacity>

                  {/* Quick Plead */}
                  <TouchableOpacity
                    style={[
                      styles.quickActionBtn,
                      h.status === 'pleaded' && styles.quickActionBtnActiveEmerald,
                    ]}
                    onPress={() => handleQuickStatus(h, 'pleaded')}
                  >
                    <Text style={styles.quickActionText}>
                      {t.hearings.actions.pleadShort}
                    </Text>
                  </TouchableOpacity>

                  {/* Open Outcome Modal */}
                  <TouchableOpacity
                    style={styles.fullDecisionBtn}
                    onPress={() => handleOpenOutcome(h)}
                  >
                    <Gavel size={14} color={colors.gold.light} />
                    <Text style={styles.fullDecisionBtnText}>
                      {t.hearings.actions.recordDecision}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Outcome Recorder Modal */}
      <HearingOutcomeModal
        visible={modalVisible}
        hearing={selectedHearing}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
  screenTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  screenSubtitle: {
    color: colors.text.muted,
    fontSize: 12,
    marginTop: 2,
  },
  statsBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
    alignItems: 'center',
  },
  statsCount: {
    color: colors.gold.light,
    fontSize: 16,
    fontWeight: '800',
  },
  statsLabel: {
    color: colors.text.muted,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
    paddingVertical: 10,
  },
  filterScroll: {
    maxHeight: 38,
    marginBottom: 10,
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: 'rgba(195, 155, 87, 0.18)',
    borderColor: colors.gold.primary,
  },
  filterChipText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.gold.light,
    fontWeight: '700',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  hearingCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  roleBox: {
    backgroundColor: colors.surfaceElevated,
    width: 48,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rolePrefixText: {
    color: colors.gold.light,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleNumberText: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  headerMeta: {
    flex: 1,
  },
  jurisdictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  jurisdictionText: {
    color: colors.gold.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  courtroomBadge: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  judgeName: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  partiesSection: {
    backgroundColor: colors.surfaceElevated,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  caseNumberText: {
    color: colors.gold.light,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  clientNameText: {
    color: colors.text.secondary,
    fontSize: 13,
    marginBottom: 2,
  },
  boldText: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  adversaryText: {
    color: colors.text.muted,
    fontSize: 12,
  },
  outcomeNotesBox: {
    backgroundColor: 'rgba(195, 155, 87, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.gold.primary,
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  outcomeNotesText: {
    color: colors.gold.light,
    fontSize: 11,
    fontWeight: '600',
  },
  nextDateText: {
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickActionBtnActiveAmber: {
    backgroundColor: colors.status.amberDark,
    borderColor: colors.status.amber,
  },
  quickActionBtnActiveBlue: {
    backgroundColor: colors.status.blueGlow,
    borderColor: colors.status.blue,
  },
  quickActionBtnActiveEmerald: {
    backgroundColor: colors.status.emeraldDark,
    borderColor: colors.status.emerald,
  },
  quickActionText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  fullDecisionBtn: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
  },
  fullDecisionBtnText: {
    color: colors.gold.light,
    fontSize: 11,
    fontWeight: '700',
  },
});
