# Project Structure

All source code lives under `mentro/`.

```
mentro/
├── src/
│   ├── analysis/             # Core analysis engine (framework-agnostic TS — no React imports)
│   │   ├── types.ts          # All shared types: PromptIntent, AnalysisResult, QualityScores, etc.
│   │   ├── parser.ts         # Extracts user messages from raw transcript text
│   │   ├── classifier.ts     # Scores intent signals; picks primaryIntent with tiebreak
│   │   ├── rubric.ts         # Detects quality flags; scores 6 quality dimensions per prompt
│   │   ├── patterns.ts       # Detects 12 behavioral patterns across the conversation
│   │   ├── suggestions.ts    # Generates summary paragraph and dimension-driven suggestions
│   │   ├── linkParser.ts     # isAIShareUrl, getPromptsFromInput, getPromptsAndTimestamp, detectPlatform, getLinkErrorMessage — fetches share links via proxy; getPromptsAndTimestamp also returns chatCreatedAt
│   │   ├── costCalculator.ts # Token cost estimates
│   │   ├── tokenEstimator.ts # Token count estimates (uses js-tiktoken)
│   │   ├── tokenConfig.ts    # Token pricing config
│   │   └── analyzer.ts       # Public entry point: analyzeConversation(string[]) → AnalysisResult
│   ├── context/
│   │   └── AuthContext.tsx   # AuthProvider + useAuth() hook — wraps app, exposes user/session/loading/signOut
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client (reads VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY)
│   │   ├── chatHistory.ts    # saveAnalysis, fetchHistory, deleteHistory — CRUD on chat_histories table
│   │   ├── dashboardService.ts  # getDashboardStats(userId) → DashboardStats; exports AnalysisHistory + DashboardStats interfaces; reads chat_histories
│   │   └── chatClient.ts     # streamChatReply(messages, handlers) — SSE stream to /api/chat/stream
│   ├── components/           # Reusable UI components
│   │   ├── Header.tsx        # Fixed nav bar — logo, History/Dashboard links (auth-gated), sign in/out
│   │   ├── ProtectedRoute.tsx # Redirects unauthenticated users to /auth
│   │   ├── ComparisonCard.tsx     # Score comparison cards (avg vs recent) for DashboardPage
│   │   ├── PlatformBreakdown.tsx  # Per-platform analysis counts for DashboardPage
│   │   ├── ProgressIndicator.tsx  # Trend badge (improving/declining/stable) for DashboardPage
│   │   ├── TrendChart.tsx         # Recharts line chart of overallQuality over time
│   │   └── TokenUsageCard.tsx     # Token usage display card
│   ├── pages/                # Route-level page components
│   │   ├── InputPage.tsx     # "/" — hero section + share link input; saves analysis on success if signed in
│   │   ├── AuthPage.tsx      # "/auth" — email/password + Google/GitHub OAuth; redirects to "/" if already signed in
│   │   ├── ResultsPage.tsx   # "/results" — full analysis display; reads result + detectedPlatform from location.state
│   │   ├── ChatPage.tsx      # "/chat" — streaming chat UI via chatClient; no auth required
│   │   ├── HistoryPage.tsx   # "/history" — protected; past analyses list with delete + re-open
│   │   └── DashboardPage.tsx # "/dashboard" — protected; aggregate stats, trend chart, platform breakdown
│   ├── App.tsx               # Router setup (BrowserRouter, 6 routes + wildcard redirect to /)
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles / Tailwind base (@import "tailwindcss")
│   └── App.css               # App-level styles
├── public/
│   ├── privacy.html          # Static privacy policy page
│   └── logo.png
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.app.json
```

## Architecture Rules

- `src/analysis/` is the analysis engine — keep it free of React imports. It must be callable from tests or a future API route without any UI dependency.
- `src/components/` contains presentational components only. They receive typed props and do not call the analyzer directly.
- `src/pages/` owns page-level state and wires analysis → components together.
- `src/context/AuthContext.tsx` is the single source of auth state — all components use `useAuth()` to read it.
- All Supabase calls go through the client in `src/lib/supabase.ts`. Do not instantiate a second client.
- Protected pages must be wrapped in `ProtectedRoute` in `App.tsx`.
- Analysis results flow: `InputPage` calls `getPromptsFromInput` (link fetch) → `analyzeConversation` → optionally `saveAnalysis` → navigates to `/results` with `{ result, detectedPlatform }` in `location.state`. `ResultsPage` reads it from state.
- If `location.state` is missing on `/results`, redirect back to `/`.
- All components import types from `src/analysis/types.ts` — not from `src/lib/`.

## Data Flow

```
share link → linkParser.ts (proxy fetch via getPromptsAndTimestamp) → string[] + chatCreatedAt
                     → classifier.ts (scoreIntents + primaryIntentFrom) → PromptIntent
                     → rubric.ts (detectFlags + scorePromptQuality) → QualityScores + flags
                     → analyzer.ts → AnalysisResult
                                   → chatHistory.ts (saveAnalysis) → Supabase chat_histories
                                   → ResultsPage (via router state)
```

Note: `getPromptsFromInput` is the simpler variant (returns `{ prompts, chatCreatedAt: null }`). `getPromptsAndTimestamp` fetches raw HTML via proxy and also extracts `chatCreatedAt` from the page.

## Key Types (src/analysis/types.ts)

- `PromptIntent` — `"delegation" | "curiosity" | "collaborative" | "verification"`
- `AnalyzedPrompt` — single prompt with `primaryIntent`, `intentScores`, `qualityScores`, `qualityScore`, `flags`, `isPassive`, `isActive`
- `ConversationScores` — `autonomy`, `curiosity`, `criticalThinking`, `specificity`, `context`, `engagement`, `overallQuality`
- `AnalysisResult` — full output: `prompts`, `scores`, `patterns`, `summary`, `suggestions`, `passiveExamples`, `activeExamples`, `distribution`

## Type Conventions

- All shared types live in `src/analysis/types.ts` — do not redefine them in components
- Use `interface` for object shapes, `type` for unions and aliases
- Props interfaces are defined inline in the component file, not exported unless reused
