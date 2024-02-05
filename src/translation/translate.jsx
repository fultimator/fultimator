import { useEffect, useState } from "react";
import data from "./data.json";

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

const replaceKey = (key, noSpan, language) => {
  if (debugMode) {
    if (!translate(key) || !translate(key)[language]) {
      if (!window.allUntranslatedKeys) {
        window.allUntranslatedKeys = [key];
      } else {
        window.allUntranslatedKeys.push(key);
      }
    }

    if (noSpan) {
      return !translate(key)
        ? key + "***NO_KEY***"
        : !translate(key)[language]
        ? key + "***NO_TRANSLATION**"
        : translate(key)[language]
        ? translate(key)[language] + "*TRANSLATED*"
        : key;
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
    return translate(key) && translate(key)[language]
      ? translate(key)[language]
      : key;
  }
};

export const useTranslate = () => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(localStorage.getItem("selectedLanguage") || "en");
  }, []);
  const t = (key, noSpan) => {
    return replaceKey(key, noSpan, language);
  };

  return { t };
};

export const t = (key, noSpan) => {
  const language = localStorage.getItem("selectedLanguage") || "en";
  return replaceKey(key, noSpan, language);
};
