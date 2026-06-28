# Tech Stack

## Runtime & Framework

- **React 19** with **TypeScript ~6**
- **Vite 8** as build tool and dev server
- **React Router v7** for client-side routing (6 routes: `/`, `/auth`, `/results`, `/chat`, `/history`, `/dashboard`)

## Styling

- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin — no `tailwind.config.js` needed)
- **clsx** + **tailwind-merge** for conditional class composition
- **lucide-react** for icons

## Auth & Data

- **@supabase/supabase-js** for Supabase client (auth + database queries)
- **recharts** for dashboard trend charts
- **js-tiktoken** for client-side token counting
- Supabase project: `anmsstuexchqyghqoipt`; public table `chat_histories` with RLS; credentials via `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`

## Testing

- **Vitest** + **fast-check** (property-based testing) — run with `npm run test` (`vitest --run`)

## Analysis Engine

- All analysis logic runs client-side in TypeScript modules under `src/analysis/`
- No API keys, no database
- Results are passed between pages via React Router `location.state`

## Proxy Server (Share Link + Chat Streaming)

- The Express proxy server has been extracted to a separate repository (`Mentro-PromptAnalyzer/server`) — it is **not** in this repo
- Two endpoints (same contract as before):
  - `GET /api/fetch-share?url=<encoded>` — proxies AI share link fetches to bypass CORS; restricted to HTTPS `chatgpt.com`, `chat.openai.com`, `gemini.google.com`, `perplexity.ai` with share paths
  - `POST /api/chat/stream` — streams Groq LLM replies as SSE (`event: token`, `event: error`, `event: end`); requires Supabase JWT for rate limiting
- Deployed to Fly.dev (`https://mentro-lucid-dust-3580.fly.dev`); default local port `3001`
- Frontend reads base URL from `VITE_PROXY_URL` env variable

## Common Commands

```bash
# Install frontend dependencies (run from mentro/)
npm install

# Start frontend dev server (run from mentro/)
npm run dev

# Run tests once (run from mentro/)
npm run test

# Format code (run from mentro/)
npm run format

# Check formatting (run from mentro/)
npm run format:check

# Type-check + production build (run from mentro/)
npm run build

# Preview production build (run from mentro/)
npm run preview

# Lint (run from mentro/)
npm run lint
```

## Key Conventions

- No shadcn/ui or Zod — plain Tailwind + custom components
- Tailwind v4 uses CSS-first config (`@import "tailwindcss"` in index.css); avoid adding a `tailwind.config.js`
- Analysis engine lives in `src/analysis/` — keep it free of React imports
- `src/context/AuthContext.tsx` provides `useAuth()` hook; wrap protected pages in `ProtectedRoute`
- All Supabase calls use the SDK client from `src/lib/supabase.ts` — do not use raw fetch for auth
