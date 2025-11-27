// Direct NFT minting utilities for Manifold contracts
import { NFT_CONFIG } from './nft';

// Mint prices in ETH (including Manifold fees)
export const MINT_PRICES = {
  FOUNDER: '0.00617', // 0.00567 ETH + 0.0005 Manifold fee = 0.00617 ETH total
  BELIEVER: '0.001', // 0.0005 ETH + 0.0005 Manifold fee = 0.001 ETH total
};

// Price breakdown for display
export const MINT_PRICE_BREAKDOWN = {
  FOUNDER: {
    mintPrice: '0.00567',
    manifoldFee: '0.0005',
    total: '0.00617',
  },
  BELIEVER: {
    mintPrice: '0.0005',
    manifoldFee: '0.0005',
    total: '0.001',
  },
};

// Manifold claim instance IDs (from the claim pages)
export const CLAIM_INSTANCES = {
  FOUNDER: 4117309680, // https://manifold.xyz/@elogiso/id/4117309680
  BELIEVER: 4117350640, // https://manifold.xyz/@elogiso/id/4117350640
};

// Convert ETH to Wei (Wei = ETH * 10^18)
function ethToWei(eth: string): string {
  const ethValue = parseFloat(eth);
  const weiValue = BigInt(Math.floor(ethValue * 1e18));
  return '0x' + weiValue.toString(16);
}

// Encode function data for Manifold claim
// Standard Manifold claim signature: mint(uint256 instanceId, uint32 mintIndex, bytes32[] merkleProof, address mintFor)
function encodeClaimData(instanceId: number, mintFor: string): string {
  // Function selector for mint(uint256,uint32,bytes32[],address)
  const functionSelector = '0x7e5cd5c1';
  
  // Parameters
  const instanceIdHex = instanceId.toString(16).padStart(64, '0');
  const mintIndex = '0'.repeat(64); // 0 for first/general mint
  const merkleProofOffset = '0000000000000000000000000000000000000000000000000000000000000080'; // offset to merkle proof array
  const mintForAddress = mintFor.slice(2).padStart(64, '0');
  const merkleProofLength = '0000000000000000000000000000000000000000000000000000000000000000'; // empty array length
  
  return functionSelector + instanceIdHex + mintIndex + merkleProofOffset + mintForAddress + merkleProofLength;
}

// Alternative: Simple mint function for Manifold (if no merkle proof required)
// mint(uint256 instanceId)
function encodeSimpleMintData(instanceId: number): string {
  const functionSelector = '0xa0712d68'; // mint(uint256)
  const instanceIdHex = instanceId.toString(16).padStart(64, '0');
  return functionSelector + instanceIdHex;
}

// Alternative: mintBatch for Manifold
// mintBatch(address to, uint256 instanceId, uint32 amount)
function encodeBatchMintData(to: string, instanceId: number, amount: number = 1): string {
  const functionSelector = '0x94029f2c'; // mintBatch(address,uint256,uint32)
  const toAddress = to.slice(2).padStart(64, '0');
  const instanceIdHex = instanceId.toString(16).padStart(64, '0');
  const amountHex = amount.toString(16).padStart(64, '0');
  return functionSelector + toAddress + instanceIdHex + amountHex;
}

export interface MintResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Mint an NFT from Manifold claim contract
 * @param tokenId - The token ID to mint (1 for Founder, 2 for Believer)
 * @param walletAddress - The wallet address to mint to
 * @returns MintResult with transaction hash or error
 */
