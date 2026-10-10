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
  UserPlus,
  Send,
  MapPin,
  CheckCircle2,
  Clock,
  Shield,
  Briefcase,
} from 'lucide-react-native';
import { JudicialContact } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';
import { OfflineStatusHeader } from '../components/OfflineStatusHeader';
import { EnaabaModal } from '../components/EnaabaModal';

export const JudicialContactsScreen: React.FC = () => {
  const { language, contacts } = useAppStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const [contactTypeFilter, setContactTypeFilter] = useState<'all' | 'bailiff' | 'colleague' | 'expert'>('all');
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<JudicialContact | null>(null);
  const [enaabaModalVisible, setEnaabaModalVisible] = useState(false);

  const filteredContacts = contacts.filter((c) => {
    const matchesType =
      contactTypeFilter === 'all' ? true : c.type === contactTypeFilter;

    const q = search.toLowerCase().trim();
    if (!q) return matchesType;

    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.nameAr && c.nameAr.includes(q)) ||
      c.jurisdiction.toLowerCase().includes(q) ||
      (c.speciality && c.speciality.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (whatsapp?: string, phone?: string) => {
    const num = (whatsapp || phone || '').replace(/\s+/g, '').replace('+', '');
    Linking.openURL(`https://wa.me/${num}`);
  };

  const handleOpenEnaaba = (c: JudicialContact) => {
    setSelectedContact(c);
    setEnaabaModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineStatusHeader />

      <View style={styles.container}>
        {/* Title */}
        <View style={[styles.headerRow, isArabic && styles.rtlRow]}>
          <View>
            <Text style={styles.title}>
              {isArabic ? t.contacts.title : 'Contacts & Substitutions'}
            </Text>
            <Text style={styles.subtitle}>{t.contacts.subtitle}</Text>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, isArabic && styles.rtlRow]}>
          <Search size={18} color={colors.gold.primary} />
          <TextInput
            style={[styles.searchInput, isArabic && styles.rtlText]}
            value={search}
            onChangeText={setSearch}
            placeholder={
              isArabic
                ? 'بحث بالاسم، المحضر، الزميل، الاختصاص...'
                : 'Nom, huissier, confrère, juridiction...'
            }
            placeholderTextColor={colors.text.muted}
          />
        </View>

        {/* Filter Tabs */}
        <View style={[styles.tabsRow, isArabic && styles.rtlRow]}>
          <TouchableOpacity
            style={[styles.tab, contactTypeFilter === 'all' && styles.tabActive]}
            onPress={() => setContactTypeFilter('all')}
          >
            <Text
              style={[
                styles.tabText,
                contactTypeFilter === 'all' && styles.tabTextActive,
              ]}
            >
              {isArabic ? 'الكل' : 'Tous'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              contactTypeFilter === 'bailiff' && styles.tabActive,
            ]}
            onPress={() => setContactTypeFilter('bailiff')}
          >
            <Text
              style={[
                styles.tabText,
                contactTypeFilter === 'bailiff' && styles.tabTextActive,
              ]}
            >
              {t.contacts.tabBailiffs}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              contactTypeFilter === 'colleague' && styles.tabActive,
            ]}
            onPress={() => setContactTypeFilter('colleague')}
          >
            <Text
              style={[
                styles.tabText,
                contactTypeFilter === 'colleague' && styles.tabTextActive,
              ]}
            >
              {t.contacts.tabColleagues}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              contactTypeFilter === 'expert' && styles.tabActive,
            ]}
            onPress={() => setContactTypeFilter('expert')}
          >
            <Text
              style={[
                styles.tabText,
                contactTypeFilter === 'expert' && styles.tabTextActive,
              ]}
            >
              {t.contacts.tabExperts}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredContacts.map((c) => (
            <View key={c.id} style={styles.contactCard}>
              <View style={[styles.cardTopRow, isArabic && styles.rtlRow]}>
                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{c.avatarInitials}</Text>
                </View>

                {/* Info */}
                <View style={styles.infoCol}>
                  <View style={[styles.nameRow, isArabic && styles.rtlRow]}>
                    <Text style={styles.contactName}>
                      {isArabic && c.nameAr ? c.nameAr : c.name}
                    </Text>
                    {c.isAvailableForSubstitution && (
                      <View style={styles.availableBadge}>
                        <View style={styles.greenDot} />
                        <Text style={styles.availableText}>{t.contacts.available}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.specialityText}>{c.speciality}</Text>

                  <View style={[styles.addressRow, isArabic && styles.rtlRow]}>
                    <MapPin size={11} color={colors.gold.primary} />
                    <Text style={styles.addressText}>{c.officeAddress}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={[styles.cardActions, isArabic && styles.rtlRow]}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(c.phone)}
                >
                  <Phone size={14} color={colors.text.primary} />
                  <Text style={styles.callBtnText}>{t.contacts.call}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={() => handleWhatsApp(c.whatsapp, c.phone)}
                >
                  <MessageCircle size={14} color={colors.text.primary} />
                  <Text style={styles.waBtnText}>{t.contacts.whatsapp}</Text>
                </TouchableOpacity>

                {c.type === 'colleague' && (
                  <TouchableOpacity
                    style={styles.enaabaBtn}
                    onPress={() => handleOpenEnaaba(c)}
                  >
                    <Send size={13} color={colors.text.inverse} />
                    <Text style={styles.enaabaBtnText}>
                      {t.contacts.requestSubstitution}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Énaaba Delegation Modal */}
      <EnaabaModal
        visible={enaabaModalVisible}
        contact={selectedContact}
        onClose={() => setEnaabaModalVisible(false)}
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
  searchBar: {
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
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabActive: {
    backgroundColor: 'rgba(195, 155, 87, 0.16)',
    borderColor: colors.gold.primary,
  },
  tabText: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.gold.light,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.gold.light,
    fontSize: 15,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  contactName: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.emerald,
  },
  availableText: {
    color: colors.status.emerald,
    fontSize: 9,
    fontWeight: '700',
  },
  specialityText: {
    color: colors.gold.light,
    fontSize: 11,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    color: colors.text.muted,
    fontSize: 11,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.blue,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  callBtnText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  waBtnText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  enaabaBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold.primary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  enaabaBtnText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: '700',
  },
});
