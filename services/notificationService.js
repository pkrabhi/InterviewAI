import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import api from './api';

// Real Expo push notifications require a device-obtained push token, which only exists on a
// native (EAS-built) app — not on web or in an emulator/simulator without a physical device.
export const pushNotificationsSupported = Platform.OS !== 'web' && Device.isDevice;

let Notifications = null;
function getNotificationsModule() {
  if (!pushNotificationsSupported) return null;
  if (!Notifications) Notifications = require('expo-notifications');
  return Notifications;
}

/**
 * Requests permission, obtains this device's Expo push token, and registers it with the
 * backend. Returns true if notifications are now active, false otherwise (denied, unsupported
 * platform, or no EAS project configured).
 */
export const enableNotifications = async () => {
  const Notif = getNotificationsModule();
  if (!Notif) return false;

  Notif.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notif.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notif.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notif.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notif.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;

  // Since Expo SDK 53, Expo Go no longer supports remote push tokens at all — this call
  // throws a cryptic native error there. Give a clear, actionable message instead.
  if (Constants.appOwnership === 'expo') {
    throw new Error('Notifications need a build of the Crackd app (EAS build or dev client) — they no longer work inside Expo Go.');
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notif.getExpoPushTokenAsync(projectId ? { projectId } : undefined);

  await api.post('/api/notifications/register-token', { token });
  await api.post('/api/notifications/preferences', { enabled: true });
  return true;
};

export const disableNotifications = async () => {
  try {
    await api.post('/api/notifications/preferences', { enabled: false });
  } catch (_) {}
};

/** Attach a listener for when the user taps a notification, returning an unsubscribe function. */
export const onNotificationTapped = (handler) => {
  const Notif = getNotificationsModule();
  if (!Notif) return () => {};
  const sub = Notif.addNotificationResponseReceivedListener((response) => {
    handler(response.notification.request.content.data || {});
  });
  return () => sub.remove();
};
