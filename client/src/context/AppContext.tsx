import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Message } from "../types";

// --- Temperature Context ---

interface TemperatureState {
  temperature: number;
}

type TemperatureAction = { type: "SET_TEMPERATURE"; payload: number };

function temperatureReducer(
  state: TemperatureState,
  action: TemperatureAction
): TemperatureState {
  switch (action.type) {
    case "SET_TEMPERATURE":
      return { ...state, temperature: action.payload };
    default:
      return state;
  }
}

interface TemperatureContextValue {
  temperature: number;
  setTemperature: (value: number) => void;
}

const TemperatureContext = createContext<TemperatureContextValue | null>(null);

export function TemperatureProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(temperatureReducer, {
    temperature: 0.5,
  });

  const setTemperature = useCallback((value: number) => {
    dispatch({ type: "SET_TEMPERATURE", payload: value });
  }, []);

  return (
    <TemperatureContext.Provider
      value={{ temperature: state.temperature, setTemperature }}
    >
      {children}
    </TemperatureContext.Provider>
  );
}

export function useTemperature(): TemperatureContextValue {
  const context = useContext(TemperatureContext);
  if (!context) {
    throw new Error("useTemperature must be used within a TemperatureProvider");
  }
  return context;
}

// --- Personality Toggles Context ---

interface TogglesContextValue {
  activeToggles: Set<string>;
  toggle: (id: string) => void;
}

const TogglesContext = createContext<TogglesContextValue | null>(null);

export function TogglesProvider({ children }: { children: ReactNode }) {
  const [activeToggles, setActiveToggles] = useReducer(
    (state: Set<string>, id: string) => {
      const next = new Set(state);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    },
    new Set<string>()
  );

  return (
    <TogglesContext.Provider value={{ activeToggles, toggle: setActiveToggles }}>
      {children}
    </TogglesContext.Provider>
  );
}

export function useToggles(): TogglesContextValue {
  const context = useContext(TogglesContext);
  if (!context) {
    throw new Error("useToggles must be used within a TogglesProvider");
  }
  return context;
}

// --- Chat Context ---

interface ChatState {
  messages: Message[];
  currentStreamedText: string;
  isGenerating: boolean;
  tokenCount: number;
  tokenRate: number;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_STREAMED_TEXT"; payload: string }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "ADD_TOKENS"; payload: number }
  | { type: "SET_TOKEN_RATE"; payload: number }
  | { type: "FINISH_GENERATION"; payload: { assistantMessage: Message } }
  | { type: "CLEAR_MESSAGES" };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_STREAMED_TEXT":
      return { ...state, currentStreamedText: action.payload };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };
    case "ADD_TOKENS":
      return { ...state, tokenCount: state.tokenCount + action.payload };
    case "SET_TOKEN_RATE":
      return { ...state, tokenRate: action.payload };
    case "FINISH_GENERATION":
      return {
        ...state,
        messages: [...state.messages, action.payload.assistantMessage],
        currentStreamedText: "",
        isGenerating: false,
      };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [], currentStreamedText: "" };
    default:
      return state;
  }
}

interface ChatContextValue {
  messages: Message[];
  currentStreamedText: string;
  isGenerating: boolean;
  tokenCount: number;
  tokenRate: number;
  dispatch: React.Dispatch<ChatAction>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    currentStreamedText: "",
    isGenerating: false,
    tokenCount: 0,
    tokenRate: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  return (
    <ChatContext.Provider value={{ ...state, dispatch, abortControllerRef }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
