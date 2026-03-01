# TRM-85 Product Requirements Document

**Token Regurgitation Machine — Model 85**

*"Crank It Up."*

**Version:** 1.0 Draft
**Date:** March 2026
**Status:** Pre-development

---

## 1. Vision

TRM-85 is a web-based LLM chat interface disguised as a piece of 1980s analog studio hardware. The core interaction is a large skeuomorphic knob that controls the AI's temperature parameter in real time, letting users explore the full spectrum from robotic precision to creative chaos — and watch both the output and the interface itself react.

It's a toy, a tool, and a conversation piece. The kind of thing someone cranks to 11, screenshots the unhinged result, and posts to Twitter. But underneath the chrome, it's a genuinely useful way to develop intuition for how temperature affects LLM output.

### Why This Will Work

- **Instant virality mechanic.** "Crank it to 11 and ask it to explain quantum physics" is a tweet that writes itself. Every user becomes a content creator.
- **Tactile satisfaction.** In a world of flat UIs and invisible sliders, a chunky analog knob is a dopamine hit. People will turn it just to feel it move.
- **Educational stealth.** Most people have no idea what "temperature" means. This makes it visceral and intuitive. You *feel* the AI loosen up.
- **Nostalgia hook.** The 1980s synth aesthetic taps into retrowave/synthwave culture, which has a massive and enthusiastic online audience.

---

## 2. Target Users

### Primary: The Shitposter (Viral Driver)

Tech-adjacent social media users who want to generate funny, unhinged AI outputs and share them. They don't care about LLM parameters — they care about the screenshot. The interface needs to look cool enough to be the background of a viral post.

### Secondary: The Tinkerer (Retention Driver)

Developers, AI enthusiasts, and curious power users who want to actually understand what temperature does. They'll spend 20 minutes methodically testing the same prompt at different settings. They'll come back.

### Tertiary: The Musician / Creative (Community Driver)

People in the synthwave/retrowave/music production community who will appreciate the hardware aesthetic on a deeper level. They'll share it in their communities not because of the AI, but because it looks like it belongs in their studio.

---

## 3. Core Experience

### 3.1 The Faceplate

The entire app is presented as a single piece of rack-mounted studio hardware. Brushed aluminum panel. Engraved labels. Visible (fake) screws. The aesthetic reference is a Roland Juno-106 or a vintage Neve channel strip — warm, analog, professional, with just enough wear to feel real.

The faceplate is the app. There is no separate "settings page" or "sidebar." Every control lives on the panel.

### 3.2 The Knob (Primary Control)

**This is the product.** Everything else is in service of the knob.

- Large, center-mounted rotary knob with a brushed-metal cap and a visible position indicator line
- Physically modeled rotation: responds to click-drag (vertical or circular), scroll wheel, and touch gestures
- Detent positions with subtle haptic feedback (vibration API on supported devices)
- Smooth interpolation between positions
- Resistance feel — it shouldn't spin freely; it should feel like it has weight
- The knob casts a realistic shadow that rotates with it
- Range: 0.0 to 1.1 (yes, it goes to 11... on a scale of 0.0 to 1.1)

**Dial labels** (engraved into the faceplate around the knob):

| Value | Label |
|-------|-------|
| 0.0 | "LOCKED DOWN" |
| 0.1 | "Legal Department" |
| 0.3 | "Wikipedia Editor" |
| 0.5 | "Normal Claude" |
| 0.7 | "Third Beer" |
| 0.9 | "Jazz Improvisation" |
| 1.0 | "Hold My Beer" |
| 1.1 | "Speaking In Tongues" |

A small seven-segment LED readout directly below the knob displays the precise numeric value (e.g., `0.47`), updating in real time as the knob turns.

### 3.3 VU Meters

Twin analog VU meters flanking the knob (left and right, like a stereo pair). Realistic needle physics — overshoot, bounce, settle.

