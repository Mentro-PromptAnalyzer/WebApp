import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import type { AnalysisResult } from '../analysis/types';

vi.mock('../context/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, signOut: async () => {} }),
}));
vi.mock('../lib/chatClient', () => ({ streamChatReply: vi.fn() }));

import { ResultsPage } from './ResultsPage';

const result: AnalysisResult = {
  prompts: [],
  scores: {
    autonomy: 30,
    curiosity: 40,
    criticalThinking: 50,
    specificity: 60,
    context: 70,
    engagement: 80,
    overallQuality: 55,
  },
  patterns: [],
  summary: 'Your prompts ask useful follow-up questions.',
  suggestions: [],
  distribution: [],
  conversationArc: 'consistent_explorer',
  tokenBreakdown: [],
  totalPromptTokens: 0,
  estimatedPromptCostUsd: 0,
  tokenEstimateLabel: 'Local estimate',
  tokenEstimateDisclaimer: 'Estimate only',
};

it('renders a result and its initial chat summary without a render-time state update', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={[{ pathname: '/results', state: { result } }]}>
      <ResultsPage />
    </MemoryRouter>
  );
  expect(html).toContain('Your prompts ask useful follow-up questions.');
  expect(html).toContain('Overall');
});

it('handles a direct results URL without route state during server rendering', () => {
  expect(() =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={['/results']}>
        <ResultsPage />
      </MemoryRouter>
    )
  ).not.toThrow();
});
