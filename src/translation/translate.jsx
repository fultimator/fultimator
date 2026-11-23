import en from "virtual:translations/en";

export const languageOptions = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano (Italian)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "pl", label: "Polski (Polish)" },
  { code: "fr", label: "Française (French)" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "zh-CN", label: "简体中文 (Chinese)" },
];

/*
    - Green is with key and with translated text on selected language
    - Red is no translated text on selected language

    How to update translations:

    - Go to console log and run: `console.log([...new Set(window.allUntranslatedKeys)].reduce((item,item2)=>{return item2 + "\n"+ item},""))` to get all untranslated keys and copy it.
    - Go to https://docs.google.com/spreadsheets/d/1H3GQGaND7PuyiWvFlfIUtmKYquJYEbgs5k8gGbqwUbs/edit#gid=0 and paste the untranslated keys on both keys and en column
    - Once machine translated, you can copy the text and repaste them using ctrl+shift+v to their cell to remove the =GOOGLETRANSLATE formula and export the csv
    - Go to https://csvjson.com/csv2json and convert the CSV to json and press copy to clipboard
    - Paste the whole json in ./translation/data.json
*/

const debugMode = false;

// data.json is split per language at build time (scripts/vite-plugin-translations.mjs).
// English is bundled as the fallback; the active language is loaded by
// loadLanguage() before the app renders. Changing language reloads the page.
const loaders = {
  it: () => import("virtual:translations/it"),
  de: () => import("virtual:translations/de"),
  pl: () => import("virtual:translations/pl"),
  fr: () => import("virtual:translations/fr"),
  es: () => import("virtual:translations/es"),
  "pt-BR": () => import("virtual:translations/pt-BR"),
  "zh-CN": () => import("virtual:translations/zh-CN"),
  ru: () => import("virtual:translations/ru"),
};
const dictionaries = { en };
let currentLanguage = "en";

// Language codes that were renamed; saved preferences may still use them.
const legacyLanguageCodes = { zh: "zh-CN" };

export async function loadLanguage(language) {
  language = legacyLanguageCodes[language] ?? language;
  if (language !== "en" && !loaders[language]) language = "en";
  if (language !== "en") {
    try {
      dictionaries[language] = (await loaders[language]()).default;
    } catch (error) {
      console.error(`Failed to load "${language}" translations`, error);
      return;
    }
  }
  currentLanguage = language;
}

const resolveLanguage = (allowedLanguages) =>
  allowedLanguages?.length > 0 && !allowedLanguages.includes(currentLanguage)
    ? "en"
    : currentLanguage;

const replaceKey = (key, noSpan, language, params) => {
  const translated = dictionaries[language]?.[key];

  if (debugMode) {
    if (!translated) {
      (window.allUntranslatedKeys ??= []).push(key);
    }
    if (!noSpan) {
      return (
        <span style={{ color: translated ? "darkgreen" : "red" }}>
          {translated ?? key}
        </span>
      );
    }
  }

  let text = translated ?? key;
  if (debugMode) text += translated ? "*TRANSLATED*" : "***NO_TRANSLATION**";

  // Handle parameter substitution
  if (params && Array.isArray(params)) {
    params.forEach((param, index) => {
      text = text.replace(new RegExp(`\\{${index}\\}`, "g"), param);
    });
  }
  return text;
};

// One stable `t` per language, so components and effects that depend on it
// don't re-run every render.
const translators = {};
const translatorFor = (language) =>
  (translators[language] ??= (key, params, noSpan) =>
    replaceKey(key, noSpan, language, params));

export const useTranslate = (allowedLanguages) => ({
  t: translatorFor(resolveLanguage(allowedLanguages)),
});

export const t = (key, params, noSpan, allowedLanguages) =>
  replaceKey(key, noSpan, resolveLanguage(allowedLanguages), params);

export const replacePlaceholders = (translatedText, replacements) => {
  let result = translatedText;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
};
