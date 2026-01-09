import { PublicKey } from '@solana/web3.js';
import { config } from './config';

// Get token accounts for a wallet
export async function getTokenBalance(walletAddress: string, tokenMint: string) {
  try {
    const response = await fetch(config.helius.rpcUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          { mint: tokenMint },
          { encoding: 'jsonParsed' }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.result || !data.result.value || data.result.value.length === 0) {
      return 0;
    }

    let totalBalance = 0;
    for (const account of data.result.value) {
      const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
      totalBalance += amount || 0;
    }

    return totalBalance;
  } catch (error: any) {
    console.error(`Error getting token balance for ${walletAddress}:`, error.message);
    return 0;
  }
}

// Get token price from Pump.fun API
export async function getTokenPrice(tokenMint: string) {
  try {
    const response = await fetch(`https://frontend-api.pump.fun/coins/${tokenMint}`);

    if (!response.ok) {
      throw new Error(`Pump.fun API error: ${response.status}`);
    }

    const data = await response.json();

    return data.usd_market_cap && data.total_supply
      ? data.usd_market_cap / data.total_supply
      : 0;
  } catch (error: any) {
    console.error('Error getting token price:', error.message);
    return 0;
  }
}

// Get holding value in USD
export async function getHoldingValueUSD(walletAddress: string) {
  try {
    const balance = await getTokenBalance(walletAddress, config.token.mint!);
    if (balance === 0) return 0;

    const price = await getTokenPrice(config.token.mint!);
    return balance * price;
  } catch (error: any) {
    console.error(`Error getting holding value for ${walletAddress}:`, error.message);
    return 0;
  }
}

// Validate wallet address
export function isValidWalletAddress(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
