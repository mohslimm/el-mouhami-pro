import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  Briefcase,
  Mic,
  Users,
  ShieldCheck,
} from 'lucide-react-native';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';

export const BottomTabBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { activeTab, setActiveTab, language, hearings } = useAppStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const pendingCount = hearings.filter((h) => h.status === 'pending').length;

  const tabs = [
    {
      id: 'hearings' as const,
      label: t.nav.hearings,
      icon: (color: string) => <Calendar size={20} color={color} />,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: 'cases' as const,
      label: t.nav.cases,
      icon: (color: string) => <Briefcase size={20} color={color} />,
    },
    {
      id: 'voice' as const,
      label: t.nav.voice,
      icon: (color: string) => <Mic size={20} color={color} />,
    },
    {
      id: 'contacts' as const,
      label: t.nav.contacts,
      icon: (color: string) => <Users size={20} color={color} />,
    },
    {
      id: 'profile' as const,
      label: t.nav.profile,
      icon: (color: string) => <ShieldCheck size={20} color={color} />,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        isArabic && styles.rtlRow,
        { paddingBottom: Math.max(insets.bottom, 14) },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const iconColor = isActive ? colors.gold.light : colors.text.muted;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {tab.icon(iconColor)}
              {tab.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderGold,
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    position: 'relative',
    minWidth: 62,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.gold.primary,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.gold.light,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.text.muted,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold.primary,
  },
});
