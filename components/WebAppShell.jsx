import React, { useEffect } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';

const MOBILE_MAX_W = 480;

/**
 * Web layout shell:
 * - Mobile browser (≤480px): full screen, no wrapper
 * - Desktop browser (>480px): phone-frame centered, dark backdrop
 * - Android: transparent pass-through
 *
 * Also injects root CSS so the height chain works for scroll:
 * html → body → #root → NavigationContainer all fill viewport height.
 */
function injectWebRootStyles() {
  if (typeof document === 'undefined') return;
  const id = 'crackd-root-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }
    #root { height: 100%; display: flex; flex-direction: column; }
    /* Smooth scrolling for all scrollable RN-web containers */
    div[style*="overflow-y: scroll"], div[style*="overflow-y: auto"] {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    /* Remove tap highlight on mobile web */
    * { -webkit-tap-highlight-color: transparent; }
    /* Prevent rubber-band scroll on outermost body */
    body { overscroll-behavior: none; }
  `;
  document.head.appendChild(style);
}

export default function WebAppShell({ children, bgColor = '#080B14' }) {
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (Platform.OS === 'web') injectWebRootStyles();
  }, []);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const isDesktop = width > MOBILE_MAX_W;

  if (!isDesktop) {
    // Mobile browser — full screen, no frame
    return (
      <View style={{ width: '100%', height: '100%', backgroundColor: bgColor }}>
        {children}
      </View>
    );
  }

  // Desktop browser — phone frame centered on dark backdrop
  return (
    <View style={{
      width: '100%', height: '100%',
      backgroundColor: '#08090F',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'radial-gradient(circle at 25% 35%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(circle at 75% 65%, rgba(245,158,11,0.12) 0%, transparent 55%)',
    }}>
      {/* Phone frame */}
      <View style={{
        width: MOBILE_MAX_W,
        height: Math.min(height, 900),
        overflow: 'hidden',
        borderRadius: 36,
        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.10)',
        backgroundColor: bgColor,
        position: 'relative',
      }}>
        {children}
      </View>
    </View>
  );
}
