import { lazy, Suspense, useState } from "react";

const CompendiumViewerModal = lazy(() => import("./CompendiumViewerModal"));

// Loads the compendium and its item data on first open instead of at app
// start, then stays mounted so it keeps its state between opens.
export default function LazyCompendiumViewerModal(props) {
  const [requested, setRequested] = useState(props.open);
  if (props.open && !requested) setRequested(true);
  if (!requested) return null;
  return (
    <Suspense fallback={null}>
      <CompendiumViewerModal {...props} />
    </Suspense>
  );
}
