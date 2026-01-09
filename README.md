# SNAKEPILL

Classic Snake game integrated with Solana memecoin. Play to earn 0.1% of token taxes!

## Structure

```
snakepill/
├── bot/          # Node.js backend (API, holder checker, tax distributor)
├── site/         # Next.js frontend (game, leaderboard, skin shop)
└── supabase-schema/  # Database schema for Supabase
```

## Quick Start

### 1. Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and run the contents of `supabase-schema/schema.sql`
4. Get your credentials from Settings > API

### 2. Bot Setup

```bash
cd bot
npm install
npm start  # First run will launch interactive setup
```

The setup will ask for:
- **Helius API Key** - Get from [helius.xyz](https://helius.xyz)
- **Supabase URL** - From project settings
- **Supabase Anon Key** - From project settings
- **Supabase Service Key** - From project settings
- **Token Mint** - Your token's contract address
- **Private Key** - (optional) Leave empty to generate new wallet

### 3. Site Setup

```bash
cd site
npm install

# Copy and edit environment file
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

npm run dev
```

## Features

### Game
- Classic Snake gameplay
- Increasing speed as you grow
- Golden pills for bonus points
- Mobile touch controls
- 6 unlockable skins

### Crypto Integration
- Phantom/Solflare wallet connection
- Persistent player stats
- Real-time leaderboard
- Tax distribution to eligible players

### Eligibility for Tax Distribution
1. Connect wallet
2. Hold minimum $5 in SNAKEPILL tokens
3. Play for 5 minutes total
4. Receive 0.1% of token taxes proportionally

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/status` | GET | System status |
| `/leaderboard` | GET | Top 100 scores |
| `/leaderboard/:wallet` | GET | Player stats |
| `/online` | GET | Online player count |
| `/donates` | GET | Top donations |
| `/skins` | GET | Available skins |
| `/eligible` | GET | Eligible players |
| `/eligible/:wallet` | GET | Check eligibility |
| `/game/start` | POST | Start game session |
| `/game/end` | POST | End game session |
| `/game/heartbeat` | POST | Keep-alive ping |
| `/skin/buy` | POST | Purchase skin |
| `/skin/equip` | POST | Equip owned skin |

## Environment Variables

### Bot (.env)
```
HELIUS_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
TOKEN_MINT=
TOKEN_SYMBOL=SNAKEPILL
MIN_HOLDING_USD=5
PRIVATE_KEY=
API_PORT=3001
```

### Site (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TOKEN_MINT=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Tech Stack

- **Backend**: Node.js, Express, Supabase
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Blockchain**: Solana, @solana/web3.js, Wallet Adapter
- **APIs**: Helius RPC, Pump.fun

## License

MIT
