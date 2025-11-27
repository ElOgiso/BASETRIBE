// Google Apps Script - Notification Handler for BaseTribe
// Add this to your existing ENGAGEMENT_BOT script

// ============================================
// CONFIGURATION
// ============================================

const NEYNAR_API_KEY = '4A2956F7-346A-4672-B9CB-0C5BA622BF1D';
const NEYNAR_NOTIFICATION_API = 'https://api.neynar.com/v2/farcaster/frame/notifications';

// ============================================
// MAIN HANDLERS
// ============================================

/**
 * Handle POST requests (for sending notifications)
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    Logger.log('POST Action: ' + action);
    
    switch(action) {
      case 'sendNotification':
        return sendNotificationToUsers(params);
      
      // Your existing POST handlers...
      case 'updateBalance':
        return updateUserBalance(params);
      
      default:
        return createJsonResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    Logger.log('POST Error: ' + error);
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Handle GET requests (for fetching stats)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    Logger.log('GET Action: ' + action);
    
    switch(action) {
      case 'getNotificationStats':
        return getNotificationStats();
      
      // Your existing GET handlers...
      case 'getLatestRaid':
        return getLatestRaid();
      
      default:
        return createJsonResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    Logger.log('GET Error: ' + error);
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send notification to all users via Neynar
 */
function sendNotificationToUsers(params) {
  const { notification, sessionInfo, test } = params;
  
  Logger.log('Sending notification: ' + JSON.stringify(notification));
  
  // Prepare payload for Neynar API
  const payload = {
    target_fids: [], // Empty array = all users with notifications enabled
    filters: {
      // Optional: Add filters if needed
      // exclude_fids: [123, 456],
      // following_fid: 1168109,
      // minimum_user_score: 0.5
    },
    notification: {
      title: notification.title || 'BaseTribe Update',
      body: notification.body || 'Check out what\'s new!',
      target_url: notification.targetUrl || 'https://your-domain.com'
    }
  };
  
  try {
    // Call Neynar API
    const options = {
      method: 'post',
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY,
        'content-type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(NEYNAR_NOTIFICATION_API, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('Neynar Response Code: ' + responseCode);
    Logger.log('Neynar Response: ' + responseText);
    
    if (responseCode === 200) {
      const result = JSON.parse(responseText);
      
      // Log notification in Google Sheets
      if (!test) {
        logNotification(sessionInfo, result);
      }
      
      return createJsonResponse({
        success: true,
        data: result,
        message: 'Notification sent successfully'
      });
    } else {
      throw new Error('Neynar API error: ' + responseText);
    }
    
  } catch (error) {
    Logger.log('Notification Error: ' + error);
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Log notification to Google Sheets for tracking
 */
function logNotification(sessionInfo, result) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('NotificationLog');
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('NotificationLog');
      sheet.appendRow([
        'Timestamp',
        'Session Time',
        'Session Number',
        'Rule',
        'Successful',
        'Invalid',
        'Rate Limited',
        'Total Sent'
      ]);
    }
    
    const successful = result.result?.successfulTokens?.length || 0;
    const invalid = result.result?.invalidTokens?.length || 0;
    const rateLimited = result.result?.rateLimitedTokens?.length || 0;
    const total = successful + invalid + rateLimited;
    
    sheet.appendRow([
      new Date(),
      sessionInfo?.sessionTime || 'N/A',
      sessionInfo?.sessionNumber || 0,
      sessionInfo?.rule || 'N/A',
      successful,
      invalid,
      rateLimited,
      total
    ]);
    
    Logger.log('Notification logged: ' + total + ' total recipients');
    
  } catch (error) {
    Logger.log('Log Error: ' + error);
  }
}

/**
 * Get notification statistics
 */
