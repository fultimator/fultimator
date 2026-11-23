import { describe, expect, it } from "vitest";
import data from "./data.json";
import { loadLanguage, t, useTranslate } from "./translate";

type Entry = { key: string } & Record<string, string | undefined>;
const entries = data as Entry[];
const languages = [
  ...new Set(
    entries.flatMap((e) => Object.keys(e).filter((k) => k && k !== "key")),
  ),
];

// The pre-split lookup: first entry with the key, its text or the key itself.
const expected = (key: string, lang: string) =>
  entries.find((e) => e.key === key)?.[lang] || key;

describe("translate", () => {
  it.each(languages)("matches data.json for every key in %s", async (lang) => {
    await loadLanguage(lang);
    for (const { key } of entries) {
      expect(t(key)).toBe(expected(key, lang));
    }
  });

  it("falls back to the key when it is missing", async () => {
    await loadLanguage("en");
    expect(t("no_such_key_xyz")).toBe("no_such_key_xyz");
  });

  it("substitutes positional params", async () => {
    await loadLanguage("en");
    expect(t("{0} and {1}", ["a", "b"])).toBe("a and b");
  });

  it("uses English when the language is not allowed", async () => {
    await loadLanguage("it");
    const key = entries.find((e) => e.en && e.it && e.en !== e.it)!.key;
    expect(t(key, undefined, undefined, ["en"])).toBe(expected(key, "en"));
    expect(useTranslate(["en"]).t(key)).toBe(expected(key, "en"));
  });

  it("returns a stable t per language", async () => {
    await loadLanguage("de");
    expect(useTranslate().t).toBe(useTranslate().t);
  });
});
