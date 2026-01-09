import { checkEnvExists, runSetup } from './setup.js';
import cron from 'node-cron';

async function main() {
    // Check if setup is needed
    if (!checkEnvExists()) {
        await runSetup();
        console.log('\nReinicie o bot para comecar: npm start\n');
        process.exit(0);
    }

    // Load environment variables after setup
    await import('dotenv/config');

    // Import after dotenv is loaded
    const { config } = await import('./config.js');
    const { startApiServer } = await import('./services/api.js');
    const { checkAllEligibility } = await import('./services/holder-checker.js');
    const { log } = await import('./lib/utils.js');

    console.log('');
    console.log('\x1b[32m╔═══════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[32m║\x1b[0m\x1b[1m              SNAKEPILL BOT - RUNNING                         \x1b[0m\x1b[32m║\x1b[0m');
    console.log('\x1b[32m╚═══════════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('');

    // Start API server
    startApiServer();

    // Schedule eligibility check every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        log('Running scheduled eligibility check...', 'info');
        try {
            await checkAllEligibility();
        } catch (error) {
            log(`Eligibility check failed: ${error.message}`, 'error');
        }
    });

    log(`Token: ${config.token.symbol} (${config.token.mint?.slice(0, 8)}...)`, 'info');
    log(`Min holding: $${config.eligibility.minHoldingUsd}`, 'info');
    log(`Min playtime: ${config.eligibility.minPlaytimeSeconds}s`, 'info');
    log('Eligibility check runs every 5 minutes', 'info');

    // Run initial eligibility check
    setTimeout(async () => {
        log('Running initial eligibility check...', 'info');
        try {
            await checkAllEligibility();
        } catch (error) {
            log(`Initial eligibility check failed: ${error.message}`, 'error');
        }
    }, 5000);
}

main().catch(console.error);
