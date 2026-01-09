// Format wallet address for display (first 4...last 4)
export function formatWallet(address: string | null | undefined): string {
  if (!address || address.length < 12) return address || '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Format SOL amount
export function formatSol(amount: number): string {
  return amount.toFixed(4);
}

// Format points with commas
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

// Format time in seconds to MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate unique session ID
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
