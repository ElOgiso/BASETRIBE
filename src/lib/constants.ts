// BaseTribe Configuration
// All configuration values for the app

// ============================================
// GOOGLE SHEETS COLUMN MAPPING (Production)
// ============================================
// This maps to the exact column headers in your Google Sheets:
// Column A (0)  = Telegram Username
// Column B (1)  = Telegram ID
// Column C (2)  = Farcaster Username
// Column D (3)  = Farcaster_fid
// Column E (4)  = session_streak
// Column F (5)  = last_engaged_date
// Column G (6)  = Fail Count
// Column H (7)  = Ban Status
// Column I (8)  = Stars
// Column J (9)  = Defaults
// Column K (10) = BTribe_Balance        ← Updated when claiming $BTRIBE
// Column L (11) = Base_Username
// Column M (12) = Email
// Column N (13) = Status
// Column O (14) = Probation Count
// Column P (15) = invite_link
// Column Q (16) = invites_count
// Column R (17) = usdc_claims           ← Updated when claiming USDC
// Column S (18) = premium
// Column T (19) = shoutoutsLeft
// Column U (20) = followers
// Column V (21) = JESSEBalance          ← Updated when claiming $JESSE
// Column W (22) = membershipNFT
// Column X (23) = completed_tasks
// ============================================

// Google Sheets Configuration
export const CONFIG = {
  SHEET_ID: import.meta.env.VITE_SHEET_ID,
  NEYNAR_API_KEY: import.meta.env.VITE_NEYNAR_API_KEY,
  FARCASTER_API_KEY: import.meta.env.VITE_NEYNAR_API_KEY, // Uses same key
  
  // 🎯 NEYNAR MINIAPP CREDENTIALS
  NEYNAR_CLIENT_ID: import.meta.env.VITE_NEYNAR_CLIENT_ID,
  NEYNAR_FID: import.meta.env.VITE_NEYNAR_FID,
  NEYNAR_SIGNER_UUID: import.meta.env.VITE_NEYNAR_SIGNER_UUID,
  
  // Telegram Configuration
  TELEGRAM_BOT_TOKEN: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
  TELEGRAM_RAID_MASTER_BOT_TOKEN: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: import.meta.env.VITE_TELEGRAM_CHAT_ID,
  
  // Google Apps Script URLs
  RAID_MASTER_URL: import.meta.env.VITE_RAID_MASTER_URL,
  ENGAGEMENT_BOT_URL: import.meta.env.VITE_ENGAGEMENT_BOT_URL,
  
  // Blockchain Configuration (Base Mainnet)
  BTRIBE_TOKEN_ADDRESS: '0xa58d90ec74c4978a161ffaba582f159b32b2d6d6',
  JESSE_TOKEN_ADDRESS: '0x50f88fe97f72cd3e75b9eb4f747f59bceba80d59',
  MANIFOLD_CONTRACT: '0x6d70517b4bb4921b6fe0b131d62415332db1b831',
  RPC_PROVIDER_URL: import.meta.env.VITE_RPC_PROVIDER_URL,
  
  // Manifold OAuth Credentials
  MANIFOLD_CLIENT_ID: import.meta.env.VITE_MANIFOLD_CLIENT_ID,
  MANIFOLD_CLIENT_SECRET: import.meta.env.VITE_MANIFOLD_CLIENT_SECRET,
  
  // Raid Master Configuration
  RAID_MASTER_DAILY_REWARD_TOPIC_ID: 1519,
  
  // Chain ID
  CHAIN_ID: 8453, // Base Mainnet
  
  // App URL (for notifications)
  APP_URL: typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com',
} as const;

// Session Times (WAT timezone - Africa/Lagos)
// These match the engagement bot's session schedule
export const SESSIONS = [
  "08:00", // 8 AM
  "12:00", // 12 PM
  "16:00", // 4 PM
  "20:00", // 8 PM
  "00:00", // 12 AM
  "04:00", // 4 AM
] as const;

// Engagement Rules per Session
// These match the bot's engagement requirements
export const ENGAGEMENT_RULES = {
  "08:00": { requirements: ["like", "recast"], text: "LIKE & RECAST" },
  "12:00": { requirements: ["like"], text: "LIKE ONLY" },
  "16:00": { requirements: ["like", "recast", "comment"], text: "FULL ENGAGEMENT (Like, Recast & Comment)" },
  "20:00": { requirements: ["recast", "comment"], text: "RECAST & COMMENT ONLY" },
  "00:00": { requirements: ["like", "recast"], text: "LIKE & QUOTE THE POST" },
  "04:00": { requirements: ["like", "recast", "comment"], text: "FULL ENGAGEMENT (Like, Recast & Comment)" },
} as const;

// NFT Token Configuration
export const NFT_TOKENS = {
  BELIEVER: {
    id: 1,
    name: 'Base Tribe Believer',
    description: 'Shows you believe in Base and its tribe',
    contract: CONFIG.MANIFOLD_CONTRACT,
  },
  FOUNDER: {
    id: 2,
    name: 'Base Tribe Founding Member',
    description: 'Proves you are a founding member of Base Tribe',
    contract: CONFIG.MANIFOLD_CONTRACT,
  },
} as const;

// Community Links
export const LINKS = {
  TELEGRAM: 'https://t.me/basetribe',
  FARCASTER: 'https://warpcast.com/~/channel/basetribe',
  ZORA: 'https://zora.co/@basetribe',
  SWAP: 'https://zora.co/@basetribe',
} as const;