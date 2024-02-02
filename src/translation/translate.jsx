import data from "./data.json";

const translate = (key) => {
  return data.find((item) => item.key === key);
};

const language = "it";
const debugMode = true;

/*
    - Green is with key and with translated text on selected language
    - Yellow is with key but no translated text on selected language
    - Red is no key and no translated text

    How to update translations:

    - Go to console log and run: `console.log(window.allUntranslatedKeys)` to get all untranslated keys and copy it.
    - Go to https://docs.google.com/spreadsheets/d/1H3GQGaND7PuyiWvFlfIUtmKYquJYEbgs5k8gGbqwUbs/edit#gid=0 and paste the untranslated keys on both keys and en column
    - Once machine translated, you can copy the text and repaste them using ctrl+shift+v to their cell to remove the =GOOGLETRANSLATE formula and export the csv
    - Go to https://csvjson.com/csv2json and convert the CSV to json and press copy to clipboard
    - Paste the whole json in ./translation/data.json
*/

export const t = (key) => {
  if (debugMode) {
    if (!translate(key) || translate(key)[language]) {
      if (!window.allUntranslatedKeys) {
        window.allUntranslatedKeys = key + "\n";
      } else {
        window.allUntranslatedKeys = window.allUntranslatedKeys + key + "\n";
      }
    }

    return !translate(key) ? (
      <span style={{ color: "red" }}>{key}</span>
    ) : !translate(key)[language] ? (
      <span style={{ color: "orange" }}>{key}</span>
    ) : (
      <span style={{ color: "darkgreen" }}>
        {translate(key)[language] ? translate(key)[language] : key}
      </span>
    );
  } else {
    return translate(key) && translate(key)[language]
      ? translate(key)[language]
      : key;
  }
};
