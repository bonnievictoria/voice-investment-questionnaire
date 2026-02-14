import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AllocationTable } from '../components/AllocationTable';
import { Disclaimer } from '../components/Disclaimer';
import { speak, stopSpeaking } from '../services/speech';
import { clearSession } from '../services/storage';
import { SessionState } from '../types';
import { COLORS, SPACING, FONT_SIZES, commonStyles } from '../theme';

type RootStackParamList = {
  Home: undefined;
  Interview: { session?: SessionState };
  Review: { session: SessionState };
  Result: { session: SessionState };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

export function ResultScreen({ navigation, route }: Props) {
  const { session } = route.params;
  const result = session.finalResult;

  useEffect(() => {
    if (result?.speakText) {
      speak(result.speakText);
    }
    return () => {
      stopSpeaking();
    };
  }, [result]);

  if (!result) {
    return (
      <SafeAreaView style={commonStyles.screen}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={commonStyles.body}>No results available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { portfolio, selectedPortfolioId, rationale, summary } = result;
  const isConservative = selectedPortfolioId === 'P2';

  const handleStartOver = async () => {
    stopSpeaking();
    await clearSession();
    navigation.popToTop();
  };

  const handleEditAnswers = () => {
    stopSpeaking();
    navigation.navigate('Review', { session });
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio header */}
        <View
          style={[
            styles.headerBanner,
            {
              backgroundColor: isConservative
                ? COLORS.portfolioGreen
                : COLORS.portfolioBlue,
            },
          ]}
        >
          <Text style={styles.headerLabel}>Your Recommended Portfolio</Text>
          <Text style={styles.headerTitle}>{portfolio.title}</Text>
          <Text style={styles.headerId}>
            Portfolio {selectedPortfolioId === 'P1' ? '1' : '2'}
          </Text>
        </View>

        {/* Rationale */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Selection Rationale</Text>
          <Text style={commonStyles.body}>{rationale}</Text>
        </View>

        {/* Client summary */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Your Profile Summary</Text>
          <SummaryRow label="Name" value={summary.name} />
          <SummaryRow label="Age" value={String(summary.age)} />
          <SummaryRow label="Family" value={summary.familySituation} />
          <SummaryRow label="Income/Wealth" value={summary.wealthSource} />
          <SummaryRow label="Preferred Areas" value={summary.coreValues} />
          <SummaryRow label="Goal" value={summary.investmentGoal} />
          <SummaryRow label="Risk for Return" value={summary.riskForReturn} />
          <SummaryRow label="Deposit Plan" value={summary.investmentAmount} />
          <SummaryRow label="Cash Needs" value={summary.foreseeableNeeds} />
          <SummaryRow label="Horizon" value={summary.investmentHorizon} />
          <SummaryRow
            label="Risk Tolerance"
            value={summary.riskToleranceConfirm}
            isLast
          />
        </View>

        {/* Portfolio details: Client profile */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Portfolio Client Profile</Text>
          <Text style={commonStyles.body}>{portfolio.clientProfile}</Text>
        </View>

        {/* Investment objectives */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Investment Objectives</Text>
          {portfolio.investmentObjectives.map((obj, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={[commonStyles.body, { flex: 1 }]}>{obj}</Text>
            </View>
          ))}
        </View>

        {/* Risk tolerance */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Risk Tolerance</Text>
          <Text style={commonStyles.body}>{portfolio.riskTolerance}</Text>
        </View>

        {/* Asset allocation table */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Asset Allocation</Text>
          <AllocationTable allocations={portfolio.assetAllocation} />
        </View>

        {/* Strategic split */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Strategic Split</Text>
          <View style={styles.splitContainer}>
            <Text style={styles.splitText}>{portfolio.strategicSplit}</Text>
          </View>
        </View>

        {/* Rebalancing */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Rebalancing Strategy</Text>
          <Text style={commonStyles.body}>{portfolio.rebalancing}</Text>
        </View>

        <Disclaimer />

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={commonStyles.buttonOutline} onPress={handleEditAnswers}>
            <Text style={commonStyles.buttonOutlineText}>Edit Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={commonStyles.button} onPress={handleStartOver}>
            <Text style={commonStyles.buttonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxl,
  },
  headerBanner: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  headerLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  headerId: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  bullet: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    lineHeight: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  summaryValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  splitContainer: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: SPACING.md,
  },
  splitText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
});
