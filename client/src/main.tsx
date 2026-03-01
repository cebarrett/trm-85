import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TemperatureProvider, ChatProvider } from "./context/AppContext";
import { App } from "./components/App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TemperatureProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </TemperatureProvider>
  </StrictMode>
);
