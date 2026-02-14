# Voice Investment Questionnaire

A cross-platform (iOS + Android) voice-first mobile app that interviews users about their investment profile and recommends a portfolio.

Built with **Expo React Native** (TypeScript) and a **Node.js + Express** backend that calls the Claude API.

---

## Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn**
- **Expo Go** app on your phone (iOS App Store / Google Play Store)
- An **Anthropic API key** (get one at https://console.anthropic.com)

### 1. Start the Backend Server

```bash
cd server

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env and add your Anthropic API key:
#   ANTHROPIC_API_KEY=sk-ant-...

# Start the dev server
npm run dev
```

The server will start on **http://localhost:4000**.

### 2. Start the Expo App

```bash
cd app

# Install dependencies
npm install

# Start Expo
npx expo start
```

Scan the QR code with Expo Go on your phone.

### 3. Connecting from a Physical Device

If running on a physical device, the app needs to reach your backend server. Edit `app/src/config/index.ts` and change the base URL to your machine's local IP:

```typescript
// Replace with your local IP address
return 'http://192.168.1.XXX:4000';
```

Find your local IP:
- **macOS/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig` → look for IPv4 Address

---

## Project Structure

```
├── README.md                  # This file
├── PROJECT_MEMORY.md          # Architecture & design decisions
├── server/                    # Express backend
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── routes/
│   │   │   └── interview.ts   # POST /api/interview/next
│   │   ├── services/
│   │   │   ├── claude.ts      # Claude API integration
│   │   │   └── portfolio.ts   # Portfolio templates & selection
│   │   └── types/
│   │       └── index.ts       # Shared TypeScript types
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── app/                       # Expo React Native app
    ├── App.tsx                # Navigation root
    ├── src/
    │   ├── screens/
    │   │   ├── HomeScreen.tsx
    │   │   ├── InterviewScreen.tsx
    │   │   ├── ReviewScreen.tsx
    │   │   └── ResultScreen.tsx
    │   ├── components/
    │   │   ├── AllocationTable.tsx
    │   │   └── Disclaimer.tsx
    │   ├── services/
    │   │   ├── api.ts         # HTTP client
    │   │   ├── speech.ts      # TTS wrapper
    │   │   └── storage.ts     # AsyncStorage wrapper
    │   ├── config/
    │   │   └── index.ts       # API URL config
    │   ├── theme/
    │   │   └── index.ts       # Colors, spacing, styles
    │   └── types/
    │       └── index.ts       # Shared TypeScript types
    ├── app.json
    ├── babel.config.js
    ├── package.json
    └── tsconfig.json
```

---

## Features

- **Voice output**: Questions are read aloud using text-to-speech (expo-speech)
- **Text input**: Type your answers (voice input requires a custom dev client build — see below)
- **11-question structured interview** covering client background, return objectives, and risk tolerance
- **Session persistence**: Leave and return — your progress is saved locally
- **Answer review & editing**: Review all answers before getting your result
- **Deterministic portfolio selection**: Rules-based engine selects between two portfolio templates
- **Polished result display**: Allocation tables, sections, rationale, and TTS readout

---

## Speech-to-Text (Voice Input)

The app currently uses **text input** as the primary input mode, which works in Expo Go.

For true voice input (speech-to-text), you would need to:

1. Install `@react-native-voice/voice`:
   ```bash
   npx expo install @react-native-voice/voice
   ```
2. Create a custom dev client build:
   ```bash
   npx expo prebuild
   npx expo run:ios   # or run:android
   ```
3. Integrate the voice recognition into `InterviewScreen.tsx`

This is not included by default because it requires native build tools (Xcode / Android Studio), which goes beyond the "minimal steps" goal of this MVP.

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | `server/.env` | Your Anthropic API key |
| `PORT` | `server/.env` | Server port (default: 4000) |

The API key is **never** sent to or stored in the mobile app.

---

## API Endpoints

### `POST /api/interview/next`

Main endpoint for the interview flow. Accepts the current state and user's answer, returns the next step.

### `GET /api/interview/health`

Health check endpoint.

See `PROJECT_MEMORY.md` for the full JSON schema.

---

## Disclaimer

This is a **prototype**. It does not provide real financial advice. The portfolio templates are dummy data for demonstration purposes only.
