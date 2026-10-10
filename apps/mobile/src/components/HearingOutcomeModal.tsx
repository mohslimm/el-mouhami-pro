import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, Check, Calendar, Clock, AlertCircle } from 'lucide-react-native';
import { CourtHearing, HearingOutcomeStatus } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';

interface HearingOutcomeModalProps {
  visible: boolean;
  hearing: CourtHearing | null;
  onClose: () => void;
}

export const HearingOutcomeModal: React.FC<HearingOutcomeModalProps> = ({
  visible,
  hearing,
  onClose,
}) => {
  const { language, updateHearingOutcome } = useAppStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const [selectedStatus, setSelectedStatus] = useState<HearingOutcomeStatus>('postponed');
  const [nextDate, setNextDate] = useState('2026-10-24');
  const [selectedReason, setSelectedReason] = useState(t.hearings.outcomeModal.reasonsList[0]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!hearing) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateHearingOutcome(
        hearing.id,
        selectedStatus,
        notes || selectedReason,
        nextDate,
        selectedReason
      );
      setIsSaving(false);
      onClose();
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={[styles.header, isArabic && styles.rtlRow]}>
            <View>
              <Text style={styles.headerTitle}>{t.hearings.outcomeModal.title}</Text>
              <Text style={styles.caseBadge}>
                {t.hearings.rolePrefix} {hearing.roleNumber} • {hearing.caseNumber}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Hearing Info Pill */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoJurisdiction}>
                {isArabic ? hearing.jurisdictionAr : hearing.jurisdiction} • {hearing.courtroom}
              </Text>
              <Text style={styles.infoClient}>
                {t.hearings.client}: <Text style={styles.boldText}>{hearing.clientName}</Text> c/{' '}
                {hearing.opposingParty}
              </Text>
            </View>

            {/* Quick Status Buttons */}
            <Text style={[styles.sectionLabel, isArabic && styles.rtlText]}>
              {t.hearings.outcomeModal.selectStatus}
            </Text>
            <View style={styles.statusButtonsRow}>
              {/* Postponed (تأجيل) */}
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  selectedStatus === 'postponed' && styles.statusOptionActivePostponed,
                ]}
                onPress={() => setSelectedStatus('postponed')}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === 'postponed' && styles.statusOptionTextActive,
                  ]}
                >
                  {isArabic ? 'تأجيل للاطلاع والرد' : 'Renvoyé pour réplique'}
                </Text>
              </TouchableOpacity>

              {/* Deliberation (تاريخ النطق) */}
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  selectedStatus === 'deliberation' && styles.statusOptionActiveDelib,
                ]}
                onPress={() => setSelectedStatus('deliberation')}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === 'deliberation' && styles.statusOptionTextActive,
                  ]}
                >
                  {isArabic ? 'تاريخ النطق للحكم' : 'Mise en délibéré'}
                </Text>
              </TouchableOpacity>

              {/* Pleaded (تمت المرافعة) */}
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  selectedStatus === 'pleaded' && styles.statusOptionActivePleaded,
                ]}
                onPress={() => setSelectedStatus('pleaded')}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === 'pleaded' && styles.statusOptionTextActive,
                  ]}
                >
                  {isArabic ? 'تمت المرافعة جاهز' : 'Plaidoirie effectuée'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Next Hearing Date */}
            <Text style={[styles.sectionLabel, isArabic && styles.rtlText]}>
              {t.hearings.outcomeModal.nextDate}
            </Text>
            <View style={[styles.dateInputContainer, isArabic && styles.rtlRow]}>
              <Calendar size={18} color={colors.gold.primary} />
              <TextInput
                style={[styles.dateInput, isArabic && styles.rtlText]}
                value={nextDate}
                onChangeText={setNextDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            {/* Common Reasons Selector */}
            <Text style={[styles.sectionLabel, isArabic && styles.rtlText]}>
              {t.hearings.outcomeModal.reason}
            </Text>
            <View style={styles.reasonChipsContainer}>
              {t.hearings.outcomeModal.reasonsList.map((reason, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.reasonChip,
                    selectedReason === reason && styles.reasonChipActive,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonChipText,
                      selectedReason === reason && styles.reasonChipTextActive,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fast Notes */}
            <Text style={[styles.sectionLabel, isArabic && styles.rtlText]}>
              {t.hearings.outcomeModal.notes}
            </Text>
            <TextInput
              style={[styles.notesInput, isArabic && styles.rtlText]}
              value={notes}
              onChangeText={setNotes}
              placeholder={isArabic ? 'اكتب ملاحظات سريعة من قاعة الجلسة...' : 'Notes d’audience...'}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footer, isArabic && styles.rtlRow]}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{t.hearings.outcomeModal.cancel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Check size={18} color={colors.text.inverse} />
              <Text style={styles.saveBtnText}>
                {isSaving ? 'Enregistrement...' : t.hearings.outcomeModal.save}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 7, 13, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  caseBadge: {
    color: colors.gold.light,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  infoBanner: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  infoJurisdiction: {
    color: colors.gold.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoClient: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  boldText: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  sectionLabel: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  statusButtonsRow: {
    gap: 8,
    marginBottom: 14,
  },
  statusOption: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  statusOptionActivePostponed: {
    backgroundColor: colors.status.amberDark,
    borderColor: colors.status.amber,
  },
  statusOptionActiveDelib: {
    backgroundColor: colors.status.blueGlow,
    borderColor: colors.status.blue,
  },
  statusOptionActivePleaded: {
    backgroundColor: colors.status.emeraldDark,
    borderColor: colors.status.emerald,
  },
  statusOptionText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  statusOptionTextActive: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
  },
  dateInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  reasonChipsContainer: {
    gap: 6,
    marginBottom: 14,
  },
  reasonChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reasonChipActive: {
    backgroundColor: 'rgba(195, 155, 87, 0.15)',
    borderColor: colors.gold.primary,
  },
  reasonChipText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  reasonChipTextActive: {
    color: colors.gold.light,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    color: colors.text.primary,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.gold.primary,
  },
  saveBtnText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
