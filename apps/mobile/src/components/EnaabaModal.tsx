import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Linking,
  ScrollView,
} from 'react-native';
import { X, Send, UserCheck, Scale, FileText, Check } from 'lucide-react-native';
import { JudicialContact, CourtHearing } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';

interface EnaabaModalProps {
  visible: boolean;
  contact: JudicialContact | null;
  onClose: () => void;
}

export const EnaabaModal: React.FC<EnaabaModalProps> = ({ visible, contact, onClose }) => {
  const { language, hearings } = useAppStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const [selectedHearingId, setSelectedHearingId] = useState<string>(
    hearings.length > 0 ? hearings[0].id : ''
  );
  const [instructions, setInstructions] = useState(
    'طلب تأجيل القضية لجلسة قادمة لتبادل المذكرات الجوابية وتمكيننا من الاطلاع على المستندات'
  );
  const [isSent, setIsSent] = useState(false);

  if (!contact) return null;

  const selectedHearing = hearings.find((h) => h.id === selectedHearingId);

  const handleSendWhatsApp = () => {
    if (!selectedHearing) return;

    const delegationText = isArabic
      ? `🏛️ *طلب إنابة قضائية عاجلة — مكتب الأستاذ ن. سليماني*\n\n` +
        `تحية تقدير للزميل المحترم ${contact.nameAr || contact.name}،\n` +
        `أرجو منكم التفضل بالإنابة عن مكتبنا في الجلسة التالية:\n\n` +
        `📍 *الجهة:* ${selectedHearing.jurisdictionAr} — ${selectedHearing.courtroom}\n` +
        `⚖️ *الغرفة:* ${selectedHearing.chamberAr}\n` +
        `🔢 *رقم الرول:* ${selectedHearing.roleNumber} (${selectedHearing.caseNumber})\n` +
        `👤 *الموكل:* ${selectedHearing.clientName} ضد ${selectedHearing.opposingParty}\n` +
        `📝 *التعليمات:* ${instructions}\n\n` +
        `مع خالص الشكر والامتنان لتعاونكم الزميلي.`
      : `🏛️ *Demande d'Énaaba Judiciaire — Cabinet Me N. Slimani*\n\n` +
        `Cher Confrère ${contact.name},\n` +
        `Prière d'assurer l'énaaba pour notre cabinet à l'audience de ce jour :\n\n` +
        `📍 *Juridiction :* ${selectedHearing.jurisdiction} — ${selectedHearing.courtroom}\n` +
        `⚖️ *Chambre :* ${selectedHearing.chamber}\n` +
        `🔢 *Rôle N° :* ${selectedHearing.roleNumber} (${selectedHearing.caseNumber})\n` +
        `👤 *Client :* ${selectedHearing.clientName} c/ ${selectedHearing.opposingParty}\n` +
        `📝 *Consigne :* ${instructions}\n\n` +
        `Avec nos confraternels remerciements.`;

    const cleanNumber = (contact.whatsapp || contact.phone).replace(/\s+/g, '').replace('+', '');
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(delegationText)}`);
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={[styles.header, isArabic && styles.rtlRow]}>
            <View>
              <Text style={styles.headerTitle}>{t.contacts.enaabaModal.title}</Text>
              <Text style={styles.contactName}>{contact.name} ({contact.jurisdiction})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Hearing Selector */}
            <Text style={[styles.sectionLabel, isArabic && styles.rtlText]}>
              {t.contacts.enaabaModal.selectHearing}
            </Text>
            <View style={styles.hearingsList}>
              {hearings.slice(0, 4).map((h) => (
                <TouchableOpacity
                  key={h.id}
                  style={[
                    styles.hearingChoice,
                    selectedHearingId === h.id && styles.hearingChoiceActive,
                  ]}
                  onPress={() => setSelectedHearingId(h.id)}
                >
                  <View style={styles.hearingChoiceHeader}>
                    <Text
                      style={[
                        styles.hearingChoiceRole,
                        selectedHearingId === h.id && styles.textGold,
                      ]}
                    >
                      {t.hearings.rolePrefix} {h.roleNumber} • {h.courtroom}
                    </Text>
                    <Text style={styles.hearingChoiceStatus}>{h.chamber}</Text>
                  </View>
                  <Text style={styles.hearingChoiceClient} numberOfLines={1}>
                    {h.clientName} c/ {h.opposingParty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Instruction input */}
            <Text style={[styles.sectionLabel, isArabic && styles.rtlText]}>
              {t.contacts.enaabaModal.instructions}
            </Text>
            <TextInput
              style={[styles.instructionInput, isArabic && styles.rtlText]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder={isArabic ? 'اكتب توجيه الجلسة للزميل...' : 'Consigne d’audience...'}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
            />

            {/* Substitution Preview Box */}
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>
                {isArabic ? 'ورقة إنابة قانونية رقمية سريعة' : 'Fiche d’Énaaba Numérique Directe'}
              </Text>
              <Text style={styles.previewText}>
                {isArabic
                  ? 'سيتم توليد نص الإنابة الرسمية وإرسالها مباشرة عبر تطبيق واتساب أو الرسائل القصيرة للزميل المختار.'
                  : 'Génère un mandat de représentation confraternelle instantané avec rôle, chambre et consignes d’audience.'}
              </Text>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendWhatsApp}
            >
              {isSent ? (
                <>
                  <Check size={18} color={colors.text.inverse} />
                  <Text style={styles.sendButtonText}>
                    {isArabic ? 'تم إرسال الإنابة' : 'Transmis avec succès'}
                  </Text>
                </>
              ) : (
                <>
                  <Send size={18} color={colors.text.inverse} />
                  <Text style={styles.sendButtonText}>
                    {t.contacts.enaabaModal.sendRequest}
                  </Text>
                </>
              )}
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
    maxHeight: '88%',
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
  contactName: {
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
  sectionLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  hearingsList: {
    gap: 8,
    marginBottom: 16,
  },
  hearingChoice: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  hearingChoiceActive: {
    backgroundColor: 'rgba(195, 155, 87, 0.12)',
    borderColor: colors.gold.primary,
  },
  hearingChoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hearingChoiceRole: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  textGold: {
    color: colors.gold.light,
  },
  hearingChoiceStatus: {
    color: colors.text.muted,
    fontSize: 11,
  },
  hearingChoiceClient: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  instructionInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    color: colors.text.primary,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 16,
  },
  previewBox: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
    marginBottom: 18,
  },
  previewLabel: {
    color: colors.gold.light,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewText: {
    color: colors.text.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold.primary,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
  },
  sendButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
