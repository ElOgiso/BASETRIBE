// Leaderboard component - displays top community members

'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Coins, Users, Clock } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardView({ leaderboard }: LeaderboardViewProps) {
  // Safely sort and filter valid entries
  const safeSort = (arr: LeaderboardEntry[], key: keyof LeaderboardEntry) => {
    return [...arr]
      .filter(entry => entry && typeof entry[key] === 'number' && !isNaN(entry[key] as number))
      .sort((a, b) => {
        const aVal = (a[key] as number) || 0;
        const bVal = (b[key] as number) || 0;
        return bVal - aVal;
      })
      .slice(0, 10)
      .map((entry, index) => ({ ...entry, rank: index + 1 })); // Assign rank based on position
  };

  const topStars = safeSort(leaderboard, 'stars');
  const topBalance = safeSort(leaderboard, 'btribe_balance');
  const topInvites = safeSort(leaderboard, 'invites_count');

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-[#FFD700]'; // Gold
    if (rank === 2) return 'text-[#C0C0C0]'; // Silver
    if (rank === 3) return 'text-[#CD7F32]'; // Bronze
    return 'text-white/60';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className={`w-5 h-5 ${getRankColor(rank)}`} />;
    return <span className="text-white/60 font-bold">#{rank}</span>;
  };

  const LeaderboardList = ({ entries, type }: { entries: LeaderboardEntry[]; type: 'stars' | 'balance' | 'invites' }) => (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <Card key={index} className="bg-[#001F3F]/50 border border-white/10 p-4 rounded-xl hover:bg-[#001F3F]/70 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              
              {/* Profile Image */}
              {entry.profile_image && (
                <img 
                  src={entry.profile_image} 
                  alt={entry.display_name || entry.farcaster_username}
                  className="w-10 h-10 rounded-full border-2 border-[#39FF14]/30 object-cover"
                />
              )}
              
              <div>
                <p className="text-white font-medium">
                  {entry.display_name || entry.farcaster_username}
                </p>
                {entry.display_name && entry.farcaster_username && (
                  <p className="text-white/40 text-xs">@{entry.farcaster_username}</p>
                )}
                <p className="text-white/50 text-xs">
                  {type === 'stars' && `${entry.stars || 0} ⭐ / ${entry.defaults || 0} ⚠️`}
                  {type === 'balance' && `${(entry.btribe_balance || 0).toLocaleString()} $BTRIBE`}
                  {type === 'invites' && `${entry.invites_count || 0} invites`}
                </p>
              </div>
            </div>
            <div className="text-right">
              {type === 'stars' && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#FFD700]" />
                  <span className="text-[#39FF14] font-bold">{entry.stars || 0}</span>
                </div>
              )}
              {type === 'balance' && (
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-[#39FF14]" />
                  <span className="text-[#39FF14] font-bold">{(entry.btribe_balance || 0).toLocaleString()}</span>
                </div>
              )}
              {type === 'invites' && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-[#00D4FF] font-bold">{entry.invites_count || 0}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🏆 Community Leaderboard</h2>
        <p className="text-white/60 text-sm">Top performers in the Base Tribe</p>
        
        {/* Live Data Indicator */}
        {leaderboard.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 bg-[#39FF14]/20 border border-[#39FF14]/30 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
              <span className="text-[#39FF14] text-xs font-medium">
                LIVE DATA • Updates hourly
              </span>
            </div>
          </div>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <Card className="bg-[#001F3F]/50 p-8 rounded-xl border border-white/10 text-center">
          <Clock className="w-12 h-12 mx-auto text-white/40 mb-3" />
          <p className="text-white/60">Loading leaderboard data...</p>
          <p className="text-white/40 text-sm mt-2">Fetching from Google Sheets</p>
        </Card>
      ) : (
        <Tabs defaultValue="stars" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#001F3F]/50 p-1 rounded-xl">
            <TabsTrigger
              value="stars"
              className="data-[state=active]:bg-[#7B2CBF] data-[state=active]:text-white rounded-lg"
            >
              <Star className="w-4 h-4 mr-2" />
              Stars
            </TabsTrigger>
            <TabsTrigger
              value="balance"
              className="data-[state=active]:bg-[#7B2CBF] data-[state=active]:text-white rounded-lg"
            >
              <Coins className="w-4 h-4 mr-2" />
              Balance
            </TabsTrigger>
            <TabsTrigger
              value="invites"
              className="data-[state=active]:bg-[#7B2CBF] data-[state=active]:text-white rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Invites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stars" className="mt-4">
            <LeaderboardList entries={topStars} type="stars" />
          </TabsContent>

          <TabsContent value="balance" className="mt-4">
            <LeaderboardList entries={topBalance} type="balance" />
          </TabsContent>

          <TabsContent value="invites" className="mt-4">
            <LeaderboardList entries={topInvites} type="invites" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}