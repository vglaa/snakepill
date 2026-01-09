'use client';

import { WalletButton } from './WalletButton';
import { formatWallet } from '@/lib/wallet';

const TOKEN_MINT = process.env.NEXT_PUBLIC_TOKEN_MINT || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpump';

export function Header() {
  const copyCA = () => {
    navigator.clipboard.writeText(TOKEN_MINT);
    alert('CA copied to clipboard!');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">&#x1F40D;</span>
            <span className="font-retro text-green-primary text-sm md:text-base">
              SNAKEPILL
            </span>
          </div>

          {/* Contract Address */}
          <button
            onClick={copyCA}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:border-green-primary transition-colors"
            title="Click to copy"
          >
            <span className="text-text-muted text-xs">CA:</span>
            <span className="text-green-primary font-mono text-sm">
              {formatWallet(TOKEN_MINT)}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-muted"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
