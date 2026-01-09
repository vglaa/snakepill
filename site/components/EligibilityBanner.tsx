'use client';

import { usePlayerWallet } from '@/hooks/useWallet';
import { formatTime } from '@/lib/wallet';

export function EligibilityBanner() {
  const { connected, player, eligibility } = usePlayerWallet();

  const minPlaytime = eligibility?.minPlaytimeRequired || 300; // 5 minutes
  const minHolding = eligibility?.minHoldingRequired || 5; // $5

  const currentPlaytime = player?.total_playtime_seconds || 0;
  const playtimeProgress = Math.min((currentPlaytime / minPlaytime) * 100, 100);
  const playtimeComplete = currentPlaytime >= minPlaytime;

  const isEligible = eligibility?.isEligible || false;
  const holdingUSD = eligibility?.holdingUSD || 0;

  return (
    <div className="game-card bg-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">&#x1F4B0;</span>
        <h3 className="font-retro text-xs text-yellow-gold">TAX ELIGIBILITY</h3>
        <span className="text-text-muted text-xs ml-auto">Earn 0.1% of token taxes!</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Connect Wallet */}
        <div className={`p-3 rounded-lg border ${connected ? 'border-green-primary bg-green-primary/10' : 'border-border bg-card'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${connected ? 'text-green-primary' : 'text-text-muted'}`}>
              {connected ? '\u2713' : '1'}
            </span>
            <span className="text-sm font-bold">Connect Wallet</span>
          </div>
          <p className="text-xs text-text-muted">
            {connected ? 'Wallet connected!' : 'Connect your Phantom or Solflare wallet'}
          </p>
        </div>

        {/* Step 2: Hold $5 in tokens */}
        <div className={`p-3 rounded-lg border ${isEligible || holdingUSD >= minHolding ? 'border-green-primary bg-green-primary/10' : 'border-border bg-card'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${holdingUSD >= minHolding ? 'text-green-primary' : 'text-text-muted'}`}>
              {holdingUSD >= minHolding ? '\u2713' : '2'}
            </span>
            <span className="text-sm font-bold">Hold ${minHolding}+ SNAKEPILL</span>
          </div>
          <p className="text-xs text-text-muted">
            {connected
              ? `Current: $${holdingUSD.toFixed(2)} ${holdingUSD >= minHolding ? '\u2713' : ''}`
              : 'Minimum token holding required'}
          </p>
        </div>

        {/* Step 3: Play 5 minutes */}
        <div className={`p-3 rounded-lg border ${playtimeComplete ? 'border-green-primary bg-green-primary/10' : 'border-border bg-card'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${playtimeComplete ? 'text-green-primary' : 'text-text-muted'}`}>
              {playtimeComplete ? '\u2713' : '3'}
            </span>
            <span className="text-sm font-bold">Play 5 Minutes</span>
          </div>
          {connected && player ? (
            <>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted">Progress:</span>
                <span className={playtimeComplete ? 'text-green-primary' : 'text-yellow-gold'}>
                  {formatTime(currentPlaytime)} / {formatTime(minPlaytime)}
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-primary transition-all duration-300"
                  style={{ width: `${playtimeProgress}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-xs text-text-muted">Cumulative playtime required</p>
          )}
        </div>
      </div>

      {/* Eligibility Status */}
      {connected && (
        <div className={`mt-4 p-3 rounded-lg text-center ${isEligible ? 'bg-green-primary/20 border border-green-primary' : 'bg-card border border-border'}`}>
          {isEligible ? (
            <p className="text-green-primary font-bold">
              &#x2713; You are ELIGIBLE to receive 0.1% of token taxes!
            </p>
          ) : (
            <p className="text-text-muted">
              Complete all steps above to become eligible for tax distribution
            </p>
          )}
        </div>
      )}
    </div>
  );
}
