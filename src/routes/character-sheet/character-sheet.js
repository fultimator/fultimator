import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslate } from "../../translation/translate";
import { firestore } from "../../firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "@firebase/firestore";
import { Grid, Button, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import PlayerCard from "../../components/player/playerSheet/PlayerCard";
import PlayerNumbers from "../../components/player/playerSheet/PlayerNumbers";
import PlayerTraits from "../../components/player/playerSheet/PlayerTraits";
import PlayerBonds from "../../components/player/playerSheet/PlayerBonds";
import PlayerNotes from "../../components/player/playerSheet/PlayerNotes";
import PlayerClasses from "../../components/player/playerSheet/PlayerClasses";
import PlayerEquipment from "../../components/player/playerSheet/PlayerEquipment";
import PlayerSpellsFull from "../../components/player/playerSheet/PlayerSpellsFull";
import PlayerRituals from "../../components/player/playerSheet/PlayerRituals";
import PlayerCompanion from "../../components/player/playerSheet/PlayerCompanion";
import powered_by_fu from "../powered_by_fu.png";
import Layout from "../../components/Layout";
import { Download } from "@mui/icons-material";
import PlayerCardShort from "../../components/player/playerSheet/PlayerCardShort";

export default function CharacterSheet() {
  const { t } = useTranslate();
  let params = useParams();
  const ref = doc(firestore, "player-personal", params.playerId);
  const [player] = useDocumentData(ref, { idField: "id" });

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [fullCharacterSheet, setFullCharacterSheet] = useState(true);

  useEffect(() => {
    // Ensure all images are loaded before setting imagesLoaded to true
    const images = document.querySelectorAll("img");
    const promises = [];

    images.forEach((image) => {
      if (!image.complete) {
        promises.push(
          new Promise((resolve) => {
            image.onload = resolve;
          })
        );
      }
    });

    Promise.all(promises).then(() => {
      setImagesLoaded(true);
    });

    // Clean up
    return () => {
      images.forEach((image) => {
        image.onload = null;
      });
    };
  }, [player]);

  const takeScreenshot = async () => {
    if (!imagesLoaded) {
      // Images are not loaded yet, prevent taking screenshot
      return;
    }

    const element = document.getElementById(
      fullCharacterSheet ? "character-sheet" : "character-sheet-short"
    );

    // Set a fixed size for the screenshot
    const originalStyle = {
      width: element.style.width,
    };
    element.style.width = fullCharacterSheet ? "2000px" : "1700px"; // Example: Set to a fixed width

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: true,
      });
      const imgData = canvas.toDataURL("image/png");

      // Restore original size and transformations
      element.style.width = originalStyle.width;
      element.style.height = originalStyle.height;

      // Create a link to download the image
      const link = document.createElement("a");
      link.href = imgData;
      link.download = player.name + "_sheet.png";
      link.click();
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  if (!player) {
    return null;
  }

  return (
    <Layout fullWidth={true}>
      <Grid container spacing={1} sx={{ paddingX: 1 }}>
        <Grid item xs={10} >
          <Button
            variant="contained"
            color="primary"
            onClick={takeScreenshot}
            style={{ marginBottom: "16px", width: "100%" }} // Add margin to separate from grid
            startIcon={<Download />}
          >
            {t("Download Character Sheet")}
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setFullCharacterSheet(!fullCharacterSheet)}
            style={{ marginBottom: "16px", width: "100%" }} // Add margin to separate from grid
          >
            {fullCharacterSheet
              ? t("Short Character Sheet")
              : t("Full Character Sheet")}
          </Button>
        </Grid>
      </Grid>
      {fullCharacterSheet ? (
        <Grid container spacing={2} sx={{ padding: 1 }} id="character-sheet">
          <Grid container item xs={12} md={6} spacing={2}>
            <Grid item xs={12}>
              <PlayerCard
                player={player}
                isCharacterSheet={true}
                characterImage={player.info.imgurl}
              />
            </Grid>
            <Grid item xs={12}>
              <PlayerNumbers player={player} isCharacterSheet={true} />
            </Grid>
            <Grid item xs={12}>
              <PlayerTraits player={player} isCharacterSheet={true} />
            </Grid>
            <Grid item xs={12}>
              <PlayerBonds player={player} isCharacterSheet={true} />
            </Grid>
            <Grid item xs={12}>
              <PlayerRituals player={player} isCharacterSheet={true} />
            </Grid>
            <Grid item xs={12}>
              <PlayerEquipment player={player} isCharacterSheet={true} />
            </Grid>
            <Grid item xs={12}>
              <PlayerNotes player={player} isCharacterSheet={true} />
            </Grid>
          </Grid>
          <Grid container item xs={12} md={6} spacing={2}>
            <Grid item xs={12}>
              <PlayerClasses player={player} isCharacterSheet={true} />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <PlayerSpellsFull player={player} isCharacterSheet={true} />
          </Grid>
          <Grid item xs={6}>
            <PlayerCompanion player={player} isCharacterSheet={true} />
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={4}>
              <img
                src={powered_by_fu}
                alt="Powered by Fu"
                style={{ width: "100%", maxWidth: "15rem" }}
                onLoad={() => setImagesLoaded(true)}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" align="center">
                <span
                  style={{
                    fontWeight: "bolder",
                    fontSize: "1.6em",
                    textTransform: "uppercase",
                    verticalAlign: "middle",
                  }}
                >
                  {t("Made with Fultimator")}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid container sx={{ padding: 1 }} id="character-sheet-short">
          <Grid container item xs={12} md={12}>
            <Grid item xs={12}>
              <PlayerCardShort
                player={player}
                isCharacterSheet={true}
                characterImage={player.info.imgurl}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}
