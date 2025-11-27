import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sword, ExternalLink, Calendar, Clock, Coins, Zap } from 'lucide-react';
import { fetchRaidData } from '../lib/api';

export function RaidMasterNotification() {
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
      <Card className="bg-gradient-to-br from-[#7B2CBF]/20 to-[#00D4FF]/20 p-6 rounded-xl border border-[#7B2CBF]/30 max-w-4xl mx-auto">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!raidData || raidData.raidStatus === 'completed') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-[#7B2CBF]/20 to-[#00D4FF]/20 p-6 rounded-xl border-2 border-[#7B2CBF]/50 max-w-4xl mx-auto shadow-lg shadow-[#7B2CBF]/20 relative overflow-hidden">
      {/* Glowing effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#7B2CBF]/30 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00D4FF]/30 rounded-full blur-3xl animate-pulse-glow-delayed"></div>
      
      <div className="relative z-10">
        {/* Header with Raid Master Avatar */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B2CBF] to-[#00D4FF] rounded-full flex items-center justify-center border-2 border-[#39FF14] shadow-lg shadow-[#39FF14]/50">
              <Sword className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#39FF14] rounded-full border-2 border-[#001F3F] animate-pulse"></div>
          </div>

          {/* Raid Master Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-bold">Raid Master</h4>
              <Badge className="bg-[#7B2CBF] text-white text-xs px-2 py-0.5">
                <Zap className="w-3 h-3 mr-1 inline" />
                BOT
              </Badge>
            </div>
            <p className="text-[#39FF14] text-xs font-medium">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>

          {/* Status Badge */}
          <Badge className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white font-bold animate-pulse-subtle">
            🔥 LIVE
          </Badge>
        </div>

        {/* Chat Bubble */}
        <div className="bg-gradient-to-br from-[#001F3F]/80 to-[#002855]/80 backdrop-blur-sm p-5 rounded-2xl rounded-tl-none border border-white/10 shadow-xl">
          {/* Raid Title */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-gradient-to-b from-[#39FF14] to-[#7B2CBF] rounded-full"></div>
            <h3 className="text-white font-bold text-lg">
              🚨 {raidData.raidTitle}
            </h3>
          </div>

          {/* Raid Description */}
          <p className="text-white/90 mb-4 leading-relaxed">
            {raidData.raidDescription}
          </p>

          {/* Raid Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {raidData.raidDate && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-white/60 text-xs">Date</span>
                </div>
                <p className="text-white font-medium text-sm">{raidData.raidDate}</p>
              </div>
            )}

            {raidData.raidTime && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[#7B2CBF]" />
                  <span className="text-white/60 text-xs">Time</span>
                </div>
                <p className="text-white font-medium text-sm">{raidData.raidTime}</p>
              </div>
            )}
          </div>

          {/* Reward Info */}
          {raidData.raidReward && (
            <div className="bg-gradient-to-r from-[#39FF14]/10 to-[#7B2CBF]/10 p-4 rounded-lg border border-[#39FF14]/30 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-[#39FF14]" />
                <span className="text-white font-bold">Raid Reward</span>
              </div>
              <p className="text-[#39FF14] font-bold text-lg">{raidData.raidReward}</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-[#7B2CBF]/20 to-[#00D4FF]/20 p-4 rounded-lg border border-[#00D4FF]/30 mb-4">
            <p className="text-white/90 text-sm mb-3">
              💪 <strong>Let's pump community value together!</strong> Join this raid to earn rewards and strengthen our tribe.
            </p>
            <div className="flex items-center gap-2 text-[#39FF14] text-xs">
              <Zap className="w-4 h-4" />
              <span>Quick participation = Maximum rewards</span>
            </div>
          </div>

          {/* Join Raid Button */}
          {raidData.raidLink && (
            <a 
              href={raidData.raidLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-gradient-to-r from-[#7B2CBF] to-[#00D4FF] hover:from-[#6A24A8] hover:to-[#00B8E6] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#7B2CBF]/30 transition-all hover:shadow-[#7B2CBF]/50 hover:scale-[1.02]">
                <Sword className="w-5 h-5 mr-2" />
                Join Raid Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          )}
        </div>

        {/* Typing indicator (optional decorative element) */}
        <div className="flex items-center gap-1 mt-2 ml-16">
          <div className="text-white/40 text-xs">Raid Master is monitoring engagement...</div>
        </div>
      </div>
    </Card>
  );
}
