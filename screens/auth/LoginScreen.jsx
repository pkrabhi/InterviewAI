import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, ScrollView, Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session/providers/google';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import useAuthStore from '../../store/useAuthStore';
import { googleLogin, emailLogin, devLogin } from '../../services/authService';

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID = '77684419524-ujp6jc26jfm1kusam24e4jg1k7qtetpq.apps.googleusercontent.com';
const WEB_CLIENT_ID = '77684419524-rji22pi8ans8lacuujbt31rdmsrbcqn6.apps.googleusercontent.com';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    androidClientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Google auth response:', JSON.stringify(authentication));
      handleGoogleToken(authentication.idToken || authentication.accessToken);
    } else if (response?.type === 'error') {
      showAlert('Google Sign-In Failed', response.error?.message || 'Unknown error');
      setLoading(false);
    } else if (response?.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  const handleGoogleToken = async (token) => {
    try {
      const data = await googleLogin(token);
      setUser({ name: data.name, email: data.email, avatarUrl: data.avatarUrl, plan: data.plan });
    } catch (error) {
      const msg = error.response?.data || error.message || 'Could not sign in with Google';
      showAlert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await promptAsync();
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await emailLogin(email.trim().toLowerCase(), password);
      setUser({ name: data.name, email: data.email, avatarUrl: data.avatarUrl, plan: data.plan });
    } catch (error) {
      showAlert('Login Failed', error.response?.data || error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const data = await devLogin();
      setUser({ name: data.name, email: data.email, avatarUrl: data.avatarUrl, plan: data.plan });
    } catch (error) {
      showAlert('Error', 'Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🎯</Text>
        </View>
        <Text style={styles.appName}>Crackd</Text>
        <Text style={styles.tagline}>Practice interviews that feel genuinely real.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.emailBtn, loading && styles.btnDisabled]}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.emailBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
          <Text style={styles.registerLinkText}>
            New here? <Text style={styles.registerLinkBold}>Create an account</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleBtn, (!request || loading) && styles.btnDisabled]}
          onPress={handleGoogleLogin}
          disabled={!request || loading}
        >
          <MaterialCommunityIcons name="google" size={20} color={COLORS.text} />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity style={styles.devBtn} onPress={handleDevLogin} disabled={loading}>
            <Text style={styles.devBtnText}>Dev Login (skip Google)</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.disclaimer}>Free to start. No credit card required.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoEmoji: { fontSize: 32 },
  appName: { fontSize: 30, fontWeight: 'bold', color: COLORS.text },
  tagline: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  form: { gap: SPACING.md },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 4,
  },
  emailBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  emailBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },
  registerLink: { alignItems: 'center' },
  registerLinkText: { color: COLORS.textMuted, fontSize: 14 },
  registerLinkBold: { color: COLORS.primary, fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: 13 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  googleBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  devBtn: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  devBtnText: { color: COLORS.textMuted, fontSize: 14 },
  disclaimer: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: SPACING.md },
});
