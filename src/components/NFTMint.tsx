// NFT Minting component - simplified for demo

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface NFTMintProps {
  tokenId: number;
  name: string;
  description: string;
  icon: 'believer' | 'founder';
  isConnected: boolean;
}

export function NFTMint({ tokenId, name, description, icon, isConnected }: NFTMintProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  const handleMint = async () => {
    try {
      setIsMinting(true);
      
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsMinted(true);
    } catch (error) {
      console.error('Mint error:', error);
    } finally {
      setIsMinting(false);
    }
  };

  const Icon = icon === 'believer' ? Sparkles : Shield;

  return (
    <Card className="bg-gradient-to-br from-[#7B2CBF] to-[#00D4FF] p-6 rounded-xl border-0 shadow-xl shadow-[#7B2CBF]/30">
      <div className="space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>

        {/* Benefits */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white/90 text-xs text-center">
            {icon === 'believer'
              ? '✨ Show your belief in Base and its tribe. Future benefits await holders.'
              : '🏅 Prove you are a founding member of Base Tribe. Exclusive benefits for holders.'}
          </p>
        </div>

        {/* Mint Button */}
        {!isConnected ? (
          <Button
            disabled
            className="w-full bg-white/20 text-white py-6 rounded-xl"
          >
            Connect Wallet to Claim
          </Button>
        ) : isMinted ? (
          <Button
            disabled
            className="w-full bg-[#39FF14] text-[#001F3F] py-6 rounded-xl font-bold"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Claimed Successfully!
          </Button>
        ) : (
          <Button
            onClick={handleMint}
            disabled={isMinting}
            className="w-full bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold py-6 rounded-xl shadow-lg shadow-[#39FF14]/30 transition-all"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              'CLAIM BADGE'
            )}
          </Button>
        )}

        {/* Warning */}
        <p className="text-xs text-white/60 text-center">
          ⚠️ Mint while you can. Remaining badges will be burned.
        </p>
      </div>
    </Card>
  );
}
