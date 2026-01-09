import { getEligiblePlayers, logTaxDistribution } from '../lib/supabase.js';
import { sendSol, getDistributionWalletBalance } from '../lib/solana.js';
import { log, formatSol } from '../lib/utils.js';

const TAX_DISTRIBUTION_PERCENTAGE = 0.001; // 0.1%

// Distribute taxes to eligible players
export async function distributeTaxes(totalTaxSol) {
    try {
        log(`Starting tax distribution for ${formatSol(totalTaxSol)} SOL...`, 'info');

        // Calculate distribution amount (0.1% of taxes)
        const distributionAmount = totalTaxSol * TAX_DISTRIBUTION_PERCENTAGE;
        log(`Distribution amount (0.1%): ${formatSol(distributionAmount)} SOL`, 'info');

        // Check wallet balance
        const walletBalance = await getDistributionWalletBalance();
        if (walletBalance < distributionAmount + 0.01) { // 0.01 SOL buffer for fees
            throw new Error(`Insufficient balance. Have: ${formatSol(walletBalance)} SOL, Need: ${formatSol(distributionAmount + 0.01)} SOL`);
        }

        // Get eligible players
        const eligiblePlayers = await getEligiblePlayers();
        if (eligiblePlayers.length === 0) {
            log('No eligible players to distribute to', 'warning');
            return { success: false, reason: 'No eligible players' };
        }

        log(`Found ${eligiblePlayers.length} eligible players`, 'info');

        // Calculate per-player amount
        const perPlayerSol = distributionAmount / eligiblePlayers.length;
        log(`Each player receives: ${formatSol(perPlayerSol)} SOL`, 'info');

        // Minimum distribution check (at least 0.0001 SOL per player)
        if (perPlayerSol < 0.0001) {
            log('Per-player amount too small, skipping distribution', 'warning');
            return { success: false, reason: 'Amount per player too small' };
        }

        // Distribute to each player
        const txSignatures = [];
        let successCount = 0;
        let failCount = 0;

        for (const player of eligiblePlayers) {
            try {
                const signature = await sendSol(player.wallet_address, perPlayerSol);
                txSignatures.push(signature);
                successCount++;
                log(`[OK] Sent ${formatSol(perPlayerSol)} SOL to ${player.wallet_address.slice(0, 8)}...`, 'success');

                // Small delay between transactions
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                failCount++;
                log(`[X] Failed to send to ${player.wallet_address.slice(0, 8)}...: ${error.message}`, 'error');
            }
        }

        // Log distribution
        await logTaxDistribution(
            totalTaxSol,
            distributionAmount,
            successCount,
            perPlayerSol,
            txSignatures
        );

        log(`Distribution complete. Success: ${successCount}, Failed: ${failCount}`, 'success');

        return {
            success: true,
            totalTaxSol,
            distributionAmount,
            eligibleCount: eligiblePlayers.length,
            successCount,
            failCount,
            perPlayerSol,
            txSignatures
        };
    } catch (error) {
        log(`Tax distribution error: ${error.message}`, 'error');
        throw error;
    }
}

// Get distribution statistics
export async function getDistributionStats() {
    try {
        const eligiblePlayers = await getEligiblePlayers();
        const walletBalance = await getDistributionWalletBalance();

        return {
            eligibleCount: eligiblePlayers.length,
            walletBalance,
            distributionPercentage: TAX_DISTRIBUTION_PERCENTAGE * 100
        };
    } catch (error) {
        log(`Error getting distribution stats: ${error.message}`, 'error');
        throw error;
    }
}
