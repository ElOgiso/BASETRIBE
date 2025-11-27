// Active Session Progress Block - Shows user's session streak and probation status

'use client';

import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Zap, Award } from 'lucide-react';

interface SessionProgressBlockProps {
  isConnected: boolean;
  userData: any;
}

export function SessionProgressBlock({ isConnected, userData }: SessionProgressBlockProps) {
  // Get data from Google Sheets
  const sessionStreak = isConnected && userData?.session_streak ? parseInt(userData.session_streak) : 0;
  const probationCount = isConnected && userData?.probation_count ? parseInt(userData.probation_count) : 0;
  
  // Calculate progress percentage (max streak of 30 days for visual purposes)
  const maxStreak = 30;
  const progressPercentage = Math.min((sessionStreak / maxStreak) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Probation Warning - Conditional */}
      {isConnected && probationCount > 0 && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#FF3B30] via-[#d4183d] to-[#FF3B30] border-2 border-[#FF3B30] rounded-2xl p-6 shadow-2xl shadow-[#FF3B30]/50">
          {/* Animated alert background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          {/* Pulsing glow */}
          <div className="absolute -inset-1 bg-[#FF3B30]/50 blur-xl animate-pulse" />
          
          <div className="relative z-10 flex items-start gap-4">
            {/* Warning icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 blur-lg animate-pulse" />
                <div className="relative w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            {/* Warning text */}
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg mb-1">
                ⚠️ You are on Probation
              </h4>
              <p className="text-white/90 text-sm leading-relaxed">
                <span className="font-bold">Missed Sessions: {probationCount}.</span>
                {' '}Participate today to avoid reward penalties.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Session Progress Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#0A0F2B]/95 via-[#001F3F]/95 to-[#0A0F2B]/95 border border-white/10 rounded-2xl backdrop-blur-xl">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
        
        {/* Subtle glow orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#4169E1]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#5B3FD6]/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#4169E1]/50 blur-md" />
                  <TrendingUp className="relative w-6 h-6 text-[#4169E1]" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Your Active Session Progress
                </h3>
              </div>
              
              {isConnected ? (
                <p className="text-white/60 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F0C75E]" />
                  <span>Session Streak: <span className="text-[#4169E1] font-bold">{sessionStreak} {sessionStreak === 1 ? 'day' : 'days'}</span></span>
                </p>
              ) : (
                <p className="text-white/60 text-sm">
                  Connect your wallet to track your progress
                </p>
              )}
            </div>
            
            {/* Streak badge */}
            {isConnected && sessionStreak > 0 && (
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F0C75E]/50 blur-lg animate-pulse" />
                  <div className="relative bg-gradient-to-br from-[#F0C75E] to-[#FFD700] rounded-full p-3 shadow-xl shadow-[#F0C75E]/50">
                    <Award className="w-6 h-6 text-[#0A0F2B]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-3">
            {/* Progress bar background */}
            <div className="relative h-4 bg-[#E5E7EB]/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
              {/* Empty state glow */}
              {sessionStreak === 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              )}
              
              {/* Progress fill */}
              <div 
                className="h-full bg-gradient-to-r from-[#4169E1] via-[#5B3FD6] to-[#4169E1] rounded-full relative transition-all duration-1000 ease-out shadow-lg shadow-[#4169E1]/50"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Animated shine effect */}
                {sessionStreak > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />
                )}
                
                {/* Leading edge glow */}
                {sessionStreak > 0 && (
                  <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                )}
              </div>
            </div>

            {/* Progress stats */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">
                {sessionStreak === 0 ? 'Start now' : `${sessionStreak} ${sessionStreak === 1 ? 'day' : 'days'}`}
              </span>
              <span className="text-white/50">
                {maxStreak} days max
              </span>
            </div>
          </div>

          {/* Status message */}
          {isConnected ? (
            sessionStreak === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <p className="text-white/70 text-sm text-center">
                  🚀 Start your first session to begin earning multipliers and unlock exclusive rewards!
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-[#4169E1]/10 to-[#5B3FD6]/10 border border-[#4169E1]/30 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
                    <p className="text-white/90 text-sm font-medium">
                      {sessionStreak >= 7 ? '🔥 On Fire!' : '💪 Keep it up!'}
                    </p>
                  </div>
                  <p className="text-[#4169E1] text-sm font-bold">
                    {sessionStreak >= 7 ? `${Math.floor(sessionStreak / 7)}x Multiplier Active` : 'Build your streak for multipliers'}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-sm text-center">
                Connect your wallet to start tracking your session streak and earning rewards
              </p>
            </div>
          )}

          {/* Booster info */}
          {isConnected && sessionStreak >= 7 && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#F0C75E]/10 to-[#FFD700]/10 border border-[#F0C75E]/30 rounded-xl p-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F0C75E] to-[#FFD700] flex items-center justify-center shadow-lg shadow-[#F0C75E]/50">
                  <Zap className="w-5 h-5 text-[#0A0F2B]" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[#F0C75E] font-bold text-sm mb-1">
                  Reward Booster Active!
                </p>
                <p className="text-white/70 text-xs">
                  Your rewards are multiplied by {Math.floor(sessionStreak / 7)}x
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}