import ReactDOM from "react-dom/client";
import { Root } from "./AppRoot";
import { registerPwaServiceWorker } from "./pwa/registerSW";

registerPwaServiceWorker();

const root = document.getElementById("root");
const rootElement = ReactDOM.createRoot(root);
rootElement.render(<Root />);
