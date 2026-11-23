import { IS_CAPACITOR, IS_ELECTRON } from "../platform";

export async function registerPwaServiceWorker() {
  if (!import.meta.env.PROD || IS_ELECTRON) return;

  // Native shells ship their assets; drop any worker left by earlier builds.
  if (IS_CAPACITOR) {
    const regs = await navigator.serviceWorker?.getRegistrations();
    await Promise.all((regs ?? []).map((r) => r.unregister()));
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
