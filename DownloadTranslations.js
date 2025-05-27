import https from "https";
import fs from "node:fs";
import Papa from "papaparse";
import { Buffer } from "node:buffer";

// Configuration - specify the sheets you want to download
const sheetNames = ["General", "Classes", "Skills", "CombatSim", "Notes-Editor"]; // Add or remove sheet names as needed
const googleSheetId = "1H3GQGaND7PuyiWvFlfIUtmKYquJYEbgs5k8gGbqwUbs";
const outputPath = "./src/translation/data.json";

// Function to download a single sheet
function downloadSheet(sheetName) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    
    https.get(url, (res) => {
      let data = [];

      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => {
        const csv = Buffer.concat(data).toString();

        try {
          const parseResult = Papa.parse(csv, { header: true });
          console.log(`Downloaded sheet: ${sheetName}`);
          resolve(parseResult.data);
        } catch (error) {
          reject(`Error parsing CSV from sheet "${sheetName}": ${error.message}`);
        }
      });
    }).on("error", (err) => {
      reject(`Error downloading sheet "${sheetName}": ${err.message}`);
    });
  });
}

// Main function to download all sheets and combine them
async function downloadAllSheets() {
  try {
    console.log("=== Downloading Translations ===");
    
    // Download all sheets in parallel
    const sheetsDataPromises = sheetNames.map(sheetName => downloadSheet(sheetName));
    const sheetsData = await Promise.all(sheetsDataPromises);
    
    // Combine all sheet data into a single array
    const combinedData = sheetsData.flat();
    
    // Write combined data to file with minimized JSON (no whitespace)
    fs.writeFile(
      outputPath,
      JSON.stringify(combinedData),
      (err) => {
        if (err) {
          console.error(`Error writing to file: ${err}`);
        } else {
          console.log(`=== Combined Translation File Created Successfully ===`);
          console.log(`Wrote data from ${sheetNames.length} sheets to ${outputPath}`);
        }
      }
    );
  } catch (error) {
    console.error(`Error in download process: ${error}`);
  }
}

// Execute the script (use npm run translate to run this script)
downloadAllSheets();