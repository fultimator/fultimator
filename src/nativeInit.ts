import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export async function initNativeShell(): Promise<void> {
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {}

  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });

  document.addEventListener(
    "click",
    (event) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const isExternal =
        /^https?:\/\//i.test(href) || anchor.target === "_blank";
      const isSameOrigin = href.startsWith(window.location.origin);
      if (isExternal && !isSameOrigin) {
        event.preventDefault();
        void Browser.open({ url: href });
      }
    },
    true,
  );

  try {
    await SplashScreen.hide();
  } catch {}
}
