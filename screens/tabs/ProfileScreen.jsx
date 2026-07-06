import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Platform, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import useThemeStore from '../../store/useThemeStore';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import useAuthStore from '../../store/useAuthStore';
import { logout }   from '../../services/authService';
import { createPaymentOrder } from '../../services/paymentService';
import { VERTICAL_SWIPE_STYLE } from '../../utils/webTouch';
import { pushNotificationsSupported, enableNotifications, disableNotifications } from '../../services/notificationService';

const showAlert = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
};

export default function ProfileScreen() {
  const { user, logout: clearAuth } = useAuthStore();
  const { COLORS, isDark, toggleTheme } = useThemeStore();
  const [upgrading, setUpgrading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);

  const MenuItem = ({ icon, label, onPress, danger, subtitle, right }) => (
    <TouchableOpacity style={[styles.menuItem, VERTICAL_SWIPE_STYLE]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconWrap, danger && { backgroundColor: COLORS.danger + '22' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={danger ? COLORS.danger : COLORS.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
        {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
      </View>
      {right || <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.textMuted + '55'} />}
    </TouchableOpacity>
  );

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) logout().then(() => clearAuth());
      return;
    }
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); clearAuth(); } },
    ]);
  };

  const handleToggleNotifications = async (value) => {
    if (value && !pushNotificationsSupported) {
      showAlert(
        'Mobile app required',
        'Push notifications need the Crackd mobile app installed on your phone — they aren\'t available on web or in a simulator.'
      );
      return;
    }
    setNotifLoading(true);
    try {
      if (value) {
        const granted = await enableNotifications();
        if (granted) {
          setNotifEnabled(true);
        } else {
          showAlert('Permission needed', 'Enable notifications for Crackd in your device settings to turn this on.');
        }
      } else {
        await disableNotifications();
        setNotifEnabled(false);
      }
    } catch (_) {
      showAlert('Error', 'Could not update notification settings. Please try again.');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const order = await createPaymentOrder();
      showAlert('Pro Upgrade', `Order ID: ${order.orderId}\nAmount: ₹${order.amount / 100}`);
    } catch {
      showAlert('Error', 'Could not create payment order. Please try again.');
    } finally { setUpgrading(false); }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AB';

  return (
    <ScreenBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xxl }}>

        {/* Avatar */}
        <View style={styles.hero}>
          <LinearGradient colors={['#6366F1', '#7C3AED']} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.name}>{user?.name || 'Abhijeet'}</Text>
          <Text style={styles.email}>{user?.email || 'abhipkr11@gmail.com'}</Text>
          <View style={[styles.planBadge, user?.plan === 'PRO' && { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent + '55' }]}>
            <Text style={[styles.planText, user?.plan === 'PRO' && { color: COLORS.accent }]}>
              {user?.plan === 'PRO' ? '⭐ PRO Plan' : 'FREE Plan'}
            </Text>
          </View>
        </View>

        {/* Upgrade card */}
        {user?.plan !== 'PRO' && (
          <GlassCard style={styles.upgradeCard} tint={COLORS.primary + '22'} borderColor={COLORS.primary + '55'} intensity={20}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.menuLabel, { fontWeight: '700' }]}>Upgrade to Pro</Text>
              <Text style={styles.menuSub}>Unlimited interviews, PDF reports & history</Text>
            </View>
            <TouchableOpacity onPress={handleUpgrade} disabled={upgrading} style={[{ borderRadius: RADIUS.md, overflow: 'hidden' }, VERTICAL_SWIPE_STYLE]}>
              <LinearGradient colors={['#6366F1', '#818CF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeBtn}>
                {upgrading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.upgradeBtnText}>₹299/mo</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Appearance */}
        <Text style={styles.sectionLabel}>Appearance</Text>
        <GlassCard style={styles.menuCard} intensity={18}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name={isDark ? 'weather-night' : 'weather-sunny'} size={18} color={COLORS.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{isDark ? 'Dark Mode' : 'Golden Glass Mode'}</Text>
              <Text style={styles.menuSub}>{isDark ? 'Switch to warm golden glass' : 'Switch to dark navy'}</Text>
            </View>
            <Switch
              value={!isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: COLORS.border, true: COLORS.accent + 'AA' }}
              thumbColor={isDark ? COLORS.textMuted : COLORS.accent}
            />
          </View>
        </GlassCard>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <GlassCard style={styles.menuCard} intensity={18}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name="bell-outline" size={18} color={COLORS.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Notifications</Text>
              <Text style={styles.menuSub}>
                {pushNotificationsSupported ? 'Report ready, unfinished interviews & daily reminders' : 'Available in the mobile app'}
              </Text>
            </View>
            {notifLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.accent + 'AA' }}
                thumbColor={notifEnabled ? COLORS.accent : COLORS.textMuted}
              />
            )}
          </View>
          <MenuItem icon="shield-check-outline" label="Privacy Policy" subtitle="How we handle your data"
            onPress={() => showAlert('Privacy', 'Crackd does not share your data with third parties.')} />
          <MenuItem icon="information-outline" label="About" subtitle="Crackd v1.0.0"
            onPress={() => showAlert('About', 'Crackd v1.0.0 — Built for Indian IT job seekers.\nTech: React Native • Spring Boot • Groq AI • Supabase')} />
        </GlassCard>

        {/* Session */}
        <Text style={styles.sectionLabel}>Session</Text>
        <GlassCard style={styles.menuCard} intensity={18}>
          <MenuItem icon="logout" label="Log Out" onPress={handleLogout} danger />
        </GlassCard>

        <Text style={styles.version}>Crackd v1.0.0 • Made for Indian IT 🇮🇳</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: SPACING.xl, paddingTop: SPACING.xxl, gap: SPACING.sm },
  avatar: {
    width: 88, height: 88, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 14,
  },
  avatarText: { color: '#fff', fontSize: FONT_SIZE.xxl, fontWeight: 'bold' },
  name:  { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: 'bold', letterSpacing: -0.3 },
  email: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  planBadge: {
    paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderRadius: RADIUS.full, marginTop: SPACING.xs,
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  planText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.textMuted },

  upgradeCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    gap: SPACING.md, borderRadius: RADIUS.lg,
  },
  upgradeBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, alignItems: 'center', minWidth: 80 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.sm },

  sectionLabel: {
    color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.xs, marginTop: SPACING.md,
  },
  menuCard: { marginHorizontal: SPACING.md, marginBottom: SPACING.xs, borderRadius: RADIUS.lg },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  menuSub:   { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  version:   { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textAlign: 'center', marginTop: SPACING.lg },
});
