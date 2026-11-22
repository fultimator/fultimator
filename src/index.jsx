import ReactDOM from "react-dom/client";
import { registerPwaServiceWorker } from "./pwa/registerSW";
import { IS_CAPACITOR } from "./platform";
import { loadLanguage } from "./translation/translate";

registerPwaServiceWorker();

if (IS_CAPACITOR) {
  import("./nativeInit").then(({ initNativeShell }) => initNativeShell());
}

function savedLanguage() {
  try {
    return localStorage.getItem("selectedLanguage") || "en";
  } catch {
    return "en";
  }
}

// Load translations before importing the app: some modules translate labels
// at import time.
loadLanguage(savedLanguage())
  .then(() => import("./AppRoot"))
  .then(({ Root }) => {
    ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
  });
