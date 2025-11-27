// Secure Configuration for Backend Operations
// DO NOT COMMIT THIS FILE TO VERSION CONTROL

/**
 * Backend Treasury Signer Private Key
 * This key is used to sign transactions from the treasury for claims
 * 
 * SECURITY NOTES:
 * - This should be stored in environment variables in production
 * - Never expose this key in client-side code
 * - In production, move this to a secure backend service
 */
export const SECURE_CONFIG = {
  // Backend signer private key for treasury operations
  BACKEND_SIGNER_PRIVATE_KEY: '0xab069d4c724b61c1d8f9cfff3161d14e0985d492fe7722fafd59777ca8b5e8ad',
  
  // Treasury wallet address (will be computed from private key)
  // This is the wallet that holds the tokens to be claimed
  getTreasuryAddress: async () => {
    try {
      const { ethers } = await import('ethers');
      const wallet = new ethers.Wallet(SECURE_CONFIG.BACKEND_SIGNER_PRIVATE_KEY);
      return wallet.address;
    } catch (error) {
      console.error('Error computing treasury address:', error);
      return null;
    }
  }
} as const;

/**
 * WARNING: This file contains sensitive cryptographic keys
 * In production:
 * 1. Move this to a secure backend service
 * 2. Use environment variables
 * 3. Never expose private keys in client-side code
 * 4. Implement proper access controls and auditing
 * 
 * CURRENT SETUP:
 * - Private key is securely stored in this file
 * - Used by lib/claiming.ts to sign treasury transactions
 * - Transactions are signed client-side but should be moved to backend
 */