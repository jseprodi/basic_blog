interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PWANotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  async initialize(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPushNotifications(): Promise<NotificationSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
      });

      await this.sendSubscriptionToServer(subscription);
      
      // Convert PushSubscription to NotificationSubscription
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      if (!p256dhKey || !authKey) {
        throw new Error('Subscription keys not available');
      }
      
      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(p256dhKey as ArrayBuffer),
          auth: this.arrayBufferToBase64(authKey as ArrayBuffer),
        },
      };
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async getSubscription(): Promise<NotificationSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (!subscription) return null;
      
      // Convert PushSubscription to NotificationSubscription
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      if (!p256dhKey || !authKey) {
        throw new Error('Subscription keys not available');
      }
      
      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(p256dhKey as ArrayBuffer),
          auth: this.arrayBufferToBase64(authKey as ArrayBuffer),
        },
      };
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  async triggerBackgroundSync(): Promise<void> {
    if (!this.registration || typeof (this.registration as any).sync === 'undefined') {
      console.log('Background sync not supported');
      return;
    }

    try {
      await (this.registration as any).sync.register('background-sync');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }

  async sendTestNotification(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.showNotification('Test Notification', {
        body: 'This is a test notification from your blog',
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      if (!p256dhKey || !authKey) {
        throw new Error('Subscription keys not available');
      }
      const p256dh = this.arrayBufferToBase64(p256dhKey as ArrayBuffer);
      const auth = this.arrayBufferToBase64(authKey as ArrayBuffer);
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh,
            auth,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      throw error;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const pwaNotificationService = new PWANotificationService(); 