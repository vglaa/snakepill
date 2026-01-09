import { config } from '../config.js';
import { getHoldingValueUSD } from '../lib/solana.js';
import {
    getPlayersWithMinPlaytime,
    setPlayerEligible,
    removePlayerEligibility,
    updatePlayer
} from '../lib/supabase.js';
import { log } from '../lib/utils.js';

// Check eligibility for all players with minimum playtime
export async function checkAllEligibility() {
    try {
        log('Starting eligibility check...', 'info');

        const minPlaytime = config.eligibility.minPlaytimeSeconds;
        const minHolding = config.eligibility.minHoldingUsd;

        // Get all players with enough playtime
        const players = await getPlayersWithMinPlaytime(minPlaytime);
        log(`Found ${players.length} players with ${minPlaytime}+ seconds playtime`, 'info');

        let eligibleCount = 0;
        let removedCount = 0;

        for (const player of players) {
            try {
                // Check holdings on-chain
                const holdingUSD = await getHoldingValueUSD(player.wallet_address);

                if (holdingUSD >= minHolding) {
                    // Mark as eligible
                    await setPlayerEligible(
                        player.id,
                        player.wallet_address,
                        holdingUSD,
                        player.total_playtime_seconds
                    );

                    // Update player record
                    if (!player.is_eligible) {
                        await updatePlayer(player.wallet_address, {
                            is_eligible: true,
                            eligible_since: new Date().toISOString()
                        });
                    }

                    eligibleCount++;
                    log(`[OK] ${player.wallet_address.slice(0, 8)}... is eligible ($${holdingUSD.toFixed(2)})`, 'success');
                } else {
                    // Remove eligibility
                    if (player.is_eligible) {
                        await removePlayerEligibility(player.wallet_address);
                        await updatePlayer(player.wallet_address, { is_eligible: false });
                        removedCount++;
                        log(`[X] ${player.wallet_address.slice(0, 8)}... no longer eligible ($${holdingUSD.toFixed(2)})`, 'warning');
                    }
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                log(`Error checking ${player.wallet_address}: ${error.message}`, 'error');
            }
        }

        log(`Eligibility check complete. Eligible: ${eligibleCount}, Removed: ${removedCount}`, 'success');
        return { eligible: eligibleCount, removed: removedCount };
    } catch (error) {
        log(`Error in eligibility check: ${error.message}`, 'error');
        throw error;
    }
}

// Check single player eligibility
export async function checkPlayerEligibility(walletAddress) {
    try {
        const holdingUSD = await getHoldingValueUSD(walletAddress);
        const isEligible = holdingUSD >= config.eligibility.minHoldingUsd;

        return {
            walletAddress,
            holdingUSD,
            minRequired: config.eligibility.minHoldingUsd,
            isEligible
        };
    } catch (error) {
        log(`Error checking player ${walletAddress}: ${error.message}`, 'error');
        throw error;
    }
}
