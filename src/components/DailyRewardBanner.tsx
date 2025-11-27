// Daily Reward Banner with Animation

'use client';

import { motion } from 'motion/react';
import { Gift, Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function DailyRewardBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-r from-[#7B2CBF] via-[#9D4EDD] to-[#C77DFF] border-0 rounded-2xl p-6">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                opacity: 0 
              }}
              animate={{
                y: [
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%'
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <Sparkles className="w-4 h-4 text-[#39FF14]" />
            </motion.div>
          ))}

          {/* Gradient Orbs */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-[#39FF14]/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00D4FF]/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Animated Icon */}
            <motion.div
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>

            {/* Text Content */}
            <div>
              <motion.h3
                className="text-white font-bold text-xl mb-1"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                ALWAYS CLAIM YOUR
              </motion.h3>
              <motion.div
                className="flex items-center gap-2"
                animate={{
                  x: [0, 2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <span className="text-[#39FF14] font-bold text-2xl">
                  DAILY ENGAGEMENT REWARD
                </span>
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <TrendingUp className="w-6 h-6 text-[#39FF14]" />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Pulsing Badge */}
          <motion.div
            className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(57, 255, 20, 0.4)',
                '0 0 0 10px rgba(57, 255, 20, 0)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <span className="text-white font-bold">6 Sessions Daily</span>
          </motion.div>
        </div>

        {/* Bottom Info Bar */}
        <motion.div
          className="relative z-10 mt-4 flex items-center justify-between text-white/80 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span>Participate in all 6 daily sessions</span>
          <span className="text-[#39FF14] font-bold">Earn up to 600 $BTRIBE/day</span>
        </motion.div>
      </Card>
    </motion.div>
  );
}
