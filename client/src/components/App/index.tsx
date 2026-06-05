import { useTemperature, useChatContext, useToggles, useEq } from "../../context/AppContext";
import { useChat } from "../../hooks/useChat";
import { Faceplate } from "../Faceplate";
import { RackDevice } from "../RackDevice";
import { Knob } from "../Knob";
import { VUMeter } from "../VUMeter";
import { LEDDisplay } from "../LEDDisplay";
import { SignalMeter } from "../SignalMeter";
import { EjectButton } from "../EjectButton";
import { PatchBay } from "../PatchBay";
import { ToggleBank, PERSONALITY_TOGGLES } from "../ToggleBank";
import { Equalizer, EQ_BANDS } from "../Equalizer";
import { Chat } from "../Chat";
import { Deterioration } from "../Deterioration";
import { buildSystemPrompt } from "../../utils/buildSystemPrompt";
import { eqToFragments } from "../../utils/eqToFragments";
import styles from "./App.module.css";

export function App() {
  const { temperature, setTemperature } = useTemperature();
  const { tokenRate } = useChatContext();
  const { activeToggles, toggle } = useToggles();
  const { bands } = useEq();
  const {
    messages,
    currentStreamedText,
    isGenerating,
    tokenCount,
    sendMessage,
    abort,
  } = useChat();

  const handleSendMessage = (content: string) => {
    // Compose the signal: persona toggles (SYNTH) + tone bands (EQ)
    const personaFragments = PERSONALITY_TOGGLES
      .filter((t) => activeToggles.has(t.id))
      .map((t) => t.prompt);
    const eqFragments = eqToFragments(bands, EQ_BANDS);
    const fragments = [...personaFragments, ...eqFragments];
    const systemPrompt = fragments.length > 0 ? buildSystemPrompt(fragments) : undefined;
    sendMessage(content, temperature, systemPrompt);
  };

  return (
    <div className={styles.app}>
      <Faceplate>
        <Deterioration temperature={temperature} />

        <div className={styles.devices}>
          <RackDevice code="TRM-85" name="Synthesizer">
            <div className={styles.controlStrip}>
              <div className={styles.knobZone}>
                <Knob
                  temperature={temperature}
                  onTemperatureChange={setTemperature}
                />
              </div>

              <div className={styles.groove} />

              <div className={styles.column}>
                <VUMeter tokenRate={tokenRate} temperature={temperature} />
                <EjectButton onEject={abort} disabled={!isGenerating} />
              </div>

              <div className={styles.groove} />

              <PatchBay />

              <div className={styles.groove} />

              <div className={styles.column}>
                <LEDDisplay count={tokenCount} />
                <SignalMeter temperature={temperature} />
              </div>
            </div>

            <div className={styles.toggleZone}>
              <ToggleBank activeToggles={activeToggles} onToggle={toggle} />
            </div>
          </RackDevice>

          <RackDevice code="TRM-EQ" name="Tone">
            <Equalizer />
          </RackDevice>

          <RackDevice code="OUT" name="Monitor">
            <div className={styles.monitor}>
              <Chat
                messages={messages}
                currentStreamedText={currentStreamedText}
                isGenerating={isGenerating}
                onSendMessage={handleSendMessage}
              />
            </div>
          </RackDevice>
        </div>
      </Faceplate>
    </div>
  );
}
