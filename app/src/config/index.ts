import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2
// For iOS simulator, localhost works directly
// For physical devices, use your machine's local IP address
const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }
  // For physical devices on the same Wi-Fi
  return 'http://192.168.1.7:4000';
};

export const CONFIG = {
  API_BASE_URL: getBaseUrl(),
  TTS_LANGUAGE: 'en-US',
  TTS_RATE: 0.9,
  TTS_PITCH: 1.0,
};
