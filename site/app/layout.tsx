import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SNAKEPILL - Play Snake, Earn Crypto',
  description: 'Classic Snake game with Solana memecoin integration. Play to earn 0.1% of token taxes!',
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'SNAKEPILL - Play Snake, Earn Crypto',
    description: 'Classic Snake game with Solana memecoin integration. Play to earn 0.1% of token taxes!',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