function getNotificationStats() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName('NotificationLog');
    const usersSheet = ss.getSheetByName('Users');
    
    let stats = {
      totalUsers: 0,
      notificationsEnabled: 0,
      totalNotificationsSent: 0,
      lastNotificationSent: null,
      successRate: 0
    };
    
    // Get total users
    if (usersSheet) {
      const lastRow = usersSheet.getLastRow();
      stats.totalUsers = lastRow > 1 ? lastRow - 1 : 0; // Exclude header
    }
    
    // Get notification stats from log
    if (logSheet && logSheet.getLastRow() > 1) {
      const data = logSheet.getDataRange().getValues();
      
      // Skip header row
      for (let i = 1; i < data.length; i++) {
        const successful = data[i][4] || 0;
        const total = data[i][7] || 0;
        
        stats.totalNotificationsSent += total;
        
        // Last notification
        if (i === data.length - 1) {
          stats.lastNotificationSent = data[i][0];
        }
      }
      
      // Calculate success rate
      if (stats.totalNotificationsSent > 0) {
        const totalSuccessful = data.slice(1).reduce((sum, row) => sum + (row[4] || 0), 0);
        stats.successRate = (totalSuccessful / stats.totalNotificationsSent * 100).toFixed(2);
      }
      
      // Estimate enabled (based on last notification)
      const lastRow = data[data.length - 1];
      stats.notificationsEnabled = lastRow[4] || 0; // Successful tokens
    }
    
    return createJsonResponse({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    Logger.log('Stats Error: ' + error);
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

// ============================================
// SCHEDULED NOTIFICATION TRIGGER
// ============================================

/**
 * Set up time-based triggers for session notifications
 * Run this function once to set up automatic notifications
 */
function setupSessionTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Session times (WAT timezone)
  const sessionTimes = [
    { hour: 8, minute: 0 },   // 08:00
    { hour: 12, minute: 0 },  // 12:00
    { hour: 16, minute: 0 },  // 16:00
    { hour: 20, minute: 0 },  // 20:00
    { hour: 0, minute: 0 },   // 00:00
    { hour: 4, minute: 0 }    // 04:00
  ];
  
  // Create trigger for each session time
  sessionTimes.forEach(time => {
    ScriptApp.newTrigger('checkAndSendSessionNotification')
      .timeBased()
      .atHour(time.hour)
      .nearMinute(time.minute)
      .everyDays(1)
      .inTimezone('Africa/Lagos')
      .create();
  });
  
  Logger.log('Session triggers created successfully!');
}

/**
 * Check current time and send notification if session is starting
 * This is called by time-based triggers
 */
function checkAndSendSessionNotification() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Only send if within 5 minutes of session start
  if (minute > 5) {
    Logger.log('Not session start time, skipping notification');
    return;
  }
  
  const sessions = {
    8: { time: '08:00', number: 1, rule: 'LIKE & RECAST' },
    12: { time: '12:00', number: 2, rule: 'LIKE ONLY' },
    16: { time: '16:00', number: 3, rule: 'FULL ENGAGEMENT' },
    20: { time: '20:00', number: 4, rule: 'RECAST & COMMENT' },
    0: { time: '00:00', number: 5, rule: 'LIKE & QUOTE' },
    4: { time: '04:00', number: 6, rule: 'FULL ENGAGEMENT' }
  };
  
  const session = sessions[hour];
  
  if (!session) {
    Logger.log('No session at hour ' + hour);
    return;
  }
  
  Logger.log('Session starting: ' + session.time);
  
  // Send notification
  const params = {
    notification: {
      title: `🔔 Session #${session.number} is LIVE!`,
      body: `${session.time} WAT - ${session.rule}. Join now to earn $BTRIBE!`,
      targetUrl: 'https://your-domain.com'
    },
    sessionInfo: session,
    test: false
  };
  
  sendNotificationToUsers(params);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create standardized JSON response
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test notification function - run manually
 */
function testNotification() {
  const params = {
    notification: {
      title: '🎉 Test Notification',
      body: 'If you see this, notifications are working!',
      targetUrl: 'https://your-domain.com'
    },
    test: true
  };
  
  const result = sendNotificationToUsers(params);
  Logger.log('Test Result: ' + result.getContent());
}

// ============================================
// SETUP INSTRUCTIONS
// ============================================

/*
 * TO SET UP NOTIFICATIONS:
 * 
 * 1. Replace 'https://your-domain.com' with your actual app URL
 * 
 * 2. Run setupSessionTriggers() once to create automatic triggers
 *    - Go to Apps Script editor
 *    - Click Run > Run function > setupSessionTriggers
 *    - Authorize the script if prompted
 * 
 * 3. Test manually by running testNotification()
 * 
 * 4. Check NotificationLog sheet for delivery stats
 * 
 * 5. View triggers at: Edit > Current project's triggers
 * 
 * IMPORTANT: 
 * - Triggers run in WAT timezone (Africa/Lagos)
 * - Notifications sent at session start times
 * - Check quota limits on Google Apps Script
 */
