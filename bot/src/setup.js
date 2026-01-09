import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, '..', '.env');

const REQUIRED_KEYS = [
    {
        key: 'HELIUS_API_KEY',
        name: 'Helius API Key',
        url: 'https://helius.xyz',
        description: 'Para RPC Solana e verificar holdings dos jogadores',
        required: true
    },
    {
        key: 'SUPABASE_URL',
        name: 'Supabase URL',
        url: 'https://supabase.com',
        description: 'URL do seu projeto Supabase (Settings > API)',
        required: true,
        example: 'https://xxxxx.supabase.co'
    },
    {
        key: 'SUPABASE_ANON_KEY',
        name: 'Supabase Anon Key',
        url: 'https://supabase.com',
        description: 'Chave anonima do Supabase (Settings > API)',
        required: true
    },
    {
        key: 'SUPABASE_SERVICE_KEY',
        name: 'Supabase Service Key',
        url: 'https://supabase.com',
        description: 'Chave service_role para operacoes admin (Settings > API)',
        required: true
    },
    {
        key: 'TOKEN_MINT',
        name: 'Token Mint (Contract Address)',
        description: 'Endereco do token SNAKEPILL na Solana',
        required: true,
        example: '7xKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpump'
    },
    {
        key: 'MIN_HOLDING_USD',
        name: 'Minimo em USD para elegibilidade',
        description: 'Valor minimo em dolares que o jogador precisa ter (padrao: 5)',
        required: false,
        default: '5'
    },
    {
        key: 'PRIVATE_KEY',
        name: 'Wallet Private Key',
        description: 'Wallet que vai distribuir as taxas (deixe vazio para gerar nova)',
        required: false
    }
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    dim: '\x1b[2m',
    magenta: '\x1b[35m'
};

export async function runSetup() {
    console.log('');
    console.log(colors.green + '╔═══════════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.green + '║' + colors.reset + colors.bright + '              SNAKEPILL - SETUP INICIAL                       ' + colors.reset + colors.green + '║' + colors.reset);
    console.log(colors.green + '╚═══════════════════════════════════════════════════════════════╝' + colors.reset);
    console.log('');
    console.log(colors.yellow + '  Vou precisar de algumas credenciais para funcionar.' + colors.reset);
    console.log(colors.dim + '  (Os links para conseguir cada uma estao abaixo)' + colors.reset);
    console.log('');

    const envValues = {};

    for (const keyInfo of REQUIRED_KEYS) {
        console.log(colors.green + '-'.repeat(60) + colors.reset);
        console.log('');
        console.log(colors.bright + `  ${keyInfo.name}` + colors.reset);
        console.log(colors.dim + `  ${keyInfo.description}` + colors.reset);
        if (keyInfo.url) {
            console.log(colors.cyan + `  -> ${keyInfo.url}` + colors.reset);
        }
        if (keyInfo.example) {
            console.log(colors.dim + `  Exemplo: ${keyInfo.example}` + colors.reset);
        }
        if (keyInfo.default) {
            console.log(colors.dim + `  Padrao: ${keyInfo.default}` + colors.reset);
        }
        console.log('');

        let value = await question(colors.yellow + `  Digite ${keyInfo.name}: ` + colors.reset);
        value = value.trim();

        // Usar valor padrao se vazio e existir default
        if (!value && keyInfo.default) {
            value = keyInfo.default;
            console.log(colors.dim + `  Usando valor padrao: ${value}` + colors.reset);
        }

        // Se for private key e estiver vazio, gera nova
        if (keyInfo.key === 'PRIVATE_KEY' && !value) {
            const newWallet = Keypair.generate();
            value = bs58.encode(newWallet.secretKey);
            console.log('');
            console.log(colors.green + '  [OK] Nova wallet gerada para distribuicao!' + colors.reset);
            console.log(colors.bright + `  Address: ${newWallet.publicKey.toBase58()}` + colors.reset);
            console.log(colors.yellow + '  IMPORTANTE: Guarde a private key em local seguro!' + colors.reset);
            console.log(colors.yellow + '  Envie SOL para esse endereco para pagar as distribuicoes.' + colors.reset);
        }

        // Validar keys obrigatorias
        if (keyInfo.required && !value) {
            console.log(colors.red + `  [ERRO] ${keyInfo.name} e obrigatoria!` + colors.reset);
            rl.close();
            process.exit(1);
        }

        if (value) {
            envValues[keyInfo.key] = value;
            console.log(colors.green + '  [OK] Salvo!' + colors.reset);
        }
        console.log('');
    }

    // Adicionar valores padrao
    envValues['API_PORT'] = '3001';
    envValues['TOKEN_SYMBOL'] = 'SNAKEPILL';

    // Gerar arquivo .env
    const envContent = Object.entries(envValues)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(ENV_PATH, envContent);

    console.log(colors.green + '='.repeat(60) + colors.reset);
    console.log('');
    console.log(colors.green + colors.bright + '  [OK] Setup completo! Arquivo .env criado.' + colors.reset);
    console.log('');
    console.log(colors.yellow + '  Proximos passos:' + colors.reset);
    console.log(colors.dim + '  1. Execute o schema SQL no Supabase (supabase-schema/schema.sql)' + colors.reset);
    console.log(colors.dim + '  2. Envie SOL para a wallet de distribuicao' + colors.reset);
    console.log(colors.dim + '  3. Rode novamente: npm start' + colors.reset);
    console.log('');
    console.log(colors.green + '='.repeat(60) + colors.reset);
    console.log('');

    rl.close();
    return envValues;
}

export function checkEnvExists() {
    if (!fs.existsSync(ENV_PATH)) {
        return false;
    }

    const content = fs.readFileSync(ENV_PATH, 'utf8');
    const requiredKeys = REQUIRED_KEYS.filter(k => k.required).map(k => k.key);

    for (const key of requiredKeys) {
        const regex = new RegExp(`^${key}=.+`, 'm');
        if (!regex.test(content)) {
            return false;
        }
    }

    return true;
}
