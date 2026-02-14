import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { sendInterviewResponse } from '../services/api';
import { speak, stopSpeaking } from '../services/speech';
import { saveSession } from '../services/storage';
import {
  SessionState,
  QuestionId,
  AnswerSummary,
  QUESTION_TEXTS,
  QUESTION_LABELS,
  InterviewResponse,
  FinalResultResponse,
} from '../types';
import { COLORS, SPACING, FONT_SIZES, commonStyles } from '../theme';

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type RootStackParamList = {
  Home: undefined;
  Interview: { session?: SessionState };
  Review: { session: SessionState };
  Result: { session: SessionState };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Interview'>;
  route: RouteProp<RootStackParamList, 'Interview'>;
};

function getWebSpeechRecognition(): any | null {
  if (Platform.OS !== 'web') return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SR || null;
}

export function InterviewScreen({ navigation, route }: Props) {
  const existingSession = route.params?.session;

  const [sessionId] = useState(() => existingSession?.sessionId || uuidv4());
  const [currentQuestionId, setCurrentQuestionId] = useState<QuestionId>(
    existingSession?.currentQuestionId || 'Q1'
  );
  const [answers, setAnswers] = useState<Partial<AnswerSummary>>(
    existingSession?.answers || {}
  );
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sttAvailable, setSttAvailable] = useState(false);
  const [clarification, setClarification] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const scrollRef = useRef<ScrollView>(null);
  const recognitionRef = useRef<any>(null);

  // Check if Web Speech API is available
  useEffect(() => {
    const SR = getWebSpeechRecognition();
    setSttAvailable(!!SR);
  }, []);

  // Speak the first question on mount
  useEffect(() => {
    const questionText = QUESTION_TEXTS[currentQuestionId];
    const welcomeText =
      currentQuestionId === 'Q1'
        ? `Welcome! Let's get started with your investment questionnaire. ${questionText}`
        : questionText;

    setDisplayText(questionText);
    addToTranscript('ai', welcomeText);
    speakText(welcomeText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToTranscript = (role: string, text: string) => {
    setTranscript((prev) => [...prev, { role, text }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeakingNow(true);
      await speak(text);
    } catch {
      // TTS failed silently — text is still visible on screen
    } finally {
      setIsSpeakingNow(false);
    }
  };

  const handleRepeat = () => {
    stopSpeaking();
    const text = clarification || QUESTION_TEXTS[currentQuestionId];
    speakText(text);
  };

  // Start/stop speech recognition (Web Speech API)
  const toggleListening = useCallback(() => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SR = getWebSpeechRecognition();
    if (!SR) {
      Alert.alert('Not available', 'Speech recognition is not supported in this browser. Please type your answer instead.');
      return;
    }

    // Stop TTS if playing so mic can hear
    stopSpeaking();
    setIsSpeakingNow(false);

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setUserInput(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const handleSubmit = async () => {
    const utterance = userInput.trim();
    if (!utterance) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    addToTranscript('user', utterance);
    setUserInput('');
    setIsProcessing(true);
    setClarification(null);

    try {
      const response: InterviewResponse = await sendInterviewResponse({
        sessionId,
        answers,
        currentQuestionId,
        lastUserUtterance: utterance,
      });

      if (response.type === 'next_question') {
        const newAnswers = response.updatedAnswers;
        setAnswers(newAnswers);
        setCurrentQuestionId(response.questionId);
        setDisplayText(response.questionText);
        addToTranscript('ai', response.speakText);
        speakText(response.speakText);

        await saveSession({
          sessionId,
          currentQuestionId: response.questionId,
          answers: newAnswers,
          isComplete: false,
        });
      } else if (response.type === 'clarification') {
        setAnswers(response.updatedAnswers);
        setClarification(response.reason);
        setDisplayText(response.questionText);
        addToTranscript('ai', response.speakText);
        speakText(response.speakText);
      } else if (response.type === 'final_result') {
        const finalSession: SessionState = {
          sessionId,
          currentQuestionId: 'Q11',
          answers: response.summary,
          isComplete: true,
          finalResult: response as FinalResultResponse,
        };
        await saveSession(finalSession);
        addToTranscript('ai', 'Thank you! Your interview is complete. Let me prepare your results.');
        stopSpeaking();

        navigation.replace('Review', { session: finalSession });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', `Failed to process your answer. ${msg}\n\nPlease try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const questionNum = parseInt(currentQuestionId.slice(1), 10);
  const progress = ((questionNum - 1) / 11) * 100;

  return (
    <SafeAreaView style={commonStyles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {questionNum} of 11 — {QUESTION_LABELS[currentQuestionId]}
          </Text>
        </View>

        {/* Current question card */}
        <View style={[commonStyles.card, styles.questionCard]}>
          <Text style={styles.questionPartLabel}>
            {questionNum <= 5
              ? 'Part 1 — Client Background'
              : questionNum <= 8
              ? 'Part 2 — Return Objective'
              : 'Part 3 — Risk Tolerance'}
          </Text>
          <View style={styles.questionRow}>
            <Text style={[styles.questionText, { flex: 1 }]}>{displayText}</Text>
            {/* Speaker icon to replay question */}
            <TouchableOpacity
              style={[styles.iconBtn, styles.speakerBtn]}
              onPress={isSpeakingNow ? () => { stopSpeaking(); setIsSpeakingNow(false); } : handleRepeat}
              activeOpacity={0.7}
            >
              <Text style={styles.iconText}>{isSpeakingNow ? '\u23F9' : '\u{1F50A}'}</Text>
            </TouchableOpacity>
          </View>
          {clarification && (
            <Text style={styles.clarificationText}>
              Clarification needed: {clarification}
            </Text>
          )}
        </View>

        {/* Transcript */}
        <ScrollView
          ref={scrollRef}
          style={styles.transcript}
          contentContainerStyle={styles.transcriptContent}
        >
          {transcript.map((entry, i) => (
            <View
              key={i}
              style={[
                styles.messageBubble,
                entry.role === 'ai' ? styles.aiBubble : styles.userBubble,
              ]}
            >
              <View style={[styles.avatarCircle, entry.role === 'ai' ? styles.aiAvatar : styles.userAvatar]}>
                <Text style={styles.avatarText}>{entry.role === 'ai' ? 'AI' : 'U'}</Text>
              </View>
              <Text style={styles.messageText}>{entry.text}</Text>
            </View>
          ))}
          {isProcessing && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={[styles.avatarCircle, styles.aiAvatar]}>
                <Text style={styles.avatarText}>AI</Text>
              </View>
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.messageText, { marginLeft: SPACING.sm }]}>
                  Processing...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={userInput}
              onChangeText={setUserInput}
              placeholder={isListening ? 'Listening...' : 'Type your answer...'}
              placeholderTextColor={isListening ? COLORS.error : COLORS.textLight}
              editable={!isProcessing}
              onSubmitEditing={handleSubmit}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!userInput.trim() || isProcessing) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!userInput.trim() || isProcessing}
            >
              <Text style={styles.sendIconText}>{'\u27A4'}</Text>
            </TouchableOpacity>
          </View>

          {/* Icon action row */}
          <View style={styles.iconRow}>
            {/* Mic button */}
            {sttAvailable && (
              <TouchableOpacity
                style={[styles.micButton, isListening && styles.micButtonActive]}
                onPress={toggleListening}
                disabled={isProcessing}
                activeOpacity={0.7}
              >
                <Text style={[styles.micIcon, isListening && styles.micIconActive]}>
                  {'\u{1F3A4}'}
                </Text>
                <Text style={[styles.micLabel, isListening && styles.micLabelActive]}>
                  {isListening ? 'Tap to stop' : 'Tap to speak'}
                </Text>
              </TouchableOpacity>
            )}

            {!sttAvailable && (
              <View style={styles.micUnavailable}>
                <Text style={styles.micUnavailableText}>
                  {'\u{1F3A4}'} Voice input not available in this browser
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  questionCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  questionPartLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 26,
  },
  clarificationText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontStyle: 'italic',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerBtn: {
    backgroundColor: COLORS.accent,
    marginLeft: SPACING.sm,
  },
  iconText: {
    fontSize: 20,
  },
  transcript: {
    flex: 1,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  transcriptContent: {
    paddingBottom: SPACING.sm,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  aiBubble: {
    backgroundColor: COLORS.accent,
    marginRight: SPACING.xl,
  },
  userBubble: {
    backgroundColor: '#e8f5e9',
    marginLeft: SPACING.xl,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  aiAvatar: {
    backgroundColor: COLORS.primary,
  },
  userAvatar: {
    backgroundColor: COLORS.secondary,
  },
  avatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  messageText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
    paddingTop: 4,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    backgroundColor: COLORS.background,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  sendIconText: {
    color: '#fff',
    fontSize: 18,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  micButtonActive: {
    backgroundColor: '#fdecea',
    borderColor: COLORS.error,
  },
  micIcon: {
    fontSize: 22,
    marginRight: SPACING.sm,
  },
  micIconActive: {
    // active state handled by container
  },
  micLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  micLabelActive: {
    color: COLORS.error,
  },
  micUnavailable: {
    paddingVertical: SPACING.xs,
  },
  micUnavailableText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
});
