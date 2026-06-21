import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const MOCK_USER = {
  name:  'Abhijeet',
  email: 'abhijeet@example.com',
  plan:  'FREE',
};

function SettingsRow({ label, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
      <View>
        <Text style={styles.settingsLabel}>{label}</Text>
        {subtitle ? <Text style={styles.settingsSub}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  function handleLogout() {
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar + info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {MOCK_USER.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.name}>{MOCK_USER.name}</Text>
          <Text style={styles.email}>{MOCK_USER.email}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{MOCK_USER.plan} PLAN</Text>
          </View>
        </View>

        {/* Upgrade card */}
        <TouchableOpacity style={styles.upgradeCard}>
          <View>
            <Text style={styles.upgradeTitle}>Upgrade to Pro ✨</Text>
            <Text style={styles.upgradeSubtitle}>
              Unlimited interviews · PDF reports · Full history
            </Text>
          </View>
          <Text style={styles.upgradePrice}>₹299/mo</Text>
        </TouchableOpacity>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <SettingsRow label="Notifications" subtitle="Interview reminders" />
            <View style={styles.divider} />
            <SettingsRow label="About" subtitle="Version 1.0.0" />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  avatarSection: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  email: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  planBadge: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  upgradeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upgradeTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  upgradeSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: SPACING.xs,
  },
  upgradePrice: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  settingsSection: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  settingsLabel: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  settingsSub: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: COLORS.danger,
  },
});
