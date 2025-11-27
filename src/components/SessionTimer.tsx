// Premium Session Timer - Minimal Coinbase x Futuristic Binance x TikTok Glow

'use client';

import { useState, useEffect } from 'react';
import { SESSIONS, ENGAGEMENT_RULES } from '@/lib/constants';

export function SessionTimer() {
  const [currentSession, setCurrentSession] = useState<{
    time: string;
    rule: string;
    isActive: boolean;
    nextSession: string;
    timeRemaining: string;
  } | null>(null);

  useEffect(() => {
    const updateSession = () => {
      const now = new Date();
      const waTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));

      // First, check if we're in an active session (15-minute window)
      for (let i = 0; i < SESSIONS.length; i++) {
        const sessionTime = SESSIONS[i];
        const nextSession = SESSIONS[(i + 1) % SESSIONS.length];
        
        const [sessionHour, sessionMin] = sessionTime.split(':').map(Number);
        
        const sessionDate = new Date(waTime);
        sessionDate.setHours(sessionHour, sessionMin, 0, 0);
        
        const sessionEnd = new Date(sessionDate.getTime() + 15 * 60 * 1000); // 15 min window
        
        if (waTime >= sessionDate && waTime < sessionEnd) {
          // Session is active
          const remaining = Math.floor((sessionEnd.getTime() - waTime.getTime()) / 1000);
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          
          setCurrentSession({
            time: sessionTime,
            rule: ENGAGEMENT_RULES[sessionTime as keyof typeof ENGAGEMENT_RULES].text,
            isActive: true,
            nextSession,
            timeRemaining: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          });
          return;
        }
      }
      
      // No active session - find the next upcoming session
      let closestSession = null;
      let minTimeDiff = Infinity;
      
      for (let i = 0; i < SESSIONS.length; i++) {
        const sessionTime = SESSIONS[i];
        const [sessionHour, sessionMin] = sessionTime.split(':').map(Number);
        
        const sessionDate = new Date(waTime);
        sessionDate.setHours(sessionHour, sessionMin, 0, 0);
        
        // If session time has passed today, check tomorrow
        if (sessionDate <= waTime) {
          sessionDate.setDate(sessionDate.getDate() + 1);
        }
        
        const timeDiff = sessionDate.getTime() - waTime.getTime();
        
        if (timeDiff > 0 && timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestSession = {
            time: sessionTime,
            sessionDate: sessionDate,
          };
        }
      }
      
      // Display the next upcoming session
      if (closestSession) {
        const remaining = Math.floor((closestSession.sessionDate.getTime() - waTime.getTime()) / 1000);
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        
        setCurrentSession({
          time: closestSession.time,
          rule: ENGAGEMENT_RULES[closestSession.time as keyof typeof ENGAGEMENT_RULES].text,
          isActive: false,
          nextSession: closestSession.time,
          timeRemaining: hours > 0 
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes}:${seconds.toString().padStart(2, '0')}`,
        });
      }
    };

    updateSession();
    const interval = setInterval(updateSession, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentSession) return null;

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="relative group max-w-3xl mx-auto">
        {/* PREMIUM WORLD-CLASS BACKGROUND GLOW LAYERS */}
        
        {/* Layer 1: Deep outer glow - extends far beyond */}
        <div className={`absolute -inset-8 sm:-inset-12 md:-inset-16 rounded-3xl blur-[120px] transition-all duration-500 pointer-events-none ${
          currentSession.isActive 
            ? 'bg-gradient-to-r from-[#39FF14]/40 via-[#00FF41]/50 to-[#39FF14]/40 animate-pulse-slow opacity-60' 
            : 'bg-gradient-to-r from-[#00D4FF]/25 via-[#0095FF]/30 to-[#7B2CBF]/20 animate-pulse-slow opacity-40'
        }`} />
        
        {/* Layer 2: Mid-range glow with rotation effect */}
        <div className={`absolute -inset-6 sm:-inset-8 md:-inset-10 rounded-3xl blur-[80px] transition-all duration-700 pointer-events-none ${
          currentSession.isActive 
            ? 'bg-gradient-to-br from-[#39FF14]/50 via-[#00FF41]/60 to-[#39FF14]/50 animate-pulse-medium opacity-70 shadow-[0_0_150px_rgba(57,255,20,0.6)]' 
            : 'bg-gradient-to-br from-[#00D4FF]/30 via-[#0095FF]/35 to-[#00D4FF]/30 animate-pulse-medium opacity-50 shadow-[0_0_100px_rgba(0,212,255,0.4)]'
        }`} />
        
        {/* Layer 3: Close range intense glow */}
        <div className={`absolute -inset-4 sm:-inset-6 rounded-2xl blur-[60px] transition-all duration-500 pointer-events-none ${
          currentSession.isActive 
            ? 'bg-gradient-to-r from-[#39FF14]/70 via-[#00FF41]/80 to-[#39FF14]/70 opacity-80 animate-pulse-strong shadow-[0_0_100px_rgba(57,255,20,0.7)]' 
            : 'bg-gradient-to-r from-[#00D4FF]/40 via-[#0095FF]/50 to-[#00D4FF]/40 opacity-60 animate-pulse shadow-[0_0_80px_rgba(0,212,255,0.5)]'
        }`} />
        
        {/* Layer 4: Inner sharp glow */}
        <div className={`absolute -inset-2 rounded-2xl blur-[40px] transition-all duration-300 pointer-events-none ${
          currentSession.isActive 
            ? 'bg-[#39FF14]/60 opacity-90 animate-pulse' 
            : 'bg-[#00D4FF]/50 opacity-70 animate-pulse'
        }`} />
        
        {/* Layer 5: Pulsing ring effect - only when active */}
        {currentSession.isActive && (
          <>
            <div className="absolute -inset-10 sm:-inset-14 md:-inset-20 rounded-3xl bg-[#39FF14]/15 blur-[100px] animate-pulse-slow opacity-40 pointer-events-none" />
            <div className="absolute -inset-12 sm:-inset-16 md:-inset-24 rounded-3xl bg-[#00FF41]/10 blur-[140px] animate-pulse-slower opacity-30 pointer-events-none" />
          </>
        )}

        {/* Glass Card - Premium Mini App - LARGER on mobile */}
        <div className={`relative backdrop-blur-xl rounded-2xl sm:rounded-3xl border transition-all duration-500 shadow-2xl overflow-hidden ${
          currentSession.isActive
            ? 'bg-gradient-to-br from-[#0a2815]/95 via-[#0d1a0d]/95 to-[#000000]/95 border-[#39FF14]/50 shadow-[0_8px_64px_0_rgba(57,255,20,0.4)]'
            : 'bg-gradient-to-br from-[#001a2a]/95 via-[#00121f]/95 to-[#000000]/95 border-[#00D4FF]/40 shadow-[0_8px_48px_0_rgba(0,212,255,0.3)]'
        }`}>
          
          {/* Top accent line */}
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent transition-colors duration-500 ${
            currentSession.isActive
              ? 'via-[#39FF14] to-transparent'
              : 'via-[#00D4FF] to-transparent'
          }`} />
          
          {/* Animated Background Grid - Binance Futuristic */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
          </div>

          {/* Shimmer Effect - TikTok Energy */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent to-transparent ${
              currentSession.isActive
                ? 'via-[#39FF14]/30'
                : 'via-[#00D4FF]/20'
            }`} />
          </div>
          
          {/* Floating particles */}
          <div className={`absolute top-4 left-6 w-1 h-1 rounded-full animate-ping ${
            currentSession.isActive ? 'bg-[#39FF14]' : 'bg-[#00D4FF]'
          }`} style={{ animationDuration: '2s' }} />
          <div className={`absolute top-6 right-8 w-1 h-1 rounded-full animate-ping ${
            currentSession.isActive ? 'bg-[#00FF41]' : 'bg-[#0095FF]'
          }`} style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className={`absolute bottom-8 left-12 w-1 h-1 rounded-full animate-ping ${
            currentSession.isActive ? 'bg-[#39FF14]' : 'bg-[#00D4FF]'
          }`} style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />

          {/* Main Content - INCREASED PADDING for mobile dominance */}
          <div className="relative px-6 py-10 sm:px-6 sm:py-8 md:px-8 md:py-10">
            {/* Status Indicator - LARGER on mobile */}
            <div className="flex items-center justify-center mb-6 sm:mb-6">
              <div className={`flex items-center gap-3 px-5 py-2.5 sm:px-5 sm:py-2 rounded-full border backdrop-blur-sm transition-all duration-300 ${
                currentSession.isActive
                  ? 'bg-[#39FF14]/20 border-[#39FF14]/60 shadow-lg shadow-[#39FF14]/30'
                  : 'bg-[#00D4FF]/10 border-[#00D4FF]/40 shadow-md shadow-[#00D4FF]/20'
              }`}>
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full blur-md ${
                    currentSession.isActive ? 'bg-[#39FF14]' : 'bg-[#00D4FF]'
                  }`} />
                  <div className={`relative w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse ${
                    currentSession.isActive 
                      ? 'bg-[#39FF14] shadow-xl shadow-[#39FF14]/80' 
                      : 'bg-[#00D4FF] shadow-lg shadow-[#00D4FF]/60'
                  }`} />
                </div>
                <span className={`text-xs sm:text-xs font-bold tracking-wider uppercase ${
                  currentSession.isActive 
                    ? 'text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]' 
                    : 'text-[#00D4FF] drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]'
                }`}>
                  {currentSession.isActive ? 'SESSION OPEN - LIVE NOW!' : 'NEXT SESSION'}
                </span>
              </div>
            </div>

            {/* Countdown Display - MUCH LARGER on mobile */}
            <div className="text-center space-y-5 sm:space-y-4">
              {/* Main Timer */}
              <div className="relative inline-block">
                {/* Timer Glow - Intense when live */}
                <div className={`absolute -inset-6 sm:-inset-8 blur-[60px] transition-all duration-500 pointer-events-none ${
                  currentSession.isActive 
                    ? 'bg-[#39FF14]/60 animate-pulse scale-150' 
                    : 'bg-[#00D4FF]/40 animate-pulse scale-125'
                }`} />
                
                {/* Timer Digits - BIGGER mobile size - WHITE COLOR */}
                <div className="relative">
                  <div className="font-mono font-black tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.9)] text-6xl xs:text-7xl sm:text-6xl md:text-7xl lg:text-8xl transition-all duration-500">
                    {currentSession.timeRemaining}
                  </div>
                  
                  {/* Session Close Countdown Label - BIGGER on mobile */}
                  {currentSession.isActive && (
                    <div className="mt-2 sm:mt-2 text-[#39FF14]/80 text-xs sm:text-xs md:text-sm font-semibold tracking-wide uppercase animate-pulse">
                      Until Session Closes
                    </div>
                  )}
                </div>
              </div>

              {/* Session Time Label - LARGER on mobile */}
              <div className="flex items-center justify-center gap-3">
                <div className={`h-px w-10 sm:w-8 transition-all duration-300 ${
                  currentSession.isActive ? 'bg-[#39FF14]/60' : 'bg-[#00D4FF]/50'
                }`} />
                <span className={`text-sm sm:text-sm font-semibold tracking-widest uppercase transition-colors duration-300 ${
                  currentSession.isActive 
                    ? 'text-[#39FF14]/90 drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]' 
                    : 'text-[#00D4FF]/80 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]'
                }`}>
                  {currentSession.time} WAT
                </span>
                <div className={`h-px w-10 sm:w-8 transition-all duration-300 ${
                  currentSession.isActive ? 'bg-[#39FF14]/60' : 'bg-[#00D4FF]/50'
                }`} />
              </div>
            </div>

            {/* Bottom Glow Line - TikTok Social */}
            <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent transition-all duration-500 ${
              currentSession.isActive
                ? 'via-[#39FF14] opacity-70 shadow-[0_0_10px_rgba(57,255,20,0.8)]'
                : 'via-[#00D4FF] opacity-50 shadow-[0_0_8px_rgba(0,212,255,0.6)]'
            }`} />
          </div>
        </div>

        {/* Floating Orbs - TikTok Glow Energy - Outside container */}
        {currentSession.isActive ? (
          <>
            <div className="absolute -top-16 sm:-top-20 -left-16 sm:-left-20 w-32 h-32 sm:w-40 sm:h-40 bg-[#39FF14]/25 rounded-full blur-3xl animate-float-slow pointer-events-none" />
            <div className="absolute -bottom-16 sm:-bottom-20 -right-16 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 bg-[#39FF14]/15 rounded-full blur-3xl animate-float-slower pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-60 sm:h-60 bg-[#39FF14]/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -top-16 sm:-top-20 -left-16 sm:-left-20 w-32 h-32 sm:w-40 sm:h-40 bg-[#00D4FF]/20 rounded-full blur-3xl animate-float-slow pointer-events-none" />
            <div className="absolute -bottom-16 sm:-bottom-20 -right-16 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 bg-[#0095FF]/15 rounded-full blur-3xl animate-float-slower pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-60 sm:h-60 bg-[#00D4FF]/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
          </>
        )}
        
        {/* Add custom animations */}
        <style>{`
          @keyframes pulse-strong {
            0%, 100% {
              opacity: 0.7;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }
          
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.6;
            }
          }
          
          @keyframes pulse-slower {
            0%, 100% {
              opacity: 0.2;
            }
            50% {
              opacity: 0.5;
            }
          }
          
          @keyframes pulse-medium {
            0%, 100% {
              opacity: 0.5;
              transform: scale(1) rotate(0deg);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.03) rotate(2deg);
            }
          }
          
          .animate-pulse-strong {
            animation: pulse-strong 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-pulse-slower {
            animation: pulse-slower 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-pulse-medium {
            animation: pulse-medium 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    </div>
  );
}