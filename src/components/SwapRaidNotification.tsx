import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sword, ExternalLink, Calendar, Clock, Coins, Zap } from 'lucide-react';
import { fetchRaidData } from '../lib/api';

export function SwapRaidNotification() {
  const [raidData, setRaidData] = useState<{
    raidTitle: string;
    raidDescription: string;
    raidLink: string;
    raidDate: string;
    raidTime: string;
    raidReward: string;
    raidStatus: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRaidData();
    // Refresh raid data every 5 minutes
    const interval = setInterval(loadRaidData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadRaidData = async () => {
    try {
      const data = await fetchRaidData();
      setRaidData(data);
    } catch (error) {
      console.error('Error loading raid data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#7B2CBF]/10 to-[#00D4FF]/10 p-4 rounded-xl border border-[#7B2CBF]/20 mb-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 bg-white/10 rounded w-1/4 mb-2"></div>
            <div className="h-2 bg-white/10 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!raidData || raidData.raidStatus === 'completed') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-[#7B2CBF]/10 to-[#00D4FF]/10 p-4 rounded-xl border-2 border-[#7B2CBF]/30 mb-4 shadow-lg shadow-[#7B2CBF]/10 relative overflow-hidden">
      {/* Glowing effect */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#7B2CBF]/20 rounded-full blur-2xl animate-pulse-glow"></div>
      <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-[#00D4FF]/20 rounded-full blur-2xl animate-pulse-glow-delayed"></div>
      
      <div className="relative z-10">
        {/* Header with Raid Master Avatar - Compact Version */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7B2CBF] to-[#00D4FF] rounded-full flex items-center justify-center border-2 border-[#39FF14] shadow-lg shadow-[#39FF14]/30">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#39FF14] rounded-full border-2 border-[#001F3F] animate-pulse"></div>
          </div>

          {/* Raid Master Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-white font-bold text-sm">Raid Master</h4>
              <Badge className="bg-[#7B2CBF] text-white text-xs px-1.5 py-0">
                <Zap className="w-2.5 h-2.5 mr-0.5 inline" />
                BOT
              </Badge>
            </div>
            <p className="text-[#39FF14] text-xs">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>

          {/* Status Badge */}
          <Badge className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white text-xs font-bold animate-pulse-subtle flex-shrink-0">
            🔥 NEW
          </Badge>
        </div>

        {/* Chat Bubble - Compact */}
        <div className="bg-gradient-to-br from-[#001F3F]/70 to-[#002855]/70 backdrop-blur-sm p-4 rounded-xl rounded-tl-none border border-white/10 shadow-lg">
          {/* Raid Title */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-gradient-to-b from-[#39FF14] to-[#7B2CBF] rounded-full"></div>
            <h3 className="text-white font-bold text-base">
              🚨 {raidData.raidTitle}
            </h3>
          </div>

          {/* Raid Description */}
          <p className="text-white/90 mb-3 text-sm leading-relaxed">
            {raidData.raidDescription}
          </p>

          {/* Raid Info - Inline */}
          <div className="flex flex-wrap gap-3 mb-3">
            {raidData.raidDate && (
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span className="text-white text-xs font-medium">{raidData.raidDate}</span>
              </div>
            )}

            {raidData.raidTime && (
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5 text-[#7B2CBF]" />
                <span className="text-white text-xs font-medium">{raidData.raidTime}</span>
              </div>
            )}

            {raidData.raidReward && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#39FF14]/20 to-[#7B2CBF]/20 px-3 py-1.5 rounded-lg border border-[#39FF14]/30">
                <Coins className="w-3.5 h-3.5 text-[#39FF14]" />
                <span className="text-[#39FF14] text-xs font-bold">{raidData.raidReward}</span>
              </div>
            )}
          </div>

          {/* Call to Action - Compact */}
          <div className="bg-gradient-to-r from-[#7B2CBF]/20 to-[#00D4FF]/20 p-3 rounded-lg border border-[#00D4FF]/30 mb-3">
            <p className="text-white/90 text-xs leading-relaxed">
              💪 <strong>Participate now!</strong> Join this raid to earn rewards and help pump community value together! 🚀
            </p>
          </div>

          {/* Join Raid Button - Compact */}
          {raidData.raidLink && (
            <a 
              href={raidData.raidLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-gradient-to-r from-[#7B2CBF] to-[#00D4FF] hover:from-[#6A24A8] hover:to-[#00B8E6] text-white font-bold py-2.5 rounded-lg shadow-md shadow-[#7B2CBF]/30 transition-all hover:shadow-[#7B2CBF]/50 hover:scale-[1.02] text-sm">
                <Sword className="w-4 h-4 mr-2" />
                Join Raid Now
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Button>
            </a>
          )}
        </div>

        {/* Footer indicator */}
        <div className="flex items-center gap-1 mt-2 ml-12">
          <div className="text-white/30 text-xs">Monitoring raid activity...</div>
        </div>
      </div>
    </Card>
  );
}
