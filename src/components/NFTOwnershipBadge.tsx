import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Sparkles, CheckCircle } from 'lucide-react';
import { checkBadgeOwnership, fetchNFTMetadata, NFT_CONFIG } from '../lib/nft';
import type { NFTMetadata } from '../lib/nft';

interface NFTOwnershipBadgeProps {
  walletAddress: string | null;
  isConnected: boolean;
}

export function NFTOwnershipBadge({ walletAddress, isConnected }: NFTOwnershipBadgeProps) {
  const [ownership, setOwnership] = useState<{ founder: number; believer: number } | null>(null);
  const [founderMetadata, setFounderMetadata] = useState<NFTMetadata | null>(null);
  const [believerMetadata, setBelieverMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadOwnershipData();
    } else {
      setOwnership(null);
    }
  }, [walletAddress, isConnected]);

  const loadOwnershipData = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      // Fetch ownership and metadata in parallel
      const [ownershipData, founderMeta, believerMeta] = await Promise.all([
        checkBadgeOwnership(walletAddress),
        fetchNFTMetadata(NFT_CONFIG.TOKENS.FOUNDER.metadataUrl),
        fetchNFTMetadata(NFT_CONFIG.TOKENS.BELIEVER.metadataUrl),
      ]);

      setOwnership(ownershipData);
      setFounderMetadata(founderMeta);
      setBelieverMetadata(believerMeta);
    } catch (error) {
      console.error('Error loading ownership data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected || !walletAddress) {
    return null;
  }

  const hasFounder = ownership && ownership.founder > 0;
  const hasBeliever = ownership && ownership.believer > 0;
  const hasAny = hasFounder || hasBeliever;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded animate-pulse mb-2 w-32" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-24" />
          </div>
        </div>
      </Card>
    );
  }

  if (!hasAny) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F]/50 to-[#003366]/50 p-4 rounded-xl border border-[#7B2CBF]/30 backdrop-blur-sm hover:border-[#7B2CBF]/60 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7B2CBF]/20 to-[#00D4FF]/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white/40" />
          </div>
          <div className="flex-1">
            <p className="text-white/90 text-sm font-medium mb-1">
              <span className="text-[#7B2CBF]">Exclusive</span> Membership Awaits
            </p>
            <p className="text-white/60 text-xs leading-relaxed">
              Unlock early access to future projects & tools ↓
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {hasFounder && founderMetadata && (
        <Card className="bg-gradient-to-br from-[#7B2CBF]/20 via-[#5A1F9A]/20 to-[#7B2CBF]/20 p-4 rounded-xl border-2 border-[#7B2CBF]/50 backdrop-blur-sm relative overflow-hidden group hover:border-[#7B2CBF] transition-all">
          {/* Premium animated border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#7B2CBF]/0 via-[#7B2CBF]/30 to-[#7B2CBF]/0 animate-shimmer pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#7B2CBF]/50 shadow-lg shadow-[#7B2CBF]/30 flex-shrink-0">
              {founderMetadata.image && (
                <img 
                  src={founderMetadata.image} 
                  alt="Founder Badge" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-[#39FF14] flex-shrink-0" />
                <p className="text-white font-bold text-sm truncate">Base Tribe Founder</p>
              </div>
              <p className="text-[#7B2CBF] text-xs font-medium">
                You own {ownership.founder} {ownership.founder === 1 ? 'badge' : 'badges'} 🎖️
              </p>
            </div>
            <Badge className="bg-[#7B2CBF] text-white border-0 flex-shrink-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Founder
            </Badge>
          </div>
        </Card>
      )}

      {hasBeliever && believerMetadata && (
        <Card className="bg-gradient-to-br from-[#00D4FF]/20 via-[#0099CC]/20 to-[#00D4FF]/20 p-4 rounded-xl border-2 border-[#00D4FF]/50 backdrop-blur-sm relative overflow-hidden group hover:border-[#00D4FF] transition-all">
          {/* Premium animated border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/0 via-[#00D4FF]/30 to-[#00D4FF]/0 animate-shimmer pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#00D4FF]/50 shadow-lg shadow-[#00D4FF]/30 flex-shrink-0">
              {believerMetadata.image && (
                <img 
                  src={believerMetadata.image} 
                  alt="Believer Badge" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-[#39FF14] flex-shrink-0" />
                <p className="text-white font-bold text-sm truncate">Base Tribe Believer</p>
              </div>
              <p className="text-[#00D4FF] text-xs font-medium">
                You own {ownership.believer} {ownership.believer === 1 ? 'badge' : 'badges'} 🔵
              </p>
            </div>
            <Badge className="bg-[#00D4FF] text-[#001F3F] border-0 flex-shrink-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Believer
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
}