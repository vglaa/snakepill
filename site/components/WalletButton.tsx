'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  return (
    <WalletMultiButton
      style={{
        backgroundColor: '#4ade80',
        color: '#000',
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 600,
        borderRadius: '8px',
        fontSize: '14px',
        padding: '8px 16px',
        height: 'auto',
      }}
    />
  );
}
