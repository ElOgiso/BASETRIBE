// Community Stats Component - Shows live community statistics

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Users, TrendingUp, Trophy, Zap, Loader2 } from 'lucide-react';
import { CONFIG } from '@/lib/constants';

interface CommunityStats {
  totalMembers: number;
  activeToday: number;
  totalBtribeDistributed: number;
  totalSessions: number;
}

export function CommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    
    // Refresh stats every 2 minutes for more real-time updates
    const interval = setInterval(loadStats, 120000); // 2 minutes instead of 30
    return () => clearInterval(interval);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Loading community stats...');
      
      // Use Google Visualization API (gviz) - works with public sheets without API key
      let retries = 3;
      let lastError;
      
      for (let i = 0; i < retries; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
          
          const response = await fetch(
            `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Users&timestamp=${Date.now()}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json, text/plain, */*',
              },
              mode: 'cors',
              cache: 'no-cache',
              signal: controller.signal,
            }
          );
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const text = await response.text();
          const jsonText = text.substring(47, text.length - 2);
          const data = JSON.parse(jsonText);
          
          const rows = data.table.rows;
          
          if (!rows || rows.length < 2) {
            throw new Error('No data returned from Google Sheets');
          }
          
          // Calculate stats from user data
          let totalMembers = 0;
          let activeToday = 0;
          let totalBtribeInCirculation = 0;
          let totalSessions = 0;
          
          const today = new Date().toISOString().split('T')[0];
          
          console.log('📊 Calculating stats from', rows.length - 1, 'rows...');
          
          for (let j = 1; j < rows.length; j++) { // Skip header row
            const row = rows[j];
            const fid = row.c[3]?.v; // Column D: Farcaster_fid
            
            if (fid) {
              totalMembers++;
              
              // Column F: last_engaged_date (index 5)
              const lastEngaged = row.c[5]?.v;
              if (lastEngaged && lastEngaged.startsWith(today)) {
                activeToday++;
              }
              
              // Column K: BTribe_Balance (index 10)
              const btribeBalance = parseFloat(row.c[10]?.v) || 0;
              totalBtribeInCirculation += btribeBalance;
              
              // Column E: session_streak (index 4)
              const sessionStreak = parseInt(row.c[4]?.v) || 0;
              totalSessions += sessionStreak;
            }
          }
          
          setStats({
            totalMembers,
            activeToday,
            totalBtribeDistributed: Math.round(totalBtribeInCirculation),
            totalSessions,
          });
          
          console.log('✅ Community stats loaded:', {
            totalMembers,
            activeToday,
            totalBtribeInCirculation: Math.round(totalBtribeInCirculation),
            totalSessions,
          });
          
          return; // Success! Exit the retry loop
        } catch (fetchError) {
          lastError = fetchError;
          console.warn(`⚠️ Attempt ${i + 1}/${retries} failed:`, fetchError);
          
          if (i < retries - 1) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
      
      // If we get here, all retries failed
      throw lastError || new Error('Failed to load community stats after multiple attempts');
    } catch (error) {
      console.error('❌ Error loading community stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load stats');
      
      // Set fallback stats if data fails to load
      if (!stats) {
        setStats({
          totalMembers: 0,
          activeToday: 0,
          totalBtribeDistributed: 0,
          totalSessions: 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 text-[#39FF14] animate-spin" />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Members */}
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-xl p-4 border border-white/10 hover:border-[#39FF14]/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#39FF14]/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#39FF14]" />
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide">Members</p>
            <p className="text-white text-2xl font-bold">{stats.totalMembers}</p>
          </div>
        </div>
      </Card>

      {/* Active Today */}
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-xl p-4 border border-white/10 hover:border-[#39FF14]/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide">Active Today</p>
            <p className="text-white text-2xl font-bold">{stats.activeToday}</p>
          </div>
        </div>
      </Card>

      {/* Total $BTRIBE */}
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-xl p-4 border border-white/10 hover:border-[#39FF14]/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide">$BTRIBE</p>
            <p className="text-white text-2xl font-bold">
              {stats.totalBtribeDistributed.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Total Sessions */}
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 rounded-xl p-4 border border-white/10 hover:border-[#39FF14]/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide">Sessions</p>
            <p className="text-white text-2xl font-bold">{stats.totalSessions.toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}