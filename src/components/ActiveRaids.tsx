// Active Raids Component - Displays live raids from Google Sheets

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Clock, Trophy, ExternalLink, Loader2, Users } from 'lucide-react';
import { CONFIG } from '@/lib/constants';

interface Raid {
  id: string;
  title: string;
  description: string;
  target_user: string;
  cast_link: string;
  reward_btribe: number;
  lucky_reward_usdc: number;
  status: string;
  posted_date: string;
  participants: number;
}

interface ActiveRaidsProps {
  isConnected: boolean;
  isMember: boolean;
  onNonMemberClick?: () => void;
}

export function ActiveRaids({ isConnected, isMember, onNonMemberClick }: ActiveRaidsProps) {
  const [raids, setRaids] = useState<Raid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRaids();
    
    // Refresh raids every 5 minutes
    const interval = setInterval(loadRaids, 300000);
    return () => clearInterval(interval);
  }, []);

  async function loadRaids() {
    try {
      setIsLoading(true);
      console.log('⚔️ Fetching active raids from Google Sheets...');
      
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=BASERAID`
      );
      
      if (!response.ok) {
        console.warn('⚠️ Failed to fetch raids');
        setRaids([]);
        return;
      }
      
      const text = await response.text();
      const jsonText = text.substring(47, text.length - 2);
      const data = JSON.parse(jsonText);
      
      const rows = data.table.rows;
      const activeRaids: Raid[] = [];
      
      // Skip header row, process data rows
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const status = row.c[9]?.v || ''; // Column J: Status
        
        // Only show active or vetted raids
        if (status.toLowerCase() === 'active' || status.toLowerCase() === 'vetted') {
          const raid: Raid = {
            id: `raid-${i}`,
            title: row.c[1]?.v || 'Community Raid', // Column B: Sponsor Username (use as title)
            description: `Follow @${row.c[5]?.v || 'user'} and engage with their cast`, // Column F: Target User
            target_user: row.c[5]?.v || '', // Column F: Target User
            cast_link: row.c[4]?.v || '', // Column E: Cast Link
            reward_btribe: parseFloat(row.c[7]?.v) || 0, // Column H: Reward BTRIBE
            lucky_reward_usdc: parseFloat(row.c[8]?.v) || 0, // Column I: Lucky Reward USDC
            status: status, // Column J: Status
            posted_date: row.c[10]?.v || '', // Column K: Posted Date
            participants: 0, // Would need to count from RaidParticipants sheet
          };
          
          activeRaids.push(raid);
        }
      }
      
      setRaids(activeRaids);
      console.log(`✅ Loaded ${activeRaids.length} active raids`);
    } catch (error) {
      console.error('❌ Error loading raids:', error);
      setRaids([]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="ml-3 text-white/60">Loading raids...</span>
        </div>
      </Card>
    );
  }

  if (raids.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-6 border border-purple-500/20">
        <div className="text-center py-8">
          <Swords className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">No active raids at the moment</p>
          <p className="text-white/40 text-sm mt-2">New raids are posted daily!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Swords className="w-5 h-5 text-purple-400" />
          Base Raids
        </h3>
        <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {raids.length} Active
        </Badge>
      </div>

      <div className="grid gap-4">
        {raids.map((raid) => (
          <Card
            key={raid.id}
            className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all"
          >
            {/* Raid Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-white">Daily Community Raid</h4>
                  <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {raid.status === 'vetted' ? 'Vetting Complete' : 'Active'}
                  </Badge>
                </div>
                <p className="text-white/70 text-sm">{raid.description}</p>
              </div>
            </div>

            {/* Target and Rewards */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-white/80">Target: </span>
                <span className="text-purple-400 font-bold">@{raid.target_user}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {raid.reward_btribe > 0 && (
                  <div className="flex items-center gap-2 bg-[#39FF14]/10 rounded-lg px-3 py-1.5">
                    <Trophy className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-[#39FF14] font-bold text-sm">
                      {raid.reward_btribe.toLocaleString()} $BTRIBE
                    </span>
                  </div>
                )}
                {raid.lucky_reward_usdc > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-500/10 rounded-lg px-3 py-1.5">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">
                      ${raid.lucky_reward_usdc.toFixed(2)} USDC Lucky Draw
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Posted Date */}
            {raid.posted_date && (
              <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                <Clock className="w-4 h-4" />
                <span>Posted: {new Date(raid.posted_date).toLocaleString()}</span>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={() => {
                if (!isConnected) {
                  alert('Please connect your wallet first');
                  return;
                }
                if (!isMember && onNonMemberClick) {
                  onNonMemberClick();
                  return;
                }
                if (raid.cast_link) {
                  window.open(raid.cast_link, '_blank');
                }
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl"
            >
              {!isConnected ? (
                'Connect Wallet to Join Raid'
              ) : !isMember ? (
                'Join Community to Participate'
              ) : raid.status === 'vetted' ? (
                'Vetting Complete - Results Posted'
              ) : (
                <>
                  Join Raid Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Info Note */}
            <div className="mt-3 text-center text-white/50 text-xs">
              {raid.status === 'vetted' 
                ? 'Rewards distributed to verified participants'
                : 'Follow, like, recast & comment to qualify for rewards'}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
