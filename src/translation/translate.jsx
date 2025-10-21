import { useEffect, useState } from "react";
import data from "./data.json";

export const languageOptions = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano (Italian)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "pl", label: "Polski (Polish)" },
  { code: "fr", label: "Française (French)" },
  { code: "pt-BR", label: "Português (Brasil)" },
  // Continue?
];

/*
    - Green is with key and with translated text on selected language
    - Yellow is with key but no translated text on selected language
    - Red is no key and no translated text

    How to update translations:

    - Go to console log and run: `console.log([...new Set(window.allUntranslatedKeys)].reduce((item,item2)=>{return item2 + "\n"+ item},""))` to get all untranslated keys and copy it.
    - Go to https://docs.google.com/spreadsheets/d/1H3GQGaND7PuyiWvFlfIUtmKYquJYEbgs5k8gGbqwUbs/edit#gid=0 and paste the untranslated keys on both keys and en column
    - Once machine translated, you can copy the text and repaste them using ctrl+shift+v to their cell to remove the =GOOGLETRANSLATE formula and export the csv
    - Go to https://csvjson.com/csv2json and convert the CSV to json and press copy to clipboard
    - Paste the whole json in ./translation/data.json
*/

const debugMode = false;

const translate = (key) => {
  return data.find((item) => item.key === key);
};

const replaceKey = (key, noSpan, language, params) => {
  if (debugMode) {
    if (!translate(key) || !translate(key)[language]) {
      if (!window.allUntranslatedKeys) {
        window.allUntranslatedKeys = [key];
      } else {
        window.allUntranslatedKeys.push(key);
      }
    }

    if (noSpan) {
      let text = !translate(key)
        ? key + "***NO_KEY***"
        : !translate(key)[language]
        ? key + "***NO_TRANSLATION**"
        : translate(key)[language]
        ? translate(key)[language] + "*TRANSLATED*"
        : key;
      
      // Handle parameter substitution
      if (params && Array.isArray(params)) {
        params.forEach((param, index) => {
          text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), param);
        });
      }
      return text;
    } else {
      return !translate(key) ? (
        <span style={{ color: "red" }}>{key}</span>
      ) : !translate(key)[language] ? (
        <span style={{ color: "orange" }}>{key}</span>
      ) : (
        <span style={{ color: "darkgreen" }}>
          {translate(key)[language] ? translate(key)[language] : key}
        </span>
      );
    }
  } else {
    let text = translate(key) && translate(key)[language]
      ? translate(key)[language]
      : key;
    
    // Handle parameter substitution
    if (params && Array.isArray(params)) {
      params.forEach((param, index) => {
        text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), param);
      });
    }
    return text;
  }
};

export const useTranslate = (allowedLanguages) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(localStorage.getItem("selectedLanguage") || "en");
  }, []);

  if (
    allowedLanguages &&
    allowedLanguages.length > 0 &&
    !allowedLanguages.includes(language)
  ) {
    setLanguage("en");
  }
  const t = (key, params, noSpan) => {
    return replaceKey(key, noSpan, language, params);
  };

  return { t };
};

export const t = (key, params, noSpan, allowedLanguages) => {
  let language = localStorage.getItem("selectedLanguage") || "en";
  if (
    allowedLanguages &&
    allowedLanguages.length > 0 &&
    !allowedLanguages.includes(language)
  ) {
    language = "en";
  }
  return replaceKey(key, noSpan, language, params);
};

export const replacePlaceholders = (translatedText, replacements) => {
  let result = translatedText;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
};
