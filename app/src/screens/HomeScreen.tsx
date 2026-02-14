import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Disclaimer } from '../components/Disclaimer';
import { loadSession, clearSession } from '../services/storage';
import { checkServerHealth } from '../services/api';
import { SessionState } from '../types';
import { COLORS, SPACING, FONT_SIZES, commonStyles } from '../theme';

type RootStackParamList = {
  Home: undefined;
  Interview: { session?: SessionState };
  Review: { session: SessionState };
  Result: { session: SessionState };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: Props) {
  const [savedSession, setSavedSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      const [session, health] = await Promise.all([
        loadSession(),
        checkServerHealth(),
      ]);
      setSavedSession(session);
      setServerOk(health);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const session = await loadSession();
      setSavedSession(session);
    });
    return unsubscribe;
  }, [navigation]);

  const handleStartNew = async () => {
    await clearSession();
    navigation.navigate('Interview', {});
  };

  const handleContinue = () => {
    if (!savedSession) return;

    if (savedSession.isComplete && savedSession.finalResult) {
      navigation.navigate('Result', { session: savedSession });
    } else {
      navigation.navigate('Interview', { session: savedSession });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Voice Investment</Text>
          <Text style={styles.titleAccent}>Questionnaire</Text>
          <Text style={styles.subtitle}>
            Answer a few questions to find the right portfolio for you.
          </Text>
        </View>

        {/* Server status */}
        {serverOk === false && (
          <View style={styles.serverWarning}>
            <Text style={styles.serverWarningText}>
              Cannot reach the server. Make sure the backend is running on port 4000.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[commonStyles.button, !serverOk && styles.buttonDisabled]}
            onPress={handleStartNew}
            disabled={!serverOk}
          >
            <Text style={commonStyles.buttonText}>Start New Interview</Text>
          </TouchableOpacity>

          {savedSession && !savedSession.isComplete && (
            <TouchableOpacity
              style={[commonStyles.buttonOutline, styles.continueButton]}
              onPress={handleContinue}
              disabled={!serverOk}
            >
              <Text style={commonStyles.buttonOutlineText}>
                Continue Interview (Q{savedSession.currentQuestionId.slice(1)}/11)
              </Text>
            </TouchableOpacity>
          )}

          {savedSession?.isComplete && savedSession.finalResult && (
            <TouchableOpacity
              style={[commonStyles.buttonOutline, styles.continueButton]}
              onPress={handleContinue}
            >
              <Text style={commonStyles.buttonOutlineText}>
                View Last Result
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* How it works */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Answer 11 questions about your investment profile
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Review and edit your answers
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              Get a personalized portfolio recommendation
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <Disclaimer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.primary,
  },
  titleAccent: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  actions: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  continueButton: {
    marginTop: 0,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  serverWarning: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  serverWarningText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
});
