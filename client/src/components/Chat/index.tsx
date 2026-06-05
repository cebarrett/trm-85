import { useState, useRef, useEffect, useCallback } from "react";
import type { Message } from "../../types";
import styles from "./Chat.module.css";

interface ChatProps {
  messages: Message[];
  currentStreamedText: string;
  isGenerating: boolean;
  onSendMessage: (content: string) => void;
}

export function Chat({
  messages,
  currentStreamedText,
  isGenerating,
  onSendMessage,
}: ChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentStreamedText]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed || isGenerating) return;
      onSendMessage(trimmed);
      setInputValue("");
    },
    [inputValue, isGenerating, onSendMessage]
  );

  return (
    <div className={styles.container}>
      <div className={styles.screen}>
        <div className={styles.messageList}>
          {messages.map((message, index) => (
            <div key={index} className={styles.message}>
              <span
                className={
                  message.role === "user" ? styles.inputLabel : styles.outputLabel
                }
              >
                {message.role === "user" ? "INPUT >" : "OUTPUT >"}
              </span>
              <pre className={styles.messageText}>{message.content}</pre>
            </div>
          ))}

          {isGenerating && currentStreamedText && (
            <div className={styles.message}>
              <span className={styles.outputLabel}>OUTPUT &gt;</span>
              <pre className={styles.messageText}>
                {currentStreamedText}
                <span className={styles.cursor}>_</span>
              </pre>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.glare} aria-hidden="true" />
      </div>

      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Enter prompt..."
          disabled={isGenerating}
        />
        <button
          type="submit"
          className={styles.transmitButton}
          disabled={isGenerating}
        >
          TRANSMIT
        </button>
      </form>
    </div>
  );
}
