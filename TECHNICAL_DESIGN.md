# TRM-85 Technical Design Document — MVP

**Version:** 1.0
**Date:** March 2026
**Scope:** Phase 1 (Core Loop)

---

## 1. MVP Scope Recap

The MVP ships the minimum feature set that enables the core viral moment: a user cranks the knob, submits a prompt, watches the output stream in while the gauges react, and screenshots the result.

**In scope:**
- Faceplate layout with all core controls
- Knob with drag/scroll/touch interaction, mapped to temperature 0.0–1.1
- Chat with streaming token display
- VU meters animated by token streaming rate
- LED token counter
- SIGNAL coherence meter
- EJECT button (abort generation)
- UI deterioration system at high temperature
- Backend proxy for Claude API
- Mobile-responsive layout

**Out of scope for MVP:**
- Preset patches, A/B mode, LFO mode
- Audio feedback
- Session recording/sharing
- Model selector (MVP uses Sonnet only)
- Extended parameter controls (top-p, top-k, etc.)
- Prompt library, Hall of Fame
- User accounts, persistence beyond local storage

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              React SPA (Vite)                    │    │
│  │                                                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │    │
│  │  │  Knob    │  │ VUMeter  │  │  LEDDisplay   │   │    │
│  │  │Component │  │Component │  │  Component    │   │    │
│  │  └────┬─────┘  └────▲─────┘  └──────▲───────┘   │    │
│  │       │              │               │           │    │
│  │  ┌────▼──────────────┴───────────────┴───────┐   │    │
│  │  │           App State (Context)             │   │    │
│  │  │  temperature │ messages │ streamState     │   │    │
│  │  │  tokenCount  │ tokenRate │ isGenerating   │   │    │
│  │  └────────────────────┬──────────────────────┘   │    │
│  │                       │                          │    │
│  │  ┌────────────────────▼──────────────────────┐   │    │
│  │  │         useChat / useStreaming hooks       │   │    │
│  │  │         (EventSource / fetch)             │   │    │
│  │  └────────────────────┬──────────────────────┘   │    │
│  └───────────────────────┼──────────────────────────┘    │
│                          │ SSE                           │
└──────────────────────────┼──────────────────────────────┘
                           │
                    HTTPS / SSE
                           │
┌──────────────────────────┼──────────────────────────────┐
│              Backend Proxy (Express)                     │
│                          │                               │
│  ┌───────────────────────▼──────────────────────────┐   │
│  │              /api/chat  (POST)                    │   │
│  │  - Validates request body                         │   │
│  │  - Attaches ANTHROPIC_API_KEY                     │   │
│  │  - Calls Claude Messages API (stream: true)       │   │
│  │  - Pipes SSE chunks back to client                │   │
│  └───────────────────────┬──────────────────────────┘   │
│                          │                               │
│  ┌───────────────────────▼──────────────────────────┐   │
│  │              Rate Limiter                         │   │
│  │  - Token bucket per IP (60 req/min)               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                    HTTPS (streaming)
                           │
               ┌───────────▼───────────┐
               │   Anthropic Claude    │
               │   Messages API        │
               └───────────────────────┘
