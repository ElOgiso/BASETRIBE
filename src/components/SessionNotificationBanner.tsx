// Session Notification Banner - Scrolling marquee reminder

'use client';

export function SessionNotificationBanner() {
  return (
    <div className="relative overflow-hidden bg-black border-y border-white/10 py-3 animate-background-pulse">
      {/* Animated red glow shadow */}
      <div className="absolute inset-0 animate-red-glow pointer-events-none" style={{ boxShadow: '0 0 20px rgba(255,0,0,0.4)' }} />
      
      {/* Neon glow edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black via-black/50 to-transparent z-10 pointer-events-none animate-edge-fade-left" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black via-black/50 to-transparent z-10 pointer-events-none animate-edge-fade-right" />
      
      {/* Subtle top/bottom glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B30]/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FF3B30]/30 to-transparent" />
      
      {/* Scrolling content */}
      <div className="flex animate-scroll-mission-fast whitespace-nowrap">
        {/* Triple content for seamless loop */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-6">
            {/* Red pulsing dot */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-[#FF3B30] rounded-full blur-md animate-pulse-dot" />
              <div className="relative w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse-dot" />
            </div>
            
            {/* Text content with color animation */}
            <p className="font-medium animate-text-invert">
              <span className="text-[#FF3B30] font-bold">Important:</span>{' '}
              <span>Always claim your daily session rewards </span>
              <span className="text-[#FF3B30] font-bold">$BTRIBE</span>
              <span> </span>
              <span className="text-[#FF3B30] font-bold">$JESSE</span>
              <span> </span>
              <span className="text-[#FF3B30] font-bold">$USDC</span>
              <span> — to unlock </span>
              <span className="font-bold">Reward Boosters</span>
              <span> with session streaks. Participate in daily raids for a chance of USDC random drops from raid sponsors. Only raiders earn $USDC.</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}