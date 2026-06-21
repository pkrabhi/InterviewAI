import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

function TabIcon({ emoji, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: focused ? COLORS.primary + '33' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* emoji text used as icon — no extra icon library needed in Phase 1 */}
        <View />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              backgroundColor: focused ? COLORS.primary : COLORS.textMuted,
              opacity: focused ? 1 : 0.5,
            }} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 22,
              height: 14,
              borderRadius: 2,
              borderWidth: 2,
              borderColor: focused ? COLORS.primary : COLORS.textMuted,
              opacity: focused ? 1 : 0.5,
            }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: focused ? COLORS.primary : COLORS.textMuted,
              opacity: focused ? 1 : 0.5,
            }} />
          ),
        }}
      />
    </Tabs>
  );
}
