export type QuestionId =
  | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'
  | 'Q6' | 'Q7' | 'Q8' | 'Q9' | 'Q10' | 'Q11';

export interface AnswerSummary {
  name: string;
  age: number;
  familySituation: string;
  wealthSource: string;
  coreValues: string;
  investmentGoal: string;
  riskForReturn: 'low' | 'medium' | 'high';
  investmentAmount: string;
  foreseeableNeeds: string;
  investmentHorizon: 'under 5 years' | '5-15 years' | '15+ years';
  riskToleranceConfirm: 'low' | 'medium' | 'high';
}

export interface AssetAllocation {
  assetClass: string;
  targetPct: number;
  range: string;
}

export interface Portfolio {
  title: string;
  clientProfile: string;
  investmentObjectives: string[];
  riskTolerance: string;
  assetAllocation: AssetAllocation[];
  strategicSplit: string;
  rebalancing: string;
}

export interface NextQuestionResponse {
  type: 'next_question';
  questionId: QuestionId;
  questionText: string;
  speakText: string;
  validationHint: string;
  updatedAnswers: Partial<AnswerSummary>;
}

export interface ClarificationResponse {
  type: 'clarification';
  questionId: QuestionId;
  questionText: string;
  speakText: string;
  reason: string;
  updatedAnswers: Partial<AnswerSummary>;
}

export interface FinalResultResponse {
  type: 'final_result';
  summary: AnswerSummary;
  selectedPortfolioId: 'P1' | 'P2';
  rationale: string;
  portfolio: Portfolio;
  speakText: string;
}

export type InterviewResponse =
  | NextQuestionResponse
  | ClarificationResponse
  | FinalResultResponse;

export interface SessionState {
  sessionId: string;
  currentQuestionId: QuestionId;
  answers: Partial<AnswerSummary>;
  isComplete: boolean;
  finalResult?: FinalResultResponse;
}

export const QUESTION_LABELS: Record<QuestionId, string> = {
  Q1: 'Name',
  Q2: 'Age',
  Q3: 'Family Details',
  Q4: 'Wealth Source',
  Q5: 'Core Values',
  Q6: 'Key Goals',
  Q7: 'Risk for Return',
  Q8: 'Investment Amount',
  Q9: 'Foreseeable Needs',
  Q10: 'Investment Horizon',
  Q11: 'Risk Tolerance Confirm',
};

export const QUESTION_TEXTS: Record<QuestionId, string> = {
  Q1: 'Can you tell me your name please?',
  Q2: 'What is your age?',
  Q3: 'What is your family situation?',
  Q4: 'What is your salary income, business earnings or anything relevant?',
  Q5: 'Any preferred areas of investments?',
  Q6: 'What is your investment goal?',
  Q7: 'How much risk are you willing to take to make this return? (low/medium/high)',
  Q8: 'How regularly and how much do you want to deposit? And do you want to put a lump sum up front?',
  Q9: 'Do you have any foreseeable cash needs in the next few years?',
  Q10: 'What is your investment horizon? (under 5 years / 5–15 years / 15+ years)',
  Q11: 'To confirm, is your risk tolerance low, medium, or high?',
};

export const ANSWER_KEYS: Record<QuestionId, keyof AnswerSummary> = {
  Q1: 'name',
  Q2: 'age',
  Q3: 'familySituation',
  Q4: 'wealthSource',
  Q5: 'coreValues',
  Q6: 'investmentGoal',
  Q7: 'riskForReturn',
  Q8: 'investmentAmount',
  Q9: 'foreseeableNeeds',
  Q10: 'investmentHorizon',
  Q11: 'riskToleranceConfirm',
};