- **During idle:** Needles rest at zero with a slight ambient twitch
- **During streaming:** Needles bounce proportionally to token output rate. Left and right can run slightly out of phase for visual interest.
- **At high temperature (>0.9):** Needles become more erratic, spending more time in the red zone
- **At 1.1:** Needles are pinned and twitching — full redline

The meters should have printed scales with a green-to-red gradient and a "dB" label, even though they're measuring tokens. Accuracy is not the point. Vibes are the point.

### 3.4 LED Token Counter

A row of seven-segment LED digits (red on black) acting as a token odometer. Counts total tokens generated in the current session. Digits roll over mechanically, like a car's trip odometer.

Should feel like it's counting something important even though the number is meaningless to most users.

### 3.5 SIGNAL Meter

A horizontal bar meter labeled "SIGNAL" with segments that light up from green (left) through yellow to red (right). This is the **coherence indicator**.

- At low temperature: Full green, steady
- As temperature rises: Signal drops, segments flicker off from the right
- At 1.0+: Barely any signal, segments flicker erratically
- The meter has no real analytical basis — it's a vibes-based heuristic tied to temperature, not actual output analysis

A small label beneath reads: "COHERENCE"

### 3.6 EJECT Button

A large, satisfying physical button (think arcade button or missile switch cover) labeled "EJECT" in stamped lettering.

- Immediately aborts the current generation
- Triggers a brief visual flourish (VU meters slam, LEDs flash)
- The button should have a pressed/unpressed state with shadow and depth
- Optional: a flip-up safety cover over the button that you have to open first (cosmetic, adds to the theater)

### 3.7 Chat Interface

The lower portion of the faceplate contains the actual chat. It should feel like a terminal embedded in the hardware — not a modern chat bubble UI.

- **Display area:** Monospaced font, amber or green on dark background (terminal aesthetic). Messages scroll up. Tokens stream in character by character during generation.
- **Input area:** A single-line text input styled as an inset panel with a brushed-metal bezel. A "TRANSMIT" button instead of "Send."
- **Message labels:** User messages labeled "INPUT >" and AI messages labeled "OUTPUT >" in the style of hardware I/O labels
- No avatars, no rounded bubbles, no modern chat conventions

### 3.8 UI Deterioration System

As temperature exceeds 1.0, the entire interface should communicate danger:

| Range | Effect |
|-------|--------|
| 0.0–0.7 | Clean, normal interface |
| 0.7–0.9 | Subtle warmth — slight amber tint to the backlight, VU meters more active |
| 0.9–1.0 | Warning zone — a faint scanline effect appears, SIGNAL meter drops noticeably, panel lighting flickers occasionally |
| 1.0–1.05 | Red alert — background develops visible static/noise, fonts shift by 1-2px randomly on re-render, VU meters redline |
| 1.05–1.1 | Full chaos — heavy CRT static overlay, text occasionally glitches (brief CSS transform distortion), panel "screws" appear to loosen, a faint hum/buzz audio cue, the SIGNAL meter is nearly dead |

These effects are purely cosmetic. They do not affect the API call. They exist to sell the narrative that you are pushing the machine past its limits.

---

## 4. Extended Features

### 4.1 Preset Patches

Like a synthesizer's patch memory, users can save and recall "patches" — named combinations of temperature + system prompt.

- A row of small backlit buttons along the top of the faceplate (PATCH 1 through PATCH 8)
- Each patch stores: temperature value, system prompt, and a user-defined label
- Pressing a patch button loads its settings with a satisfying click
- Ships with factory presets:
  - **PATCH 1: "Studio Clean"** — Temp 0.3, system prompt for precise technical answers
  - **PATCH 2: "Late Night FM"** — Temp 0.7, system prompt for conversational warmth
  - **PATCH 3: "Free Jazz"** — Temp 0.95, system prompt encouraging creative exploration
  - **PATCH 4: "Broken Machine"** — Temp 1.1, no system prompt, pure chaos

### 4.2 A/B Split Mode

