export function formatWallet(address: string) {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatSol(amount: number) {
  return parseFloat(String(amount)).toFixed(4);
}

export function formatUSD(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculatePoints(score: number, playtimeSeconds: number, pillsEaten: number) {
  let points = score;
  if (playtimeSeconds >= 60) points += 100;
  if (playtimeSeconds >= 300) points += 500;
  return points;
}

export function log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${type.toUpperCase()}] [${timestamp}] ${message}`);
}
