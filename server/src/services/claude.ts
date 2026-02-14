import Anthropic from '@anthropic-ai/sdk';
import { InterviewRequest, ClaudeResponse } from '../types';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables. Check server/.env');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `You are an AI investment questionnaire assistant. You MUST respond with valid JSON ONLY — no markdown fences, no explanatory text, no commentary. Output a single JSON object and nothing else.

You are conducting an interview with a client to determine their investment profile. The interview consists of 11 fixed questions that must be asked in order.

QUESTIONS (in order):
Q1 (name): "Can you tell me your name please?"
Q2 (age): "What is your age?"
Q3 (familySituation): "What is your family situation?"
Q4 (wealthSource): "What is your salary income, business earnings or anything relevant?"
Q5 (coreValues): "Any preferred areas of investments?"
Q6 (investmentGoal): "What is your investment goal?"
Q7 (riskForReturn): "How much risk are you willing to take to make this return? (low/medium/high)"
Q8 (investmentAmount): "How regularly and how much do you want to deposit? And do you want to put a lump sum up front?"
Q9 (foreseeableNeeds): "Do you have any foreseeable cash needs in the next few years?"
Q10 (investmentHorizon): "What is your investment horizon? (under 5 years / 5–15 years / 15+ years)"
Q11 (riskToleranceConfirm): "To confirm, is your risk tolerance low, medium, or high?"

ANSWER FIELD MAPPING:
Q1 -> "name" (string)
Q2 -> "age" (number — extract the numeric age)
Q3 -> "familySituation" (string)
Q4 -> "wealthSource" (string)
Q5 -> "coreValues" (string)
Q6 -> "investmentGoal" (string)
Q7 -> "riskForReturn" (must be exactly "low", "medium", or "high")
Q8 -> "investmentAmount" (string)
Q9 -> "foreseeableNeeds" (string — the user's full answer)
Q10 -> "investmentHorizon" (must be exactly "under 5 years", "5-15 years", or "15+ years")
Q11 -> "riskToleranceConfirm" (must be exactly "low", "medium", or "high")

NORMALIZATION RULES:
- For "age": extract a number. If user says "thirty-five" → 35. If unclear, ask for clarification.
- For "riskForReturn": must be one of "low", "medium", "high". Map synonyms: "moderate"→"medium", "minimal"/"conservative"→"low", "aggressive"→"high". If truly ambiguous, clarify.
- For "investmentHorizon": map to one of: "under 5 years", "5-15 years", "15+ years". Examples: "3 years"→"under 5 years", "10 years"→"5-15 years", "20 years"/"long term"→"15+ years". If unclear, clarify.
- For "riskToleranceConfirm": same rules as riskForReturn.

RESPONSE FORMATS — respond with EXACTLY one of these JSON structures:

1. Next question (when current question is answered satisfactorily):
{
  "type": "next_question",
  "questionId": "<next question ID, e.g. Q2>",
  "questionText": "<the fixed question text>",
  "speakText": "<a friendly, natural transition + the question>",
  "validationHint": "<what kind of answer is expected>",
  "updatedAnswers": { <all answers collected so far, including the one just parsed> }
}

2. Clarification needed (when the answer is ambiguous or invalid):
{
  "type": "clarification",
  "questionId": "<current question ID>",
  "questionText": "<the fixed question text>",
  "speakText": "<a friendly re-ask or clarification prompt>",
  "reason": "<why clarification is needed>",
  "updatedAnswers": { <answers so far, WITHOUT the ambiguous one> }
}

3. Interview complete (after Q11 is answered):
{
  "type": "complete",
  "updatedAnswers": {
    "name": "string",
    "age": <number>,
    "familySituation": "string",
    "wealthSource": "string",
    "coreValues": "string",
    "investmentGoal": "string",
    "riskForReturn": "low|medium|high",
    "investmentAmount": "string",
    "foreseeableNeeds": "string",
    "investmentHorizon": "under 5 years|5-15 years|15+ years",
    "riskToleranceConfirm": "low|medium|high"
  }
}

RULES:
- updatedAnswers must include ALL answers collected so far (carry forward previous answers).
- Only advance to the next question when the current one is adequately answered.
- If the user says "repeat" or asks to hear the question again, re-ask the current question as a next_question with the same questionId.
- speakText should be conversational, warm, and professional. Use the client's name once you know it.
- For Q1, speakText should be welcoming. For subsequent questions, include a brief, natural acknowledgment of their answer.
- NEVER output markdown, code fences, or any text outside the JSON object.`;

export async function processInterview(
  request: InterviewRequest
): Promise<ClaudeResponse> {
  const userMessage = buildUserMessage(request);

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return parseClaudeResponse(text);
  } catch {
    // Retry once with repair prompt
    const retryResponse = await getClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: text },
        {
          role: 'user',
          content:
            'Your previous response was not valid JSON. Please return ONLY a valid JSON object with no additional text, markdown, or code fences.',
        },
      ],
    });

    const retryText =
      retryResponse.content[0].type === 'text'
        ? retryResponse.content[0].text
        : '';

    return parseClaudeResponse(retryText);
  }
}

function buildUserMessage(request: InterviewRequest): string {
  const { currentQuestionId, answers, lastUserUtterance } = request;

  return `Current state of the interview:
- Current question being answered: ${currentQuestionId}
- Answers collected so far: ${JSON.stringify(answers)}
- User's response to the current question: "${lastUserUtterance}"

Process this response. If the answer is clear and valid, advance to the next question (or return "complete" if this was Q11). If the answer is ambiguous or invalid for this question type, return a clarification request. Return ONLY valid JSON.`;
}

function parseClaudeResponse(text: string): ClaudeResponse {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);

  if (!parsed.type || !parsed.updatedAnswers) {
    throw new Error('Invalid response structure from Claude');
  }

  if (!['next_question', 'clarification', 'complete'].includes(parsed.type)) {
    throw new Error(`Unknown response type: ${parsed.type}`);
  }

  return parsed as ClaudeResponse;
}
