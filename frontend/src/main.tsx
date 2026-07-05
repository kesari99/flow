import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { applyTheme } from "./stores/theme-store";
import "./index.css";
import App from "./App.tsx";

try {
  const stored = localStorage.getItem("promptflow-theme");
  if (stored) {
    const parsed = JSON.parse(stored) as { state?: { theme?: string } };
    if (parsed.state?.theme) {
      applyTheme(parsed.state.theme as "dark" | "light" | "system");
    }
  } else {
    applyTheme("dark");
  }
} catch {
  applyTheme("dark");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
