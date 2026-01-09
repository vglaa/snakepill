'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WalletButton } from './WalletButton';
import { formatWallet } from '@/lib/wallet';

const TOKEN_MINT = process.env.NEXT_PUBLIC_TOKEN_MINT || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpump';

export function Header() {
  const copyCA = () => {
    navigator.clipboard.writeText(TOKEN_MINT);
    alert('CA copied to clipboard!');
  };

  return (
    <header className="relative border-b border-border sticky top-0 z-50 overflow-hidden">
      {/* Banner Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner.png"
          alt="SNAKEPILL Banner"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background" />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-6xl relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="SNAKEPILL Logo"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <span className="font-retro text-green-primary text-sm md:text-base hidden sm:block">
              SNAKEPILL
            </span>
          </Link>

          {/* Contract Address */}
          <button
            onClick={copyCA}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur border border-border rounded-xl hover:border-green-primary transition-all shadow-lg"
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

          {/* Right Side: X Button + Docs + Wallet */}
          <div className="flex items-center gap-3">
            {/* X (Twitter) Button */}
            <a
              href="https://x.com/Snakepill_fun"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-card/80 backdrop-blur border border-border rounded-xl hover:border-green-primary hover:bg-card transition-all shadow-lg"
              title="Follow us on X"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Docs Link */}
            <Link
              href="/docs"
              className="px-3 py-2 bg-card/80 backdrop-blur border border-border rounded-xl hover:border-green-primary hover:bg-card transition-all shadow-lg text-sm font-medium"
            >
              Docs
            </Link>

            {/* Wallet Button */}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
