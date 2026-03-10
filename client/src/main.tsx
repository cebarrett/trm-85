import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TemperatureProvider, ChatProvider, TogglesProvider } from "./context/AppContext";
import { App } from "./components/App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TemperatureProvider>
      <TogglesProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </TogglesProvider>
    </TemperatureProvider>
  </StrictMode>
);
