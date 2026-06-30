import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen    from '../screens/tabs/HomeScreen';
import HistoryScreen from '../screens/tabs/HistoryScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';
import { COLORS }   from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor:  COLORS.border,
          borderTopWidth:  1,
          height:          60,
          paddingBottom:   8,
          ...(Platform.OS === 'web' ? { position: 'sticky', bottom: 0, zIndex: 100 } : {}),
        },
        sceneContainerStyle: Platform.OS === 'web' ? { flex: 1, height: '100%' } : {},
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home:    'home',
            History: 'history',
            Profile: 'account-circle',
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name]}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
