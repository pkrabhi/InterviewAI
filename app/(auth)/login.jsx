import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function LoginScreen() {
  function handleGoogleSignIn() {
    // Phase 7 will wire up real Google Sign-In.
    // For now, skip straight to the main app.
    router.replace('/(tabs)/home');
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <Text style={styles.logoEmoji}>🎯</Text>
        <Text style={styles.appName}>InterviewAI</Text>
        <Text style={styles.tagline}>
          Practice interviews that feel{'\n'}genuinely real.
        </Text>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.fineprint}>Free to start. No credit card.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoEmoji: {
    fontSize: 72,
  },
  appName: {
    fontSize: 36,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: SPACING.sm,
  },
  actionSection: {
    gap: SPACING.md,
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.bg,
  },
  fineprint: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
});
