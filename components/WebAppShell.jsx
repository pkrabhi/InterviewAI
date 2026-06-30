import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';

const MOBILE_MAX_W = 480;

/**
 * On web desktop (width > 480): centers the app in a phone-width column
 * with the background color filling the sides.
 * On web mobile browser and on Android: renders children full-screen (no-op).
 */
export default function WebAppShell({ children, bgColor = '#080B14' }) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web' || width <= MOBILE_MAX_W) {
    return <>{children}</>;
  }

  // Desktop web — phone-frame container
  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      {/* Subtle grid/pattern background for desktop */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(245,158,11,0.10) 0%, transparent 60%)',
        backgroundColor: '#0A0C18',
      }} />
      {/* App frame */}
      <View style={{
        width: MOBILE_MAX_W,
        height: '100vh',
        maxHeight: 900,
        overflow: 'hidden',
        borderRadius: width > 800 ? 32 : 0,
        boxShadow: width > 800 ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)' : 'none',
        position: 'relative',
        backgroundColor: bgColor,
      }}>
        {children}
      </View>
    </View>
  );
}
