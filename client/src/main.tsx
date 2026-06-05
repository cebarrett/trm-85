import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TemperatureProvider, ChatProvider, TogglesProvider, EqProvider } from "./context/AppContext";
import { App } from "./components/App";
import "./styles/tokens.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TemperatureProvider>
      <TogglesProvider>
        <EqProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </EqProvider>
      </TogglesProvider>
    </TemperatureProvider>
  </StrictMode>
);
