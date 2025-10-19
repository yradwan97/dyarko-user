'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export function useFcmToken() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
          return;
        }

        const permission = await Notification.requestPermission();
        setNotificationPermissionStatus(permission);

        if (permission !== 'granted') {
          return;
        }

        const messaging = getMessaging();
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (currentToken) {
          setFcmToken(currentToken);
        }

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.warn('Message received:', payload);
          // Handle the message here
        });
      } catch (error) {
        console.error('Error retrieving FCM token:', error);
      }
    };

    retrieveToken();
  }, []);

  return { fcmToken, notificationPermissionStatus };
}
