import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Phone,
  MessageCircle,
  Briefcase,
  Scale,
  MapPin,
  ChevronRight,
  FolderOpen,
  DollarSign,
} from 'lucide-react-native';
import { PocketCase } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';
import { OfflineStatusHeader } from '../components/OfflineStatusHeader';
import { CaseDetailModal } from '../components/CaseDetailModal';

export const PocketCasesScreen: React.FC = () => {
  const { language, cases } = useAppStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState<PocketCase | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const filteredCases = cases.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.clientName.toLowerCase().includes(q) ||
      c.reference.toLowerCase().includes(q) ||
      c.roleNumber.includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.jurisdiction.toLowerCase().includes(q) ||
      c.opposingParty.toLowerCase().includes(q)
    );
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, clientName: string) => {
    const cleanNumber = phone.replace(/\s+/g, '').replace('+', '');
    const message = encodeURIComponent(
      isArabic
        ? `السلام عليكم سيدي/سيدتي ${clientName}، معكم الأستاذ نور الدين سليماني بخصوص قضيتكم...`
        : `Bonjour ${clientName}, Maître Slimani à propos de votre dossier...`
    );
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${message}`);
  };

  const openCase = (c: PocketCase) => {
    setSelectedCase(c);
    setDetailVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineStatusHeader />

      <View style={styles.container}>
        {/* Title */}
        <View style={[styles.headerRow, isArabic && styles.rtlRow]}>
          <View>
            <Text style={styles.title}>
              {isArabic ? 'سجل القضايا الميداني' : t.cases.title}
            </Text>
            <Text style={styles.subtitle}>{t.cases.subtitle}</Text>
          </View>
          <View style={styles.badge}>
            <Briefcase size={14} color={colors.gold.light} />
            <Text style={styles.badgeText}>{filteredCases.length} dossiers</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={[styles.searchBar, isArabic && styles.rtlRow]}>
          <Search size={18} color={colors.gold.primary} />
          <TextInput
            style={[styles.searchInput, isArabic && styles.rtlText]}
            value={search}
            onChangeText={setSearch}
            placeholder={t.cases.searchPlaceholder}
            placeholderTextColor={colors.text.muted}
          />
        </View>

        {/* Case Docket List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredCases.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              onPress={() => openCase(c)}
              activeOpacity={0.8}
            >
              {/* Top Card Info */}
              <View style={[styles.cardTop, isArabic && styles.rtlRow]}>
                <View style={styles.refPill}>
                  <Text style={styles.refText}>{c.reference}</Text>
                </View>
                <Text style={styles.roleText}>
                  {t.hearings.rolePrefix} {c.roleNumber}
                </Text>
                <View style={styles.jurisdictionTag}>
                  <Text style={styles.jurisdictionText} numberOfLines={1}>
                    {isArabic ? c.jurisdictionAr : c.jurisdiction}
                  </Text>
                </View>
              </View>

              {/* Title & Client */}
              <Text style={styles.caseTitle} numberOfLines={2}>
                {isArabic ? c.titleAr : c.title}
              </Text>

              <View style={[styles.clientSection, isArabic && styles.rtlRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clientLabel}>{t.hearings.client}</Text>
                  <Text style={styles.clientName}>{c.clientName}</Text>
                  <Text style={styles.opposingParty} numberOfLines={1}>
                    c/ {c.opposingParty}
                  </Text>
                </View>

                {/* 1-Tap Direct Call & WhatsApp Buttons */}
                <View style={[styles.contactActions, isArabic && styles.rtlRow]}>
                  <TouchableOpacity
                    style={styles.phoneBtn}
                    onPress={() => handleCall(c.clientPhone)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Phone size={15} color={colors.text.primary} />
                    <Text style={styles.actionBtnLabel}>{t.cases.callClient}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.whatsappBtn}
                    onPress={() => handleWhatsApp(c.clientPhone, c.clientName)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MessageCircle size={15} color={colors.text.primary} />
                    <Text style={styles.actionBtnLabel}>{t.cases.whatsappClient}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Meta */}
              <View style={[styles.cardBottom, isArabic && styles.rtlRow]}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>{t.cases.stage}</Text>
                  <Text style={styles.metaValue}>{c.stage}</Text>
                </View>

                {c.claimAmountDzd ? (
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>{t.cases.claim}</Text>
                    <Text style={styles.metaAmount}>
                      {c.claimAmountDzd.toLocaleString('fr-FR')} DA
                    </Text>
                  </View>
                ) : null}

                <View style={styles.arrowIcon}>
                  <ChevronRight size={16} color={colors.gold.light} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Case Details Slide-Over */}
      <CaseDetailModal
        visible={detailVisible}
        caseItem={selectedCase}
        onClose={() => setDetailVisible(false)}
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
  headerRow: {
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
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
  },
  badgeText: {
    color: colors.gold.light,
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
    paddingVertical: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  refPill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  refText: {
    color: colors.gold.light,
    fontSize: 11,
    fontWeight: '700',
  },
  roleText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  jurisdictionTag: {
    flex: 1,
    alignItems: 'flex-end',
  },
  jurisdictionText: {
    color: colors.text.muted,
    fontSize: 11,
  },
  caseTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 10,
  },
  clientSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientLabel: {
    color: colors.text.muted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  clientName: {
    color: colors.gold.light,
    fontSize: 13,
    fontWeight: '700',
  },
  opposingParty: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 6,
  },
  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.blue,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  actionBtnLabel: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  metaCol: {
    flexDirection: 'column',
  },
  metaLabel: {
    color: colors.text.muted,
    fontSize: 10,
  },
  metaValue: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  metaAmount: {
    color: colors.gold.light,
    fontSize: 12,
    fontWeight: '700',
  },
  arrowIcon: {
    padding: 4,
  },
});
