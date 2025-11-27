// Active Mission Card - Shows current active mission from Google Sheets

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Trophy, ExternalLink, Loader2, Zap } from 'lucide-react';
import { CONFIG } from '@/lib/constants';

interface Mission {
  title: string;
  description: string;
  reward: number;
  deadline: string;
  link: string;
  status: string;
}

interface ActiveMissionCardProps {
  isConnected: boolean;
  isMember: boolean;
  onNonMemberClick?: () => void;
}

export function ActiveMissionCard({ isConnected, isMember, onNonMemberClick }: ActiveMissionCardProps) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    loadActiveMission();
    
    // Refresh every 10 minutes
    const interval = setInterval(loadActiveMission, 600000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!mission?.deadline) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const deadline = new Date(mission.deadline).getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [mission]);

  async function loadActiveMission() {
    try {
      setIsLoading(true);
      console.log('🎯 Fetching active mission from Google Sheets...');
      
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Missions`
      );
      
      if (!response.ok) {
        console.warn('⚠️ Failed to fetch missions');
        setMission(null);
        return;
      }
      
      const text = await response.text();
      const jsonText = text.substring(47, text.length - 2);
      const data = JSON.parse(jsonText);
      
      const rows = data.table.rows;
      
      // Find the first active mission
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const status = row.c[6]?.v || ''; // Column G: Status
        
        if (status.toLowerCase() === 'active') {
          const activeMission: Mission = {
            title: row.c[1]?.v || 'Active Mission', // Column B: Title
            description: row.c[2]?.v || '', // Column C: Description
            reward: parseFloat(row.c[3]?.v) || 0, // Column D: $BTRIBE Reward
            deadline: row.c[5]?.v || '', // Column F: Deadline
            link: row.c[7]?.v || '', // Column H: Link
            status: status, // Column G: Status
          };
          
          setMission(activeMission);
          console.log('✅ Active mission loaded:', activeMission.title);
          break;
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading mission:', error);
      setMission(null);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-2xl p-6 border border-[#39FF14]/20">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
          <span className="ml-3 text-white/60">Loading active mission...</span>
        </div>
      </Card>
    );
  }

  if (!mission) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-2xl p-6 border border-[#39FF14]/20">
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">No active mission at the moment</p>
          <p className="text-white/40 text-sm mt-2">Check back soon for new opportunities!</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#003366] rounded-2xl border-2 border-[#39FF14]/30">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-full bg-[#39FF14]/20 flex items-center justify-center"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Target className="w-6 h-6 text-[#39FF14]" />
              </motion.div>
              <div>
                <Badge className="bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30 mb-2">
                  ACTIVE MISSION
                </Badge>
                <h3 className="text-white font-bold text-xl">{mission.title}</h3>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm mb-4 leading-relaxed">
            {mission.description}
          </p>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {/* Reward */}
            <motion.div
              className="flex items-center gap-2 bg-gradient-to-r from-[#39FF14]/20 to-[#2ECC11]/20 rounded-lg px-4 py-2 border border-[#39FF14]/30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Trophy className="w-5 h-5 text-[#39FF14]" />
              <div>
                <p className="text-white/60 text-xs">Reward</p>
                <p className="text-[#39FF14] font-bold text-lg">
                  {mission.reward.toLocaleString()} $BTRIBE
                </p>
              </div>
            </motion.div>

            {/* Time Left */}
            {timeLeft && (
              <motion.div
                className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2"
                animate={{
                  borderColor: ['rgba(57, 255, 20, 0.3)', 'rgba(57, 255, 20, 0)', 'rgba(57, 255, 20, 0.3)'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                style={{ border: '1px solid' }}
              >
                <Clock className="w-5 h-5 text-[#00D4FF]" />
                <div>
                  <p className="text-white/60 text-xs">Time Left</p>
                  <p className="text-[#00D4FF] font-bold">{timeLeft}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
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
                if (mission.link) {
                  window.open(mission.link, '_blank');
                }
              }}
              className="w-full bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold py-4 rounded-xl shadow-lg shadow-[#39FF14]/30"
            >
              {!isConnected ? (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Connect Wallet to Start Mission
                </>
              ) : !isMember ? (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Join Community to Participate
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Start Mission Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Info Text */}
          <motion.p
            className="text-center text-white/50 text-xs mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Complete the mission before the deadline to earn your reward
          </motion.p>
        </div>

        {/* Glowing Border Animation */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.5), transparent)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      </Card>
    </motion.div>
  );
}
