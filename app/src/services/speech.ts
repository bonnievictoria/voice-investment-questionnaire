import * as Speech from 'expo-speech';
import { CONFIG } from '../config';

export function speak(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: CONFIG.TTS_LANGUAGE,
      rate: CONFIG.TTS_RATE,
      pitch: CONFIG.TTS_PITCH,
      onDone: () => resolve(),
      onError: (error) => reject(error),
    });
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
