// User Data Loader - Handles fetching user data from Google Sheets on login

'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { fetchUserDataByFID, fetchFarcasterProfile } from '@/lib/api';
import { CONFIG } from '@/lib/constants';
import type { UserData, FarcasterProfile } from '@/lib/types';

interface UserDataLoaderProps {
  onUserDataLoaded: (userData: UserData | null, profile: FarcasterProfile | null) => void;
  onMembershipStatus: (isMember: boolean) => void;
}

export function UserDataLoader({ onUserDataLoaded, onMembershipStatus }: UserDataLoaderProps) {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      onUserDataLoaded(null, null);
      onMembershipStatus(false);
      return;
    }

    loadUserData();
  }, [address, isConnected]);

  async function loadUserData() {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Step 1: Fetching FID for wallet address:', address);

      // Step 1: Get FID from wallet address via Neynar API
      const fidResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
        {
          headers: {
            'accept': 'application/json',
            'api_key': CONFIG.FARCASTER_API_KEY,
          },
        }
      );

      if (!fidResponse.ok) {
        console.warn('⚠️ Failed to fetch FID from Neynar');
        setError('Could not verify Farcaster account');
        onUserDataLoaded(null, null);
        onMembershipStatus(false);
        setLoading(false);
        return;
      }

      const fidData = await fidResponse.json();
      const userAddressData = fidData[address.toLowerCase()];

      if (!userAddressData || userAddressData.length === 0) {
        console.warn('⚠️ No Farcaster account found for wallet:', address);
        setError('No Farcaster account linked to this wallet');
        onUserDataLoaded(null, null);
        onMembershipStatus(false);
        setLoading(false);
        return;
      }

      const fid = String(userAddressData[0].fid);
      console.log('✅ Step 2: FID found:', fid);

      // Step 2: Fetch user data from Google Sheets using FID
      console.log('🔍 Step 3: Fetching user data from Google Sheets...');
      const userData = await fetchUserDataByFID(fid);

      if (!userData) {
        console.warn('⚠️ User not found in Google Sheets (not a Base Tribe member)');
        setError('You are not a member of Base Tribe yet');
        onUserDataLoaded(null, null);
        onMembershipStatus(false);
        setLoading(false);
        return;
      }

      console.log('✅ Step 4: User data loaded from Google Sheets:', {
        fid: userData.farcaster_fid,
        username: userData.farcaster_username,
        btribe: userData.btribe_balance,
        jesse: userData.jesse_balance,
        status: userData.status,
      });

      // Step 3: Fetch Farcaster profile (profile image, display name, etc.)
      console.log('🔍 Step 5: Fetching Farcaster profile from Neynar...');
      const profile = await fetchFarcasterProfile(fid);

      if (profile) {
        console.log('✅ Step 6: Profile loaded:', {
          username: profile.username,
          displayName: profile.displayName,
          pfpUrl: profile.pfpUrl,
        });
      }

      // Step 4: Check membership status
      const isMember = userData.status === 'full_member';
      console.log(isMember ? '✅ User is a FULL MEMBER' : '⚠️ User is NOT a full member');

      // Step 5: Notify parent component with loaded data
      onUserDataLoaded(userData, profile);
      onMembershipStatus(isMember);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading user data:', err);
      setError('Failed to load user data');
      onUserDataLoaded(null, null);
      onMembershipStatus(false);
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">Connect your wallet to continue</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#39FF14]"></div>
        <p className="text-white/80 mt-4">Loading your Base Tribe data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-400 font-semibold mb-2">⚠️ {error}</p>
          <p className="text-white/60 text-sm">
            {error.includes('not a member') 
              ? 'Join Base Tribe to access all features' 
              : 'Please try again or contact support'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
