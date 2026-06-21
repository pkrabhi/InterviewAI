import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import { COLORS } from '../constants/theme';

// Keep the splash screen visible until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = Font.useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <Stack screenOptions={{ headerShown: false }}>
        {/*
          Expo Router file-based navigation:
          - (auth) group  → login, onboarding (no tab bar)
          - (tabs) group  → main app with bottom tab bar
          - interview/    → stack screens on top of tabs
        */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="interview" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
