import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import { getUser, getToken } from './services/authService';

const AuthStack = createStackNavigator();

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
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <NavigationContainer>
        {isLoggedIn ? (
          <AppNavigator />
        ) : (
          <AuthStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.bg } }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
