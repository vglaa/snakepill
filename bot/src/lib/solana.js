import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { config } from '../config.js';

const connection = new Connection(config.helius.rpcUrl, 'confirmed');

// Get wallet keypair from private key
export function getWalletKeypair() {
    if (!config.wallet.privateKey) {
        throw new Error('No private key configured');
    }
    return Keypair.fromSecretKey(bs58.decode(config.wallet.privateKey));
}

// Get token accounts for a wallet
export async function getTokenBalance(walletAddress, tokenMint) {
    try {
        const wallet = new PublicKey(walletAddress);
        const mint = new PublicKey(tokenMint);

        const response = await fetch(config.helius.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenAccountsByOwner',
                params: [
                    wallet.toBase58(),
                    { mint: mint.toBase58() },
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

        // Sum up all token accounts
        let totalBalance = 0;
        for (const account of data.result.value) {
            const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
            totalBalance += amount || 0;
        }

        return totalBalance;
    } catch (error) {
        console.error(`Error getting token balance for ${walletAddress}:`, error.message);
        return 0;
    }
}

// Get token price from Pump.fun API
export async function getTokenPrice(tokenMint) {
    try {
        const response = await fetch(`https://frontend-api.pump.fun/coins/${tokenMint}`);

        if (!response.ok) {
            throw new Error(`Pump.fun API error: ${response.status}`);
        }

        const data = await response.json();

        // Pump.fun returns price in USD
        return data.usd_market_cap && data.total_supply
            ? data.usd_market_cap / data.total_supply
            : 0;
    } catch (error) {
        console.error('Error getting token price:', error.message);
        return 0;
    }
}

// Get holding value in USD
export async function getHoldingValueUSD(walletAddress) {
    try {
        const balance = await getTokenBalance(walletAddress, config.token.mint);
        if (balance === 0) return 0;

        const price = await getTokenPrice(config.token.mint);
        return balance * price;
    } catch (error) {
        console.error(`Error getting holding value for ${walletAddress}:`, error.message);
        return 0;
    }
}

// Send SOL to a wallet
export async function sendSol(toAddress, amountSol) {
    try {
        const fromWallet = getWalletKeypair();
        const to = new PublicKey(toAddress);
        const lamports = Math.floor(amountSol * 1e9);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromWallet.publicKey,
                toPubkey: to,
                lamports
            })
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
        return signature;
    } catch (error) {
        console.error(`Error sending SOL to ${toAddress}:`, error.message);
        throw error;
    }
}

// Get SOL balance of distribution wallet
export async function getDistributionWalletBalance() {
    try {
        const wallet = getWalletKeypair();
        const balance = await connection.getBalance(wallet.publicKey);
        return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
        console.error('Error getting distribution wallet balance:', error.message);
        return 0;
    }
}

// Validate wallet address
export function isValidWalletAddress(address) {
    try {
        new PublicKey(address);
        return true;
    } catch {
        return false;
    }
}
