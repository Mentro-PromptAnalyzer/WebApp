# Mentro — Product Overview

**Slogan:** Better questions, better answers

Mentro is a desktop web app that analyzes a pasted ChatGPT conversation and helps users understand how they use AI. It identifies user prompts, classifies each by intent type, scores the overall conversation across six quality dimensions, and gives concrete suggestions for asking more active, curious, and thoughtful questions.

## Core Value

Give users a mirror: show what kinds of questions they asked, where they were passive, where they were active, and how to improve.

## Target Users

- Hackathon judges (short live demo)
- Students and learners who want to use AI without losing active reasoning
- AI-heavy builders who want feedback on their prompting habits

## Prompt Intent Categories

Every user message is classified into exactly one primary intent:

- **Delegation** — asking AI to do a task ("Write this", "Fix this", "Summarize this")
- **Curiosity** — asking why/how/what-if, exploring ideas
- **Collaborative** — thinking with AI, brainstorming, iterating together
- **Verification** — asking AI to check, review, or critique work

Intent and quality are scored separately. A delegation prompt is not automatically bad — "Fix this and explain why" is delegation with learning intent and scores well.

## Prompt Quality Flags

Each prompt is also checked for behavioral signals:

- `delegation_with_learning_intent` — task + explanation request
- `shows_prior_attempt` — user shares their own attempt or reasoning
- `asks_for_reasoning` — user asks for step-by-step or rationale
- `asks_for_alternatives` — user asks for options, comparisons, tradeoffs
- `asks_for_risk_or_limitations` — user asks for edge cases, assumptions, failure modes
- `copy_paste_without_question` — long prompt (100+ words) with no question mark

## Conversation Scores (0–100)

Six dimensions, each averaged from prompt-level rubric scores:

- **Autonomy** — active thinking vs. offloading; boosted by prior attempts and learning intent
- **Curiosity** — exploratory questions and conceptual depth
- **Critical Thinking** — verification, reasoning requests, edge case awareness
- **Specificity** — goal, constraints, audience, format, examples in prompts
- **Context** — background and framing provided to the AI
- **Engagement** — iteration, follow-up, and conversation length
- **Overall Quality** — average of all six dimensions

## Auth & Persistence

- Supabase Auth: email/password + Google/GitHub OAuth via `@supabase/supabase-js` SDK
- `AuthContext` (`src/context/AuthContext.tsx`) wraps the app; exposes `user`, `session`, `loading`, `signOut`
- `ProtectedRoute` redirects unauthenticated users to `/auth`
- Analyses are saved to `chat_histories` table in Supabase (columns: `user_id`, `title`, `overall_score`, `prompt_count`, `platform`, `analysis_result`, `created_at`)
- Auth is optional for analysis — unauthenticated users can analyze but results are not persisted
- When signed in, `saveAnalysis` in `src/lib/chatHistory.ts` persists the result after navigation to `/results`

## Input

- The input page accepts an AI chat **share link** (ChatGPT, Gemini, Perplexity) — no raw text paste
- `src/analysis/linkParser.ts` detects platform, fetches the shared conversation via the proxy server, and extracts prompts
- `detectPlatform(url)` returns the platform string passed to `saveAnalysis` and forwarded to `/results` as `detectedPlatform`

## Other Features

- `/chat` — streaming AI chat via Fly.dev backend (`/api/chat/stream`); no auth required; uses `chatClient.ts`
- `/history` — protected; lists past analyses from `chat_histories` with score badge, prompt count, date; supports delete and re-open
- `/dashboard` — protected; aggregate stats (avg scores, recent score, trend, platform breakdown) via `dashboardService.ts`; `DashboardStats` derived entirely from `chat_histories.analysis_result` JSON

## Constraints

- Desktop-first; basic responsiveness acceptable
- Rule-based analysis engine only — no LLM for scoring (Groq is used server-side for the `/chat` feature only)