A toggle switch labeled "A/B" that splits the output display into two channels. The same prompt is sent twice — once at the current knob position, once at a user-set comparison point. Outputs stream side by side so you can directly see how temperature changes the response.

- Two independent VU meters (one per channel)
- The comparison temperature is set with a smaller secondary knob or a detented toggle
- Extremely useful for building intuition, and generates great side-by-side screenshots for sharing

### 4.3 Temperature Automation (LFO Mode)

Inspired by a synthesizer's LFO (Low Frequency Oscillator), this mode makes the temperature oscillate automatically during a single generation.

- A small toggle switch labeled "LFO" activates it
- A secondary "RATE" knob controls oscillation speed
- A "DEPTH" knob controls the range of oscillation around the current knob position
- The main knob visually wobbles as the LFO runs
- The result: output that drifts between coherent and chaotic within a single response
- Waveform selector (sine, square, sawtooth) for different oscillation patterns — each produces a distinctly different output character

### 4.4 Audio Feedback

Optional (toggle-able) audio layer that reinforces the hardware illusion:

- **Knob turning:** Subtle mechanical click at each detent position
- **Button presses:** Satisfying tactile click sounds
- **Streaming:** Faint dot-matrix printer / teletype chatter while tokens generate
- **High temperature:** Low electrical hum that increases with the dial, CRT buzz
- **EJECT:** A dramatic mechanical clunk + tape-stop sound effect
- **Ambient:** Very faint 60Hz hum and occasional relay click, like powered-up hardware sitting idle

All audio should be subtle and optional. A master volume knob or mute switch on the faceplate.

### 4.5 Session Recording & Sharing

A "REC" button (with a red LED indicator) that captures a session for sharing:

- Records the full interaction: prompts, outputs, temperature changes over time
- Generates a shareable link that replays the session as an animation — the knob turns, the VU meters bounce, the text streams in, all in real time
- Also generates a static "screenshot card" optimized for Twitter/social sharing: shows the faceplate with the knob position, a snippet of the output, and the temperature label
- The share card should look good enough that people share the image even without clicking through

### 4.6 Model Selector

A rotary selector switch (like an oscillator waveform selector on a synth) for choosing the underlying model:

- Labeled positions for available models (e.g., Haiku, Sonnet, Opus)
- Each position has an engraved label in the synth style
- Switching models produces a satisfying clunk and a brief "recalibrating" animation
- Different models could have subtly different faceplate color temperatures (cool blue for Haiku, warm amber for Opus) to suggest different "hardware revisions"

### 4.7 Extended Parameter Controls

A secondary panel (slide-out drawer or flip-down section) with additional smaller knobs for other generation parameters:

- **TOP P** — Small knob, 0.0 to 1.0
- **TOP K** — Small knob, 1 to 100
- **MAX TOKENS** — Stepped rotary selector (256 / 512 / 1024 / 2048 / 4096)
- **FREQ PENALTY** — Small knob, labeled "REPETITION SUPPRESS"

These are for power users. The main knob (temperature) remains the star. These are the small trim pots on the back of the rack unit — they exist, but most people never touch them.

### 4.8 Prompt Library ("Greatest Hits")

A curated collection of prompts that are particularly entertaining or revealing at different temperatures. Accessible via a small panel on the faceplate.

- Each prompt is labeled like a track on a mixtape: "A1", "A2", "B1", etc.
- Categories:
  - **"Temperature Tests"** — Prompts designed to show dramatic differences across the range (e.g., "Explain love," "Write a cover letter," "Tell me a bedtime story")
  - **"Stress Tests"** — Prompts that push high-temperature output to its most entertaining (e.g., "Explain quantum physics as a pirate," "Write a recipe for something that doesn't exist")
  - **"Serious Mode"** — Prompts that demonstrate the practical value of temperature control for real work
- Tapping a prompt loads it into the input field

### 4.9 Hall of Fame

A community gallery of the best/funniest outputs generated by TRM-85 users.

