# Problem Radar

A single-page Next.js tool for turning seller problems from multiple source platforms into structured insights, saving them to a Feishu radar table, and generating platform-specific content drafts.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Node API Routes
- OpenRouter or OpenAI compatible AI client with heuristic fallback
- Feishu Bitable API with local mock fallback

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in what you need.

### AI

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` optional, defaults to `openai/gpt-4.1-mini`
- `OPENROUTER_BASE_URL` optional, defaults to `https://openrouter.ai/api/v1`
- `OPENROUTER_SITE_URL` optional, recommended for OpenRouter rankings
- `OPENROUTER_APP_NAME` optional, recommended for OpenRouter rankings
- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults to `gpt-4.1-mini`

The app prefers OpenRouter when `OPENROUTER_API_KEY` is present, otherwise it falls back to OpenAI. Without either key, it still runs with deterministic fallback analysis and rewrite behavior.

### Feishu

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_APP_TOKEN`
- `FEISHU_TABLE_ID`

Without Feishu credentials, radar save requests use an in-memory mock store keyed by `source_url`.

## Workflow

1. Paste a source URL or enter the source content manually.
2. Click `Analyze`.
3. Review the AI insight panel.
4. Click `Save to Radar`.
5. Click `Generate Content`.
6. Rewrite or copy per platform.
