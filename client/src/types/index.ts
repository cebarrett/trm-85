export interface Message {
  role: "user" | "assistant";
  content: string;
  temperature: number;
  timestamp: number;
}

export type TemperatureZone = "clean" | "warm" | "warning" | "danger" | "chaos";

export interface AppState {
  temperature: number;
  messages: Message[];
  currentStreamedText: string;
  isGenerating: boolean;
  abortController: AbortController | null;
  tokenCount: number;
  tokenRate: number;
}