- Users can submit outputs with a "SUBMIT TO HALL OF FAME" button
- Submissions include: the prompt, the output, the temperature, and the faceplate screenshot
- Upvote/downvote system
- Filterable by temperature range ("Show me the best outputs from the danger zone")
- This is the long-term retention and community play — people come back to browse, laugh, and try to top each other

---

## 5. Technical Requirements

### 5.1 Frontend

- **Framework:** React 18+ with TypeScript
- **Build tool:** Vite
- **Styling:** CSS modules, hand-crafted (no utility frameworks). The skeuomorphic aesthetic requires precise, custom styling.
- **Animation:** CSS transitions and requestAnimationFrame for meter physics. No heavy animation libraries unless needed for complex spring physics.
- **Audio:** Web Audio API for sound effects (loaded as small audio sprites)
- **Haptics:** Navigator Vibration API for mobile knob feedback (progressive enhancement, not required)
- **Responsive:** Must work on desktop and mobile. On mobile, the faceplate scales down but all controls remain usable. The knob responds to touch drag.

### 5.2 Backend

- **Proxy server:** Lightweight Node.js/Express server (or serverless functions) to proxy Claude API calls and keep the API key server-side
- **Streaming:** Server-sent events to pipe Claude's streaming responses to the client
- **Rate limiting:** Basic per-session rate limiting to prevent abuse
- **Session storage:** Optional — store conversation history in local storage (client-side) or a simple database for session recording/sharing features

### 5.3 API Integration

- **Provider:** Anthropic Claude API
- **Models:** Support for Haiku, Sonnet, and Opus
- **Parameters exposed:**
  - `temperature` (0.0–1.1, mapped from knob)
  - `top_p` (extended controls)
  - `top_k` (extended controls)
  - `max_tokens` (extended controls)
- **Streaming:** Use the streaming messages API; pipe each `content_block_delta` event to the frontend as an SSE event

### 5.4 Performance

- Knob interaction must be 60fps with no dropped frames — this is the core UX and any jank destroys the illusion
- VU meter animation at 60fps during streaming
- First meaningful paint under 2 seconds
- Token streaming should feel instantaneous — no perceptible delay between receiving a token and displaying it
- Audio latency under 50ms for knob clicks and button presses

### 5.5 Browser Support

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile Safari and Chrome on iOS/Android
- Progressive enhancement for audio and haptics (graceful degradation if APIs unavailable)

---

## 6. Design Specifications

### 6.1 Color Palette

| Element | Color | Notes |
|---------|-------|-------|
| Faceplate | #C0C0C0 → #A0A0A0 | Brushed aluminum gradient with subtle noise texture |
| Panel text / labels | #2A2A2A | Engraved/debossed look, slightly darker than surface |
| LED display | #FF1A1A on #1A0000 | Classic red seven-segment on near-black |
| VU meter face | #F5F0E0 | Warm off-white, vintage paper look |
| VU needle | #1A1A1A | Black needle with red tip |
| VU red zone | #CC0000 | Right ~20% of meter scale |
| Chat background | #0A0A0A | Near-black |
| Chat text (output) | #FFB347 | Warm amber, terminal style |
| Chat text (input) | #33FF33 | Green, terminal style |
| EJECT button | #CC0000 | Red with darker edge shadow |
| Indicator LEDs | #FF3300 (on), #330A00 (off) | Warm red LEDs with glow effect |

### 6.2 Typography

- **Faceplate labels:** A condensed sans-serif that looks stamped/engraved (e.g., Eurostile, Bank Gothic, or a similar industrial typeface)
- **LED displays:** A true seven-segment font (e.g., DSEG7 or similar)
- **Chat/terminal text:** A monospaced font (e.g., IBM Plex Mono, JetBrains Mono, or Fira Code)
- **No system fonts.** Every typeface is deliberately chosen for the aesthetic.

### 6.3 Textures and Materials

