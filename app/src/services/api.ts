import { CONFIG } from '../config';
import { InterviewResponse, QuestionId, AnswerSummary } from '../types';

interface InterviewNextRequest {
  sessionId: string;
  answers: Partial<AnswerSummary>;
  currentQuestionId: QuestionId;
  lastUserUtterance: string;
}

export async function sendInterviewResponse(
  request: InterviewNextRequest
): Promise<InterviewResponse> {
  const url = `${CONFIG.API_BASE_URL}/api/interview/next`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Server error (${response.status}): ${errorBody}`);
  }

  return response.json();
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const url = `${CONFIG.API_BASE_URL}/api/interview/health`;
    const response = await fetch(url, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
