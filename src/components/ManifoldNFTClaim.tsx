import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Sparkles } from 'lucide-react';
import { NFTMintCard } from '@coinbase/onchainkit/nft';
import { NFTMintButton } from '@coinbase/onchainkit/nft/mint';
import bannerImage from '../assets/nftmint.png';
import { ethers } from 'ethers';

// Contracts & Config
const CORE_CONTRACT = '0x6d70517b4bb4921b6fe0b131d62415332db1b831';
const CLAIM_CONTRACT = '0x26BBEA7803DcAc346D5F5f135b57Cf2c752A02bE';

const INSTANCE_IDS = {
  FOUNDER: 4117309680,
  BELIEVER: 4117350640
};

const PRICES = {
  FOUNDER: '0.00617', 
  BELIEVER: '0.001'
};

interface ManifoldNFTClaimProps {
  isConnected: boolean;
  walletAddress: string | null;
  userFid?: string | null;
}

export function ManifoldNFTClaim({ isConnected, walletAddress }: ManifoldNFTClaimProps) {
  
  // Custom Transaction Handler for Manifold
  const buildMintTransaction = async (instanceId: number, priceEth: string) => {
    const iface = new ethers.Interface([
      'function mint(address creatorContractAddress, uint256 instanceId, uint32 mintIndex, bytes32[] merkleProof, address mintFor) payable'
    ]);

    const data = iface.encodeFunctionData('mint', [
      CORE_CONTRACT,
      instanceId,
      0, 
      [], 
      walletAddress 
    ]);

    return [{
      to: CLAIM_CONTRACT as `0x${string}`,
      value: BigInt(ethers.parseEther(priceEth).toString()),
      data: data as `0x${string}`
    }];
  };

  return (
    <div className="space-y-8 pb-12">
      <Card className="relative overflow-hidden rounded-2xl border-2 border-[#39FF14]/30 p-0 shadow-lg">
        <img src={bannerImage} alt="Base Tribe Banner" className="w-full h-auto block" />
      </Card>

      <div className="text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Official Tribe Badges</h2>
        <Badge className="bg-[#39FF14] text-[#001F3F]">Minting Live on Base</Badge>
      </div>

      {!isConnected ? (
        <Card className="bg-[#001F3F]/80 p-8 border-white/10 text-center text-white">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Connect Wallet to Mint</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* FOUNDER BADGE */}
          <Card className="bg-[#001F3F]/50 border-[#7B2CBF]/30 p-6 flex flex-col gap-4 rounded-xl">
            <div className="text-center space-y-2">
              <h3 className="text-[#7B2CBF] font-bold text-xl flex items-center justify-center gap-2">
                Founder Badge <Sparkles className="w-4 h-4" />
              </h3>
              <p className="text-white/60 text-sm">Join the inner circle.</p>
              <p className="text-white font-mono bg-white/5 py-1 px-2 rounded inline-block">
                {PRICES.FOUNDER} ETH
              </p>
            </div>
            
            <NFTMintCard
              contractAddress={CORE_CONTRACT as `0x${string}`}
              buildMintTransaction={() => buildMintTransaction(INSTANCE_IDS.FOUNDER, PRICES.FOUNDER)}
              className="bg-transparent border-0 p-0"
            >
              <NFTMintButton 
                label="Mint Founder Badge"
                className="w-full bg-[#7B2CBF] hover:bg-[#5A1F9A] text-white font-bold py-4 rounded-lg transition-colors border-0" 
              />
            </NFTMintCard>
          </Card>

          {/* BELIEVER BADGE */}
          <Card className="bg-[#001F3F]/50 border-[#00D4FF]/30 p-6 flex flex-col gap-4 rounded-xl">
            <div className="text-center space-y-2">
              <h3 className="text-[#00D4FF] font-bold text-xl flex items-center justify-center gap-2">
                Believer Badge <Shield className="w-4 h-4" />
              </h3>
              <p className="text-white/60 text-sm">Show support for the tribe.</p>
              <p className="text-white font-mono bg-white/5 py-1 px-2 rounded inline-block">
                {PRICES.BELIEVER} ETH
              </p>
            </div>

            <NFTMintCard
              contractAddress={CORE_CONTRACT as `0x${string}`}
              buildMintTransaction={() => buildMintTransaction(INSTANCE_IDS.BELIEVER, PRICES.BELIEVER)}
              className="bg-transparent border-0 p-0"
            >
              <NFTMintButton 
                label="Mint Believer Badge"
                className="w-full bg-[#00D4FF] hover:bg-[#0099CC] text-white font-bold py-4 rounded-lg transition-colors border-0" 
              />
            </NFTMintCard>
          </Card>

        </div>
      )}
    </div>
  );
}