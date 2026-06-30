import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import useAuthStore from '../../store/useAuthStore';
import { logout }   from '../../services/authService';
import { createPaymentOrder } from '../../services/paymentService';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

const MenuItem = ({ icon, label, onPress, danger, subtitle }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconWrap, danger && styles.menuIconDanger]}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={danger ? COLORS.danger : 'rgba(255,255,255,0.55)'}
      />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
    </View>
    <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(255,255,255,0.2)" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout: clearAuth } = useAuthStore();
  const [upgrading, setUpgrading]   = useState(false);

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
      showAlert('Pro Upgrade', `Order created!\nOrder ID: ${order.orderId}\nAmount: ₹${order.amount / 100}`);
    } catch (e) {
      showAlert('Error', 'Could not create payment order. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AB';

  return (
    <ScreenBackground>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar hero section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#6366F1', '#7C3AED']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.name}>{user?.name || 'Abhijeet'}</Text>
          <Text style={styles.email}>{user?.email || 'abhipkr11@gmail.com'}</Text>
          <View style={[styles.planBadge, user?.plan === 'PRO' && styles.planBadgePro]}>
            <Text style={[styles.planText, user?.plan === 'PRO' && styles.planTextPro]}>
              {user?.plan === 'PRO' ? '⭐ PRO Plan' : 'FREE Plan'}
            </Text>
          </View>
        </View>

        {/* Upgrade card */}
        {user?.plan !== 'PRO' && (
          <GlassCard
            style={styles.upgradeCard}
            tint="rgba(99,102,241,0.18)"
            borderColor="rgba(99,102,241,0.35)"
            intensity={20}
          >
            <View style={styles.upgradeLeft}>
              <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
              <Text style={styles.upgradeSubtitle}>Unlimited interviews, PDF reports & history</Text>
            </View>
            <TouchableOpacity onPress={handleUpgrade} disabled={upgrading} style={styles.upgradeBtnWrapper}>
              <LinearGradient
                colors={['#6366F1', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeBtn}
              >
                {upgrading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.upgradeBtnText}>₹299/mo</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Account menu */}
        <Text style={styles.sectionLabel}>Account</Text>
        <GlassCard style={styles.menuCard} intensity={18}>
          <MenuItem
            icon="bell-outline"
            label="Notifications"
            subtitle="Interview reminders & updates"
            onPress={() => showAlert('Notifications', 'Push notifications coming in the next update!')}
          />
          <MenuItem
            icon="shield-check-outline"
            label="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => showAlert('Privacy', 'InterviewAI does not share your data with third parties.')}
          />
          <MenuItem
            icon="information-outline"
            label="About"
            subtitle="Crackd v1.0.0"
            onPress={() => showAlert('About', 'Crackd v1.0.0 — Built for Indian IT job seekers.\nTech: React Native • Spring Boot • Groq AI • Supabase')}
          />
        </GlassCard>

        {/* Support menu */}
        <Text style={styles.sectionLabel}>Support</Text>
        <GlassCard style={styles.menuCard} intensity={18}>
          <MenuItem
            icon="help-circle-outline"
            label="Help & FAQ"
            subtitle="Common questions answered"
            onPress={() => showAlert('Help', 'Q: How many free interviews?\nA: 2 on free plan.\n\nQ: Voice input?\nA: Yes, tap the mic in interview screen.')}
          />
          <MenuItem
            icon="star-outline"
            label="Rate the App"
            subtitle="Share your feedback"
            onPress={() => showAlert('Rate', 'Thank you! Rating available when live on Play Store.')}
          />
        </GlassCard>

        {/* Logout */}
        <Text style={styles.sectionLabel}>Session</Text>
        <GlassCard style={styles.menuCard} intensity={18}>
          <MenuItem icon="logout" label="Log Out" onPress={handleLogout} danger />
        </GlassCard>

        <Text style={styles.version}>Crackd v1.0.0 • Made for Indian IT 🇮🇳</Text>
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 14,
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  name: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', letterSpacing: -0.3 },
  email: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  planBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  planBadgePro: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  planText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  planTextPro: { color: COLORS.accent },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  upgradeLeft: { flex: 1, gap: 4 },
  upgradeTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  upgradeSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  upgradeBtnWrapper: { borderRadius: RADIUS.md, overflow: 'hidden' },
  upgradeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    minWidth: 80,
  },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  menuCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: 'rgba(239,68,68,0.12)' },
  menuLabel: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  menuSubtitle: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 1 },
  version: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});
