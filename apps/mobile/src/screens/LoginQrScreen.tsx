import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  Fingerprint,
  QrCode,
  Lock,
  Camera,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Laptop,
} from 'lucide-react-native';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { colors } from '../theme/colors';

export const LoginQrScreen: React.FC = () => {
  const { language, session, authenticateBiometric, pairWithDesktop, setActiveTab } = useAppStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const [pinCode, setPinCode] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [pairingSuccess, setPairingSuccess] = useState(false);

  const handleBiometric = async () => {
    setIsAuthenticating(true);
    await authenticateBiometric();
    setIsAuthenticating(false);
    setActiveTab('hearings');
  };

  const handleSimulateQrScan = async () => {
    await pairWithDesktop('Poste Sidi M’hamed (Bureau 01) — Token 8F9A-2026');
    setPairingSuccess(true);
    setTimeout(() => {
      setPairingSuccess(false);
      setShowQrModal(false);
      setActiveTab('hearings');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Prestige Gold Monogram & Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={36} color={colors.gold.light} />
          </View>
          <Text style={styles.brandTitle}>EL-MOUHAMI PRO</Text>
          <Text style={styles.brandSubtitle}>
            {isArabic ? 'المساعد الميداني للجلسات القضائية' : 'Courtroom Companion • Alger'}
          </Text>
          <Text style={styles.attorneyName}>{session.attorneyName}</Text>
          <Text style={styles.barreau}>{session.barreau}</Text>
        </View>

        {/* Pairing Status Card */}
        <View style={styles.pairingCard}>
          <View style={[styles.pairingCardHeader, isArabic && styles.rtlRow]}>
            <Laptop size={16} color={colors.gold.primary} />
            <Text style={styles.pairingCardTitle}>
              {session.devicePaired ? t.login.pairedWithDesktop : 'Non Couplé'}
            </Text>
          </View>
          <Text style={[styles.pairingCardDetails, isArabic && styles.rtlText]}>
            {t.login.officeId}
          </Text>
          <Text style={[styles.pairingCardSub, isArabic && styles.rtlText]}>
            {t.login.lastPairing}
          </Text>
        </View>

        {/* Action 1: Biometric Unlock Button */}
        <TouchableOpacity
          style={styles.biometricBtn}
          onPress={handleBiometric}
          disabled={isAuthenticating}
          activeOpacity={0.8}
        >
          <View style={styles.biometricIconWrapper}>
            <Fingerprint size={28} color={colors.text.inverse} />
          </View>
          <View style={styles.biometricTextContainer}>
            <Text style={styles.biometricBtnText}>
              {isAuthenticating ? 'Vérification biométrique...' : t.login.unlockBiometrics}
            </Text>
            <Text style={styles.biometricHint}>FaceID / TouchID / Secure Enclave</Text>
          </View>
        </TouchableOpacity>

        {/* Action 2: Scan Desktop QR Code */}
        <TouchableOpacity
          style={styles.qrScanBtn}
          onPress={() => setShowQrModal(true)}
          activeOpacity={0.8}
        >
          <QrCode size={20} color={colors.gold.light} />
          <Text style={styles.qrScanBtnText}>{t.login.scanQr}</Text>
        </TouchableOpacity>

        {/* Emergency PIN Input */}
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>Ou code PIN d’urgence du cabinet :</Text>
          <View style={[styles.pinInputWrapper, isArabic && styles.rtlRow]}>
            <Lock size={16} color={colors.text.muted} />
            <TextInput
              style={[styles.pinInput, isArabic && styles.rtlText]}
              value={pinCode}
              onChangeText={setPinCode}
              placeholder="••••"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
            />
            {pinCode.length >= 4 && (
              <TouchableOpacity
                style={styles.pinSubmit}
                onPress={() => setActiveTab('hearings')}
              >
                <ArrowRight size={16} color={colors.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Simulated QR Code Scanner Modal */}
        <Modal
          visible={showQrModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQrModal(false)}
        >
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalCard}>
              <View style={styles.qrModalHeader}>
                <Camera size={24} color={colors.gold.light} />
                <Text style={styles.qrModalTitle}>Couplage Poste Desktop</Text>
              </View>

              <Text style={styles.qrInstruction}>{t.login.qrInstruction}</Text>

              {/* Viewfinder Target */}
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />

                {pairingSuccess ? (
                  <View style={styles.successScan}>
                    <CheckCircle2 size={48} color={colors.status.emerald} />
                    <Text style={styles.successText}>Poste Authentifié !</Text>
                  </View>
                ) : (
                  <View style={styles.scanningCrosshair}>
                    <Sparkles size={24} color={colors.gold.primary} />
                    <Text style={styles.scanningText}>Détection du QR Code...</Text>
                  </View>
                )}
              </View>

              {/* Simulate Scan Button */}
              <TouchableOpacity
                style={styles.simulateScanBtn}
                onPress={handleSimulateQrScan}
              >
                <Text style={styles.simulateScanBtnText}>
                  {isArabic ? 'تأكيد مسح الكود' : 'Valider la détection QR Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeQrBtn}
                onPress={() => setShowQrModal(false)}
              >
                <Text style={styles.closeQrBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    color: colors.gold.light,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  attorneyName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
  },
  barreau: {
    color: colors.gold.medium,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  pairingCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
    marginBottom: 24,
  },
  pairingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pairingCardTitle: {
    color: colors.gold.light,
    fontSize: 13,
    fontWeight: '700',
  },
  pairingCardDetails: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  pairingCardSub: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 14,
  },
  biometricIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricTextContainer: {
    flex: 1,
  },
  biometricBtnText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '800',
  },
  biometricHint: {
    color: 'rgba(11, 13, 23, 0.75)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  qrScanBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
    gap: 10,
    marginBottom: 24,
  },
  qrScanBtnText: {
    color: colors.gold.light,
    fontSize: 14,
    fontWeight: '700',
  },
  pinSection: {
    alignItems: 'center',
  },
  pinLabel: {
    color: colors.text.muted,
    fontSize: 11,
    marginBottom: 8,
  },
  pinInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    width: 180,
    gap: 8,
  },
  pinInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    paddingVertical: 8,
    textAlign: 'center',
    letterSpacing: 4,
  },
  pinSubmit: {
    backgroundColor: colors.gold.primary,
    padding: 6,
    borderRadius: 6,
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 7, 13, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorderGold,
  },
  qrModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  qrModalTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  qrInstruction: {
    color: colors.text.muted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  viewfinder: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.gold.primary,
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanningCrosshair: {
    alignItems: 'center',
    gap: 8,
  },
  scanningText: {
    color: colors.gold.light,
    fontSize: 12,
    fontWeight: '600',
  },
  successScan: {
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    color: colors.status.emerald,
    fontSize: 14,
    fontWeight: '700',
  },
  simulateScanBtn: {
    backgroundColor: colors.gold.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  simulateScanBtnText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  closeQrBtn: {
    paddingVertical: 8,
  },
  closeQrBtnText: {
    color: colors.text.muted,
    fontSize: 13,
  },
});
