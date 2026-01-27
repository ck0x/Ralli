import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n";
import App from "./App.tsx";
import { QueryProvider } from "@/providers/QueryProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { ClerkProviderWrapper } from "@/providers/ClerkProviderWrapper";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProviderWrapper>
      <I18nProvider>
        <QueryProvider>
          <App />
        </QueryProvider>
      </I18nProvider>
    </ClerkProviderWrapper>
  </StrictMode>,
);
