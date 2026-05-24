import { registerSW } from "virtual:pwa-register";

export function registerPwaServiceWorker() {
  if (import.meta.env.PROD) {
    registerSW();
  }
}
