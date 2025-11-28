// Token claiming with private key signer and Google Sheets integration
// ⚠️ WARNING: This implementation requires a BACKEND SERVICE for production
// Private keys should NEVER be exposed in client-side code

import { ethers } from 'ethers';
import { CONFIG } from './constants';
import { SECURE_CONFIG } from './secure-config';

// ERC20 ABI for transfer function
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// USDC ABI (6 decimals)
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
];

// Safe environment variable access with multiple fallback layers
const getEnvVar = (key: string): string => {
  try {
    // Check if import.meta exists
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || '';
    }
    // Check if process.env exists (for some build tools)
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key] || '';
    }
    return '';
  } catch (error) {
    console.warn(`Could not access environment variable ${key}:`, error);
    return '';
  }
};

// Treasury wallet private key - Use secure config as primary source
const TREASURY_PRIVATE_KEY = SECURE_CONFIG.BACKEND_SIGNER_PRIVATE_KEY || getEnvVar('VITE_TREASURY_PRIVATE_KEY');

// Token Contract Addresses on Base
const BTRIBE_TOKEN_ADDRESS = getEnvVar('VITE_BTRIBE_TOKEN_ADDRESS') || CONFIG.BTRIBE_TOKEN_ADDRESS;
const JESSE_TOKEN_ADDRESS = getEnvVar('VITE_JESSE_TOKEN_ADDRESS') || CONFIG.JESSE_TOKEN_ADDRESS;
const USDC_TOKEN_ADDRESS = getEnvVar('VITE_USDC_TOKEN_ADDRESS') || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base

// Google Sheets webhook URL for balance updates
const SHEETS_WEBHOOK_URL = getEnvVar('VITE_SHEETS_WEBHOOK_URL');

// Webhook secret key (optional, for security)
const WEBHOOK_SECRET = getEnvVar('VITE_SHEETS_WEBHOOK_SECRET');

// Base RPC URL - Verify this is correct for Base mainnet
// Using multiple public RPC endpoints with fallback
const BASE_RPC_URLS = [
  'https://mainnet.base.org', // Public Base RPC (Primary)
  'https://base.gateway.tenderly.co', // Tenderly (Fallback 1)
  'https://base-mainnet.public.blastapi.io', // Blast API (Fallback 2)
  'https://1rpc.io/base', // 1RPC (Fallback 3)
];

const BASE_RPC_URL = BASE_RPC_URLS[0]; // Use primary endpoint

interface ClaimResult {
  success: boolean;
  txHash?: string;
  error?: string;
  newBalance?: number;
}

/**
 * Verify RPC endpoint is working
 */
async function verifyRPCEndpoint(): Promise<boolean> {
  try {
    console.log('🔍 Verifying RPC endpoint:', BASE_RPC_URL);
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ RPC endpoint is live. Current block:', blockNumber);
    return true;
  } catch (error) {
    console.error('❌ RPC endpoint verification failed:', error);
    return false;
  }
}

/**
 * Claim $BTRIBE tokens - sends from treasury wallet to user's wallet
 * ⚠️ SECURITY WARNING: This should be implemented as a backend API endpoint
 * Private keys must NEVER be in client-side code in production
 */
