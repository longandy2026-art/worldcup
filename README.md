# SportMind AI — 2026 World Cup MVP

## Quick Start

```bash
npm install
npm run dev
```

## Deploy to Cloudflare Pages

```bash
npm run pages:build
npm run deploy
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DEEPSEEK_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-v1-...
```

## Data Import

1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Import Excel data via Supabase Table Editor or CSV upload
