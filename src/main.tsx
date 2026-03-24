import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const RECOVERY_PARAM = "__recover";
const RECOVERY_ATTEMPT_KEY = "lovable_chunk_recovery_attempted";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "";
  }
};

const isRecoverableChunkError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  if (!message) return false;

  return [
    "chunkloaderror",
    "loading chunk",
    "failed to fetch dynamically imported module",
    "importing a module script failed",
    "dynamically imported module",
    "load failed",
    "unexpected token '<'",
  ].some((term) => message.includes(term));
};

const getRecoveryAttempted = () => {
  try {
    return window.sessionStorage.getItem(RECOVERY_ATTEMPT_KEY) === "1";
  } catch {
    return false;
  }
};

const setRecoveryAttempted = () => {
  try {
    window.sessionStorage.setItem(RECOVERY_ATTEMPT_KEY, "1");
  } catch {
    // ignore
  }
};

const clearRecoveryAttempted = () => {
  try {
    window.sessionStorage.removeItem(RECOVERY_ATTEMPT_KEY);
  } catch {
    // ignore
  }
};

const showRecoveryFallback = () => {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = "";

  const container = document.createElement("div");
  container.className = "min-h-screen bg-background text-foreground flex items-center justify-center p-6";

  const card = document.createElement("div");
  card.className = "w-full max-w-md rounded-lg border border-border bg-card p-6 text-center space-y-3";

  const title = document.createElement("h1");
  title.className = "text-xl font-semibold";
  title.textContent = "Falha ao carregar a página";

  const description = document.createElement("p");
  description.className = "text-sm text-muted-foreground";
  description.textContent = "Clique em tentar novamente para recarregar o projeto.";

  const button = document.createElement("button");
  button.className = "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground";
  button.textContent = "Tentar novamente";
  button.onclick = () => {
    clearRecoveryAttempted();
    window.location.reload();
  };

  card.append(title, description, button);
  container.appendChild(card);
  root.appendChild(container);
};

const reloadBypassingStaleCache = () => {
  const url = new URL(window.location.href);
  if (url.searchParams.has(RECOVERY_PARAM)) {
    showRecoveryFallback();
    return;
  }

  setRecoveryAttempted();
  url.searchParams.set(RECOVERY_PARAM, "1");
  url.searchParams.set("_reload", Date.now().toString());
  window.location.replace(url.toString());
};

const handleRecoverableError = (error: unknown) => {
  if (!isRecoverableChunkError(error)) return false;

  if (getRecoveryAttempted()) {
    showRecoveryFallback();
    return true;
  }

  reloadBypassingStaleCache();
  return true;
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const payload = (event as Event & { payload?: unknown }).payload;

  if (!handleRecoverableError(payload ?? event)) {
    reloadBypassingStaleCache();
  }
});

window.addEventListener("error", (event) => {
  handleRecoverableError(event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  if (handleRecoverableError(event.reason)) {
    event.preventDefault();
  }
});

const currentUrl = new URL(window.location.href);
const loadedFromRecovery = currentUrl.searchParams.has(RECOVERY_PARAM);

if (loadedFromRecovery) {
  currentUrl.searchParams.delete(RECOVERY_PARAM);
  currentUrl.searchParams.delete("_reload");
  window.history.replaceState({}, "", currentUrl.toString());
} else {
  clearRecoveryAttempted();
}

class RootErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Root render error:", error);
    handleRecoverableError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center space-y-3">
            <h1 className="text-xl font-semibold">Ocorreu um erro ao abrir o projeto</h1>
            <p className="text-sm text-muted-foreground">Tente recarregar para continuar.</p>
            <button
              type="button"
              onClick={() => {
                clearRecoveryAttempted();
                window.location.reload();
              }}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root não encontrado");
}

createRoot(rootElement).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>,
);
