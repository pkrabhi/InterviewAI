import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, ScrollView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session/providers/google';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import useThemeStore from '../../store/useThemeStore';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import useAuthStore from '../../store/useAuthStore';
import { googleLogin, emailLogin } from '../../services/authService';
import { VERTICAL_SWIPE_STYLE } from '../../utils/webTouch';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '77684419524-rji22pi8ans8lacuujbt31rdmsrbcqn6.apps.googleusercontent.com';

const GlassInput = ({ icon, rightIcon, onRightIcon, COLORS, ...props }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.inputBorder, paddingHorizontal: SPACING.md, paddingVertical: 13 }}>
    <MaterialCommunityIcons name={icon} size={18} color={COLORS.textMuted} />
    <TextInput style={{ flex: 1, color: COLORS.text, fontSize: FONT_SIZE.md }} placeholderTextColor={COLORS.textMuted} {...props} />
    {rightIcon && (
      <TouchableOpacity onPress={onRightIcon}>
        <MaterialCommunityIcons name={rightIcon} size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    )}
  </View>
);

export default function LoginScreen({ navigation }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPwd]  = useState(false);
  const [loading, setLoading]       = useState(false);
  const { setUser } = useAuthStore();
  const { COLORS } = useThemeStore();

  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    androidClientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleToken(authentication.idToken || authentication.accessToken);
    } else if (response?.type === 'error') {
      showAlert('Google Sign-In Failed', response.error?.message || 'Unknown error');
      setLoading(false);
    } else if (response?.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const handleGoogleToken = async (token) => {
    try {
      const data = await googleLogin(token);
      setUser({ name: data.name, email: data.email, avatarUrl: data.avatarUrl, plan: data.plan });
    } catch (error) {
      showAlert('Login Failed', error.response?.data || error.message || 'Could not sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await promptAsync(Platform.OS === 'android' ? { useProxy: true } : {});
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

  return (
    <ScreenBackground variant="auth">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={['#6366F1', '#818CF8']}
            style={styles.logoCircle}
          >
            <Text style={styles.logoEmoji}>🎯</Text>
          </LinearGradient>
          <Text style={[styles.appName, { color: COLORS.text }]}>Crackd</Text>
          <Text style={[styles.tagline, { color: COLORS.textMuted }]}>Practice interviews that feel genuinely real.</Text>
        </View>

        {/* Glass form card */}
        <GlassCard style={styles.formCard}>
          <Text style={[styles.formTitle, { color: COLORS.text }]}>Welcome back</Text>

          <View style={styles.fields}>
            <GlassInput COLORS={COLORS} icon="email-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <GlassInput COLORS={COLORS} icon="lock-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'} onRightIcon={() => setShowPwd(!showPassword)} />
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            onPress={handleEmailLogin}
            disabled={loading}
            style={[styles.signInBtnWrapper, VERTICAL_SWIPE_STYLE]}
          >
            <LinearGradient
              colors={loading ? ['#4B4F8A', '#4B4F8A'] : ['#6366F1', '#818CF8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signInBtn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.signInBtnText}>Sign In</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={[styles.registerLink, VERTICAL_SWIPE_STYLE]}>
            <Text style={[styles.registerLinkText, { color: COLORS.textMuted }]}>
              New here?{'  '}
              <Text style={{ color: COLORS.primaryLight, fontWeight: '600' }}>Create an account</Text>
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.googleBtn, { backgroundColor: COLORS.inputBg, borderColor: COLORS.inputBorder }, (!request || loading) && { opacity: 0.5 }, VERTICAL_SWIPE_STYLE]}
            onPress={handleGoogleLogin}
            disabled={!request || loading}
          >
            <MaterialCommunityIcons name="google" size={20} color={COLORS.text} />
            <Text style={[styles.googleBtnText, { color: COLORS.text }]}>Continue with Google</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.disclaimer}>Free to start. No credit card required.</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

// Note: theme colors used inline; static layout styles only here
const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: { fontSize: 34 },
  appName: { fontSize: FONT_SIZE.hero, fontWeight: 'bold', letterSpacing: -0.5 },
  tagline:  { fontSize: FONT_SIZE.sm, textAlign: 'center' },
  formCard: {
    padding: SPACING.xl,
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  formTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: -SPACING.xs },
  fields: {
    gap: SPACING.sm,
  },
  signInBtnWrapper: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  signInBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  signInBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  registerLink: { alignItems: 'center', marginTop: -SPACING.xs },
  registerLinkText: { fontSize: FONT_SIZE.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(128,128,128,0.2)' },
  dividerText: { fontSize: FONT_SIZE.sm, opacity: 0.5 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 14, borderRadius: RADIUS.full, borderWidth: 1 },
  googleBtnText: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  disclaimer: { fontSize: FONT_SIZE.xs, textAlign: 'center', marginTop: SPACING.md, opacity: 0.4 },
});
