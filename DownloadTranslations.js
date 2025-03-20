const https = require("https");
const fs = require("node:fs");
const Papa = require("papaparse");

https
  .get(
    "https://docs.google.com/spreadsheets/d/1H3GQGaND7PuyiWvFlfIUtmKYquJYEbgs5k8gGbqwUbs/gviz/tq?tqx=out:csv&sheet=Sheet1",
    (res) => {
      let data = [];

      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => {
        const csv = Buffer.concat(data).toString();

        const translationJSON = Papa.parse(csv, { header: true });

        console.log(translationJSON);

        console.log("=== Downloaded Translations ===");
        fs.writeFile(
          "./src/translation/data.json",
          JSON.stringify(translationJSON.data),
          (err) => {
            if (err) {
              console.error(err);
            } else {
              // file written successfully
            }
          }
        );
      });
    }
  )
  .on("error", (err) => {
    console.log("Error: ", err.message);
  });
