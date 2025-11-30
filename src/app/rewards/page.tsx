"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { X, Zap, Trophy, Gift } from "lucide-react";

const FortuneWheel = dynamic(() => import('@/components/FortuneWheel'), {
  ssr: false,     
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <div className="border corner-accents bg-accent/5 text-accent px-4 py-3">
        <span className="text-sm font-bold">Loading Fortune Wheel...</span>
      </div>
    </div>
  )
});

export default function EarnRewardsPage() {
  const [showCongrats, setShowCongrats] = useState(false);
  const [wonPrize, setWonPrize] = useState('');

  // Wheel prizes and their descriptions
  const prizeDescriptions = [
    { name: '0.01ETH', description: 'Instant crypto reward - 0.01 ETH value added to your wallet' },
    { name: 'BONUS', description: 'Special bonus multiplier - Next ticket purchase gets 2x rewards' },
    { name: 'TICKET', description: 'Free event ticket - Choose any available event worth up to 0.5 ETH' },
    { name: 'EMPTY', description: 'Don\'t worry, try again - Better luck next time, keep spinning for amazing prizes!' },
    { name: '0.05ETH', description: 'Big crypto prize - 0.05 ETH value deposited directly to your account' },
    { name: 'SPIN', description: 'Extra spin bonus - Get an additional free fortune wheel spin immediately' },
    { name: 'NFT', description: 'Exclusive NFT reward - Limited edition Sticket collectible for your wallet' },
    { name: 'JACKPOT', description: 'Ultimate prize - 0.1 ETH + Premium NFT + 5 Free tickets combo!' }
  ];

  const handleWheelWin = (prize: string) => {
    setWonPrize(prize);
    setShowCongrats(true);
  };

  const closePopup = () => {
    setShowCongrats(false);
    setWonPrize('');
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Header Section */}
        <div className="border border-t-0 corner-accents">
          <div 
            className="p-8 md:p-12 space-y-4"
            style={{
              backgroundImage: `url(/WhatsApp%20Görsel%202025-11-29%20saat%2020.28.56_af709104.jpg)`,
              backgroundSize: "contain",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="inline-block border corner-accents bg-accent/5 text-accent px-3 py-1 text-xs font-bold">
              [REWARDS_SYSTEM]
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Earn Rewards
            </h1>
            <p className="text-muted-foreground text-sm">
              &gt; GAMIFICATION_MODULE // 
            </p>
          </div>
        </div>

        {/* Fortune Wheel Section */}
        <div className="border border-t-0 corner-accents">
          <div className="p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="border corner-accents p-8 bg-muted/5 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Fortune Wheel</h2>
                </div>
                
                {/* Fortune Wheel Component */}
                <div className="flex justify-center">
                  <FortuneWheel 
                    onWin={handleWheelWin}
                    className="border corner-accents bg-black/20 p-4 rounded"
                  />
                </div>
                
                <div className="border corner-accents bg-accent/5 text-accent px-4 py-3 text-center">
                  <span className="text-sm font-bold">Spin the wheel to earn rewards!</span>
                </div>

                {/* Prize Descriptions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-center">Possible Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prizeDescriptions.map((prize, index) => (
                      <div key={index} className="border corner-accents p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className={`px-2 py-1 rounded text-xs font-bold border corner-accents ${
                              prize.name === 'JACKPOT' ? 'bg-accent/20 text-accent border-accent' :
                              prize.name === '0.05ETH' || prize.name === 'NFT' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                              prize.name === 'EMPTY' ? 'bg-muted text-muted-foreground' :
                              'bg-accent/10 text-accent'
                            }`}>
                              {prize.name}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {prize.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Congratulations Popup */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="border corner-accents bg-background p-8 max-w-md w-full mx-auto space-y-6 relative">
            {/* Close Button */}
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 p-1 hover:bg-muted/30 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Congratulations Content */}
            <div className="text-center space-y-4">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-accent" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-accent mb-2">
                  {wonPrize === 'EMPTY' ? '😔 Don\'t Give Up!' : '🎉 Congratulations!'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {wonPrize === 'EMPTY' ? 'Better luck next time!' : 'You won an amazing prize!'}
                </p>
              </div>

              {/* Prize Display */}
              <div className="border corner-accents bg-accent/5 p-6 space-y-3">
                <div className="flex justify-center">
                  {wonPrize === 'EMPTY' ? (
                    <div className="w-8 h-8 text-muted-foreground">💔</div>
                  ) : (
                    <Gift className="w-8 h-8 text-accent" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-accent">{wonPrize}</h3>
                  <p className="text-sm text-muted-foreground">
                    {wonPrize === 'EMPTY' 
                      ? 'Don\'t worry! Try spinning again for better prizes!' 
                      : 'Your reward has been added to your account'
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={closePopup} className="w-full gap-2">
                  <Zap className="w-4 h-4" />
                  {wonPrize === 'EMPTY' ? 'Try Again!' : 'Awesome!'}
                </Button>
                <button 
                  onClick={closePopup}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {wonPrize === 'EMPTY' ? 'Spin Again' : 'Continue Playing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}