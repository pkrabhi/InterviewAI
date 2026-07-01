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
    html { height: 100%; height: 100dvh; margin: 0; padding: 0; }
    body { height: 100%; height: 100dvh; margin: 0; padding: 0; overflow: hidden; overscroll-behavior: none; }
    #root { height: 100%; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
    /* Flex items default to min-height:auto (won't shrink below content), so a nested
       ScrollView never gets clipped to the viewport — it just grows to fit its content
       and the overflow is silently cut off by an ancestor's overflow:hidden with nothing
       scrollable in between. Force min-height:0 through the whole chain so ScrollViews
       actually bound to available space and become scrollable. */
    #root * { min-height: 0; }
    /* Smooth touch scroll on all scrollable divs */
    * { -webkit-overflow-scrolling: touch; -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    /* NOTE: previously had "div[style*='overflow'] { overscroll-behavior: contain }" here.
       That selector matched every GlassCard too (they set overflow:'hidden' inline for the
       rounded-corner clip), not just real scroll containers. Since most cards have nothing
       to scroll internally, the browser found 0 scrollable delta on the card and — because
       of overscroll-behavior:contain — refused to chain the gesture up to the real
       scrollable ancestor. That's why sliding with a finger starting on a card did nothing,
       while sliding in the gap between cards scrolled fine. Removed; the outer
       overscroll-behavior:none on body already prevents page-level bounce/pull-to-refresh. */
    /* Prevent iOS bounce on outer */
    body { touch-action: pan-y; }
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
    // flex:1 (not height:'100%') — a plain RN View defaults to flexShrink:0 and sizes to
    // its content inside a flex-column ancestor, so height:100% alone doesn't bound it.
    return (
      <View style={{ flex: 1, minHeight: 0, width: '100%', backgroundColor: bgColor }}>
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
