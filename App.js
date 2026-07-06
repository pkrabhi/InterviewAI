import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider }    from 'react-native-safe-area-context';
import { StatusBar }           from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import AppNavigator    from './navigation/AppNavigator';
import LoginScreen     from './screens/auth/LoginScreen';
import RegisterScreen  from './screens/auth/RegisterScreen';
import { DARK_COLORS as COLORS } from './store/useThemeStore';
import useAuthStore    from './store/useAuthStore';
import useThemeStore   from './store/useThemeStore';
import WebAppShell     from './components/WebAppShell';
import { getUser, getToken } from './services/authService';
import { onNotificationTapped } from './services/notificationService';

const AuthStack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

// Routes a tapped notification to the relevant screen. Only "report_ready" carries enough
// info (a sessionId) to deep-link directly; the others just surface the tab where the user
// can act, since resuming a session needs its full role/level/type/length context.
function handleNotificationTap(data) {
  if (!navigationRef.isReady()) return;
  if (data.type === 'report_ready' && data.sessionId) {
    navigationRef.navigate('InterviewReport', { sessionId: data.sessionId });
  } else if (data.type === 'resume_interview') {
    navigationRef.navigate('MainTabs', { screen: 'History' });
  } else if (data.type === 'daily_reminder') {
    navigationRef.navigate('MainTabs', { screen: 'Home' });
  }
}

export default function App() {
  const { isLoggedIn, isLoading, setUser, setLoading } = useAuthStore();
  const { loadTheme } = useThemeStore();

  useEffect(() => {
    const init = async () => {
      try {
        await loadTheme();               // restore saved theme first
        const token = await getToken();
        const user  = await getUser();
        if (token && user) setUser(user);
      } catch (_) {}
      finally { setLoading(false); }
    };
    init();
    return onNotificationTapped(handleNotificationTap);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <WebAppShell bgColor={COLORS.bg}>
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <NavigationContainer ref={navigationRef}>
        {isLoggedIn ? (
          <AppNavigator />
        ) : (
          <AuthStack.Navigator screenOptions={{ headerShown: false, headerMode: 'float', cardStyle: { backgroundColor: COLORS.bg } }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
    </WebAppShell>
  );
}
