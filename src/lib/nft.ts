// NFT and blockchain utilities

export const NFT_CONFIG = {
  CONTRACT_ADDRESS: '0x6d70517b4bb4921b6fe0b131d62415332db1b831',
  CHAIN: 'base',
  RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/f86O0OhMG7x1VXjtFHHqJ',
  TOKENS: {
    FOUNDER: {
      id: '1',
      metadataUrl: 'https://x6zdncpcsp5vmpjbl5lm3rdsovw3xftreclixaaaqdhwlg33j5vq.arweave.net/v7I2ieKT-1Y9IV9WzcRydW27lnEglouAAIDPZZt7T2s',
      name: 'Base Tribe Founder',
      description: 'Founding member of Base Tribe'
    },
    BELIEVER: {
      id: '2',
      metadataUrl: 'https://wzgs6ztnl6rg2jshfax2e5tzvf67d4qefptad6pi6uywpo7fwweq.arweave.net/tk0vZm1fom0mRygvonZ5qX3x8gQr5gH56PUxZ7vltYk',
      name: 'Base Tribe Believer',
      description: 'I believe in Base and its tribe'
    }
  }
};

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTPrice {
  eth: string;
  usd: string;
}

export interface NFTOwnership {
  tokenId: string;
  balance: number;
  metadata?: NFTMetadata;
  price?: NFTPrice;
}

// Fetch NFT metadata from Arweave
export async function fetchNFTMetadata(metadataUrl: string): Promise<NFTMetadata | null> {
  try {
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

// Check NFT ownership using Alchemy API
export async function checkNFTOwnership(
  walletAddress: string,
  contractAddress: string = NFT_CONFIG.CONTRACT_ADDRESS
): Promise<NFTOwnership[]> {
  try {
    const alchemyApiKey = NFT_CONFIG.RPC_URL.split('/').pop();
    
    if (!alchemyApiKey || alchemyApiKey.length < 10) {
      console.warn('Invalid Alchemy API key, skipping NFT ownership check');
      return [];
    }
    
    const url = `https://base-mainnet.g.alchemy.com/nft/v3/${alchemyApiKey}/getNFTsForOwner`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner: walletAddress,
        contractAddresses: [contractAddress],
        withMetadata: true,
      }),
    });

    if (!response.ok) {
      console.warn('NFT ownership check failed with status:', response.status);
      return [];
    }

    const data = await response.json();
    
    // Parse owned NFTs
    const ownedNFTs: NFTOwnership[] = [];
    
    if (data.ownedNfts && data.ownedNfts.length > 0) {
      for (const nft of data.ownedNfts) {
        ownedNFTs.push({
          tokenId: nft.tokenId,
          balance: parseInt(nft.balance) || 1,
          metadata: nft.metadata || null,
        });
      }
    }

    return ownedNFTs;
  } catch (error) {
    console.warn('NFT ownership check unavailable:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

// Get balance of specific token for address (ERC-1155)
export async function getTokenBalance(
  walletAddress: string,
  tokenId: string,
  contractAddress: string = NFT_CONFIG.CONTRACT_ADDRESS
): Promise<number> {
  try {
    // Check if we have a valid RPC URL
    if (!NFT_CONFIG.RPC_URL || NFT_CONFIG.RPC_URL.length < 10) {
      console.warn('Invalid RPC URL, skipping token balance check');
      return 0;
    }

    const response = await fetch(NFT_CONFIG.RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          {
            to: contractAddress,
            data: `0x00fdd58e${walletAddress.slice(2).padStart(64, '0')}${tokenId.padStart(64, '0')}`, // balanceOf(address,uint256)
          },
          'latest',
        ],
      }),
    });

    if (!response.ok) {
      // Silently skip - this is expected when RPC is rate limited or unavailable
      return 0;
    }

    const data = await response.json();
    
    // Check for RPC errors
    if (data.error) {
      // Silently skip RPC errors (rate limits, etc.)
      return 0;
    }
    
    if (data.result) {
      return parseInt(data.result, 16);
    }
    
    return 0;
  } catch (error) {
    // Silent fail - don't spam console with errors for expected failures
    return 0;
  }
}

// Check ownership of both badges
export async function checkBadgeOwnership(walletAddress: string): Promise<{
  founder: number;
  believer: number;
}> {
  try {
    const [founderBalance, believerBalance] = await Promise.all([
      getTokenBalance(walletAddress, NFT_CONFIG.TOKENS.FOUNDER.id),
      getTokenBalance(walletAddress, NFT_CONFIG.TOKENS.BELIEVER.id),
    ]);

    return {
      founder: founderBalance,
      believer: believerBalance,
    };
  } catch (error) {
    console.warn('Badge ownership check unavailable:', error instanceof Error ? error.message : 'Unknown error');
    return { founder: 0, believer: 0 };
  }
}

// Fetch ETH to USD conversion rate
async function getEthToUsdRate(): Promise<number> {
  try {
    const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH', {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      return 3000; // Fallback price
    }
    
    const data = await response.json();
    return parseFloat(data.data.rates.USD) || 3000;
  } catch (error) {
    // Silent fail - use fallback price
    return 3000;
  }
}

// Fetch mint price from Manifold contract for a specific token
export async function getMintPrice(tokenId: string): Promise<NFTPrice | null> {
  try {
    if (!NFT_CONFIG.RPC_URL || NFT_CONFIG.RPC_URL.length < 10) {
      return null;
    }

    // Call the contract's mintFee function (assuming standard Manifold interface)
    // mintFee() returns uint256 - the price in wei
    const response = await fetch(NFT_CONFIG.RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          {
            to: NFT_CONFIG.CONTRACT_ADDRESS,
            data: '0x13966db5', // mintFee() function selector
          },
          'latest',
        ],
      }),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.error || !data.result) {
      return null;
    }

    // Convert wei to ETH
    const priceWei = BigInt(data.result);
    const priceEth = Number(priceWei) / 1e18;
    
    // Get ETH to USD rate
    const ethToUsd = await getEthToUsdRate();
    const priceUsd = priceEth * ethToUsd;

    return {
      eth: priceEth.toFixed(5),
      usd: priceUsd.toFixed(2),
    };
  } catch (error) {
    // Silent fail - prices will use fallback
    return null;
  }
}