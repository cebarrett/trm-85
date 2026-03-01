# CLAUDE.md

## Project Overview

TRM-85 (Token Regurgitation Machine) is a React + TypeScript web app that wraps the Claude API in a skeuomorphic 1980s synthesizer UI. The main interaction is a large analog knob that controls LLM temperature from 0.1 to 1.1, with the chat output streaming in real time.

## Tech Stack

- React 18+ with TypeScript
- Vite for build tooling
- CSS modules for component styling (no Tailwind — the aesthetic is hand-crafted skeuomorphic)
- Anthropic Claude API for LLM calls
- Server-sent events for streaming responses

## Architecture

### Key Components

- **Knob** — The central UI element. Maps rotation to temperature 0.0–1.1. Must feel tactile and satisfying. Brushed metal skeuomorphic style.
- **VUMeter** — Animated needle meters that bounce in response to token streaming rate.
- **LEDDisplay** — Seven-segment red-on-black display for token count.
- **SignalMeter** — Coherence indicator that drops as temperature increases.
- **EjectButton** — Aborts the current generation.
- **Chat** — Standard message list + input. Streams tokens in real time.

### API Integration

- All LLM calls go through a thin backend proxy (or serverless function) to keep the API key off the client.
- Temperature is passed directly from the knob state to the API call.
- Responses are streamed via SSE so tokens appear incrementally.

### UI Deterioration System

When temperature exceeds 1.0, the UI should visually degrade:
- Background noise/static increases
- Font rendering drifts slightly (subtle CSS transforms)
- VU meters redline and behave erratically
- Color palette shifts warmer / more distorted

This is cosmetic only — it doesn't affect the API call, just sells the "danger zone" feeling.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint with ESLint
npm run typecheck    # TypeScript type checking
npm test             # Run tests
```

## Code Conventions

- Functional components with hooks (no class components)
- Component folders: each component gets its own directory with an index.tsx and a .module.css file
- Keep API logic out of components — use custom hooks (e.g., `useChat`, `useStreaming`)
- No abbreviations in variable names except widely understood ones (e.g., `ref`, `id`, `url`)
- Prefer `const` over `let`; no `var`

## Environment Variables

- `ANTHROPIC_API_KEY` — Required. Your Anthropic API key. Never commit this.

## Design Principles

1. **The knob is king.** Every design decision serves the knob interaction. If the knob doesn't feel good, nothing else matters.
2. **1980s synth, not 1980s computer.** Think Roland Juno-106, not Commodore 64. Brushed metal, not beige plastic.
3. **Skeuomorphic maximalism.** This is not a clean minimal app. Textures, shadows, reflections, fake screws — lean into it.
4. **The UI tells the story.** Temperature isn't just a number — the entire interface should communicate what zone you're in.
