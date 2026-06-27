import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Linking, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import useAuthStore from '../../store/useAuthStore';
import { logout }   from '../../services/authService';
import { createPaymentOrder } from '../../services/paymentService';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const MenuItem = ({ icon, label, onPress, danger, subtitle }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={danger ? COLORS.danger : COLORS.textMuted}
    />
    <View style={{ flex: 1 }}>
      <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
    </View>
    <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.border} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout: clearAuth, setUser } = useAuthStore();
  const [upgrading, setUpgrading] = useState(false);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        logout().then(() => clearAuth());
      }
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); clearAuth(); } },
    ]);
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const order = await createPaymentOrder();
      showAlert(
        'Pro Upgrade',
        `Order created!\nOrder ID: ${order.orderId}\nAmount: ₹${order.amount / 100}\n\nRazorpay checkout is available in the Android build.`
      );
    } catch (e) {
      showAlert('Error', 'Could not create payment order. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleNotifications = () => {
    showAlert('Notifications', 'Push notifications will be available in the Android app. Stay tuned!');
  };

  const handlePrivacy = () => {
    showAlert(
      'Privacy Policy',
      'InterviewAI does not share your interview data with third parties.\n\n' +
      '• Your answers are used only to generate your performance report.\n' +
      '• We use Groq AI for question generation.\n' +
      '• Data is stored securely on Supabase (PostgreSQL).\n' +
      '• You can delete your account and all data anytime.'
    );
  };

  const handleAbout = () => {
    showAlert(
      'About InterviewAI',
      'InterviewAI v1.0.0\n\n' +
      'Practice real-world technical interviews with AI Interviewer Aryan.\n\n' +
      'Built for Indian IT job seekers.\n\n' +
      'Tech Stack: React Native • Spring Boot • Groq AI • Supabase\n\n' +
      '© 2026 InterviewAI. All rights reserved.'
    );
  };

  const handleHelp = () => {
    showAlert(
      'Help & FAQ',
      'Q: How many free interviews do I get?\nA: 2 interviews on the free plan.\n\n' +
      'Q: How is my score calculated?\nA: AI evaluates technical knowledge, communication, problem solving and best practices.\n\n' +
      'Q: Is my interview data private?\nA: Yes, only you can see your reports.\n\n' +
      'Q: Can I use voice input?\nA: Yes! Tap the mic button in the interview screen (Chrome only).'
    );
  };

  const handleRate = () => {
    showAlert('Rate the App', 'Thank you! Rating will be available when the app is live on Play Store.');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AB';

  const planColor = user?.plan === 'PRO' ? COLORS.accent : COLORS.textMuted;
  const planBg    = user?.plan === 'PRO' ? COLORS.accent + '22' : COLORS.card;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Avatar + name */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Abhijeet'}</Text>
        <Text style={styles.email}>{user?.email || 'abhipkr11@gmail.com'}</Text>
        <View style={[styles.planBadge, { backgroundColor: planBg }]}>
          <Text style={[styles.planText, { color: planColor }]}>
            {user?.plan === 'PRO' ? '⭐ PRO Plan' : 'FREE Plan'}
          </Text>
        </View>
      </View>

      {/* Upgrade card */}
      {user?.plan !== 'PRO' && (
        <View style={styles.upgradeCard}>
          <View style={styles.upgradeLeft}>
            <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeSubtitle}>
              Unlimited interviews, PDF reports & history
            </Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} disabled={upgrading}>
            {upgrading
              ? <ActivityIndicator size="small" color={COLORS.text} />
              : <Text style={styles.upgradeBtnText}>₹299/mo</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Account */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>
        <MenuItem
          icon="bell-outline"
          label="Notifications"
          subtitle="Interview reminders & updates"
          onPress={handleNotifications}
        />
        <MenuItem
          icon="shield-check-outline"
          label="Privacy Policy"
          subtitle="How we handle your data"
          onPress={handlePrivacy}
        />
        <MenuItem
          icon="information-outline"
          label="About"
          subtitle="InterviewAI v1.0.0"
          onPress={handleAbout}
        />
      </View>

      {/* Support */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Support</Text>
        <MenuItem
          icon="help-circle-outline"
          label="Help & FAQ"
          subtitle="Common questions answered"
          onPress={handleHelp}
        />
        <MenuItem
          icon="star-outline"
          label="Rate the App"
          subtitle="Share your feedback"
          onPress={handleRate}
        />
      </View>

      {/* Logout */}
      <View style={styles.menuSection}>
        <MenuItem icon="logout" label="Logout" onPress={handleLogout} danger />
      </View>

      <Text style={styles.version}>InterviewAI v1.0.0 • Made for Indian IT 🇮🇳</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  planBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planText: {
    fontSize: 13,
    fontWeight: '600',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '55',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  upgradeLeft: {
    flex: 1,
    gap: 4,
  },
  upgradeTitle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  upgradeSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  upgradeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
  menuSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuSectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuLabel: {
    color: COLORS.text,
    fontSize: 15,
  },
  menuSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  version: {
    color: COLORS.border,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});
