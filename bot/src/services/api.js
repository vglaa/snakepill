import express from 'express';
import cors from 'cors';
import { config } from '../config.js';
import {
    getPlayer,
    createPlayer,
    updatePlayer,
    createGameSession,
    endGameSession,
    getLeaderboard,
    getDonates,
    getSkins,
    buySkin,
    equipSkin,
    getEligiblePlayers,
    updateOnlinePlayer,
    removeOnlinePlayer,
    getOnlineCount,
    getSystemStatus,
    updateSystemStats,
    cleanupOfflinePlayers
} from '../lib/supabase.js';
import { isValidWalletAddress } from '../lib/solana.js';
import { checkPlayerEligibility } from './holder-checker.js';
import { getDistributionStats } from './tax-distributor.js';
import { generateSessionId, calculatePoints, log } from '../lib/utils.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// System status
app.get('/status', async (req, res) => {
    try {
        await updateSystemStats();
        const status = await getSystemStatus();
        const distStats = await getDistributionStats();
        res.json({ ...status, ...distStats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const leaderboard = await getLeaderboard(limit);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Player stats
app.get('/leaderboard/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;
        if (!isValidWalletAddress(wallet)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }
        const player = await getPlayer(wallet);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Online count
app.get('/online', async (req, res) => {
    try {
        const count = await getOnlineCount();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Top donates
app.get('/donates', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const donates = await getDonates(limit);
        res.json(donates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Skins list
app.get('/skins', async (req, res) => {
    try {
        const skins = await getSkins();
        res.json(skins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eligible players
app.get('/eligible', async (req, res) => {
    try {
        const eligible = await getEligiblePlayers();
        res.json(eligible);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check eligibility for wallet
app.get('/eligible/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;
        if (!isValidWalletAddress(wallet)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        const player = await getPlayer(wallet);
        if (!player) {
            return res.json({
                isEligible: false,
                reason: 'No player record',
                playtimeSeconds: 0,
                minPlaytimeRequired: config.eligibility.minPlaytimeSeconds
            });
        }

        // Check playtime
        if (player.total_playtime_seconds < config.eligibility.minPlaytimeSeconds) {
            return res.json({
                isEligible: false,
                reason: 'Not enough playtime',
                playtimeSeconds: player.total_playtime_seconds,
                minPlaytimeRequired: config.eligibility.minPlaytimeSeconds
            });
        }

        // Check holdings
        const eligibility = await checkPlayerEligibility(wallet);

        res.json({
            isEligible: eligibility.isEligible,
            holdingUSD: eligibility.holdingUSD,
            minHoldingRequired: eligibility.minRequired,
            playtimeSeconds: player.total_playtime_seconds,
            minPlaytimeRequired: config.eligibility.minPlaytimeSeconds
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start game session
app.post('/game/start', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const sessionId = generateSessionId();

        let player = null;
        let playerId = null;

        if (walletAddress && isValidWalletAddress(walletAddress)) {
            player = await getPlayer(walletAddress);
            if (!player) {
                player = await createPlayer(walletAddress);
            }
            playerId = player.id;
        }

        const session = await createGameSession(playerId, walletAddress || null);

        // Update online status
        await updateOnlinePlayer(sessionId, walletAddress || null, true);

        res.json({
            sessionId,
            gameSessionId: session.id,
            player
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// End game session
app.post('/game/end', async (req, res) => {
    try {
        const { sessionId, gameSessionId, score, playtimeSeconds, pillsEaten, reason, walletAddress } = req.body;

        // End game session
        const session = await endGameSession(gameSessionId, score, playtimeSeconds, pillsEaten, reason);

        // Remove from online
        await removeOnlinePlayer(sessionId);

        // Update player stats if wallet connected
        if (walletAddress && isValidWalletAddress(walletAddress)) {
            const player = await getPlayer(walletAddress);
            if (player) {
                const totalPoints = calculatePoints(score, playtimeSeconds, pillsEaten);

                await updatePlayer(walletAddress, {
                    total_points: player.total_points + totalPoints,
                    total_playtime_seconds: player.total_playtime_seconds + playtimeSeconds,
                    games_played: player.games_played + 1,
                    highest_score: Math.max(player.highest_score, score)
                });
            }
        }

        res.json({ success: true, session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Heartbeat (keep online status alive)
app.post('/game/heartbeat', async (req, res) => {
    try {
        const { sessionId, walletAddress, isPlaying } = req.body;

        await updateOnlinePlayer(sessionId, walletAddress || null, isPlaying);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buy skin
app.post('/skin/buy', async (req, res) => {
    try {
        const { walletAddress, skinId } = req.body;

        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        if (!skinId) {
            return res.status(400).json({ error: 'Skin ID required' });
        }

        const player = await buySkin(walletAddress, skinId);
        res.json({ success: true, player });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Equip skin
app.post('/skin/equip', async (req, res) => {
    try {
        const { walletAddress, skinId } = req.body;

        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        if (!skinId) {
            return res.status(400).json({ error: 'Skin ID required' });
        }

        const player = await equipSkin(walletAddress, skinId);
        res.json({ success: true, player });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start the API server
export function startApiServer() {
    const port = config.api.port;

    // Cleanup offline players every minute
    setInterval(async () => {
        try {
            await cleanupOfflinePlayers();
        } catch (error) {
            log(`Error cleaning up offline players: ${error.message}`, 'error');
        }
    }, 60000);

    app.listen(port, () => {
        log(`API server running on port ${port}`, 'success');
    });

    return app;
}
