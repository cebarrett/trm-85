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
    let systemPrompt: string | undefined;
    if (activeToggles.size > 0) {
      const fragments = PERSONALITY_TOGGLES
        .filter((t) => activeToggles.has(t.id))
        .map((t) => t.prompt);
      systemPrompt =
        "You are an AI assistant with the following personality modifiers active simultaneously. Combine all of them in your responses:\n\n" +
        fragments.map((f, i) => `${i + 1}. ${f}`).join("\n");
    }
    sendMessage(content, temperature, systemPrompt);
  };

  return (
    <div className={styles.app}>
      <Faceplate>
        <Deterioration temperature={temperature} />

        <div className={styles.controlsSection}>
          <div className={styles.meterColumn}>
            <VUMeter tokenRate={tokenRate} temperature={temperature} />
          </div>

          <div className={styles.knobColumn}>
            <Knob
              temperature={temperature}
              onTemperatureChange={setTemperature}
            />
          </div>

          <div className={styles.meterColumn}>
            <VUMeter tokenRate={tokenRate} temperature={temperature} />
          </div>
        </div>

        <div className={styles.indicatorsSection}>
          <LEDDisplay count={tokenCount} />
          <SignalMeter temperature={temperature} />
          <EjectButton onEject={abort} disabled={!isGenerating} />
        </div>

        <div className={styles.toggleSection}>
          <ToggleBank activeToggles={activeToggles} onToggle={toggle} />
        </div>

        <div className={styles.chatSection}>
          <Chat
            messages={messages}
            currentStreamedText={currentStreamedText}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
          />
        </div>
      </Faceplate>
    </div>
  );
}
