import React from 'react';
import { Card } from './ui/card';
import { ExternalLink, Twitter } from 'lucide-react';
import { Button } from './ui/button';

interface XCommunityPostProps {
  tweetUrl?: string;
}

export function XCommunityPost({ 
  tweetUrl = 'https://x.com/TribeOnBase/status/1992043125573882361' 
}: XCommunityPostProps) {
  return (
    <Card className="bg-[#001F3F]/50 p-6 rounded-xl border border-white/10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-[#00D4FF] font-medium text-lg mb-1">X Community</h4>
          <p className="text-white/70 text-sm">Follow us on X for latest updates</p>
        </div>
        <a 
          href="https://x.com/TribeOnBase" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Follow @TribeOnBase
          </Button>
        </a>
      </div>

      {/* X Community Card */}
      <div className="bg-gradient-to-br from-[#00D4FF]/10 to-[#8B5CF6]/10 rounded-lg p-6 border border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-[#00D4FF]/20 p-3 rounded-full">
            <Twitter className="w-8 h-8 text-[#00D4FF]" />
          </div>
          <div>
            <h5 className="text-white font-medium">Join Our X Community</h5>
            <p className="text-white/60 text-sm">@TribeOnBase</p>
          </div>
        </div>
        
        <p className="text-white/80 mb-6">
          Stay connected with the BaseTribe community on X. Get real-time updates on raids, 
          rewards, and exclusive community events.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a 
            href="https://x.com/i/communities/1891908738966835560"
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#001F3F]/50 hover:bg-[#001F3F]/80 p-4 rounded-lg border border-white/10 hover:border-[#00D4FF]/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-1">X Community</p>
                <p className="text-white/60 text-sm">Join discussions</p>
              </div>
              <ExternalLink className="w-5 h-5 text-[#00D4FF] group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          <a 
            href="https://x.com/TribeOnBase"
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#001F3F]/50 hover:bg-[#001F3F]/80 p-4 rounded-lg border border-white/10 hover:border-[#00D4FF]/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-1">Follow Us</p>
                <p className="text-white/60 text-sm">Latest updates</p>
              </div>
              <ExternalLink className="w-5 h-5 text-[#00D4FF] group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      </div>

      {/* Latest Post Link */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <a 
          href={tweetUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#00D4FF] hover:text-[#39FF14] text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>View latest post on X</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
}