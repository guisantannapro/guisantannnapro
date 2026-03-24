import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const RECOVERY_PARAM = "__recover";

const reloadBypassingStaleCache = () => {
  const url = new URL(window.location.href);
  if (url.searchParams.has(RECOVERY_PARAM)) return;

  url.searchParams.set(RECOVERY_PARAM, "1");
  url.searchParams.set("_reload", Date.now().toString());
  window.location.replace(url.toString());
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadBypassingStaleCache();
});

const currentUrl = new URL(window.location.href);
if (currentUrl.searchParams.has(RECOVERY_PARAM)) {
  currentUrl.searchParams.delete(RECOVERY_PARAM);
  currentUrl.searchParams.delete("_reload");
  window.history.replaceState({}, "", currentUrl.toString());
}

createRoot(document.getElementById("root")!).render(<App />);
