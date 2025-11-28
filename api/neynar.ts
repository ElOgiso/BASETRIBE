/**
 * Vercel Serverless Function - Neynar API Proxy
 * Keeps API keys secure on the server
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'getFidFromWallet':
        return await getFidFromWallet(req, res);
      case 'getUserProfile':
        return await getUserProfile(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Neynar API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFidFromWallet(req: VercelRequest, res: VercelResponse) {
  const { wallet } = req.query;

  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  const NEYNAR_CLIENT_ID = process.env.NEYNAR_CLIENT_ID;

  if (!NEYNAR_CLIENT_ID) {
    return res.status(500).json({ error: 'Neynar client ID not configured' });
  }

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${wallet}`;
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-api-key': NEYNAR_CLIENT_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && Object.keys(data).length > 0) {
      const walletData = data[wallet.toLowerCase()];
      if (walletData && walletData.length > 0) {
        return res.status(200).json({ fid: walletData[0].fid.toString() });
      }
    }

    return res.status(404).json({ error: 'FID not found for wallet' });
  } catch (error) {
    console.error('getFidFromWallet error:', error);
    return res.status(500).json({ error: 'Failed to fetch FID' });
  }
}

async function getUserProfile(req: VercelRequest, res: VercelResponse) {
  const { fid } = req.query;

  if (!fid) {
    return res.status(400).json({ error: 'FID required' });
  }

  const NEYNAR_CLIENT_ID = process.env.NEYNAR_CLIENT_ID;

  if (!NEYNAR_CLIENT_ID) {
    return res.status(500).json({ error: 'Neynar client ID not configured' });
  }

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-api-key': NEYNAR_CLIENT_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.users && data.users.length > 0) {
      const user = data.users[0];
      return res.status(200).json({
        pfpUrl: user.pfp_url,
        displayName: user.display_name,
        username: user.username,
      });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (error) {
    console.error('getUserProfile error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}
