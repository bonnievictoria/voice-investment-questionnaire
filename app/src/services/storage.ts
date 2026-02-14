import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionState } from '../types';

const SESSION_KEY = 'voice_investment_session';

export async function saveSession(session: SessionState): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<SessionState | null> {
  const data = await AsyncStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as SessionState;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
