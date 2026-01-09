// Format wallet address for display (first 4...last 4)
export function formatWallet(address) {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Format SOL amount
export function formatSol(amount) {
    return parseFloat(amount).toFixed(4);
}

// Format USD amount
export function formatUSD(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format time in seconds to MM:SS
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate unique session ID
export function generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Sleep utility
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry with exponential backoff
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
}

// Validate required environment variables
export function validateEnv(requiredVars) {
    const missing = [];
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }
    if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
}

// Calculate points for a game session
export function calculatePoints(score, playtimeSeconds, pillsEaten) {
    let points = score;

    // Bonus for surviving 1 minute
    if (playtimeSeconds >= 60) {
        points += 100;
    }

    // Bonus for completing 5 minutes
    if (playtimeSeconds >= 300) {
        points += 500;
    }

    return points;
}

// Log with timestamp
export function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}