export async function mintNFT(tokenId: string, walletAddress: string): Promise<MintResult> {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      return {
        success: false,
        error: 'Please install MetaMask or another Web3 wallet',
      };
    }

    // Check current network and switch to Base if needed
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const baseChainId = '0x2105'; // Base mainnet (8453 in decimal)
      
      console.log('Current chain ID:', chainId);
      
      if (chainId !== baseChainId) {
        console.log('⚠️ Wrong network detected. Switching to Base...');
        
        try {
          // Try to switch to Base network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: baseChainId }],
          });
          
          console.log('✅ Switched to Base network');
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            console.log('Base network not found. Adding Base network...');
            
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: baseChainId,
                    chainName: 'Base',
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://mainnet.base.org'],
                    blockExplorerUrls: ['https://basescan.org'],
                  },
                ],
              });
              
              console.log('✅ Base network added and switched');
            } catch (addError) {
              console.error('Failed to add Base network:', addError);
              return {
                success: false,
                error: 'Failed to add Base network. Please add Base network manually in your wallet.',
              };
            }
          } else {
            console.error('Failed to switch network:', switchError);
            return {
              success: false,
              error: 'Please switch to Base network in your wallet to mint.',
            };
          }
        }
      }
    } catch (networkError) {
      console.error('Network check error:', networkError);
      return {
        success: false,
        error: 'Failed to verify network. Please ensure you are on Base network.',
      };
    }

    // Check user's ETH balance before attempting mint
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [walletAddress, 'latest'],
      });
      
      const balanceInEth = parseInt(balance, 16) / 1e18;
      console.log('User ETH balance:', balanceInEth, 'ETH');
      
      // Get the claim instance ID and price based on token ID
      const isFounder = tokenId === '1';
      const mintPrice = isFounder ? MINT_PRICES.FOUNDER : MINT_PRICES.BELIEVER;
      const requiredAmount = parseFloat(mintPrice);
      
      // Need at least mint price + estimated gas (0.0001 ETH buffer)
      const minRequired = requiredAmount + 0.0001;
      
      if (balanceInEth < minRequired) {
        return {
          success: false,
          error: `Insufficient ETH. You need at least ${minRequired.toFixed(5)} ETH (${requiredAmount} for mint + gas). Your balance: ${balanceInEth.toFixed(5)} ETH`,
        };
      }
      
      console.log('✅ Sufficient balance:', balanceInEth, 'ETH');
    } catch (balanceError) {
      console.warn('Could not check balance:', balanceError);
      // Continue anyway, let the transaction fail if insufficient
    }

    // Get the claim instance ID and price based on token ID
    const isFounder = tokenId === '1';
    const instanceId = isFounder ? CLAIM_INSTANCES.FOUNDER : CLAIM_INSTANCES.BELIEVER;
    const mintPrice = isFounder ? MINT_PRICES.FOUNDER : MINT_PRICES.BELIEVER;
    const priceInWei = ethToWei(mintPrice);

    console.log('🎨 Minting NFT:', {
      tokenId,
      instanceId,
      contract: NFT_CONFIG.CONTRACT_ADDRESS,
      price: mintPrice,
      priceWei: priceInWei,
    });

    // Try multiple encoding methods (Manifold has different claim patterns)
    const encodingMethods = [
      {
        name: 'Simple mint(uint256)',
        data: encodeSimpleMintData(instanceId),
      },
      {
        name: 'Claim with merkle proof',
        data: encodeClaimData(instanceId, walletAddress),
      },
      {
        name: 'Batch mint',
        data: encodeBatchMintData(walletAddress, instanceId, 1),
      },
    ];

    // Try the first method (simple mint is most common for public claims)
    const data = encodingMethods[0].data;

    // Prepare transaction
    const transactionParameters = {
      to: NFT_CONFIG.CONTRACT_ADDRESS,
      from: walletAddress,
      value: priceInWei,
      data: data,
    };

    console.log('📤 Sending transaction:', transactionParameters);

    // Request transaction from MetaMask
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    console.log('✅ Transaction sent:', txHash);

    return {
      success: true,
      txHash: txHash as string,
    };
  } catch (error: any) {
    console.error('❌ Mint error:', error);

    // Handle user rejection
    if (error.code === 4001 || error.message?.includes('User rejected')) {
      return {
        success: false,
        error: 'Transaction cancelled by user',
      };
    }

    // Handle insufficient funds
    if (error.code === -32000 || error.message?.includes('insufficient funds')) {
      return {
        success: false,
        error: 'Insufficient ETH balance to cover mint price and gas fees. Please add more ETH to your wallet.',
      };
    }

    // Handle execution reverted - might need different method
    if (error.message?.includes('execution reverted')) {
      return {
        success: false,
        error: 'Minting failed. The claim may not be active or you may have already minted. Please check the Manifold page.',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to mint NFT. Please try again.',
    };
  }
}

/**
 * Alternative mint function that opens Manifold claim page
 * This is a fallback if direct minting doesn't work
 */
export function openManifoldClaimPage(tokenId: string): void {
  const isFounder = tokenId === '1';
  const url = isFounder 
    ? 'https://manifold.xyz/@elogiso/id/4117309680'
    : 'https://manifold.xyz/@elogiso/id/4117350640';
  
  window.open(url, '_blank');
}

/**
 * Wait for transaction confirmation
 * @param txHash - Transaction hash to wait for
 * @param maxWaitTime - Maximum time to wait in milliseconds (default 60s)
 * @returns true if confirmed, false if timeout
 */
export async function waitForTransaction(txHash: string, maxWaitTime: number = 60000): Promise<boolean> {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      if (receipt && receipt.status) {
        return receipt.status === '0x1'; // Success
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    } catch (error) {
      console.error('Error checking transaction:', error);
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }

  return false; // Timeout
}