// Serves src/translation/data.json as one module per language
// ("virtual:translations/<lang>"), so a page load ships only the language it
// uses instead of every column of the spreadsheet export.
import { readFileSync } from "node:fs";
import path from "node:path";

const PREFIX = "virtual:translations/";

export default function translations() {
  const file = path.resolve(import.meta.dirname, "../src/translation/data.json");
  return {
    name: "translations",
    resolveId(id) {
      if (id.startsWith(PREFIX)) return "\0" + id;
    },
    load(id) {
      if (!id.startsWith("\0" + PREFIX)) return;
      const lang = id.slice(PREFIX.length + 1);
      this.addWatchFile(file);
      const dictionary = {};
      for (const entry of JSON.parse(readFileSync(file, "utf8"))) {
        // First entry wins for duplicate keys, matching the old Array.find.
        if (entry[lang] && !(entry.key in dictionary)) {
          dictionary[entry.key] = entry[lang];
        }
      }
      // JSON.parse of a string literal parses faster than an object literal.
      return `export default JSON.parse(${JSON.stringify(JSON.stringify(dictionary))});`;
    },
  };
}
