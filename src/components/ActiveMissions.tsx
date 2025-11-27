// Active Missions Component - Displays live missions from Google Sheets

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Coins, ExternalLink, Loader2 } from 'lucide-react';
import { CONFIG } from '@/lib/constants';

interface Mission {
  id: string;
  title: string;
  description: string;
  reward_btribe: number;
  reward_jesse: number;
  deadline: string;
  status: string;
  link?: string;
  participants: number;
}

interface ActiveMissionsProps {
  isConnected: boolean;
  isMember: boolean;
  onNonMemberClick?: () => void;
}

export function ActiveMissions({ isConnected, isMember, onNonMemberClick }: ActiveMissionsProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMissions();
    
    // Refresh missions every 10 minutes
    const interval = setInterval(loadMissions, 600000);
    return () => clearInterval(interval);
  }, []);

  async function loadMissions() {
    try {
      setIsLoading(true);
      console.log('📋 Fetching active missions from Google Sheets...');
      
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Missions`
      );
      
      if (!response.ok) {
        console.warn('⚠️ Failed to fetch missions');
        setMissions([]);
        return;
      }
      
      const text = await response.text();
      const jsonText = text.substring(47, text.length - 2);
      const data = JSON.parse(jsonText);
      
      const rows = data.table.rows;
      const activeMissions: Mission[] = [];
      
      // Skip header row, process data rows
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const status = row.c[6]?.v || ''; // Column G: Status
        
        // Only show active missions
        if (status.toLowerCase() === 'active') {
          const mission: Mission = {
            id: row.c[0]?.v || `mission-${i}`, // Column A: ID
            title: row.c[1]?.v || 'Untitled Mission', // Column B: Title
            description: row.c[2]?.v || '', // Column C: Description
            reward_btribe: parseFloat(row.c[3]?.v) || 0, // Column D: $BTRIBE Reward
            reward_jesse: parseFloat(row.c[4]?.v) || 0, // Column E: $JESSE Reward
            deadline: row.c[5]?.v || '', // Column F: Deadline
            status: status, // Column G: Status
            link: row.c[7]?.v || '', // Column H: Link
            participants: parseInt(row.c[8]?.v) || 0, // Column I: Participants
          };
          
          activeMissions.push(mission);
        }
      }
      
      setMissions(activeMissions);
      console.log(`✅ Loaded ${activeMissions.length} active missions`);
    } catch (error) {
      console.error('❌ Error loading missions:', error);
      setMissions([]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-2xl p-6 border border-[#39FF14]/20">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
          <span className="ml-3 text-white/60">Loading missions...</span>
        </div>
      </Card>
    );
  }

  if (missions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-2xl p-6 border border-[#39FF14]/20">
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">No active missions at the moment</p>
          <p className="text-white/40 text-sm mt-2">Check back soon for new opportunities!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-[#39FF14]" />
          Active Missions
        </h3>
        <Badge className="bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30">
          {missions.length} Available
        </Badge>
      </div>

      <div className="grid gap-4">
        {missions.map((mission) => (
          <Card
            key={mission.id}
            className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-2xl p-6 border border-[#39FF14]/20 hover:border-[#39FF14]/40 transition-all"
          >
            {/* Mission Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-2">{mission.title}</h4>
                <p className="text-white/70 text-sm">{mission.description}</p>
              </div>
              <Badge className="bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30 ml-4">
                Active
              </Badge>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {mission.reward_btribe > 0 && (
                <div className="flex items-center gap-2 bg-[#39FF14]/10 rounded-lg px-3 py-2">
                  <Coins className="w-4 h-4 text-[#39FF14]" />
                  <span className="text-[#39FF14] font-bold text-sm">
                    {mission.reward_btribe.toLocaleString()} $BTRIBE
                  </span>
                </div>
              )}
              {mission.reward_jesse > 0 && (
                <div className="flex items-center gap-2 bg-purple-500/10 rounded-lg px-3 py-2">
                  <Coins className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-bold text-sm">
                    {mission.reward_jesse.toLocaleString()} $JESSE
                  </span>
                </div>
              )}
            </div>

            {/* Deadline and Participants */}
            <div className="flex items-center justify-between text-sm mb-4">
              {mission.deadline && (
                <div className="flex items-center gap-2 text-white/60">
                  <Clock className="w-4 h-4" />
                  <span>Ends: {new Date(mission.deadline).toLocaleDateString()}</span>
                </div>
              )}
              {mission.participants > 0 && (
                <div className="text-white/60">
                  {mission.participants} participants
                </div>
              )}
            </div>

            {/* Action Button */}
            {mission.link ? (
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
                  window.open(mission.link, '_blank');
                }}
                className="w-full bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold rounded-xl"
              >
                {!isConnected ? (
                  'Connect Wallet to Participate'
                ) : !isMember ? (
                  'Join Community to Participate'
                ) : (
                  <>
                    Participate Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <div className="text-center text-white/40 text-sm py-2">
                Details coming soon
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
