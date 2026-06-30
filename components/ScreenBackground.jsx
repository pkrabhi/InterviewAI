import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScreenBackground({ children, style, variant = 'default' }) {
  return (
    <View style={[styles.root, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top-center indigo orb — always present */}
        <View style={styles.orbTopCenter}>
          <LinearGradient
            colors={['#6366F148', 'transparent']}
            style={styles.orbGrad}
          />
        </View>
        {/* Bottom-right amber orb */}
        <View style={styles.orbBottomRight}>
          <LinearGradient
            colors={['#F59E0B28', 'transparent']}
            style={styles.orbGrad}
          />
        </View>
        {/* Mid-left purple tint */}
        <View style={styles.orbMidLeft}>
          <LinearGradient
            colors={['#818CF818', 'transparent']}
            style={styles.orbGrad}
          />
        </View>
        {variant === 'auth' && (
          // Extra large orb for login/register screens
          <View style={styles.orbAuthCenter}>
            <LinearGradient
              colors={['#6366F130', 'transparent']}
              style={styles.orbGrad}
            />
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  orbGrad: {
    flex: 1,
    borderRadius: 9999,
  },
  orbTopCenter: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -140,
    left: '50%',
    marginLeft: -180,
    overflow: 'hidden',
  },
  orbBottomRight: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: -90,
    right: -90,
    overflow: 'hidden',
  },
  orbMidLeft: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: '38%',
    left: -110,
    overflow: 'hidden',
  },
  orbAuthCenter: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    top: -100,
    left: '50%',
    marginLeft: -250,
    overflow: 'hidden',
  },
});
