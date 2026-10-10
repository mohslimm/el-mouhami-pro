import React, { useState, useEffect } from 'react';
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
  Mic,
  Square,
  Play,
  Pause,
  Sparkles,
  Tag,
  Volume2,
  Clock,
  CheckCircle,
  FileAudio,
  Trash2,
} from 'lucide-react-native';
import { VoiceNote } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';
import { OfflineStatusHeader } from '../components/OfflineStatusHeader';

export const VoiceNotesScreen: React.FC = () => {
  const { language, voiceNotes, addVoiceNote, cases } = useAppStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [selectedCaseRef, setSelectedCaseRef] = useState(cases[0]?.reference || 'GENERAL');
  const [memoTitle, setMemoTitle] = useState('');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  // Timer effect during recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartRecord = () => {
    setIsRecording(true);
  };

  const handleStopAndTranscribe = async () => {
    setIsRecording(false);
    const finalSeconds = recordSeconds > 0 ? recordSeconds : 14;

    // AI Court Transcription Simulation
    const title =
      memoTitle ||
      (isArabic
        ? `قرار جلسة — ${selectedCaseRef}`
        : `Décision d'Audience — ${selectedCaseRef}`);

    const simulatedTranscription = isArabic
      ? 'القضية نودي عليها في تمام 10:45. حضر الأستاذ ممثلاً للموكل، وقدمنا المذكرة التكميلية مع حافظة المستندات التي تتضمن عقد الشهرة ومحضر المعاينة. قررت هيئة المحكمة حجز القضية للنطق بالحكم في جلسة 24 أكتوبر 2026.'
      : "Cause appelée à 10h45 en Salle 02. Dépôt de nos conclusions récapitulatives et du bordereau de pièces justificatives. Le Tribunal a prononcé la clôture des débats et la mise en délibéré pour jugement au 24 Octobre 2026.";

    const tags = [selectedCaseRef, 'Audience', isArabic ? 'نطق' : 'Délibéré'];

    await addVoiceNote(title, finalSeconds, simulatedTranscription, tags, selectedCaseRef);
    setMemoTitle('');
  };

  const togglePlayback = (id: string) => {
    if (currentlyPlayingId === id) {
      setCurrentlyPlayingId(null);
    } else {
      setCurrentlyPlayingId(id);
      setTimeout(() => setCurrentlyPlayingId(null), 3000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineStatusHeader />

      <View style={styles.container}>
        {/* Header Title */}
        <View style={[styles.headerRow, isArabic && styles.rtlRow]}>
          <View>
            <Text style={styles.title}>
              {isArabic ? t.voice.title : 'Mémos & Décisions Vocales'}
            </Text>
            <Text style={styles.subtitle}>{t.voice.subtitle}</Text>
          </View>
        </View>

        {/* Live Recorder Deck */}
        <View style={styles.recorderDeck}>
          {isRecording ? (
            <View style={styles.recordingActiveContainer}>
              <View style={styles.pulseIndicator}>
                <View style={styles.redDot} />
                <Text style={styles.recordingTimer}>{formatTimer(recordSeconds)}</Text>
              </View>

              {/* Waveform Visualization Bars */}
              <View style={styles.waveformContainer}>
                {[18, 36, 52, 28, 44, 60, 32, 48, 22, 55, 38, 20].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      { height: h, backgroundColor: colors.gold.primary },
                    ]}
                  />
                ))}
              </View>

              <Text style={styles.recordingStatusText}>
                {isArabic ? 'جاري الاستماع للقرار وتفريغه...' : 'Enregistrement en direct du couloir...'}
              </Text>

              <TouchableOpacity
                style={styles.stopRecordBtn}
                onPress={handleStopAndTranscribe}
                activeOpacity={0.8}
              >
                <Square size={20} color={colors.text.inverse} />
                <Text style={styles.stopRecordBtnText}>{t.voice.stopRecord}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.idleRecorderContainer}>
              {/* Optional Title Input */}
              <TextInput
                style={[styles.memoTitleInput, isArabic && styles.rtlText]}
                value={memoTitle}
                onChangeText={setMemoTitle}
                placeholder={
                  isArabic
                    ? 'عنوان المذكرة (مثال: سيدي امحمد رول 14)...'
                    : 'Titre du mémo (ex: Sidi M’hamed Rôle 14)...'
                }
                placeholderTextColor={colors.text.muted}
              />

              {/* Big Record Button */}
              <TouchableOpacity
                style={styles.recordCircleBtn}
                onPress={handleStartRecord}
                activeOpacity={0.8}
              >
                <Mic size={36} color={colors.text.inverse} />
              </TouchableOpacity>

              <Text style={styles.recordPromptText}>
                {isArabic
                  ? 'اضغط لبدء تسجيل مآل الجلسة بالصوت'
                  : 'Appuyez pour dicter la décision d’audience'}
              </Text>
              <Text style={styles.recordPromptSub}>
                Transcription IA Juridique automatique immédiate
              </Text>
            </View>
          )}
        </View>

        {/* Saved Audio Notes List */}
        <View style={[styles.listHeaderRow, isArabic && styles.rtlRow]}>
          <Text style={styles.listSectionTitle}>{t.voice.savedMemos}</Text>
          <Text style={styles.listCountBadge}>{voiceNotes.length}</Text>
        </View>

        <ScrollView
          style={styles.notesList}
          contentContainerStyle={styles.notesListContent}
          showsVerticalScrollIndicator={false}
        >
          {voiceNotes.map((note) => {
            const isPlaying = currentlyPlayingId === note.id;

            return (
              <View key={note.id} style={styles.noteCard}>
                <View style={[styles.noteTopRow, isArabic && styles.rtlRow]}>
                  <TouchableOpacity
                    style={[
                      styles.playBtn,
                      isPlaying && styles.playBtnActive,
                    ]}
                    onPress={() => togglePlayback(note.id)}
                  >
                    {isPlaying ? (
                      <Pause size={16} color={colors.text.inverse} />
                    ) : (
                      <Play size={16} color={colors.text.inverse} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.noteTitleArea}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <Text style={styles.noteMeta}>
                      {note.timestamp} • {note.durationSeconds}s
                    </Text>
                  </View>

                  <View style={styles.iaBadge}>
                    <Sparkles size={11} color={colors.gold.light} />
                    <Text style={styles.iaBadgeText}>IA CPCA</Text>
                  </View>
                </View>

                {/* AI Transcription Text Box */}
                <View style={styles.transcriptionBox}>
                  <Text style={styles.transcriptionText}>
                    {isArabic && note.transcriptionAr
                      ? note.transcriptionAr
                      : note.transcription}
                  </Text>
                </View>

                {/* Tags */}
                <View style={[styles.tagsRow, isArabic && styles.rtlRow]}>
                  {note.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tagPill}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
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
  recorderDeck: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
    alignItems: 'center',
    marginBottom: 16,
  },
  idleRecorderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  memoTitleInput: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text.primary,
    fontSize: 13,
    marginBottom: 14,
  },
  recordCircleBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.gold.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  recordPromptText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  recordPromptSub: {
    color: colors.text.muted,
    fontSize: 11,
  },
  recordingActiveContainer: {
    width: '100%',
    alignItems: 'center',
  },
  pulseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.ruby,
  },
  recordingTimer: {
    color: colors.status.ruby,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 60,
    marginBottom: 14,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  recordingStatusText: {
    color: colors.gold.light,
    fontSize: 12,
    marginBottom: 16,
  },
  stopRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.status.ruby,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  stopRecordBtnText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listSectionTitle: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  listCountBadge: {
    color: colors.gold.light,
    fontSize: 12,
    fontWeight: '700',
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    paddingBottom: 24,
    gap: 12,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  noteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: {
    backgroundColor: colors.status.emerald,
  },
  noteTitleArea: {
    flex: 1,
  },
  noteTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  noteMeta: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  iaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(195, 155, 87, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  iaBadgeText: {
    color: colors.gold.light,
    fontSize: 9,
    fontWeight: '700',
  },
  transcriptionBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  transcriptionText: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tagText: {
    color: colors.gold.light,
    fontSize: 10,
    fontWeight: '600',
  },
});
