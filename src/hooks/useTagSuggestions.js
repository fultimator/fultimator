import { useCallback, useRef, useState } from "react";

const NO_TAGS = [];

export function rankTags(items) {
  const counts = {};
  items?.forEach((item) =>
    item.tags?.forEach((tag) => {
      const name = tag?.name?.toUpperCase();
      if (name) counts[name] = (counts[name] || 0) + 1;
    }),
  );
  return Object.keys(counts).sort(
    (a, b) => counts[b] - counts[a] || a.localeCompare(b),
  );
}

export function useTagSuggestions(db, collectionName) {
  const [suggestions, setSuggestions] = useState(NO_TAGS);
  const loadedFrom = useRef(null);

  const load = useCallback(() => {
    if (!db || !collectionName || loadedFrom.current === db) return;
    loadedFrom.current = db;
    db.getCachedDocs(db.query(db.collection(collectionName)))
      .then((docs) => setSuggestions(rankTags(docs)))
      .catch(() => setSuggestions(NO_TAGS));
  }, [db, collectionName]);

  return { suggestions, load };
}
