// Token scroller component - displays BTRIBE token info at the top

import { CONFIG } from '@/lib/constants';

export function TokenScroller() {
  return (
    <div className="w-full bg-gradient-to-r from-[#7B2CBF] via-[#00D4FF] to-[#7B2CBF] py-3 overflow-hidden">
      <div className="animate-scroll flex whitespace-nowrap">
        <div className="flex items-center gap-8 px-4">
          <span className="text-white font-medium">$BTRIBE</span>
          <span className="text-[#39FF14]">
            CA: {CONFIG.BTRIBE_TOKEN_ADDRESS.slice(0, 6)}...{CONFIG.BTRIBE_TOKEN_ADDRESS.slice(-4)}
          </span>
          <span className="text-white">•</span>
          <span className="text-white/90 text-sm italic">Base Tribe is not affiliated with the Official Base</span>
          <span className="text-white">•</span>
          <span className="text-white font-medium">$BTRIBE</span>
          <span className="text-[#39FF14]">
            CA: {CONFIG.BTRIBE_TOKEN_ADDRESS.slice(0, 6)}...{CONFIG.BTRIBE_TOKEN_ADDRESS.slice(-4)}
          </span>
          <span className="text-white">•</span>
          <span className="text-white/90 text-sm italic">Base Tribe is not affiliated with the Official Base</span>
          <span className="text-white">•</span>
          <span className="text-white font-medium">$BTRIBE</span>
          <span className="text-[#39FF14]">
            CA: {CONFIG.BTRIBE_TOKEN_ADDRESS.slice(0, 6)}...{CONFIG.BTRIBE_TOKEN_ADDRESS.slice(-4)}
          </span>
        </div>
        <div className="flex items-center gap-8 px-4">
          <span className="text-white font-medium">$BTRIBE</span>
          <span className="text-[#39FF14]">
            CA: {CONFIG.BTRIBE_TOKEN_ADDRESS.slice(0, 6)}...{CONFIG.BTRIBE_TOKEN_ADDRESS.slice(-4)}
          </span>
          <span className="text-white">•</span>
          <span className="text-white/90 text-sm italic">Base Tribe is not affiliated with the Official Base</span>
          <span className="text-white">•</span>
          <span className="text-white font-medium">$BTRIBE</span>
          <span className="text-[#39FF14]">
            CA: {CONFIG.BTRIBE_TOKEN_ADDRESS.slice(0, 6)}...{CONFIG.BTRIBE_TOKEN_ADDRESS.slice(-4)}
          </span>
          <span className="text-white">•</span>
          <span className="text-white/90 text-sm italic">Base Tribe is not affiliated with the Official Base</span>
          <span className="text-white">•</span>
          <span className="text-white font-medium">$BTRIBE</span>
          <span className="text-[#39FF14]">
            CA: {CONFIG.BTRIBE_TOKEN_ADDRESS.slice(0, 6)}...{CONFIG.BTRIBE_TOKEN_ADDRESS.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
}