import { config } from './config';
import { getHoldingValueUSD } from './solana';
import {
  getPlayersWithMinPlaytime,
  setPlayerEligible,
  removePlayerEligibility,
  updatePlayer
} from './supabase';
import { log } from './utils';

// Check eligibility for all players with minimum playtime
export async function checkAllEligibility() {
  try {
    log('Starting eligibility check...', 'info');

    const minPlaytime = config.eligibility.minPlaytimeSeconds;
    const minHolding = config.eligibility.minHoldingUsd;

    const players = await getPlayersWithMinPlaytime(minPlaytime);
    log(`Found ${players?.length || 0} players with ${minPlaytime}+ seconds playtime`, 'info');

    let eligibleCount = 0;
    let removedCount = 0;

    for (const player of players || []) {
      try {
        const holdingUSD = await getHoldingValueUSD(player.wallet_address);

        if (holdingUSD >= minHolding) {
          await setPlayerEligible(
            player.id,
            player.wallet_address,
            holdingUSD,
            player.total_playtime_seconds
          );

          if (!player.is_eligible) {
            await updatePlayer(player.wallet_address, {
              is_eligible: true,
              eligible_since: new Date().toISOString()
            });
          }

          eligibleCount++;
          log(`[OK] ${player.wallet_address.slice(0, 8)}... is eligible ($${holdingUSD.toFixed(2)})`, 'success');
        } else {
          if (player.is_eligible) {
            await removePlayerEligibility(player.wallet_address);
            await updatePlayer(player.wallet_address, { is_eligible: false });
            removedCount++;
            log(`[X] ${player.wallet_address.slice(0, 8)}... no longer eligible ($${holdingUSD.toFixed(2)})`, 'warning');
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error: any) {
        log(`Error checking ${player.wallet_address}: ${error.message}`, 'error');
      }
    }

    log(`Eligibility check complete. Eligible: ${eligibleCount}, Removed: ${removedCount}`, 'success');
    return { eligible: eligibleCount, removed: removedCount };
  } catch (error: any) {
    log(`Error in eligibility check: ${error.message}`, 'error');
    throw error;
  }
}

// Check single player eligibility
export async function checkPlayerEligibility(walletAddress: string) {
  try {
    const holdingUSD = await getHoldingValueUSD(walletAddress);
    const isEligible = holdingUSD >= config.eligibility.minHoldingUsd;

    return {
      walletAddress,
      holdingUSD,
      minRequired: config.eligibility.minHoldingUsd,
      isEligible
    };
  } catch (error: any) {
    log(`Error checking player ${walletAddress}: ${error.message}`, 'error');
    throw error;
  }
}
