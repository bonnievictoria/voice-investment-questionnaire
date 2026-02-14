import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { InterviewScreen } from './src/screens/InterviewScreen';
import { ReviewScreen } from './src/screens/ReviewScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SessionState } from './src/types';
import { COLORS } from './src/theme';

type RootStackParamList = {
  Home: undefined;
  Interview: { session?: SessionState };
  Review: { session: SessionState };
  Result: { session: SessionState };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Interview"
          component={InterviewScreen}
          options={{
            title: 'Interview',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            title: 'Review Answers',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{
            title: 'Your Portfolio',
            headerBackTitle: 'Review',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
