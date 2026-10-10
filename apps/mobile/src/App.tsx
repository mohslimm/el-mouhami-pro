import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from './stores/useAppStore';
import { colors } from './theme/colors';
import { BottomTabBar } from './navigation/BottomTabBar';

// Screens
import { LoginQrScreen } from './screens/LoginQrScreen';
import { TodayHearingsScreen } from './screens/TodayHearingsScreen';
import { PocketCasesScreen } from './screens/PocketCasesScreen';
import { VoiceNotesScreen } from './screens/VoiceNotesScreen';
import { JudicialContactsScreen } from './screens/JudicialContactsScreen';

export default function App() {
  const { activeTab, initializeStore, session } = useAppStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Screen Router
  const renderScreen = () => {
    switch (activeTab) {
      case 'profile':
        return <LoginQrScreen />;
      case 'cases':
        return <PocketCasesScreen />;
      case 'voice':
        return <VoiceNotesScreen />;
      case 'contacts':
        return <JudicialContactsScreen />;
      case 'hearings':
      default:
        return <TodayHearingsScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.screenContainer}>{renderScreen()}</View>
        <BottomTabBar />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
