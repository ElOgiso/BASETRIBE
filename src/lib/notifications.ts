// Notification utilities for BaseTribe MiniApp
// Handles sending notifications via Neynar when sessions start

import { CONFIG, ENGAGEMENT_RULES } from './constants';

interface NotificationPayload {
  title: string;
  body: string;
  targetUrl: string;
}

interface SessionInfo {
  sessionTime: string;
  sessionNumber: number;
  rule: string;
}

/**
 * Send notification to all users with notifications enabled
 * Uses Neynar API to broadcast to all tokens
 */
export async function sendSessionStartNotification(sessionInfo: SessionInfo): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { sessionTime, sessionNumber, rule } = sessionInfo;
    
    // Prepare notification content
    const notification: NotificationPayload = {
      title: `🔔 Session #${sessionNumber} is LIVE!`,
      body: `${sessionTime} WAT - ${rule}. Join now to earn $BTRIBE!`,
      targetUrl: CONFIG.APP_URL,
    };

    // Log notification attempt
    console.log('📤 Sending session notification:', notification);

    // Call your backend to send notification via Neynar
    // Your backend should handle the Neynar API call
    // Note: This may fail due to CORS. That's OK - notifications are optional
    const response = await fetch(
      `${CONFIG.ENGAGEMENT_BOT_URL}?action=sendNotification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Prevent CORS errors
        body: JSON.stringify({
          notification,
          sessionInfo,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    // With no-cors mode, we can't read the response, but that's OK
    console.log('✅ Notification sent (no-cors mode)');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send test notification
 */
export async function sendTestNotification(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const notification: NotificationPayload = {
      title: '🎉 Test Notification',
      body: 'If you see this, notifications are working!',
      targetUrl: CONFIG.APP_URL,
    };

    console.log('📤 Sending test notification:', notification);

    const response = await fetch(
      `${CONFIG.ENGAGEMENT_BOT_URL}?action=sendNotification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Prevent CORS errors
        body: JSON.stringify({
          notification,
          test: true,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    // With no-cors mode, we can't read the response, but that's OK
    console.log('✅ Test notification sent (no-cors mode)');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send test notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<{
  totalUsers: number;
  notificationsEnabled: number;
  lastNotificationSent?: string;
} | null> {
  try {
    const response = await fetch(
      `${CONFIG.ENGAGEMENT_BOT_URL}?action=getNotificationStats`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Try with CORS first
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.stats || null;
  } catch (error) {
    // CORS errors are expected - notifications are optional feature
    console.log('ℹ️ Notification stats unavailable (this is OK)');
    return null;
  }
}

/**
 * Format session notification message based on engagement rule
 */
export function formatSessionNotification(
  sessionTime: string,
  sessionNumber: number
): { title: string; body: string } {
  const rule = ENGAGEMENT_RULES[sessionTime as keyof typeof ENGAGEMENT_RULES];
  
  if (!rule) {
    return {
      title: `🔔 Session #${sessionNumber} is LIVE!`,
      body: `Join now at ${sessionTime} WAT to earn $BTRIBE tokens!`,
    };
  }

  // Custom messages based on engagement type
  const ruleText = rule.text;
  const emoji = getSessionEmoji(rule.requirements);

  return {
    title: `${emoji} Session #${sessionNumber} LIVE - ${sessionTime} WAT`,
    body: `${ruleText}. Engage now to earn $BTRIBE!`,
  };
}

/**
 * Get emoji based on engagement requirements
 */
function getSessionEmoji(requirements: readonly string[]): string {
  if (requirements.length === 3) return '🔥'; // Full engagement
  if (requirements.includes('comment')) return '💬'; // Has comment
  if (requirements.includes('recast')) return '🔁'; // Has recast
  if (requirements.includes('like')) return '❤️'; // Like only
  return '🔔'; // Default
}

/**
 * Check if notifications are supported in current environment
 */
export function areNotificationsSupported(): boolean {
  // Check if running in Base/Farcaster app
  return typeof window !== 'undefined' && !!window.sdk?.actions?.addMiniApp;
}

/**
 * Get user's notification preference from localStorage
 */
export function getUserNotificationPreference(): {
  enabled: boolean;
  appAdded: boolean;
} {
  if (typeof window === 'undefined') {
    return { enabled: false, appAdded: false };
  }

  return {
    enabled: localStorage.getItem('basetribe_notifications_enabled') === 'true',
    appAdded: localStorage.getItem('basetribe_app_added') === 'true',
  };
}
