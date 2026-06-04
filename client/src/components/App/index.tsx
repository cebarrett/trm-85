import { useTemperature, useChatContext, useToggles } from "../../context/AppContext";
import { useChat } from "../../hooks/useChat";
import { Faceplate } from "../Faceplate";
import { Knob } from "../Knob";
import { VUMeter } from "../VUMeter";
import { LEDDisplay } from "../LEDDisplay";
import { SignalMeter } from "../SignalMeter";
import { EjectButton } from "../EjectButton";
import { ToggleBank, PERSONALITY_TOGGLES } from "../ToggleBank";
import { Chat } from "../Chat";
import { Deterioration } from "../Deterioration";
import { buildSystemPrompt } from "../../utils/buildSystemPrompt";
import styles from "./App.module.css";

export function App() {
  const { temperature, setTemperature } = useTemperature();
  const { tokenRate } = useChatContext();
  const { activeToggles, toggle } = useToggles();
  const {
    messages,
    currentStreamedText,
    isGenerating,
    tokenCount,
    sendMessage,
    abort,
  } = useChat();

  const handleSendMessage = (content: string) => {
    const fragments = PERSONALITY_TOGGLES
      .filter((t) => activeToggles.has(t.id))
      .map((t) => t.prompt);
    const systemPrompt = fragments.length > 0 ? buildSystemPrompt(fragments) : undefined;
    sendMessage(content, temperature, systemPrompt);
  };

  return (
    <div className={styles.app}>
      <Faceplate>
        <Deterioration temperature={temperature} />

        <div className={styles.mainRow}>
          <div className={styles.controls}>
            <div className={styles.controlStrip}>
              <div className={styles.knobZone}>
                <Knob
                  temperature={temperature}
                  onTemperatureChange={setTemperature}
                />
              </div>

              <div className={styles.column}>
                <VUMeter tokenRate={tokenRate} temperature={temperature} />
                <EjectButton onEject={abort} disabled={!isGenerating} />
              </div>

              <div className={styles.column}>
                <LEDDisplay count={tokenCount} />
                <SignalMeter temperature={temperature} />
              </div>
            </div>

            <div className={styles.toggleZone}>
              <ToggleBank activeToggles={activeToggles} onToggle={toggle} />
            </div>
          </div>

          <div className={styles.chatZone}>
            <Chat
              messages={messages}
              currentStreamedText={currentStreamedText}
              isGenerating={isGenerating}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </Faceplate>
    </div>
  );
}
