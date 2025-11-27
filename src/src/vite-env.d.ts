/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TREASURY_PRIVATE_KEY?: string
  readonly VITE_BTRIBE_TOKEN_ADDRESS?: string
  readonly VITE_SHEETS_WEBHOOK_URL?: string
  readonly VITE_SHEETS_WEBHOOK_SECRET?: string
  readonly VITE_NEYNAR_API_KEY?: string
  readonly VITE_SHEET_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
