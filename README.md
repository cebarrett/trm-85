# TRM-85

**Token Regurgitation Machine**

A skeuomorphic chatbot interface disguised as a 1980s analog synthesizer. Crank the big knob to control LLM temperature in real time — from buttoned-up corporate prose to full fever-dream glossolalia.

**Tagline:** *"Crank It Up."*

## Concept

TRM-85 wraps an LLM API (Claude) in a retro hardware UI. The centerpiece is a chunky analog knob that maps directly to the temperature parameter, going all the way to 11. As you turn it up, the interface itself starts to lose its composure.

### The Knob

The dial has labeled detents around its range:

| Value | Label |
|-------|-------|
| 0.1 | "Legal Department" |
| 0.3 | "Wikipedia Editor" |
| 0.5 | "Normal Claude" |
| 0.7 | "Third Beer" |
| 0.9 | "Jazz Improvisation" |
| 1.0 | "Hold My Beer" |
| 1.1 | "The AI Is Speaking In Tongues Now" |

The knob must feel satisfying to turn. Skeuomorphic brushed-metal. No minimal sliders. If it doesn't feel like real hardware, the whole thing falls apart.

### Visual Design

The aesthetic is **1980s analog synthesizer** — think brushed aluminum faceplates, chunky hardware labels, and warm indicator lights.

- **VU meters** — Bouncing needle meters that react to token output rate during streaming
- **Seven-segment LED display** — Red on black, showing token count like an odometer rolling over (old-school LED font, no discussion)
- **"SIGNAL" meter** — A coherence indicator that drops as temperature climbs
- **"EJECT" button** — Emergency stop for when things go off the rails
- **UI deterioration** — Past 1.0, the interface starts breaking down: background static, drifting fonts, redlining VU meters. The whole UI communicates "you are leaving the safe zone"

### Chat Interface

Underneath the hardware chrome is a functional chat interface. Messages stream in real time so you can watch the output go from boring to unhinged as you crank the dial.

## Tech Stack

- **Frontend:** React + TypeScript
- **Styling:** CSS with skeuomorphic design (no utility-class minimalism)
- **LLM Backend:** Claude API (Anthropic), with temperature piped directly from the knob
- **Streaming:** Server-sent events for real-time token streaming

## Getting Started

```bash
# Install dependencies
npm install

# Set your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start development server
npm run dev
```

## Project Structure

```
trm-85/
├── src/
│   ├── components/
│   │   ├── Knob/           # The big analog temperature knob
│   │   ├── VUMeter/        # Bouncing VU meter needles
│   │   ├── LEDDisplay/     # Seven-segment token counter
│   │   ├── SignalMeter/    # Coherence indicator
│   │   ├── EjectButton/    # Emergency stop
│   │   └── Chat/           # Message display and input
│   ├── api/                # Claude API integration
│   ├── hooks/              # Shared React hooks
│   └── App.tsx
├── public/
└── package.json
```

## License

MIT
