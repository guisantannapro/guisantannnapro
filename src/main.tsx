import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const RECOVERY_RELOAD_KEY = "__chunk_recovery_reload__";

const shouldReloadForRecovery = () => {
  try {
    const hasReloaded = sessionStorage.getItem(RECOVERY_RELOAD_KEY) === "1";
    if (hasReloaded) {
      sessionStorage.removeItem(RECOVERY_RELOAD_KEY);
      return false;
    }
    sessionStorage.setItem(RECOVERY_RELOAD_KEY, "1");
    return true;
  } catch {
    return true;
  }
};

const reloadBypassingStaleCache = () => {
  const url = new URL(window.location.href);
  url.searchParams.set("_reload", Date.now().toString());
  window.location.replace(url.toString());
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  if (shouldReloadForRecovery()) {
    reloadBypassingStaleCache();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason ?? "");

  if (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed")
  ) {
    event.preventDefault();
    if (shouldReloadForRecovery()) {
      reloadBypassingStaleCache();
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
