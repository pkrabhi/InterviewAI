import React from 'react';
import { TouchableOpacity, Platform, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import TabNavigator    from './TabNavigator';
import SetupScreen     from '../screens/interview/SetupScreen';
import SessionScreen   from '../screens/interview/SessionScreen';
import ReportScreen    from '../screens/interview/ReportScreen';
import { COLORS }      from '../constants/theme';

const Stack = createStackNavigator();

const BackButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 12 }}>
    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
  </TouchableOpacity>
);

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: COLORS.card },
        headerTintColor:  COLORS.text,
        headerTitleStyle: { fontWeight: '600' },
        cardStyle:        { backgroundColor: COLORS.bg, flex: 1, ...(Platform.OS === 'web' ? { height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' } : {}) },
        animationEnabled: Platform.OS !== 'web',
        // headerMode defaults to 'screen' on web, which flips react-navigation-stack's
        // internal pageOverflowEnabled to true — that swaps the card container's style
        // from { flex:1, overflow:'hidden' } to { minHeight:'100%' } (no flex at all),
        // so nested ScrollViews never get bounded and their overflow becomes unreachable.
        // Forcing 'float' here keeps the flex/overflow-hidden card mode always active.
        headerMode: 'float',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="InterviewSetup"
        component={SetupScreen}
        options={({ navigation }) => ({
          title: 'Setup Interview',
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        })}
      />
      <Stack.Screen
        name="InterviewSession"
        component={SessionScreen}
        options={{ title: 'Interview', headerShown: false }}
      />
      <Stack.Screen
        name="InterviewReport"
        component={ReportScreen}
        options={({ navigation }) => ({
          title: 'Your Report',
          headerLeft: () => <BackButton onPress={() => navigation.navigate('MainTabs')} />,
        })}
      />
    </Stack.Navigator>
  );
}
