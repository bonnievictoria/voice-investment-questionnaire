export interface InterviewRequest {
  sessionId: string;
  answers: Partial<AnswerSummary>;
  currentQuestionId: QuestionId;
  lastUserUtterance: string;
}

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

export interface ClaudeNextQuestion {
  type: 'next_question';
  questionId: QuestionId;
  questionText: string;
  speakText: string;
  validationHint: string;
  updatedAnswers: Partial<AnswerSummary>;
}

export interface ClaudeClarification {
  type: 'clarification';
  questionId: QuestionId;
  questionText: string;
  speakText: string;
  reason: string;
  updatedAnswers: Partial<AnswerSummary>;
}

export interface ClaudeComplete {
  type: 'complete';
  updatedAnswers: AnswerSummary;
}

export type ClaudeResponse = ClaudeNextQuestion | ClaudeClarification | ClaudeComplete;
