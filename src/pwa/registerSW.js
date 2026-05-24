import { registerSW } from "virtual:pwa-register";

export function registerPwaServiceWorker() {
  if (import.meta.env.PROD) {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (window.confirm("New version available. Reload to update?")) {
          updateSW(true);
        }
      },
    });
  }
}