```

### Why This Architecture

- **Express proxy, not serverless:** SSE streaming requires a long-lived connection with no buffering. While AWS Lambda now supports response streaming via Function URLs, it introduces cold-start latency (noticeable on the first request after idle) and has buffering behavior that can add chunkiness to token delivery. Since the entire product is about the *feel* of streaming, a real long-running server process gives us predictable, unbuffered SSE. The Express server is tiny — the Fargate cost at MVP scale is negligible.
- **No database:** MVP stores conversation history in React state (lost on refresh). Local storage persistence is a nice-to-have that can be added trivially without architectural changes.
- **No auth:** MVP is open. Rate limiting by IP is sufficient for launch. BYOK and accounts come later.

### AWS Deployment Architecture

```
                          ┌──────────────┐
                          │ Squarespace  │
                          │  Domains     │
                          └──────┬───────┘
                                 │
                          ┌──────▼───────┐
                          │  CloudFront  │
                          │  Distribution│
                          │  + WAF       │
                          └──┬────────┬──┘
                 ┌───────────┘        └───────────┐
         /api/* (origin 2)              /* (origin 1, default)
                 │                                │
          ┌──────▼───────┐                ┌───────▼──────┐
          │     ALB      │                │   S3 Bucket  │
          │ (internal)   │                │  (static)    │
          └──────┬───────┘                │  client/dist │
                 │                        └──────────────┘
          ┌──────▼───────┐
          │ ECS Fargate  │
          │  Service     │
          │ (Express     │
          │  proxy)      │
          └──────┬───────┘
                 │
          ┌──────▼───────┐        ┌──────────────────┐
          │  Secrets     │        │   Anthropic API   │
          │  Manager     │        │                   │
          │ (API key)    │        └──────────────────┘
          └──────────────┘
```

**Service roles:**

| Service | Role |
|---------|------|
| **Squarespace Domains** | DNS. Maps `trm-85.example.com` to the CloudFront distribution. |
| **CloudFront** | Unified entry point. Routes `/api/*` to the ALB origin, everything else to S3. Handles TLS termination, caching of static assets, and geographic distribution. |
| **WAF** | Attached to CloudFront. Handles rate limiting (replaces the in-memory token bucket). IP-based rate rules: 30 requests per 1-minute window to `/api/*`. |
| **S3** | Hosts the built React SPA (`client/dist/`). Private bucket, accessed only via CloudFront Origin Access Control. |
| **ALB** | Internal Application Load Balancer in front of the Fargate service. Handles health checks, distributes across tasks if scaled. Configured with idle timeout of 300s to support long SSE streams. |
| **ECS Fargate** | Runs the Express container. Minimum 1 task, auto-scales on CPU (target 60%). Each task runs the same stateless proxy. |
| **Secrets Manager** | Stores `ANTHROPIC_API_KEY`. The Fargate task role has read access. Value injected as an environment variable at task start. |

**Why these choices:**

- **CloudFront in front of everything** (not just S3): Gives us a single domain, no CORS issues between client and API, TLS handled in one place, and WAF rate limiting without building our own.
- **ALB idle timeout = 300s**: Default is 60s, which would kill SSE connections for long Claude responses. 300s is generous — even a max-length Opus response won't take 5 minutes.
- **Fargate, not EC2**: No instances to patch. Scales to zero-ish (minimum 1 task, but that's ~$15/month for a small container). For MVP traffic, 1 task is enough.
- **Fargate, not App Runner**: App Runner is simpler but gives less control over ALB timeouts, VPC configuration, and scaling policies. The SSE idle timeout issue alone makes Fargate worth the extra configuration.
- **Fargate, not Lambda**: As discussed above — cold starts and streaming buffering undermine the core UX. Lambda is the right call for many APIs, but not for one where token-by-token streaming latency is the product.

### Alternative: AppSync + Lambda (GraphQL)

If we prefer a fully serverless approach with managed real-time infrastructure, AWS AppSync is a strong option. It replaces the Fargate/ALB/Express layer entirely.

```
                          ┌──────────────┐
                          │  CloudFront  │
                          └──┬────────┬──┘
                 ┌───────────┘        └───────────┐
            /graphql                        /* (static)
                 │                                │
          ┌──────▼───────┐                ┌───────▼──────┐
          │   AppSync    │                │   S3 Bucket  │
          │  (GraphQL    │                │  client/dist │
          │   API)       │                └──────────────┘
          └──┬────────┬──┘
    Mutation │        │ Subscription
    (sendMsg)│        │ (onToken)
          ┌──▼────┐   │
          │Lambda │   │  WebSocket (managed)
          │Resolver│  │
          └──┬────┘   │
             │        │
  Reads Claude stream, │
  publishes token      │
  batches back to  ────┘
  AppSync subscription
```

**GraphQL schema:**

```graphql
type Mutation {
  sendMessage(input: SendMessageInput!): SendMessageResponse!
}

type Subscription {
  onTokens(sessionId: ID!): TokenBatch
    @aws_subscribe(mutations: ["publishTokens"])
}

type Mutation {
  # Internal — called by Lambda, not the client
  publishTokens(sessionId: ID!, tokens: String!, done: Boolean!): TokenBatch
}

input SendMessageInput {
  sessionId: ID!
  messages: [MessageInput!]!
  temperature: Float!
}

type TokenBatch {
  sessionId: ID!
  tokens: String!
  done: Boolean!
}
```

**Flow:**

1. Client opens a WebSocket subscription to `onTokens(sessionId)` via AppSync
2. Client sends `sendMessage` mutation with conversation history + temperature
3. Lambda resolver receives the mutation, calls Claude Messages API with `stream: true`
4. Lambda reads Claude's SSE stream, batches token deltas (~50ms batches), and calls the `publishTokens` mutation on AppSync for each batch
5. AppSync pushes each `TokenBatch` to the client's WebSocket subscription
6. Client processes batches identically to how it would process SSE chunks

**Tradeoffs vs Fargate:**

| Concern | Fargate + SSE | AppSync + Lambda |
|---------|--------------|-----------------|
| **Streaming latency** | Minimal — raw byte pipe, 1 network hop | Extra hop per batch (Lambda → AppSync → client). Adds ~10-30ms per batch, likely imperceptible when batching at 50ms intervals |
| **Infrastructure** | ALB + Fargate service + task definition | Managed — AppSync handles connections, scaling, WebSocket lifecycle |
| **Cost at low traffic** | ~$15/month minimum (1 Fargate task always running) | Near-zero at idle (pay per request + subscription event) |
| **Cost at scale** | Predictable (Fargate tasks scale linearly) | AppSync charges $2/million real-time updates — token batching keeps this reasonable but watch it |
| **EJECT (abort)** | Clean — `req.on("close")` cancels upstream reader | Harder — need a signal mechanism (e.g., DynamoDB flag polled by Lambda, or just let Lambda finish and discard on client) |
| **Local development** | `npm run dev` — trivial | Needs AppSync simulator or mocks. More friction for local iteration |
| **Cold starts** | None (server always running) | Lambda cold start on first request after idle (~200-500ms). Not on the streaming path though — only on the initial mutation |
| **Complexity** | Lower — one Express file | Higher — GraphQL schema, resolver config, subscription wiring, IAM roles |

**Recommendation:** Start with Fargate + SSE for MVP. The streaming latency characteristics are more predictable, EJECT is trivially clean, and local development is frictionless. Migrate to AppSync in Phase 2–3 if we want to go fully serverless, especially once session recording/sharing (which benefits from subscription-based architecture) is in scope. The client-side hook interface (`useChat`, `useStreaming`) stays the same regardless — only the transport layer changes.

That said, if the team has strong AppSync experience and values the serverless operational model, AppSync is entirely viable for MVP. The 50ms batching strategy neutralizes most of the latency concern, and the cold-start hit is a one-time cost per idle period.

---

## 3. Project Structure

```
trm-85/
├── client/                          # React frontend
│   ├── public/
│   │   ├── fonts/                   # DSEG7, IBM Plex Mono, Eurostile
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── App/
│   │   │   │   ├── index.tsx        # Root layout, composes faceplate
│   │   │   │   └── App.module.css
│   │   │   ├── Faceplate/
│   │   │   │   ├── index.tsx        # Outer chrome, screws, panel sections
│   │   │   │   └── Faceplate.module.css
│   │   │   ├── Knob/
│   │   │   │   ├── index.tsx        # Rotary knob control
│   │   │   │   ├── Knob.module.css
│   │   │   │   └── useKnobInteraction.ts  # Drag/scroll/touch physics
│   │   │   ├── VUMeter/
│   │   │   │   ├── index.tsx        # Single VU meter (instantiated x2)
│   │   │   │   └── VUMeter.module.css
│   │   │   ├── LEDDisplay/
│   │   │   │   ├── index.tsx        # Seven-segment digit row
│   │   │   │   └── LEDDisplay.module.css
│   │   │   ├── SignalMeter/
│   │   │   │   ├── index.tsx        # Horizontal coherence bar
│   │   │   │   └── SignalMeter.module.css
│   │   │   ├── EjectButton/
│   │   │   │   ├── index.tsx        # Abort button with visual feedback
│   │   │   │   └── EjectButton.module.css
│   │   │   ├── Chat/
│   │   │   │   ├── index.tsx        # Message list + input
│   │   │   │   ├── Chat.module.css
│   │   │   │   ├── MessageList.tsx  # Scrollable output area
│   │   │   │   └── MessageInput.tsx # Input + TRANSMIT button
│   │   │   └── Deterioration/
│   │   │       ├── index.tsx        # Overlay layers (static, scanlines, noise)
│   │   │       └── Deterioration.module.css
│   │   ├── hooks/
│   │   │   ├── useChat.ts           # Message state + API call orchestration
│   │   │   ├── useStreaming.ts      # SSE connection + token buffering
│   │   │   └── useTokenRate.ts      # Sliding-window token rate calculation
│   │   ├── context/
│   │   │   └── AppContext.tsx        # Shared state (temperature, generation status)
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript types
│   │   ├── utils/
│   │   │   ├── clamp.ts             # Math helpers
│   │   │   └── temperatureZone.ts   # Maps temperature to deterioration level
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global resets, font-face declarations
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                          # Backend proxy
│   ├── index.ts                     # Express server entry
│   ├── routes/
│   │   └── chat.ts                  # POST /api/chat — proxy to Claude
│   ├── middleware/
│   │   └── rateLimiter.ts           # Token-bucket rate limiting
│   └── tsconfig.json
├── infra/                           # AWS CDK infrastructure
│   ├── bin/
│   │   └── trm-85.ts               # CDK app entry point
│   ├── lib/
│   │   └── trm-85-stack.ts         # Single stack: S3, CloudFront, ECS, WAF
│   ├── cdk.json
│   └── tsconfig.json
├── Dockerfile                       # Multi-stage build for server
├── package.json                     # Workspace root (npm workspaces)
├── tsconfig.base.json               # Shared TS config
├── .env.example                     # Template for ANTHROPIC_API_KEY
├── .gitignore
├── CLAUDE.md
├── README.md
├── PRD.md
└── TECHNICAL_DESIGN.md
```

### Why a Monorepo with Workspaces

Client and server are co-located but have independent `tsconfig.json` files and dependencies. npm workspaces allow running both from the root with a single `npm run dev` command (using `concurrently`). This avoids the overhead of a separate repo or a full monorepo tool (Turborepo, Nx) for what is a two-package project.

---

## 4. State Management

### 4.1 State Shape

No external state library. React Context + `useReducer` is sufficient for the MVP's state surface area.

```typescript
interface AppState {
  // Knob / temperature
  temperature: number;           // 0.0 – 1.1

  // Chat
  messages: Message[];           // Full conversation history
  currentStreamedText: string;   // Partial text of in-flight response

  // Generation status
  isGenerating: boolean;         // True while streaming
  abortController: AbortController | null;

  // Meter data
  tokenCount: number;            // Total tokens generated this session
  tokenRate: number;             // Tokens per second (rolling average)
}

interface Message {
  role: "user" | "assistant";
  content: string;
  temperature: number;           // Temperature at time of generation
  timestamp: number;
}
```

### 4.2 Why Context, Not Redux / Zustand

- The state tree is flat and small (< 10 fields)
- There are no deeply nested consumers that would cause re-render issues
- Only one "write path" at a time (either the user is turning the knob or a stream is running)
- Adding Zustand later is trivial if needed — the hook interface stays the same

### 4.3 Re-render Isolation

The knob updates `temperature` at 60fps during drag. This must not re-render the chat or meters.

**Strategy:** Split context into two providers:

```
<TemperatureProvider>     ← temperature, only consumed by Knob, SignalMeter, Deterioration
  <ChatProvider>          ← messages, streaming state, tokenRate, consumed by Chat, VUMeter, LED
    <Faceplate />
  </ChatProvider>
</TemperatureProvider>
```

Components that need both (e.g., `useChat` needs temperature when sending a request) read temperature via a ref (`useRef` synced to state) rather than subscribing to context, avoiding unnecessary re-renders.

---

## 5. Component Design

### 5.1 Knob

The most complex component. Must feel physical.

**Interaction model:**

| Input | Behavior |
|-------|----------|
| Mouse drag (vertical) | Drag up = increase, drag down = decrease. 300px of vertical travel maps to the full 0.0–1.1 range. |
| Mouse drag (rotational) | Calculate angle from knob center to pointer. Map angle delta to temperature delta. |
| Scroll wheel | Each detent step = 0.01 temperature change. Holding Shift = 0.1 steps. |
| Touch drag | Same as mouse vertical drag. Single finger only. |
| Keyboard (when focused) | Arrow Up/Right = +0.01, Arrow Down/Left = −0.01. Page Up/Down = ±0.1. |

**Physics:**

- No actual spring/momentum physics (adds latency and unpredictability). The knob position tracks the input directly.
- Soft clamp at limits: when hitting 0.0 or 1.1, a subtle CSS scale pulse (1.0 → 1.02 → 1.0 over 100ms) signals you've reached the end.
- Rotation range: 270° arc (from 7 o'clock to 5 o'clock, like a real pot)

**Rendering:**

- The knob cap is a single `<div>` with:
  - `border-radius: 50%`
  - Radial gradient for the brushed metal texture
  - A pseudo-element for the position indicator line
  - `transform: rotate(Xdeg)` updated via `style` prop (not CSS class toggling) for 60fps
  - `box-shadow` that rotates with the knob to simulate directional lighting
- The dial labels and tick marks are absolutely positioned around the knob, rendered once (static)

**Accessibility:**

- The knob is a `<div role="slider">` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-label`
- Keyboard navigation fully functional
- Screen reader announces the temperature value and zone label on change (debounced)

### 5.2 VU Meter

A single `VUMeter` component, instantiated twice (left and right).

**Needle physics (simulated via `requestAnimationFrame`):**

```
targetAngle = map(tokenRate, 0, maxRate, REST_ANGLE, PEAK_ANGLE)
velocity += (targetAngle - currentAngle) * SPRING_CONSTANT
velocity *= DAMPING
currentAngle += velocity
```

Constants tuned by eye:
- `SPRING_CONSTANT`: 0.15 (responsive but not twitchy)
- `DAMPING`: 0.7 (visible overshoot, settles in ~3 bounces)
- `REST_ANGLE`: -45° (needle at far left)
- `PEAK_ANGLE`: +45° (needle at far right / redline)

At high temperature (>0.9), inject a noise term into `targetAngle`:
```
noise = (Math.random() - 0.5) * NOISE_AMPLITUDE * temperatureExcess
```

**Rendering:**

- The meter face is a static background: an SVG or CSS-drawn arc with tick marks and the "dB" scale, a green-to-red gradient behind the scale
- The needle is an absolutely positioned `<div>` rotated via `transform: rotate()`, with `transform-origin` at the bottom center (pivot point)
- A subtle CSS `drop-shadow` on the needle for depth
- The glass cover is a `<div>` overlay with a slight radial gradient (simulating curved glass reflection)

### 5.3 LED Display

Renders a row of seven-segment digits showing the session token count.

**Implementation:**

- Use the DSEG7 web font for authentic seven-segment rendering
- Each digit is a `<span>` with the font applied
- Behind each digit, render a dim "8" (the font at very low opacity) to simulate the unlit segments — this is what makes LED displays look real
- Digits update by re-rendering the text content; no animation needed since real LEDs just switch

**Value formatting:**
- Right-aligned, zero-padded to 6 digits: `000042`
- When count exceeds 999999, rolls over to 000000 (like an odometer)

### 5.4 Signal Meter

A horizontal row of rectangular segments that light up to indicate "coherence."

**Implementation:**

- 20 segments rendered as `<div>` elements in a flex row
- Each segment has three possible states: off, dim, lit
- The number of lit segments is inversely proportional to temperature:
  ```
  litCount = Math.round(20 * (1 - temperature / 1.1))
  ```
- Segment colors: positions 1–12 are green, 13–16 are yellow, 17–20 are red (but in practice you rarely see red since high signal = low temperature)
- At temperature > 0.9, add a random flicker: each frame, 1–3 lit segments randomly toggle off and back on

### 5.5 Eject Button

A large circular button with pressed/unpressed states.

**Behavior:**
- On click: calls `abortController.abort()` on the active generation
- Triggers a 200ms visual burst: VU meters slam to max, LED display flashes, then everything settles
- The button has a CSS `:active` state that depresses it (translate + shadow change)
- Disabled (visually dimmed) when no generation is in progress

### 5.6 Chat

**Message list:**
- A scrollable `<div>` with `overflow-y: auto`
- Each message is a `<pre>` block (preserves whitespace, monospaced)
- During streaming, the current response is rendered from `currentStreamedText` and updated on each SSE event — React state update, not DOM manipulation
- Auto-scrolls to bottom on new content (using `scrollIntoView` on a sentinel element)

**Input:**
- A `<form>` with a text `<input>` and a submit button labeled "TRANSMIT"
- Submit triggers `useChat.sendMessage(inputText, temperature)`
- Input is disabled during generation
- Enter submits; Shift+Enter is not needed (single-line input)

### 5.7 Deterioration Overlay

A transparent overlay `<div>` that sits on top of the entire faceplate and applies visual effects based on temperature zone.

**Implementation strategy: layered CSS effects, not canvas.**

| Layer | Technique | Trigger |
|-------|-----------|---------|
| Warm tint | `background: rgba(255, 160, 50, opacity)` on the overlay, blending. Opacity scales 0→0.05 from temp 0.7→1.0 | temp > 0.7 |
| Scanlines | A repeating `linear-gradient` of alternating transparent/semi-transparent 2px bands, applied as a pseudo-element | temp > 0.9 |
| Static noise | An SVG `<feTurbulence>` filter applied to the overlay with animated `seed` attribute, or a tiling noisy PNG with animated `background-position` | temp > 1.0 |
| Text glitch | CSS `transform: translate(Xpx, Ypx)` on `.message` elements, with small random values on a 200ms interval timer | temp > 1.0 |
| Screw loosening | CSS `transform: rotate(Xdeg)` on screw elements, with small random values | temp > 1.05 |

**Performance notes:**
- All effects use GPU-composited CSS properties (`transform`, `opacity`, `filter`) — no layout thrashing
- The noise animation runs on a `setInterval` (changing the SVG seed or background offset), not `requestAnimationFrame`, since it doesn't need to be smooth — jitter adds to the effect
- Effects are fully disabled (not just hidden) when temperature is below their threshold to avoid idle GPU work

---

## 6. Hooks Design

### 6.1 `useChat`

Orchestrates the full message lifecycle.

```typescript
interface UseChatReturn {
  messages: Message[];
  currentStreamedText: string;
  isGenerating: boolean;
  sendMessage: (content: string, temperature: number) => void;
  abort: () => void;
}
```

**`sendMessage` flow:**

1. Append user message to `messages`
2. Set `isGenerating = true`
3. Create a new `AbortController`
4. Call `fetch("/api/chat", { method: "POST", body, signal })` where body is:
   ```json
   {
     "messages": [{ "role": "user", "content": "..." }, ...],
     "temperature": 0.73
   }
   ```
5. The response is an SSE stream. Hand off to `useStreaming` for consumption.
6. On stream complete: append the full assistant message to `messages`, clear `currentStreamedText`, set `isGenerating = false`
7. On abort or error: same cleanup, but partial text is still appended as the assistant message (so you can see what it generated before EJECT)

### 6.2 `useStreaming`

Consumes an SSE stream from the backend proxy and emits tokens.

```typescript
interface UseStreamingReturn {
  startStream: (response: Response) => void;
  currentText: string;
  tokenCount: number;
}
```

**Implementation:**

- Uses the `ReadableStream` API (`response.body.getReader()`) rather than the `EventSource` API, because `EventSource` only supports GET requests and we need POST
- Reads chunks from the stream, splits by newline, parses `data:` lines
- Each parsed event is a Claude SSE event. We extract `content_block_delta` events and append the `text` delta to a buffer
- State updates are batched: accumulate deltas for 16ms (one frame), then flush to React state in a single update — this prevents rendering every individual token and keeps the frame budget

**SSE event types we handle:**

| Event | Action |
|-------|--------|
| `message_start` | Initialize response metadata |
| `content_block_start` | Begin text accumulation |
| `content_block_delta` | Append `delta.text` to buffer, increment token count |
| `content_block_stop` | Finalize block |
| `message_stop` | Signal stream complete |
| `error` | Surface error to UI |

### 6.3 `useTokenRate`

Calculates a rolling tokens-per-second rate for driving the VU meters.

```typescript
interface UseTokenRateReturn {
  tokenRate: number;   // tokens per second, updated every frame
}
```

**Algorithm:**

- Maintain a circular buffer of the last 60 timestamp entries (one per token or token batch)
- Each time tokens arrive, push `{ count, timestamp }` to the buffer
- On each `requestAnimationFrame`, calculate rate from buffer entries within the last 1000ms:
  ```
  rate = sum(counts in window) / (windowDuration / 1000)
  ```
- This gives a smooth, responsive rate that the VU meters can track

---

## 7. Backend Proxy

### 7.1 Express Server

Minimal. One route, one middleware, one job.

```typescript
// server/index.ts
import express from "express";
import { chatRoute } from "./routes/chat";
import { rateLimiter } from "./middleware/rateLimiter";

const app = express();
app.use(express.json());
app.use("/api", rateLimiter);
app.post("/api/chat", chatRoute);

// In production, also serve the built client static files
app.use(express.static("../client/dist"));

app.listen(process.env.PORT || 3001);
```

### 7.2 Chat Route

```typescript
// server/routes/chat.ts
export async function chatRoute(req: Request, res: Response) {
  const { messages, temperature } = req.body;

  // Validate
  if (!Array.isArray(messages) || typeof temperature !== "number") {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const clampedTemperature = Math.min(Math.max(temperature, 0), 1.1);

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Call Claude API
  const anthropicResponse = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        temperature: clampedTemperature,
        stream: true,
        messages,
      }),
    }
  );

  // Pipe the SSE stream directly to the client
  // This avoids buffering the full response in memory
  const reader = anthropicResponse.body.getReader();
  const pump = async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  };

  // Handle client disconnect (EJECT)
  req.on("close", () => {
    reader.cancel();
  });

  await pump();
}
```

**Key decisions:**
- We pipe raw SSE bytes from Anthropic directly to the client. No parsing on the server. This keeps the proxy as thin as possible and avoids introducing latency.
- When the client disconnects (EJECT button → `AbortController.abort()` → TCP close), the `close` event fires and we cancel the upstream reader, which terminates the Anthropic request and stops billing.

### 7.3 Rate Limiter

**Local development:** Simple in-memory token bucket (keyed by IP) for local dev, as originally designed. This is fine when there's one server process.

**AWS production:** In-memory rate limiting breaks with multiple Fargate tasks because each task has its own memory space — a user's requests would be distributed across tasks by the ALB, and no single task sees the full count. Instead of adding Redis or DynamoDB for shared state, we use **AWS WAF** attached to the CloudFront distribution.

WAF rate-based rule configuration:

```
Rule: TRM85-RateLimit
  - Scope: CloudFront distribution
  - Match: URI path starts with "/api/"
  - Rate limit: 30 requests per 1-minute window
  - Aggregation key: Source IP
  - Action: Block (returns 403)
```

This is handled entirely at the edge before requests even reach the ALB. No application code needed. The Express server still has a lightweight in-memory fallback (`server/middleware/rateLimiter.ts`) as defense-in-depth, but WAF does the heavy lifting.

**Why WAF over API Gateway throttling:** We're using CloudFront → ALB, not API Gateway. Adding API Gateway in front of the ALB just for throttling would add another hop and another service to configure. WAF is already on the CloudFront distribution — the rate rule is a single config addition.

### 7.4 Vite Dev Proxy

During development, the Vite dev server proxies `/api` to the Express server so both run on different ports without CORS issues.

```typescript
// client/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

---

## 8. Data Flow: Complete Request Lifecycle

```
User types prompt, clicks TRANSMIT
         │
         ▼
  Chat/MessageInput calls sendMessage(text, temperature)
         │
         ▼
  useChat appends user message to state,
  sets isGenerating = true,
  creates AbortController
         │
         ▼
  fetch POST /api/chat { messages, temperature }
         │
         ▼
  Express validates, forwards to Anthropic Messages API (stream: true)
         │
         ▼
  Anthropic streams SSE events back to Express
         │
         ▼
  Express pipes raw SSE bytes to client response
         │
         ▼
  useStreaming reads chunks via ReadableStream,
  parses content_block_delta events,
  batches text deltas per 16ms frame
         │
         ├──▶ Updates currentStreamedText → Chat re-renders with new tokens
         ├──▶ Updates tokenCount → LEDDisplay re-renders
         └──▶ Updates tokenRate (via useTokenRate) → VUMeter animates needle
                                                      │
                                                      ▼
                                              requestAnimationFrame loop
                                              applies spring physics
                                              to needle rotation

  On message_stop event:
    - Full text moved from currentStreamedText to messages array
    - isGenerating set to false
    - AbortController cleared

  On EJECT (user clicks button):
    - abortController.abort()
    - Fetch connection closes
    - Express close event fires, cancels upstream Anthropic reader
    - Partial text preserved in messages
    - VU meters slam + LED flash (200ms animation)
```

---

## 9. UI Deterioration: Implementation Detail

The deterioration system is driven by a single derived value: the **temperature zone**.

```typescript
// utils/temperatureZone.ts
type TemperatureZone = "clean" | "warm" | "warning" | "danger" | "chaos";

function getTemperatureZone(temperature: number): TemperatureZone {
  if (temperature <= 0.7) return "clean";
  if (temperature <= 0.9) return "warm";
  if (temperature <= 1.0) return "warning";
  if (temperature <= 1.05) return "danger";
  return "chaos";
}
```

The `Deterioration` component reads temperature from context and renders overlay layers conditionally:

```tsx
function Deterioration() {
  const { temperature } = useTemperature();
  const zone = getTemperatureZone(temperature);

  return (
    <div className={styles.overlay} data-zone={zone}>
      {zone !== "clean" && <div className={styles.warmTint} />}
      {(zone === "warning" || zone === "danger" || zone === "chaos") && (
        <div className={styles.scanlines} />
      )}
      {(zone === "danger" || zone === "chaos") && (
        <StaticNoise intensity={zone === "chaos" ? 1.0 : 0.5} />
      )}
    </div>
  );
}
```

The `StaticNoise` sub-component uses an SVG filter with `<feTurbulence>`:

```html
<svg>
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.9"
                  numOctaves="3" seed={animatedSeed} />
    <feColorMatrix type="saturate" values="0" />
  </filter>
</svg>
<div style={{ filter: "url(#noise)", opacity: intensity * 0.15 }} />
```

The `seed` attribute is updated every 100ms via `setInterval` to create the animated static effect. This is deliberately *not* every frame — real static has a chunky, low-framerate quality.

Text glitching is applied via a CSS class toggled on message elements:

```css
.glitched {
  animation: glitch 150ms steps(2) infinite;
}

@keyframes glitch {
  0%   { transform: translate(0, 0); }
  50%  { transform: translate(var(--glitch-x), var(--glitch-y)); }
  100% { transform: translate(0, 0); }
}
```

The `--glitch-x` and `--glitch-y` custom properties are set to small random pixel values (±2px) on a 200ms interval.

---

## 10. Responsive Design

### Breakpoints

| Breakpoint | Layout |
|------------|--------|
| ≥ 1024px (desktop) | Full faceplate, all elements at designed size |
| 768–1023px (tablet) | Faceplate scales to fit width, knob slightly smaller, VU meters move above chat |
| < 768px (mobile) | Single-column stack: knob + meters on top, chat below. Knob remains large enough to operate with a thumb. |

### Mobile Knob Interaction

On touch devices, the knob uses vertical drag:
- Touch start: record Y position
- Touch move: delta Y maps to temperature delta (200px for full range)
- Touch end: finalize temperature

This is more reliable than circular drag on small screens. The visual knob still rotates — the mapping is just linear input to rotational output.

### Viewport Strategy

- The faceplate has a fixed aspect ratio (~16:10)
- On desktop: centered in viewport with dark background visible around edges
- On mobile: fills viewport width, scrolls vertically if needed
- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">` — prevent zoom on double-tap (which would interfere with knob interaction)

---

## 11. Performance Budget

| Metric | Budget | Enforcement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Vite code splitting, font preloading |
| Largest Contentful Paint | < 2.5s | Inline critical CSS, lazy-load non-essential textures |
| Knob frame time | < 16ms (60fps) | No state updates that trigger chat re-renders during drag |
| VU meter frame time | < 16ms (60fps) | requestAnimationFrame with direct DOM style mutation (bypass React for needle rotation) |
| JS bundle size (gzipped) | < 80KB | No large dependencies. React + ReactDOM (~40KB), app code (~30KB), fonts loaded async |
| Token display latency | < 50ms from SSE event to screen | Batched state updates on 16ms frame boundary |

### VU Meter Performance Note

The VU meter needle is the one place where we bypass React's rendering for performance. During animation:

```typescript
// Inside requestAnimationFrame loop
needleRef.current.style.transform = `rotate(${angle}deg)`;
```

This avoids React's reconciliation overhead and ensures the needle animation never competes with token streaming state updates for render cycles.

---

## 12. Error Handling

| Scenario | Handling |
|----------|----------|
| API key missing on server | Server logs error at startup, returns 500 with generic message. On Fargate: task fails health check, ECS restarts it — check Secrets Manager ARN in task definition. |
| Anthropic API returns non-200 | Parse error body, forward user-friendly message to client via SSE error event |
| Anthropic API rate limit (429) | Forward to client, display "Machine overheated — try again in a moment" in chat |
| Network error during stream | Detect fetch failure, display "Signal lost" in chat, preserve any partial output |
| Client disconnects mid-stream | Server cancels upstream request (via `req.on("close")`) |
| Malformed SSE event | Skip the event, log warning. Do not crash the stream parser. |
| WAF rate limit (403) | CloudFront returns 403 before request reaches server. Client detects non-SSE 403 response, displays "Cooling down..." message in chat area |
| ALB idle timeout | ALB closes connection after 300s. For responses that could exceed this, client detects closed connection and shows "Signal lost — transmission exceeded time limit" |
| Fargate task crash | ECS auto-restarts the task. In-flight SSE connections on that task are lost — client detects the broken connection and shows a reconnect prompt |

---

## 13. Testing Strategy

### Unit Tests (Vitest)

- **Hooks:** `useChat`, `useStreaming`, `useTokenRate` — mock fetch, verify state transitions
- **Utilities:** `temperatureZone`, `clamp` — pure functions, straightforward assertions
- **Knob math:** Verify that input deltas map correctly to temperature values, that clamping works at boundaries

### Component Tests (Vitest + React Testing Library)

- **Knob:** Simulate mouse drag events, verify `aria-valuenow` updates, verify keyboard control
- **Chat:** Render with mock messages, verify message labels ("INPUT >", "OUTPUT >"), verify auto-scroll
- **LEDDisplay:** Render with various counts, verify digit formatting and zero-padding
- **SignalMeter:** Render at various temperatures, verify correct number of lit segments
- **EjectButton:** Verify disabled state when not generating, verify abort callback fires

### Integration Tests

- **Full send flow:** Mount App, type a message, mock the backend SSE response, verify tokens appear in chat, VU meters activate, token count increments
- **EJECT flow:** Start generation, click EJECT, verify stream stops, partial text preserved

### Manual Testing Checklist

- [ ] Knob feels smooth at 60fps on Chrome, Firefox, Safari
- [ ] Knob works via touch on iOS Safari and Android Chrome
- [ ] Streaming tokens appear without perceptible lag
- [ ] VU meter needles bounce naturally (not robotic, not over-damped)
- [ ] UI deterioration activates at correct thresholds
- [ ] EJECT immediately stops generation (no lingering tokens)
- [ ] Rate limit message displays correctly when throttled
- [ ] Layout works at 1440px, 1024px, 768px, 375px widths

---

## 14. Dependencies

### Client

| Package | Purpose | Approx Size (gzip) |
|---------|---------|---------------------|
| react | UI framework | 6KB |
| react-dom | DOM rendering | 35KB |
| (dev) vite | Build tool | — |
| (dev) typescript | Type checking | — |
| (dev) vitest | Test runner | — |
| (dev) @testing-library/react | Component testing | — |
| (dev) eslint | Linting | — |

That's it. No CSS framework, no animation library, no state management library, no component library. Every visual element is hand-built. This keeps the bundle small and the aesthetic fully controlled.

### Server

| Package | Purpose |
|---------|---------|
| express | HTTP server |
| (dev) typescript | Type checking |
| (dev) tsx | Dev-time TS execution |

### Fonts (self-hosted, loaded via @font-face)

| Font | Purpose | License |
|------|---------|---------|
| DSEG7 Classic | Seven-segment LED display | OFL |
| IBM Plex Mono | Chat terminal text | OFL |
| Eurostile (or similar) | Faceplate labels | Commercial (or use free alternative like Orbitron) |

---

## 15. Development Workflow

### Local Development

```bash
npm install                    # Install all workspace dependencies
npm run dev                    # Starts both Vite dev server and Express server
```

Under the hood, `npm run dev` runs `concurrently`:
- `vite` on port 5173 (client, with HMR)
- `tsx watch server/index.ts` on port 3001 (server, with file watching)

Vite proxies `/api/*` to port 3001, so the client hits `localhost:5173/api/chat` and it reaches Express.

### Build

```bash
npm run build                  # Builds client (vite build) + compiles server (tsc)
npm start                      # Runs compiled server locally (for testing the prod build)
```

### Docker

The server is containerized for Fargate deployment. Multi-stage Dockerfile:

```dockerfile
# Stage 1: Build client
FROM node:20-alpine AS client-build
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --workspace=client
COPY client/ ./client/
RUN npm run build --workspace=client

# Stage 2: Build server
FROM node:20-alpine AS server-build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=server
COPY server/ ./server/
RUN npm run build --workspace=server

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/node_modules ./node_modules
COPY --from=client-build /app/client/dist ./client/dist
EXPOSE 3001
CMD ["node", "server/dist/index.js"]
```

The production image contains only compiled JS and `node_modules` — no TypeScript, no dev dependencies, no source. Image size target: < 150MB.

Note: In the AWS architecture, the client static files in this image are unused — S3/CloudFront serves them instead. They're included in the image so the same container works for local `docker run` testing without needing S3.

### AWS Deployment

**Prerequisites:**
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- The API key stored in Secrets Manager (one-time manual step):
  ```bash
  aws secretsmanager create-secret \
    --name trm-85/anthropic-api-key \
    --secret-string "sk-ant-..."
  ```

**Deploy:**

```bash
cd infra
npm install
cdk bootstrap               # First time only — sets up CDK toolkit stack
cdk deploy                   # Deploys/updates the full stack
```

`cdk deploy` provisions everything in a single CloudFormation stack:
1. S3 bucket + bucket policy
2. CloudFront distribution + Origin Access Control
3. WAF web ACL with rate-limiting rule
4. VPC (public subnets only — Fargate tasks need internet access for Anthropic API)
5. ECS cluster + Fargate service + task definition
6. ALB + target group + listener
7. IAM roles (task execution role with Secrets Manager read access)
8. ECR repository (for the Docker image)

**CI/CD (GitHub Actions):**

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }

      # Build and push Docker image to ECR
      - run: aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
      - run: docker build -t $ECR_URI:${{ github.sha }} .
      - run: docker push $ECR_URI:${{ github.sha }}

      # Upload client build to S3
      - run: npm ci && npm run build --workspace=client
      - run: aws s3 sync client/dist/ s3://$BUCKET_NAME --delete

      # Update Fargate service to use new image
      - run: |
          aws ecs update-service \
            --cluster trm-85 \
            --service trm-85-api \
            --force-new-deployment

      # Invalidate CloudFront cache for static assets
      - run: aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"
```

**Environment variables (production):**

The Fargate task definition injects secrets at runtime:

```json
{
  "containerDefinitions": [{
    "secrets": [{
      "name": "ANTHROPIC_API_KEY",
      "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:trm-85/anthropic-api-key"
    }],
    "environment": [{
      "name": "PORT",
      "value": "3001"
    }, {
      "name": "NODE_ENV",
      "value": "production"
    }]
  }]
}
```

No `.env` file in production. No secrets in the image or in environment variable config. Secrets Manager is the single source of truth.

### Environment (local only)

```bash
# .env (not committed, local dev only)
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001                      # Optional, defaults to 3001
```

---

## 16. Open Technical Questions

1. **SSE vs WebSocket vs AppSync subscriptions:** SSE (via fetch + ReadableStream) is the simplest transport for one-way streaming and is the recommended MVP approach with Fargate. AppSync with GraphQL subscriptions is a strong alternative that brings managed WebSocket infrastructure, natural support for session-based channels, and a fully serverless model. The client-side hook interface is transport-agnostic — `useStreaming` consumes token batches regardless of whether they arrive via SSE or GraphQL subscription. Decision: start with SSE for MVP simplicity, migrate to AppSync if we go fully serverless in Phase 2+. If the team has strong AppSync experience, skip ahead.

2. **Knob: SVG vs CSS vs Canvas?** CSS is recommended for MVP — fewer moving parts, GPU-composited transforms, and the brushed-metal texture is achievable with CSS gradients. SVG gives more control over the metal grain effect if CSS isn't convincing enough. Canvas is overkill for a single knob.

3. **VU meter: SVG vs CSS?** The meter face (static backdrop) is a good candidate for SVG since it has curved scale markings. The needle itself should be CSS-transformed for performance. Hybrid approach: SVG background + CSS needle.

4. **Font licensing:** Eurostile is a commercial font. If the project is open-source or the license is a concern, Orbitron (Google Fonts, OFL) is a viable free alternative with a similar industrial feel. Decide before development begins.

5. **Max conversation length:** Claude's context window is large but not infinite. For MVP, cap conversation history sent to the API at the last 20 messages (10 exchanges). Display all messages in the UI but only send the recent window. This prevents runaway token costs and avoids hitting context limits.

6. **AWS region:** `us-east-1` is the default for CloudFront and has the broadest service availability. If the primary audience is elsewhere, consider the region's latency to Anthropic's API endpoints.

7. **Custom domain + TLS:** Squarespace Domains for DNS + ACM certificate in `us-east-1` (required for CloudFront). Decide on domain name before first deploy — changing CloudFront alternate domain names later is straightforward but requires a new certificate.

8. **Cost guardrails:** Set up AWS Budgets alerts. Key cost drivers at MVP: Fargate (fixed ~$15/month at minimum), CloudFront (data transfer, likely < $5/month at MVP scale), WAF ($5/month base + $1/million requests), Anthropic API (variable, the real cost). Consider a hard monthly budget alert at $50 for AWS infra and a separate alert for Anthropic API spend.
