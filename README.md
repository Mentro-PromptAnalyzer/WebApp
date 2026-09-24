# Mentro

**Better questions, better answers.**

🔗 [Live App](https://ask-better-kiro-hacks.vercel.app/) · [Devpost](https://kiro-hacks-cal-poly.devpost.com/)

**Demo Login:** `eschiffler1122@gmail.com` / `Testing1!`

## What is Mentro?

Mentro is a web app that analyzes your AI conversations and helps you understand how you interact with tools like ChatGPT, Gemini, and Perplexity. Paste a share link from any supported platform, and Mentro will break down your prompting habits — showing where you were passive, where you were active, and how to ask better questions.

### What it does

- **Analyzes your prompts** — classifies each message by intent (delegation, curiosity, collaborative, verification) and scores quality across six dimensions
- **Scores your conversation** — rates Autonomy, Curiosity, Critical Thinking, Specificity, Context, and Engagement on a 0–100 scale
- **Detects patterns** — identifies behavioral patterns like one-and-done prompts, rubber-stamping, or fading engagement
- **Gives actionable feedback** — provides concrete, prompt-specific suggestions for improvement, not generic advice
- **Tracks progress over time** — logged-in users get a personal dashboard with trend charts, score comparisons, and platform usage breakdown
- **Supports multiple AI platforms** — works with ChatGPT, Gemini, and Perplexity share links

### How it works

All analysis runs client-side using a rule-based TypeScript engine — no API keys required for analysis. Share links are fetched through a lightweight proxy server that handles CORS restrictions.

## Local Development

The WebApp source and lockfile are in `mentro/`. The Express proxy server is
maintained in the separate `Mentro-PromptAnalyzer/server` repository; this
repository does not contain or recreate that server.

For the local production-container preview, including required public build
configuration and startup, health, stop, restart, and recovery commands, follow
the [container runbook](docs/container-runbook.md).

To install and check the frontend directly, use Node.js 24 from `mentro/`:

```bash
cd mentro
npm ci
npm run format:check
npm run lint
npm test
npm run build
```

The frontend's public build configuration is validated before building. Never
put privileged Supabase keys in `VITE_` variables. The runbook documents the
local fixture addresses and their limits; they do not provide real Auth or
history integration.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Recharts
- **Backend**: Express proxy server (Node.js) for share link fetching
- **Database**: Supabase (PostgreSQL) for user auth and analysis history
- **Analysis**: Client-side rule-based engine (no LLM required)
- **AI Chat**: Groq API (Llama 3.1) for the embedded chat feature

## Routes

| Route        | Description                                 |
| ------------ | ------------------------------------------- |
| `/`          | Home page with share link input             |
| `/analyze`   | Analysis workflow                           |
| `/results`   | Full analysis display with embedded AI chat |
| `/dashboard` | Personal progress tracking (requires login) |
| `/auth`      | Sign up / Sign in                           |
| `/chat`      | AI chat page                                |

## Built at Kiro Hacks @ Cal Poly

## License

[MIT](LICENSE)
