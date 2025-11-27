// Treasury Information Display Component
// Shows treasury wallet info for admin verification

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wallet, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getTreasuryInfo } from '../lib/claiming';

export function TreasuryInfo() {
  const [treasuryInfo, setTreasuryInfo] = useState<{
    address: string;
    balance: string;
    configured: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTreasuryInfo = async () => {
    setIsLoading(true);
    try {
      const info = await getTreasuryInfo();
      setTreasuryInfo(info);
    } catch (error) {
      console.error('Error loading treasury info:', error);
      setTreasuryInfo({
        address: 'Error',
        balance: '0',
        configured: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTreasuryInfo();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[#001F3F]/90 to-[#003366]/90 p-6 rounded-xl border-2 border-[#39FF14]/30 backdrop-blur-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#39FF14]" />
            <h3 className="text-white font-bold text-lg">Treasury Wallet Info</h3>
          </div>
          <Button
            onClick={loadTreasuryInfo}
            disabled={isLoading}
            size="sm"
            className="bg-[#39FF14]/20 hover:bg-[#39FF14]/30 text-[#39FF14] border border-[#39FF14]/40"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Status Badge */}
        {treasuryInfo && (
          <Badge 
            className={`${
              treasuryInfo.configured 
                ? 'bg-green-500/20 text-green-400 border-green-500/40' 
                : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}
          >
            {treasuryInfo.configured ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Configured
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Not Configured
              </>
            )}
          </Badge>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
          </div>
        )}

        {/* Treasury Info */}
        {!isLoading && treasuryInfo && (
          <div className="space-y-3">
            {/* Address */}
            <div className="bg-[#001F3F]/60 p-4 rounded-lg border border-white/10">
              <p className="text-white/60 text-xs mb-1">Wallet Address</p>
              <p className="text-white font-mono text-sm break-all">
                {treasuryInfo.address}
              </p>
            </div>

            {/* Balance */}
            <div className="bg-[#001F3F]/60 p-4 rounded-lg border border-white/10">
              <p className="text-white/60 text-xs mb-1">Balance</p>
              <p className="text-white font-mono text-sm">
                {treasuryInfo.balance}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-xs">
            ⚠️ <strong>Admin Only:</strong> This shows treasury wallet information. Ensure the wallet has sufficient ETH for gas and $BTRIBE tokens for claims.
          </p>
        </div>
      </div>
    </Card>
  );
}
