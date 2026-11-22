export async function registerPwaServiceWorker() {
  if (!import.meta.env.PROD || import.meta.env.VITE_TARGET === "electron") {
    return;
  }
  const { registerSW } = await import("virtual:pwa-register");
  const updateSW = registerSW({
    onNeedRefresh() {
      if (window.confirm("New version available. Reload to update?")) {
        updateSW(true);
      }
    },
  });
}
