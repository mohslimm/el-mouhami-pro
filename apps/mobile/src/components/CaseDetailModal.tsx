import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Phone, MessageCircle, Scale, Calendar, MapPin, Check, User } from 'lucide-react-native';
import { PocketCase } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';

interface CaseDetailModalProps {
  visible: boolean;
  caseItem: PocketCase | null;
  onClose: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  visible,
  caseItem,
  onClose,
}) => {
  const { language, updateCaseNotes } = useAppStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const [notes, setNotes] = useState(caseItem?.lastNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!caseItem) return null;

  const handleCall = () => {
    Linking.openURL(`tel:${caseItem.clientPhone}`);
  };

  const handleWhatsApp = () => {
    const cleanNumber = caseItem.clientPhone.replace(/\s+/g, '').replace('+', '');
    const message = encodeURIComponent(
      isArabic
        ? `السلام عليكم سيدي/سيدتي ${caseItem.clientName}، بخصوص قضيتكم رقم ${caseItem.roleNumber} بمحكمة ${caseItem.jurisdictionAr}...`
        : `Bonjour ${caseItem.clientName}, suite à l'audience de ce jour au ${caseItem.jurisdiction}...`
    );
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${message}`);
  };

  const handleSaveNotes = async () => {
    await updateCaseNotes(caseItem.id, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const formatDzd = (amount?: number) => {
    if (!amount) return 'N/C';
    return `${amount.toLocaleString('fr-FR')} DZD`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={[styles.header, isArabic && styles.rtlRow]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerRef}>{caseItem.reference}</Text>
              <Text style={styles.headerTitle} numberOfLines={2}>
                {isArabic ? caseItem.titleAr : caseItem.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Quick Action Contact Bar (1-Tap Call & WhatsApp) */}
            <View style={[styles.contactCard, isArabic && styles.rtlRow]}>
              <View style={styles.clientMeta}>
                <View style={[styles.clientNameRow, isArabic && styles.rtlRow]}>
                  <User size={16} color={colors.gold.light} />
                  <Text style={styles.clientName}>{caseItem.clientName}</Text>
                </View>
                <Text style={styles.clientPhone}>{caseItem.clientPhone}</Text>
              </View>

              <View style={[styles.actionButtons, isArabic && styles.rtlRow]}>
                <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                  <Phone size={15} color={colors.text.primary} />
                  <Text style={styles.callButtonText}>{t.cases.callClient}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.waButton} onPress={handleWhatsApp}>
                  <MessageCircle size={15} color={colors.text.primary} />
                  <Text style={styles.waButtonText}>{t.cases.whatsappClient}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Case Key Metrics */}
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>{isArabic ? 'الرول والمحكمة' : 'Rôle & Juridiction'}</Text>
                <Text style={styles.gridValue}>
                  {t.hearings.rolePrefix} {caseItem.roleNumber}
                </Text>
                <Text style={styles.gridSubvalue}>
                  {isArabic ? caseItem.jurisdictionAr : caseItem.jurisdiction}
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>{t.cases.claim}</Text>
                <Text style={[styles.gridValue, { color: colors.gold.light }]}>
                  {formatDzd(caseItem.claimAmountDzd)}
                </Text>
                <Text style={styles.gridSubvalue}>{caseItem.stage}</Text>
              </View>
            </View>

            {/* Room & Adversary */}
            <View style={styles.sectionCard}>
              <View style={[styles.detailRow, isArabic && styles.rtlRow]}>
                <MapPin size={15} color={colors.gold.primary} />
                <Text style={styles.detailLabel}>
                  {isArabic ? 'القاعة والغرفة:' : 'Salle & Chambre :'}
                </Text>
                <Text style={styles.detailValue}>
                  {caseItem.courtroom} • {caseItem.chamber}
                </Text>
              </View>

              <View style={[styles.detailRow, isArabic && styles.rtlRow]}>
                <Scale size={15} color={colors.gold.primary} />
                <Text style={styles.detailLabel}>{t.hearings.adversary} :</Text>
                <Text style={styles.detailValue}>{caseItem.opposingParty}</Text>
              </View>
            </View>

            {/* Field Notes (Editable Offline) */}
            <Text style={[styles.sectionLabel, isArabic && styles.rtlText]}>
              {t.cases.notes}
            </Text>
            <TextInput
              style={[styles.notesInput, isArabic && styles.rtlText]}
              value={notes}
              onChangeText={setNotes}
              placeholder={isArabic ? 'إضافة ملاحظة على القضية...' : 'Notes de terrain...'}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveNotesBtn} onPress={handleSaveNotes}>
              <Check size={16} color={colors.text.inverse} />
              <Text style={styles.saveNotesBtnText}>
                {isSaved ? (isArabic ? 'تم الحفظ محلياً' : 'Enregistré') : (isArabic ? 'تحديث الملاحظات' : 'Sauvegarder la note')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  headerRef: {
    color: colors.gold.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    marginLeft: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientMeta: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  clientName: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  clientPhone: {
    color: colors.text.muted,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.blue,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  callButtonText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  waButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  waButtonText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  gridLabel: {
    color: colors.text.muted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 6,
  },
  gridValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  gridSubvalue: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  sectionCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  detailValue: {
    color: colors.text.secondary,
    fontSize: 12,
    flex: 1,
  },
  sectionLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
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
    minHeight: 80,
    marginBottom: 12,
  },
  saveNotesBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveNotesBtnText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '700',
  },
});
