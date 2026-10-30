import ReactDOM from "react-dom/client";
import { Root } from "./AppRoot";
import { registerPwaServiceWorker } from "./pwa/registerSW";
import { IS_CAPACITOR } from "./platform";

registerPwaServiceWorker();

if (IS_CAPACITOR) {
  import("./nativeInit").then(({ initNativeShell }) => initNativeShell());
}

const root = document.getElementById("root");
const rootElement = ReactDOM.createRoot(root);
rootElement.render(<Root />);
