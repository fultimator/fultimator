const PWA_REGISTER_MODULE = "virtual:pwa-register";

export async function registerPwaServiceWorker() {
  if (import.meta.env.PROD && import.meta.env.VITE_TARGET !== "electron") {
    const { registerSW } = await import(/* @vite-ignore */ PWA_REGISTER_MODULE);
    const updateSW = registerSW({
      onNeedRefresh() {
        if (window.confirm("New version available. Reload to update?")) {
          updateSW(true);
        }
      },
    });
  }
}
