import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { sendInterviewResponse } from '../services/api';
import { saveSession } from '../services/storage';
import {
  SessionState,
  AnswerSummary,
  QUESTION_LABELS,
  ANSWER_KEYS,
  QuestionId,
  FinalResultResponse,
} from '../types';
import { COLORS, SPACING, FONT_SIZES, commonStyles } from '../theme';

type RootStackParamList = {
  Home: undefined;
  Interview: { session?: SessionState };
  Review: { session: SessionState };
  Result: { session: SessionState };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Review'>;
  route: RouteProp<RootStackParamList, 'Review'>;
};

const ALL_QUESTIONS: QuestionId[] = [
  'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11',
];

export function ReviewScreen({ navigation, route }: Props) {
  const { session } = route.params;
  const [answers, setAnswers] = useState<Partial<AnswerSummary>>({ ...session.answers });
  const [editingQuestion, setEditingQuestion] = useState<QuestionId | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAnswerValue = (qId: QuestionId): string => {
    const key = ANSWER_KEYS[qId];
    const val = answers[key];
    if (val === undefined || val === null) return '—';
    return String(val);
  };

  const handleEdit = (qId: QuestionId) => {
    setEditingQuestion(qId);
    setEditValue(getAnswerValue(qId));
  };

  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    const key = ANSWER_KEYS[editingQuestion];
    const newAnswers = { ...answers };

    if (key === 'age') {
      const num = parseInt(editValue, 10);
      if (isNaN(num) || num < 0 || num > 150) {
        Alert.alert('Invalid age', 'Please enter a valid age.');
        return;
      }
      (newAnswers as Record<string, unknown>)[key] = num;
    } else {
      (newAnswers as Record<string, unknown>)[key] = editValue;
    }

    setAnswers(newAnswers);
    setEditingQuestion(null);
    setEditValue('');
  };

  const handleSubmitForResult = async () => {
    setIsSubmitting(true);

    try {
      // Re-submit final answer to get portfolio selection
      // We send Q11 with the confirmed risk tolerance to trigger final_result
      const response = await sendInterviewResponse({
        sessionId: session.sessionId,
        answers,
        currentQuestionId: 'Q11',
        lastUserUtterance: String(answers.riskToleranceConfirm || 'medium'),
      });

      if (response.type === 'final_result') {
        const finalSession: SessionState = {
          ...session,
          answers: response.summary,
          isComplete: true,
          finalResult: response as FinalResultResponse,
        };
        await saveSession(finalSession);
        navigation.replace('Result', { session: finalSession });
      } else {
        // Should not happen, but handle gracefully
        Alert.alert('Unexpected response', 'Please try again.');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to get results: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={commonStyles.title}>Review Your Answers</Text>
        <Text style={[commonStyles.caption, { marginBottom: SPACING.md }]}>
          Tap any answer to edit it before getting your result.
        </Text>

        {/* Part 1 */}
        <Text style={styles.partLabel}>Part 1 — Client Background</Text>
        {ALL_QUESTIONS.slice(0, 5).map((qId) => (
          <AnswerRow
            key={qId}
            questionId={qId}
            label={QUESTION_LABELS[qId]}
            value={getAnswerValue(qId)}
            isEditing={editingQuestion === qId}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onStartEdit={() => handleEdit(qId)}
            onSave={handleSaveEdit}
            onCancel={() => setEditingQuestion(null)}
          />
        ))}

        {/* Part 2 */}
        <Text style={styles.partLabel}>Part 2 — Return Objective</Text>
        {ALL_QUESTIONS.slice(5, 8).map((qId) => (
          <AnswerRow
            key={qId}
            questionId={qId}
            label={QUESTION_LABELS[qId]}
            value={getAnswerValue(qId)}
            isEditing={editingQuestion === qId}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onStartEdit={() => handleEdit(qId)}
            onSave={handleSaveEdit}
            onCancel={() => setEditingQuestion(null)}
          />
        ))}

        {/* Part 3 */}
        <Text style={styles.partLabel}>Part 3 — Risk Tolerance</Text>
        {ALL_QUESTIONS.slice(8, 11).map((qId) => (
          <AnswerRow
            key={qId}
            questionId={qId}
            label={QUESTION_LABELS[qId]}
            value={getAnswerValue(qId)}
            isEditing={editingQuestion === qId}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onStartEdit={() => handleEdit(qId)}
            onSave={handleSaveEdit}
            onCancel={() => setEditingQuestion(null)}
          />
        ))}

        {/* Submit */}
        <TouchableOpacity
          style={[commonStyles.button, styles.submitButton, isSubmitting && styles.disabled]}
          onPress={handleSubmitForResult}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={commonStyles.buttonText}>Get My Portfolio Recommendation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function AnswerRow({
  questionId,
  label,
  value,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onSave,
  onCancel,
}: {
  questionId: QuestionId;
  label: string;
  value: string;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (text: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const qNum = questionId.slice(1);

  if (isEditing) {
    return (
      <View style={[styles.answerCard, styles.answerCardEditing]}>
        <Text style={styles.answerLabel}>
          Q{qNum}. {label}
        </Text>
        <TextInput
          style={styles.editInput}
          value={editValue}
          onChangeText={onEditValueChange}
          autoFocus
          multiline
        />
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.answerCard} onPress={onStartEdit}>
      <Text style={styles.answerLabel}>
        Q{qNum}. {label}
      </Text>
      <Text style={styles.answerValue}>{value}</Text>
      <Text style={styles.editHint}>Tap to edit</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  partLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  answerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  answerCardEditing: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  answerLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  answerValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  editHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  editInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    minHeight: 44,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  cancelBtn: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: FONT_SIZES.sm,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  disabled: {
    backgroundColor: COLORS.textLight,
  },
});
