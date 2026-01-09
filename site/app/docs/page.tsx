import Image from 'next/image';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <Image
              src="/logo.png"
              alt="SNAKEPILL Logo"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="font-retro text-green-primary text-sm">SNAKEPILL</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Image
            src="/logo.png"
            alt="SNAKEPILL"
            width={120}
            height={120}
            className="mx-auto mb-6 rounded-2xl shadow-deep"
          />
          <h1 className="font-retro text-green-primary text-2xl md:text-3xl mb-4">
            SNAKEPILL
          </h1>
          <p className="text-text-muted text-lg">
            Play Snake. Earn Crypto. Simple as that.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* What is SNAKEPILL */}
          <section className="game-card p-6 md:p-8">
            <h2 className="font-retro text-green-primary text-lg mb-4">What is SNAKEPILL?</h2>
            <p className="text-text-muted leading-relaxed">
              SNAKEPILL is a classic Snake game integrated with Solana blockchain.
              Play the nostalgic Nokia-era snake game and earn a share of token taxes
              by holding SNAKEPILL tokens and playing the game.
            </p>
          </section>

          {/* How to Play */}
          <section className="game-card p-6 md:p-8">
            <h2 className="font-retro text-green-primary text-lg mb-4">How to Play</h2>
            <div className="space-y-4 text-text-muted">
              <div className="flex items-start gap-3">
                <span className="text-pink-pill font-bold">1.</span>
                <p>Connect your Solana wallet (Phantom or Solflare)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-pill font-bold">2.</span>
                <p>Click START to begin the game</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-pill font-bold">3.</span>
                <p>Use arrow keys or WASD to control the snake</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-pill font-bold">4.</span>
                <p>Eat pills to grow and score points</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-pill font-bold">5.</span>
                <p>Golden pills give bonus points!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-pill font-bold">6.</span>
                <p>Avoid hitting walls or yourself</p>
              </div>
            </div>
          </section>

          {/* Earning System */}
          <section className="game-card p-6 md:p-8">
            <h2 className="font-retro text-green-primary text-lg mb-4">How to Earn</h2>
            <p className="text-text-muted mb-6">
              Eligible players receive 0.1% of all token taxes, distributed proportionally.
            </p>

            <h3 className="font-bold text-white mb-3">Eligibility Requirements:</h3>
            <div className="space-y-3 text-text-muted">
              <div className="flex items-center gap-3 bg-background/50 p-3 rounded-xl">
                <span className="text-2xl">&#x1F4B0;</span>
                <div>
                  <p className="font-semibold text-white">Hold $5+ in SNAKEPILL</p>
                  <p className="text-sm">Minimum token holding requirement</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background/50 p-3 rounded-xl">
                <span className="text-2xl">&#x23F1;</span>
                <div>
                  <p className="font-semibold text-white">Play for 5+ minutes</p>
                  <p className="text-sm">Total accumulated playtime</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background/50 p-3 rounded-xl">
                <span className="text-2xl">&#x1F4B1;</span>
                <div>
                  <p className="font-semibold text-white">Connect your wallet</p>
                  <p className="text-sm">Required to track your progress</p>
                </div>
              </div>
            </div>
          </section>

          {/* Points System */}
          <section className="game-card p-6 md:p-8">
            <h2 className="font-retro text-green-primary text-lg mb-4">Points System</h2>
            <p className="text-text-muted mb-4">
              Earn points by playing and use them to buy snake skins!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background/50 p-4 rounded-xl">
                <p className="text-pink-pill font-bold text-xl">+10 pts</p>
                <p className="text-text-muted text-sm">Per regular pill</p>
              </div>
              <div className="bg-background/50 p-4 rounded-xl">
                <p className="text-yellow-gold font-bold text-xl">+50 pts</p>
                <p className="text-text-muted text-sm">Per golden pill</p>
              </div>
              <div className="bg-background/50 p-4 rounded-xl">
                <p className="text-green-primary font-bold text-xl">+100 pts</p>
                <p className="text-text-muted text-sm">Survive 1 minute bonus</p>
              </div>
              <div className="bg-background/50 p-4 rounded-xl">
                <p className="text-green-primary font-bold text-xl">+500 pts</p>
                <p className="text-text-muted text-sm">Survive 5 minutes bonus</p>
              </div>
            </div>
          </section>

          {/* Skins */}
          <section className="game-card p-6 md:p-8">
            <h2 className="font-retro text-green-primary text-lg mb-4">Snake Skins</h2>
            <p className="text-text-muted mb-4">
              Customize your snake with different skins! Spend your earned points
              in the Skin Shop to unlock new looks.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-[#9bbc0f] to-[#8bac0f] p-4 rounded-xl text-center">
                <p className="font-bold text-[#0f380f]">Classic</p>
                <p className="text-xs text-[#0f380f]/70">Free</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 p-4 rounded-xl text-center">
                <p className="font-bold text-black">Neon</p>
                <p className="text-xs text-black/70">500 pts</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-xl text-center">
                <p className="font-bold text-black">Gold</p>
                <p className="text-xs text-black/70">1000 pts</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-xl text-center">
                <p className="font-bold text-white">Fire</p>
                <p className="text-xs text-white/70">2000 pts</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl text-center animate-rainbow">
                <p className="font-bold text-white">Rainbow</p>
                <p className="text-xs text-white/70">5000 pts</p>
              </div>
              <div className="bg-gradient-to-br from-white to-blue-100 p-4 rounded-xl text-center">
                <p className="font-bold text-gray-800">Diamond</p>
                <p className="text-xs text-gray-600">10000 pts</p>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="game-card p-6 md:p-8">
            <h2 className="font-retro text-green-primary text-lg mb-4">Links</h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://x.com/Snakepill_fun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl hover:border-green-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter/X</span>
              </a>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-green-primary text-black font-bold rounded-xl hover:bg-green-secondary transition-colors"
              >
                <span>&#x1F3AE;</span>
                <span>Play Now</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-text-muted text-sm">
          <p>SNAKEPILL - Play Snake, Earn Crypto</p>
          <p className="mt-2">Built on Solana</p>
        </footer>
      </main>
    </div>
  );
}
