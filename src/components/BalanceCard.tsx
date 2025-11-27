// Balance card component - shows user's BTRIBE balance and stats

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Star, TrendingUp, Zap, Shield, Loader2 } from 'lucide-react';
import type { UserData } from '@/lib/types';

interface BalanceCardProps {
  userData: UserData | null;
  onClaim: () => void;
  isLoading?: boolean;
  onClaimJesse?: () => void;
  onClaimRaidBtribe?: () => void;
  isLoadingJesse?: boolean;
  isLoadingRaidBtribe?: boolean;
  isLoadingUserData?: boolean;
}

export function BalanceCard({ 
  userData, 
  onClaim, 
  isLoading,
  onClaimJesse,
  onClaimRaidBtribe,
  isLoadingJesse,
  isLoadingRaidBtribe,
  isLoadingUserData
}: BalanceCardProps) {
  if (!userData) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F] to-[#003366] p-6 rounded-xl border-0 shadow-lg shadow-[#39FF14]/10">
        <div className="text-center text-white">
          <p className="text-sm opacity-70">Connect wallet to view balance</p>
        </div>
      </Card>
    );
  }

  // Show loading state while fetching user data
  if (isLoadingUserData) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F] to-[#003366] p-6 rounded-xl border-0 shadow-lg shadow-[#39FF14]/10">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#39FF14]" />
          <p className="text-sm opacity-70">Loading your balance...</p>
        </div>
      </Card>
    );
  }

  // Raid balances from user data (0 for non-members)
  const raidBountyJesse = userData.jesse_balance || 0;
  const usdcDrops = userData.usdc_claims || 0; // Fetch from Google Sheets usdc_claims column

  return (
    <Card className="bg-gradient-to-br from-[#0a0e1a] via-[#0d1117] to-[#000000] p-6 rounded-2xl border border-white/5 shadow-2xl">
      <div className="space-y-5">
        {/* Main Balance - BTRIBE - Neon Green Premium Design */}
        <div className="relative overflow-hidden group">
          {/* Multi-layer glow effects */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#39FF14] via-[#00FF41] to-[#39FF14] rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 animate-pulse transition-opacity duration-1000"></div>
          <div className="absolute -inset-1 bg-gradient-to-br from-[#39FF14]/20 via-transparent to-[#00FF41]/20 rounded-2xl blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
          
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
          
          {/* Glass morphism card */}
          <div className="relative bg-gradient-to-br from-[#0a2815]/90 via-[#0d1a0d]/80 to-[#000000]/90 backdrop-blur-xl p-8 rounded-2xl border border-[#39FF14]/30 shadow-[0_8px_32px_0_rgba(57,255,20,0.15)]">
            {/* Floating particles effect */}
            <div className="absolute top-2 left-4 w-1 h-1 bg-[#39FF14] rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute top-4 right-8 w-1 h-1 bg-[#00FF41] rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
            <div className="absolute bottom-6 left-12 w-1 h-1 bg-[#39FF14] rounded-full animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
            
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39FF14] to-transparent"></div>
            
            <div className="text-center">
              {/* Label with animation */}
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-[#39FF14]/10 rounded-full border border-[#39FF14]/30">
                <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></div>
                <p className="text-[#39FF14] text-xs font-bold tracking-[0.2em] uppercase">$BTRIBE Balance</p>
              </div>
              
              {/* Amount with premium styling */}
              <div className="relative mb-3">
                {/* Intense glow behind number */}
                <div className="absolute inset-0 bg-[#39FF14] blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 bg-[#00FF41] blur-2xl opacity-30 animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }}></div>
                
                {/* The number itself */}
                <div className="relative flex items-center justify-center gap-4">
                  <Coins className="w-12 h-12 text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.8)] animate-pulse" style={{ animationDuration: '2s' }} />
                  <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] via-[#00FF41] to-[#39FF14] drop-shadow-[0_0_30px_rgba(57,255,20,0.9)] tracking-tight animate-pulse" style={{ animationDuration: '2s' }}>
                    {userData.btribe_balance.toLocaleString()}
                  </h2>
                </div>
              </div>
              
              {/* Token label */}
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#39FF14]/50"></div>
                <p className="text-[#39FF14]/80 font-bold tracking-widest uppercase">$BTRIBE</p>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#39FF14]/50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Balances - Premium Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Raid Bounty - Premium Gold Design */}
          <div className="relative overflow-hidden group">
            {/* Gold glow layers */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FF9800] rounded-xl blur-xl opacity-40 group-hover:opacity-60 animate-pulse transition-opacity"></div>
            <div className="absolute -inset-0.5 bg-[#FFD700] rounded-xl blur-2xl opacity-20 animate-pulse" style={{ animationDuration: '3s' }}></div>
            
            {/* Shimmer on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
            
            {/* Glass card */}
            <div className="relative bg-gradient-to-br from-[#2a2000]/95 via-[#1a1500]/90 to-[#000000]/95 backdrop-blur-xl p-5 rounded-xl border border-[#FFD700]/40 shadow-[0_8px_24px_0_rgba(255,215,0,0.2)]">
              {/* Top shine */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>
              
              {/* Floating particles */}
              <div className="absolute top-2 right-3 w-1 h-1 bg-[#FFD700] rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute bottom-3 left-4 w-1 h-1 bg-[#FFC107] rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
              
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FFD700] blur-md rounded-full"></div>
                  <Shield className="relative w-5 h-5 text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                </div>
                <p className="text-[#FFD700] text-[10px] font-black tracking-[0.15em] uppercase">Raid Bounty</p>
              </div>
              
              {/* Amount */}
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-[#FFD700] blur-xl opacity-30 animate-pulse"></div>
                <p className="relative text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
                  {raidBountyJesse.toLocaleString()}
                </p>
              </div>
              
              <p className="text-[#FFD700]/70 text-xs font-bold tracking-wider mb-3">$JESSE</p>
              
              {/* Premium button */}
              <Button
                onClick={onClaimJesse}
                disabled={isLoadingJesse || raidBountyJesse === 0}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] text-black font-black py-2.5 text-xs rounded-lg shadow-[0_4px_20px_0_rgba(255,215,0,0.4)] hover:shadow-[0_6px_30px_0_rgba(255,215,0,0.6)] transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoadingJesse ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'CLAIM'
                )}
              </Button>
            </div>
          </div>

          {/* USDC Drops - Premium Blue Design */}
          <div className="relative overflow-hidden group">
            {/* Blue glow layers */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00D4FF] via-[#0095FF] to-[#0066CC] rounded-xl blur-xl opacity-40 group-hover:opacity-60 animate-pulse transition-opacity"></div>
            <div className="absolute -inset-0.5 bg-[#00D4FF] rounded-xl blur-2xl opacity-20 animate-pulse" style={{ animationDuration: '3s' }}></div>
            
            {/* Shimmer on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
            
            {/* Glass card */}
            <div className="relative bg-gradient-to-br from-[#001a2a]/95 via-[#00121f]/90 to-[#000000]/95 backdrop-blur-xl p-5 rounded-xl border border-[#00D4FF]/40 shadow-[0_8px_24px_0_rgba(0,212,255,0.2)]">
              {/* Top shine */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
              
              {/* Floating particles */}
              <div className="absolute top-2 right-3 w-1 h-1 bg-[#00D4FF] rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute bottom-3 left-4 w-1 h-1 bg-[#0095FF] rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
              
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00D4FF] blur-md rounded-full"></div>
                  <Zap className="relative w-5 h-5 text-[#00D4FF] drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                </div>
                <p className="text-[#00D4FF] text-[10px] font-black tracking-[0.15em] uppercase">USDC Drops</p>
              </div>
              
              {/* Amount */}
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-[#00D4FF] blur-xl opacity-30 animate-pulse"></div>
                <p className="relative text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00D4FF] via-[#0095FF] to-[#00D4FF] drop-shadow-[0_0_20px_rgba(0,212,255,0.6)]">
                  {usdcDrops.toLocaleString()}
                </p>
              </div>
              
              <p className="text-[#00D4FF]/70 text-xs font-bold tracking-wider mb-3">$USDC</p>
              
              {/* Premium button */}
              <Button
                onClick={onClaimRaidBtribe}
                disabled={isLoadingRaidBtribe || usdcDrops === 0}
                className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0095FF] hover:from-[#0095FF] hover:to-[#0077CC] text-white font-black py-2.5 text-xs rounded-lg shadow-[0_4px_20px_0_rgba(0,212,255,0.4)] hover:shadow-[0_6px_30px_0_rgba(0,212,255,0.6)] transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoadingRaidBtribe ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'CLAIM'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Premium Dark */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0f1117]/80 via-[#0a0d13]/60 to-[#000000]/80 backdrop-blur-sm border border-white/5 p-4">
          {/* Subtle top shine */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FFD700] blur-md rounded-full opacity-40"></div>
                  <Star className="relative w-5 h-5 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                </div>
                <p className="text-2xl font-black text-white drop-shadow-lg">{userData.stars}</p>
              </div>
              <p className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Stars</p>
            </div>
            
            <div className="text-center border-x border-white/5">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00D4FF] blur-md rounded-full opacity-40"></div>
                  <TrendingUp className="relative w-5 h-5 text-[#00D4FF] drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                </div>
                <p className="text-2xl font-black text-white drop-shadow-lg">{userData.session_streak}</p>
              </div>
              <p className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Streak</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <p className="text-2xl font-black text-white drop-shadow-lg">{userData.defaults}</p>
              </div>
              <p className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Defaults</p>
            </div>
          </div>
        </div>

        {/* Main Claim Button - Premium Green */}
        <div className="relative overflow-hidden group">
          {/* Green glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#39FF14] via-[#00FF41] to-[#39FF14] rounded-2xl blur-xl opacity-50 group-hover:opacity-70 animate-pulse transition-opacity"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
          
          <Button
            onClick={onClaim}
            disabled={isLoading || userData.btribe_balance === 0}
            className="relative w-full bg-gradient-to-r from-[#39FF14] via-[#00FF41] to-[#39FF14] hover:from-[#00FF41] hover:to-[#39FF14] text-black font-black py-7 rounded-2xl shadow-[0_8px_32px_0_rgba(57,255,20,0.4)] hover:shadow-[0_12px_48px_0_rgba(57,255,20,0.6)] transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg tracking-wide"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>CLAIMING...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Coins className="w-6 h-6 drop-shadow-lg" />
                <span>CLAIM YOUR $BTRIBE</span>
              </div>
            )}
          </Button>
        </div>

        {userData.btribe_balance === 0 && (
          <p className="text-center text-xs text-white/40 font-medium">
            Complete engagement sessions to earn $BTRIBE
          </p>
        )}
      </div>
    </Card>
  );
}