export const config = {
  helius: {
    apiKey: process.env.HELIUS_API_KEY,
    rpcUrl: `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },
  token: {
    mint: process.env.NEXT_PUBLIC_TOKEN_MINT || process.env.TOKEN_MINT,
    symbol: process.env.TOKEN_SYMBOL || 'SNAKEPILL'
  },
  eligibility: {
    minHoldingUsd: parseFloat(process.env.MIN_HOLDING_USD || '5'),
    minPlaytimeSeconds: 300 // 5 minutes
  },
  wallet: {
    privateKey: process.env.PRIVATE_KEY
  }
};
