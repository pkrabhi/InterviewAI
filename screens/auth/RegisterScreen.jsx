import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, ScrollView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import useAuthStore from '../../store/useAuthStore';
import { emailRegister } from '../../services/authService';

const GlassInput = ({ icon, label, rightIcon, onRightIcon, ...props }) => (
  <View style={inputStyles.group}>
    {label && <Text style={inputStyles.label}>{label}</Text>}
    <View style={inputStyles.wrapper}>
      <MaterialCommunityIcons name={icon} size={18} color="rgba(255,255,255,0.4)" />
      <TextInput style={inputStyles.input} placeholderTextColor="rgba(255,255,255,0.3)" {...props} />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIcon}>
          <MaterialCommunityIcons name={rightIcon} size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const inputStyles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 15 },
});

export default function RegisterScreen({ navigation }) {
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPwd]    = useState('');
  const [showPassword, setShowPwd]          = useState(false);
  const [loading, setLoading]               = useState(false);
  const { setUser } = useAuthStore();

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showAlert('Error', 'Please fill in all fields'); return;
    }
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match'); return;
    }
    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const data = await emailRegister(name.trim(), email.trim().toLowerCase(), password);
      setUser({ name: data.name, email: data.email, avatarUrl: data.avatarUrl, plan: data.plan });
    } catch (error) {
      showAlert('Registration Failed', error.response?.data || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground variant="auth">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <View style={styles.backBtnInner}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.text} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Crackd and start practicing</Text>
        </View>

        <GlassCard style={styles.formCard}>
          <View style={styles.fields}>
            <GlassInput
              icon="account-outline"
              label="Full Name"
              placeholder="Abhijeet Kumar"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <GlassInput
              icon="email-outline"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <GlassInput
              icon="lock-outline"
              label="Password"
              placeholder="Min. 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIcon={() => setShowPwd(!showPassword)}
            />
            <GlassInput
              icon="lock-check-outline"
              label="Confirm Password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChangeText={setConfirmPwd}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.btnWrapper}>
            <LinearGradient
              colors={loading ? ['#4B4F8A', '#4B4F8A'] : ['#6366F1', '#818CF8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerBtn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.registerBtnText}>Create Account</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account?{'  '}
              <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  backBtn: { marginBottom: SPACING.lg },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: { marginBottom: SPACING.xl },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.4)' },
  formCard: { padding: SPACING.xl, gap: SPACING.lg },
  fields: { gap: SPACING.md },
  btnWrapper: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  registerBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center' },
  loginLinkText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  loginLinkBold: { color: COLORS.primaryLight, fontWeight: '600' },
});
