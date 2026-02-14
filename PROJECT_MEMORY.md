# Project Memory — Voice Investment Questionnaire

## What Was Built

A cross-platform mobile app (iOS + Android) that conducts a structured 11-question investment interview and recommends one of two dummy portfolio templates. The app uses text-to-speech to read questions aloud and accepts typed answers (with a clear path to add speech-to-text via a custom dev client).

## Architecture

### Frontend: Expo React Native (TypeScript)
- **Navigation**: `@react-navigation/native-stack` with 4 screens
- **TTS**: `expo-speech` for reading questions and results aloud
- **Persistence**: `@react-native-async-storage/async-storage` for session state
- **Input**: Text input (type your answers); voice input requires native build

### Backend: Node.js + Express (TypeScript)
- **AI**: Anthropic Claude API (claude-sonnet-4-5-20250929) for interview flow management
- **Portfolio selection**: Deterministic rules engine (no AI involved)
- **Security**: API key stored server-side only, CORS enabled for local dev

## Folder Structure

```
/server
  /src
    index.ts              — Express server entry, CORS, routing
    /routes
      interview.ts        — POST /api/interview/next handler
    /services
      claude.ts           — Claude API integration, system prompt, JSON parsing
      portfolio.ts        — Portfolio templates, selection rules
    /types
      index.ts            — TypeScript interfaces for API contract
  .env.example            — Template for environment variables
  package.json / tsconfig.json

/app
  App.tsx                 — Navigation container with 4 screens
  /src
    /screens
      HomeScreen.tsx      — Welcome, start/continue session, server health check
      InterviewScreen.tsx — Question display, TTS, text input, progress bar
      ReviewScreen.tsx    — All Q&A pairs with inline editing
      ResultScreen.tsx    — Portfolio display with allocation table, rationale, TTS
    /components
      AllocationTable.tsx — Tabular display of asset allocation
      Disclaimer.tsx      — Yellow warning banner
    /services
      api.ts              — HTTP client for backend
      speech.ts           — TTS wrapper (expo-speech)
      storage.ts          — AsyncStorage wrapper for session persistence
    /config
      index.ts            — API base URL (platform-aware for emulator vs device)
    /theme
      index.ts            — Colors, spacing, font sizes, common styles
    /types
      index.ts            — TypeScript types matching API contract
  app.json / package.json / tsconfig.json / babel.config.js
```

## Key Environment Variables

| Variable | File | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `server/.env` | Anthropic API key for Claude calls |
| `PORT` | `server/.env` | Backend port (default 4000) |

## Interview JSON Schema

### Request: `POST /api/interview/next`
```json
{
  "sessionId": "uuid",
  "answers": { "name": "John", "age": 35, ... },
  "currentQuestionId": "Q1" through "Q11",
  "lastUserUtterance": "user's spoken/typed text"
}
```

### Response Types

**next_question** — advance to the next question:
```json
{
  "type": "next_question",
  "questionId": "Q2",
  "questionText": "What is your age?",
  "speakText": "Nice to meet you, John! What is your age?",
  "validationHint": "Expect a number",
  "updatedAnswers": { "name": "John" }
}
```

**clarification** — re-ask when answer is ambiguous:
```json
{
  "type": "clarification",
  "questionId": "Q7",
  "questionText": "How much risk...",
  "speakText": "Could you clarify — low, medium, or high?",
  "reason": "Ambiguous risk level",
  "updatedAnswers": { ... }
}
```

**final_result** — after Q11 is answered (assembled by server, not Claude):
```json
{
  "type": "final_result",
  "summary": { ... all 11 answers ... },
  "selectedPortfolioId": "P1" | "P2",
  "rationale": "reason string",
  "portfolio": { ... full portfolio details ... },
  "speakText": "TTS text"
}
```

## How Claude Is Used

Claude receives a system prompt with:
- The fixed 11-question list with IDs and answer field mappings
- Normalization rules (age→number, risk→enum, horizon→enum)
- Three strict JSON response formats
- Instructions to never output anything except JSON

The user message includes: current question ID, all answers so far, and the user's latest utterance. Claude parses the answer, normalizes it, and returns the next step.

If Claude returns invalid JSON, the server retries once with a "return JSON only" repair prompt.

## Portfolio Selection Rules (Deterministic)

**Select Portfolio 2 (Conservative Income)** if ANY are true:
1. `riskToleranceConfirm == "low"`
2. `investmentHorizon == "under 5 years"`
3. `age >= 60`
4. `foreseeableNeeds` indicates near-term cash needs (keyword matching)

**Otherwise → Portfolio 1 (Moderate Growth)**

The rationale string explains which rules triggered the selection.

## Next Steps for Production Hardening

1. **Speech-to-text**: Add `@react-native-voice/voice` with custom dev client build
2. **Authentication**: Add user accounts and session management
3. **Database**: Replace in-memory session with persistent storage (PostgreSQL/MongoDB)
4. **Rate limiting**: Add rate limiting to the Express API
5. **Input validation**: Add server-side validation with Zod or Joi
6. **Error monitoring**: Add Sentry or similar for crash reporting
7. **Real portfolios**: Replace dummy templates with real portfolio logic
8. **Compliance**: Add proper regulatory disclaimers, terms of service
9. **Testing**: Add unit tests (Jest) and E2E tests (Detox/Maestro)
10. **CI/CD**: GitHub Actions pipeline for build/test/deploy
11. **Hosting**: Deploy server to Railway/Render/AWS, use EAS for mobile builds
12. **Streaming**: Use Claude streaming for faster perceived response times
13. **Localization**: i18n support for multiple languages
14. **Accessibility**: Full VoiceOver/TalkBack support