- Brushed aluminum: horizontal grain, rendered with CSS gradients + subtle SVG noise
- Knob cap: radial brushed metal with a slightly different grain direction than the faceplate
- Screw heads: phillips-head, slightly recessed, with shadow
- Panel sections divided by engraved lines (1px inset borders)
- LED displays recessed into the faceplate with a dark bezel
- All shadows suggest a consistent overhead light source (top-center, slightly forward)

---

## 7. Launch Strategy

### 7.1 Phase 1: MVP (Core Loop)

Ship the minimum that makes the viral moment possible:

- The knob (fully functional, fully satisfying)
- Temperature mapped to Claude API
- Streaming chat output
- VU meters reacting to token rate
- LED token counter
- SIGNAL coherence meter
- EJECT button
- UI deterioration at high temperature
- Mobile support

**Success metric:** Someone cranks it to 1.1, screenshots the result, and posts it. If the screenshot alone makes people want to try it, MVP is done.

### 7.2 Phase 2: Stickiness

Features that make people come back:

- Preset patches
- A/B split mode
- Audio feedback
- Session history (local storage)
- Prompt library / greatest hits

### 7.3 Phase 3: Community

Features that build a user base:

- Session recording and sharing (animated replays)
- Social sharing cards (optimized screenshots)
- Hall of Fame gallery
- Model selector

### 7.4 Phase 4: Power User

Features for depth and retention:

- LFO mode (temperature automation)
- Extended parameter controls (top-p, top-k, etc.)
- Custom system prompts on patches
- Keyboard shortcuts

---

## 8. Success Metrics

| Metric | Target | Why |
|--------|--------|-----|
| Viral screenshot shares | 100+ in first week | Validates the core "toy" mechanic |
| Average session length | > 5 minutes | People are experimenting, not bouncing |
| Knob interactions per session | > 20 turns | The knob is satisfying enough to fidget with |
| Return visits (7-day) | > 30% | There's enough depth to come back to |
| Temperature distribution | Bimodal (peaks at ~0.5 and ~1.0+) | People test both extremes — the range is doing its job |
| "EJECT" button presses | High (> 1 per session avg) | People are pushing into the danger zone and having fun |

---

## 9. Risks and Mitigations

### Content Risk
High temperature + creative prompts can produce offensive or nonsensical output. The LLM's built-in safety still applies — temperature affects randomness, not safety boundaries. The EJECT button provides a user-initiated escape hatch. Consider a brief disclaimer on first visit.

### API Cost
Every knob turn doesn't trigger a new API call — only submitting a prompt does. But viral traction could mean high volume. Mitigate with rate limiting, session caps, and potentially a "bring your own API key" mode for power users.

### Knob UX on Mobile
Touch-based rotary controls are notoriously finicky. Invest heavily in the touch interaction model. Vertical drag (up = increase, down = decrease) is more reliable than trying to simulate circular rotation on a small screen. Test obsessively.

### Performance
The skeuomorphic UI with textures, animations, and streaming could be heavy. Profile early and often. The knob must be 60fps or the entire illusion breaks. Consider reducing VU meter fidelity on lower-end devices.

### "Just a Toy" Perception
Lean into it. The product *is* a toy. But a toy that teaches you something about AI and makes you laugh is more valuable than another grey chat interface. The educational angle ("now you understand what temperature does") gives it substance when the novelty fades.

---

## 10. Open Questions

1. **BYOK (Bring Your Own Key) mode?** Letting users plug in their own API key removes the cost burden but adds friction. Could be a Phase 2 toggle.
2. **Multiple LLM providers?** The knob metaphor works for any LLM with a temperature parameter. Supporting OpenAI/Gemini/etc. would broaden appeal but adds complexity.
3. **Embeddable widget?** A small version of the knob that bloggers/developers could embed on their own sites. Could be a great distribution channel.
4. **Physical hardware version?** A USB MIDI controller mapped to the knob. Completely impractical. Absolutely would sell out immediately.
5. **Sound design depth?** How far do we go with the audio? A simple click per detent, or a full ambient soundscape? Start minimal, layer on based on feedback.
