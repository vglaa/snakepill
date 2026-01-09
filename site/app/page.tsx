'use client';

import { Header } from '@/components/Header';
import { SnakeGame } from '@/components/SnakeGame';
import { OnlineCounter } from '@/components/OnlineCounter';
import { Leaderboard } from '@/components/Leaderboard';
import { DonateTable } from '@/components/DonateTable';
import { SkinShop } from '@/components/SkinShop';
import { EligibilityBanner } from '@/components/EligibilityBanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Game Section */}
        <div className="flex justify-center mb-8">
          <SnakeGame />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <OnlineCounter />
          <Leaderboard />
          <DonateTable />
        </div>

        {/* Skin Shop */}
        <div className="mb-8">
          <SkinShop />
        </div>

        {/* Eligibility Banner */}
        <EligibilityBanner />
      </div>
    </main>
  );
}
