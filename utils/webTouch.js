import { Platform } from 'react-native';

// React Native Web's TouchableOpacity/Pressable default to touch-action:'manipulation'.
// On some mobile browsers a touch that starts directly on such an element inside a
// vertical ScrollView gets captured by the press responder instead of handing off to
// the scroll gesture. Forcing 'pan-y' lets the browser scroll the page when the user
// drags vertically over a card, while taps still register normally. Native platforms
// ignore this (touchAction isn't a native style prop), so it's web-only.
export const VERTICAL_SWIPE_STYLE = Platform.OS === 'web' ? { touchAction: 'pan-y' } : {};
