# Supabase Schema - SNAKEPILL

## Como usar

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Va em **SQL Editor**
3. Cole todo o conteudo de `schema.sql`
4. Clique em **Run**

## Tabelas criadas

| Tabela | Descricao |
|--------|-----------|
| `players` | Jogadores registrados |
| `game_sessions` | Historico de partidas |
| `leaderboard` | Ranking de pontuacao |
| `donates` | Doacoes recebidas |
| `skins` | Skins disponiveis |
| `eligible_players` | Jogadores elegiveis para taxas |
| `tax_distributions` | Historico de distribuicoes |
| `online_players` | Jogadores online em tempo real |
| `system_status` | Estatisticas do sistema |

## Realtime

O schema ja habilita Realtime em todas as tabelas necessarias.

## RLS (Row Level Security)

- Leitura publica habilitada
- Escrita apenas via service_role (bot)