export async function claimTokens(
  userAddress: string,
  claimAmount: number,
  farcasterFid: string
): Promise<ClaimResult> {
  console.log('\n=== CLAIM TOKENS DEBUG LOG ===');
  console.log('📍 User Connected Address:', userAddress);
  console.log('📍 Farcaster FID:', farcasterFid || 'Not provided');
  console.log('📍 Claim Amount:', claimAmount);
  console.log('📍 RPC Endpoint:', BASE_RPC_URL);
  console.log('📍 $BTRIBE Token Address:', BTRIBE_TOKEN_ADDRESS);
  
  try {
    // Step 1: Validate inputs
    console.log('\n🔍 Step 1: Validating inputs...');
    
    if (!userAddress || !ethers.isAddress(userAddress)) {
      console.error('❌ Invalid wallet address:', userAddress);
      return { success: false, error: 'Invalid wallet address format' };
    }
    console.log('✅ User address is valid');

    if (claimAmount <= 0) {
      console.error('❌ Invalid claim amount:', claimAmount);
      return { success: false, error: 'No balance available to claim' };
    }
    console.log('✅ Claim amount is valid:', claimAmount);

    if (!TREASURY_PRIVATE_KEY || TREASURY_PRIVATE_KEY.length < 64) {
      console.error('❌ Treasury private key not configured or invalid');
      console.error('⚠️ CRITICAL: Private keys should be on a BACKEND SERVER, not client-side!');
      return { success: false, error: 'Claim system not configured. Contact support.' };
    }
    console.log('✅ Treasury private key is configured');

    // Step 2: Verify RPC endpoint
    console.log('\n🔍 Step 2: Verifying RPC endpoint...');
    const rpcLive = await verifyRPCEndpoint();
    if (!rpcLive) {
      return { success: false, error: 'RPC endpoint is not responding. Try again later.' };
    }

    // Step 3: Setup provider and wallet
    console.log('\n🔍 Step 3: Setting up provider and treasury wallet...');
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    
    let treasuryWallet;
    try {
      treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
      console.log('✅ Treasury wallet address:', treasuryWallet.address);
    } catch (error) {
      console.error('❌ Failed to create wallet from private key:', error);
      return { success: false, error: 'Invalid treasury wallet configuration' };
    }

    // Step 4: Connect to token contract
    console.log('\n🔍 Step 4: Connecting to $BTRIBE token contract...');
    const tokenContract = new ethers.Contract(
      BTRIBE_TOKEN_ADDRESS,
      ERC20_ABI,
      treasuryWallet
    );

    // Step 5: Get token decimals
    console.log('\n🔍 Step 5: Getting token decimals...');
    let decimals;
    try {
      decimals = await tokenContract.decimals();
      console.log('✅ Token decimals:', decimals);
    } catch (error) {
      console.error('❌ Failed to get decimals. Token contract may be invalid:', error);
      return { success: false, error: 'Invalid token contract address' };
    }

    // Step 6: Calculate amount with decimals
    console.log('\n🔍 Step 6: Calculating amount with decimals...');
    const amountInWei = ethers.parseUnits(claimAmount.toString(), decimals);
    console.log('✅ Amount in wei:', amountInWei.toString());
    console.log('   Human readable:', claimAmount, '$BTRIBE');
    console.log('   With decimals:', ethers.formatUnits(amountInWei, decimals));

    // Step 7: Check treasury token balance
    console.log('\n🔍 Step 7: Checking treasury token balance...');
    let treasuryBalance;
    try {
      treasuryBalance = await tokenContract.balanceOf(treasuryWallet.address);
      const treasuryBalanceFormatted = ethers.formatUnits(treasuryBalance, decimals);
      console.log('✅ Treasury $BTRIBE balance:', treasuryBalanceFormatted);
      console.log('   Raw balance:', treasuryBalance.toString());
      
      if (treasuryBalance < amountInWei) {
        console.error('❌ Insufficient treasury balance!');
        console.error('   Required:', ethers.formatUnits(amountInWei, decimals), '$BTRIBE');
        console.error('   Available:', treasuryBalanceFormatted, '$BTRIBE');
        return { 
          success: false, 
          error: `Treasury has insufficient funds. Available: ${treasuryBalanceFormatted} $BTRIBE` 
        };
      }
      console.log('✅ Treasury has sufficient balance');
    } catch (error) {
      console.error('❌ Failed to check treasury balance:', error);
      return { success: false, error: 'Failed to verify treasury balance' };
    }

    // Step 8: Check treasury ETH balance for gas
    console.log('\n🔍 Step 8: Checking treasury ETH balance for gas...');
    try {
      const ethBalance = await provider.getBalance(treasuryWallet.address);
      const ethBalanceFormatted = ethers.formatEther(ethBalance);
      console.log('✅ Treasury ETH balance:', ethBalanceFormatted, 'ETH');
      
      if (ethBalance < ethers.parseEther('0.0001')) {
        console.error('❌ Treasury has insufficient ETH for gas!');
        return { 
          success: false, 
          error: 'Treasury has insufficient ETH for gas fees' 
        };
      }
      console.log('✅ Treasury has sufficient ETH for gas');
    } catch (error) {
      console.error('❌ Failed to check ETH balance:', error);
      return { success: false, error: 'Failed to verify ETH balance' };
    }

    // Step 9: Get current nonce
    console.log('\n🔍 Step 9: Getting transaction nonce...');
    let nonce;
    try {
      nonce = await treasuryWallet.getNonce();
      console.log('✅ Current nonce:', nonce);
    } catch (error) {
      console.error('❌ Failed to get nonce:', error);
      return { success: false, error: 'Failed to get transaction nonce' };
    }

    // Step 10: Estimate gas
    console.log('\n🔍 Step 10: Estimating gas...');
    let gasEstimate;
    try {
      gasEstimate = await tokenContract.transfer.estimateGas(userAddress, amountInWei);
      console.log('✅ Gas estimate:', gasEstimate.toString());
    } catch (error: any) {
      console.error('❌ Gas estimation failed:', error);
      
      // Parse revert reason
      if (error.message.includes('insufficient funds')) {
        return { success: false, error: 'Treasury has insufficient token balance' };
      } else if (error.message.includes('invalid address')) {
        return { success: false, error: 'Invalid recipient address' };
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        return { success: false, error: 'Transaction would fail. Check token contract and balances.' };
      }
      
      return { success: false, error: `Gas estimation failed: ${error.message.substring(0, 100)}` };
    }

    // Step 11: Get gas price
    console.log('\n🔍 Step 11: Getting gas price...');
    let feeData;
    try {
      feeData = await provider.getFeeData();
      console.log('✅ Gas price (maxFeePerGas):', feeData.maxFeePerGas?.toString());
      console.log('   Priority fee (maxPriorityFeePerGas):', feeData.maxPriorityFeePerGas?.toString());
    } catch (error) {
      console.error('⚠️ Failed to get fee data, will use default:', error);
    }

    // Step 12: Send transaction
    console.log('\n🔍 Step 12: Sending transaction...');
    console.log('   From (Treasury):', treasuryWallet.address);
    console.log('   To (User):', userAddress);
    console.log('   Amount:', ethers.formatUnits(amountInWei, decimals), '$BTRIBE');
    console.log('   Nonce:', nonce);
    
    let tx;
    try {
      tx = await tokenContract.transfer(userAddress, amountInWei, {
        nonce: nonce,
        gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
      });
      console.log('✅ Transaction sent!');
      console.log('   TX Hash:', tx.hash);
      console.log('   View on BaseScan: https://basescan.org/tx/' + tx.hash);
    } catch (error: any) {
      console.error('❌ Transaction failed to send:', error);
      
      // Parse error types
      let errorMessage = 'Transaction failed';
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Treasury has insufficient ETH for gas';
      } else if (error.code === 'NONCE_EXPIRED') {
        errorMessage = 'Transaction nonce error. Please try again.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas or tokens';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message.substring(0, 150);
      }
      
      console.error('   Error code:', error.code);
      console.error('   Error message:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Step 13: Wait for confirmation
    console.log('\n🔍 Step 13: Waiting for confirmation...');
    let receipt;
    try {
      receipt = await tx.wait(1); // Wait for 1 confirmation
      console.log('✅ Transaction confirmed!');
      console.log('   Block number:', receipt.blockNumber);
      console.log('   Gas used:', receipt.gasUsed.toString());
      console.log('   Status:', receipt.status === 1 ? 'Success ✅' : 'Failed ❌');
      
      if (receipt.status !== 1) {
        console.error('❌ Transaction was mined but failed!');
        return {
          success: false,
          error: 'Transaction was mined but reverted. Check BaseScan for details.',
        };
      }
      
      // Check for Transfer event
      const transferEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = tokenContract.interface.parseLog(log);
          return parsed?.name === 'Transfer';
        } catch {
          return false;
        }
      });
      
      if (transferEvent) {
        console.log('✅ Transfer event found in logs');
      } else {
        console.warn('⚠️ No Transfer event found - transaction may have failed');
      }
      
    } catch (error) {
      console.error('❌ Error waiting for confirmation:', error);
      return {
        success: false,
        error: 'Transaction sent but confirmation failed. Check BaseScan with TX hash.',
        txHash: tx.hash,
      };
    }

    // Step 14: Update Google Sheets (optional)
    console.log('\n🔍 Step 14: Updating Google Sheets...');
    if (farcasterFid) {
      const currentBalance = await getUserBalanceFromSheets(farcasterFid);
      if (currentBalance !== null && currentBalance >= claimAmount) {
        const newBalance = currentBalance - claimAmount;
        const updated = await updateUserBalanceInSheets(farcasterFid, newBalance, claimAmount, tx.hash);
        if (updated) {
          console.log('✅ Google Sheets updated successfully');
        } else {
          console.warn('⚠️ Failed to update Google Sheets (transaction still succeeded)');
        }
      } else {
        console.log('ℹ️ User not in sheets or insufficient balance - skipping sheets update');
      }
    } else {
      console.log('ℹ️ No FID provided - skipping sheets update');
    }

    console.log('\n✅ === CLAIM SUCCESSFUL ===');
    console.log('TX Hash:', tx.hash);
    console.log('Amount:', claimAmount, '$BTRIBE');
    console.log('Recipient:', userAddress);
    console.log('================================\n');

    return {
      success: true,
      txHash: tx.hash,
      newBalance: 0,
    };
  } catch (error: any) {
    console.error('\n❌ === CLAIM FAILED ===');
    console.error('Unexpected error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('======================\n');
    
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * Get user's $BTRIBE balance from Google Sheets
 */
async function getUserBalanceFromSheets(farcasterFid: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/Users!A:W`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length < 2) return null;

    // Find user by FID (Column D = index 3)
    const userRow = rows.find((row: string[]) => row[3] === farcasterFid);
    
    if (!userRow) return null;

    // Column K (index 10) = BTribe_Balance
    const balance = parseInt(userRow[10] || '0');
    return isNaN(balance) ? 0 : balance;
  } catch (error) {
    console.error('Error fetching balance from sheets:', error);
    return null;
  }
}

/**
 * Update user's balance in Google Sheets after claim
 * Uses Google Apps Script webhook
 */
async function updateUserBalanceInSheets(
  farcasterFid: string,
  newBalance: number,
  claimedAmount: number = 0,
  txHash: string = ''
): Promise<boolean> {
  try {
    if (!SHEETS_WEBHOOK_URL) {
      console.warn('⚠️ Sheets webhook URL not configured');
      return false;
    }

    // Prepare request payload
    const payload: any = {
      farcasterFid,
      newBalance,
      claimedAmount,
      txHash,
    };

    // Add secret key if configured
    if (WEBHOOK_SECRET) {
      payload.key = WEBHOOK_SECRET;
    }

    // Call webhook
    const response = await fetch(SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook request failed:', response.status);
      return false;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Google Sheets updated successfully');
      return true;
    } else {
      console.error('Webhook returned error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error calling webhook:', error);
    return false;
  }
}

/**
 * Get user's FID from their connected wallet address
 * Uses Neynar API to lookup FID by wallet address
 * Includes retry logic with exponential backoff
 */
export async function fetchFidFromWallet(walletAddress: string, maxRetries: number = 3): Promise<string | null> {
  if (!walletAddress) {
    console.log('ℹ️ No wallet address provided for FID lookup');
    return null;
  }

  // Normalize wallet address to lowercase
  const normalizedAddress = walletAddress.toLowerCase();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      console.log(`🔍 Fetching FID for wallet (attempt ${attempt}/${maxRetries})...`);
      
      // Use our serverless API route instead of direct Neynar call
      const response = await fetch(
        `${CONFIG.API.NEYNAR}?action=getFidFromWallet&wallet=${normalizedAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // No FID found for this wallet - this is normal, not an error
          console.log('ℹ️ No Farcaster account linked to this wallet');
          return null;
        }
        
        if (attempt < maxRetries) {
          console.log(`⚠️ API request failed (${response.status}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        }
        
        console.log('⚠️ Could not fetch FID from API');
        return null;
      }

      const data = await response.json();
      
      if (data.fid) {
        console.log('✅ FID found:', data.fid);
        return data.fid;
      }

      console.log('ℹ️ No Farcaster account linked to this wallet');
      return null;
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (attempt < maxRetries) {
            console.log(`⚠️ Request timeout (attempt ${attempt}/${maxRetries}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Longer backoff for timeouts
            continue;
          }
          console.log('⚠️ FID lookup timed out - continuing without FID');
        } else {
          if (attempt < maxRetries) {
            console.log(`⚠️ Network error (attempt ${attempt}/${maxRetries}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          console.log('⚠️ Could not connect to Farcaster network');
        }
      }
      
      if (attempt === maxRetries) {
        return null;
      }
    }
  }
  
  return null;
}

/**
 * Check if user has claimable balance
 */
export async function getClaimableBalance(farcasterFid: string): Promise<number> {
  const balance = await getUserBalanceFromSheets(farcasterFid);
  return balance || 0;
}

/**
 * Get treasury wallet address for verification
 * This helps ensure the treasury is properly configured
 */
export async function getTreasuryInfo(): Promise<{
  address: string;
  balance: string;
  configured: boolean;
}> {
  try {
    if (!TREASURY_PRIVATE_KEY) {
      console.error('❌ Treasury private key not configured');
      return {
        address: 'Not configured',
        balance: '0',
        configured: false,
      };
    }

    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
    
    // Get ETH balance
    const ethBalance = await provider.getBalance(treasuryWallet.address);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    
    // Get BTRIBE token balance
    const tokenContract = new ethers.Contract(
      BTRIBE_TOKEN_ADDRESS,
      ERC20_ABI,
      provider
    );
    const tokenBalance = await tokenContract.balanceOf(treasuryWallet.address);
    const decimals = await tokenContract.decimals();
    const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, decimals);

    console.log('✅ Treasury Wallet Info:');
    console.log(`   Address: ${treasuryWallet.address}`);
    console.log(`   ETH Balance: ${ethBalanceFormatted} ETH`);
    console.log(`   $BTRIBE Balance: ${tokenBalanceFormatted} BTRIBE`);

    return {
      address: treasuryWallet.address,
      balance: `${ethBalanceFormatted} ETH | ${tokenBalanceFormatted} BTRIBE`,
      configured: true,
    };
  } catch (error) {
    console.error('❌ Error fetching treasury info:', error);
    return {
      address: 'Error',
      balance: '0',
      configured: false,
    };
  }
}

/**
 * 🔧 DIAGNOSTIC TOOL - Test treasury wallet configuration
 * Call this from browser console: window.testTreasury()
 */
export async function diagnoseTreasuryWallet(): Promise<void> {
  console.log('\n🔧 === TREASURY DIAGNOSTIC TEST ===\n');
  
  try {
    // 1. Check private key
    console.log('Step 1: Checking private key...');
    if (!TREASURY_PRIVATE_KEY) {
      console.error('❌ CRITICAL: Treasury private key is NOT configured!');
      console.error('   Fix: Add private key to /lib/secure-config.ts');
      return;
    }
    console.log('✅ Private key is configured');
    console.log(`   Length: ${TREASURY_PRIVATE_KEY.length} characters`);

    // 2. Check RPC endpoint
    console.log('\nStep 2: Testing RPC endpoint...');
    console.log(`   Endpoint: ${BASE_RPC_URL}`);
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ RPC is live! Current block: ${blockNumber}`);

    // 3. Derive treasury wallet
    console.log('\nStep 3: Deriving treasury wallet from private key...');
    const treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
    console.log('✅ Treasury wallet created');
    console.log(`   Address: ${treasuryWallet.address}`);

    // 4. Check ETH balance
    console.log('\nStep 4: Checking treasury ETH balance...');
    const ethBalance = await provider.getBalance(treasuryWallet.address);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    console.log(`   ETH Balance: ${ethBalanceFormatted} ETH`);
    if (ethBalance < ethers.parseEther('0.0001')) {
      console.error('❌ WARNING: Treasury has insufficient ETH for gas!');
      console.error(`   Current: ${ethBalanceFormatted} ETH`);
      console.error('   Minimum needed: 0.0001 ETH');
      console.error('   Action: Send ETH to treasury wallet for gas fees');
    } else {
      console.log('✅ Treasury has sufficient ETH for gas');
    }

    // 5. Check $BTRIBE token balance
    console.log('\nStep 5: Checking $BTRIBE token balance...');
    console.log(`   Token Address: ${BTRIBE_TOKEN_ADDRESS}`);
    const btribeContract = new ethers.Contract(
      BTRIBE_TOKEN_ADDRESS,
      ERC20_ABI,
      provider
    );
    
    try {
      const btribeDecimals = await btribeContract.decimals();
      const btribeBalance = await btribeContract.balanceOf(treasuryWallet.address);
      const btribeBalanceFormatted = ethers.formatUnits(btribeBalance, btribeDecimals);
      console.log(`   $BTRIBE Balance: ${btribeBalanceFormatted} BTRIBE`);
      
      if (btribeBalance === 0n) {
        console.error('❌ WARNING: Treasury has ZERO $BTRIBE tokens!');
        console.error('   Action: Send $BTRIBE tokens to treasury wallet');
      } else {
        console.log('✅ Treasury has $BTRIBE tokens');
      }
    } catch (error) {
      console.error('❌ Failed to read $BTRIBE contract. Token address may be wrong!');
      console.error('   Error:', error);
    }

    // 6. Check $JESSE token balance
    console.log('\nStep 6: Checking $JESSE token balance...');
    console.log(`   Token Address: ${JESSE_TOKEN_ADDRESS}`);
    const jesseContract = new ethers.Contract(
      JESSE_TOKEN_ADDRESS,
      ERC20_ABI,
      provider
    );
    
    try {
      const jesseDecimals = await jesseContract.decimals();
      const jesseBalance = await jesseContract.balanceOf(treasuryWallet.address);
      const jesseBalanceFormatted = ethers.formatUnits(jesseBalance, jesseDecimals);
      console.log(`   $JESSE Balance: ${jesseBalanceFormatted} JESSE`);
      
      if (jesseBalance === 0n) {
        console.warn('⚠️ Treasury has ZERO $JESSE tokens');
      } else {
        console.log('✅ Treasury has $JESSE tokens');
      }
    } catch (error) {
      console.error('❌ Failed to read $JESSE contract. Token address may be wrong!');
      console.error('   Error:', error);
    }

    // 7. Check USDC balance
    console.log('\nStep 7: Checking USDC balance...');
    console.log(`   Token Address: ${USDC_TOKEN_ADDRESS}`);
    const usdcContract = new ethers.Contract(
      USDC_TOKEN_ADDRESS,
      USDC_ABI,
      provider
    );
    
    try {
      const usdcBalance = await usdcContract.balanceOf(treasuryWallet.address);
      const usdcBalanceFormatted = ethers.formatUnits(usdcBalance, 6); // USDC has 6 decimals
      console.log(`   USDC Balance: ${usdcBalanceFormatted} USDC`);
      
      if (usdcBalance === 0n) {
        console.warn('⚠️ Treasury has ZERO USDC');
      } else {
        console.log('✅ Treasury has USDC');
      }
    } catch (error) {
      console.error('❌ Failed to read USDC contract');
      console.error('   Error:', error);
    }

    console.log('\n🎯 === DIAGNOSTIC COMPLETE ===');
    console.log('\n📋 SUMMARY:');
    console.log(`   Treasury Address: ${treasuryWallet.address}`);
    console.log(`   ETH Balance: ${ethBalanceFormatted} ETH`);
    console.log(`   Network: Base Mainnet (Chain ID: 8453)`);
    console.log(`   RPC: ${BASE_RPC_URL}`);
    console.log('\n✅ If all checks passed, the claiming system should work!');
    console.log('❌ If any check failed, fix the issue before testing claims.');
    
  } catch (error: any) {
    console.error('\n❌ DIAGNOSTIC FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Expose to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testTreasury = diagnoseTreasuryWallet;
  (window as any).getTreasuryInfo = getTreasuryInfo;
}

/**
 * Claim $JESSE tokens (Raid Bounty) - sends from treasury wallet to user's wallet
 */
export async function claimJesseTokens(
  userAddress: string,
  claimAmount: number,
  userData: any
): Promise<ClaimResult> {
  try {
    // Validate inputs
    if (!userAddress || !ethers.isAddress(userAddress)) {
      return { success: false, error: 'Invalid wallet address' };
    }

    if (claimAmount <= 0) {
      return { success: false, error: 'Invalid claim amount' };
    }

    if (!TREASURY_PRIVATE_KEY) {
      console.error('❌ Treasury private key not configured');
      return { success: false, error: 'Treasury wallet not configured' };
    }

    if (!userData || !userData.farcaster_fid) {
      return { success: false, error: 'User data not found' };
    }

    console.log(`💰 Claiming ${claimAmount} $JESSE for ${userAddress}...`);

    // Check user has balance
    if (userData.jesse_balance < claimAmount) {
      return { success: false, error: `Insufficient balance. You have ${userData.jesse_balance} $JESSE available.` };
    }

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

    console.log(`📝 Treasury wallet: ${treasuryWallet.address}`);

    // Connect to $JESSE token contract
    const tokenContract = new ethers.Contract(
      JESSE_TOKEN_ADDRESS,
      ERC20_ABI,
      treasuryWallet
    );

    // Get token decimals
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.parseUnits(claimAmount.toString(), decimals);

    console.log(`📤 Sending ${claimAmount} $JESSE (${amountInWei.toString()} wei)...`);

    // Check treasury balance
    const treasuryBalance = await tokenContract.balanceOf(treasuryWallet.address);
    if (treasuryBalance < amountInWei) {
      return { 
        success: false, 
        error: 'Treasury has insufficient $JESSE funds. Please contact support.' 
      };
    }

    // Send transaction
    const tx = await tokenContract.transfer(userAddress, amountInWei);
    console.log(`⏳ Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Update Google Sheets would go here if you have a webhook for jesse_balance
    // For now, we'll just return success

    return {
      success: true,
      txHash: tx.hash,
      newBalance: userData.jesse_balance - claimAmount,
    };
  } catch (error: any) {
    console.error('❌ JESSE Claim failed:', error);
    
    let errorMessage = 'Failed to claim $JESSE tokens';
    if (error.message) {
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Treasury wallet has insufficient ETH for gas';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected';
      } else {
        errorMessage = error.message.substring(0, 100);
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Claim USDC (USDC Drops) - sends from treasury wallet to user's wallet
 */
export async function claimUSDC(
  userAddress: string,
  claimAmount: number,
  userData: any
): Promise<ClaimResult> {
  try {
    // Validate inputs
    if (!userAddress || !ethers.isAddress(userAddress)) {
      return { success: false, error: 'Invalid wallet address' };
    }

    if (claimAmount <= 0) {
      return { success: false, error: 'Invalid claim amount' };
    }

    if (!TREASURY_PRIVATE_KEY) {
      console.error('❌ Treasury private key not configured');
      return { success: false, error: 'Treasury wallet not configured' };
    }

    if (!userData || !userData.farcaster_fid) {
      return { success: false, error: 'User data not found' };
    }

    console.log(`💰 Claiming ${claimAmount} USDC for ${userAddress}...`);

    // Check user has balance
    if (userData.usdc_claims < claimAmount) {
      return { success: false, error: `Insufficient balance. You have ${userData.usdc_claims} USDC available.` };
    }

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

    console.log(`📝 Treasury wallet: ${treasuryWallet.address}`);

    // Connect to USDC token contract (6 decimals)
    const tokenContract = new ethers.Contract(
      USDC_TOKEN_ADDRESS,
      USDC_ABI,
      treasuryWallet
    );

    // USDC has 6 decimals
    const amountInWei = ethers.parseUnits(claimAmount.toString(), 6);

    console.log(`📤 Sending ${claimAmount} USDC (${amountInWei.toString()} units)...`);

    // Check treasury balance
    const treasuryBalance = await tokenContract.balanceOf(treasuryWallet.address);
    if (treasuryBalance < amountInWei) {
      return { 
        success: false, 
        error: 'Treasury has insufficient USDC funds. Please contact support.' 
      };
    }

    // Send transaction
    const tx = await tokenContract.transfer(userAddress, amountInWei);
    console.log(`⏳ Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Update Google Sheets would go here if you have a webhook for usdc_claims
    // For now, we'll just return success

    return {
      success: true,
      txHash: tx.hash,
      newBalance: userData.usdc_claims - claimAmount,
    };
  } catch (error: any) {
    console.error('❌ USDC Claim failed:', error);
    
    let errorMessage = 'Failed to claim USDC';
    if (error.message) {
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Treasury wallet has insufficient ETH for gas';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected';
      } else {
        errorMessage = error.message.substring(0, 100);
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}