"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("pwa_prompt_shown") === "1";
    const handler = (event: Event) => {
      event.preventDefault();
      if (alreadyShown) return;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
      sessionStorage.setItem("pwa_prompt_shown", "1");
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="surface fixed right-4 bottom-4 z-50 p-3 shadow-lg">
      <p className="mb-2 text-sm text-primary">Install NeoBazaar app?</p>
      <div className="flex gap-2">
        <button
          className="btn-primary btn-sm"
          onClick={async () => {
            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setVisible(false);
          }}
        >
          Install
        </button>
        <button className="btn-secondary btn-sm" onClick={() => setVisible(false)}>
          Later
        </button>
      </div>
    </div>
  );
}
