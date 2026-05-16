import React, { useState } from "react";
import { Grid, Typography, Box, Dialog } from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import Diamond from "../../../Diamond";
import { StyledMarkdown } from "./shared";

function Rank({ npc }) {
  const { t } = useTranslate();
  return (
    <>
      {npc.rank === "elite" && t("Elite")}
      {npc.rank === "champion1" && t("Champion (1)")}
      {npc.rank === "champion2" && t("Champion (2)")}
      {npc.rank === "champion3" && t("Champion (3)")}
      {npc.rank === "champion4" && t("Champion (4)")}
      {npc.rank === "champion5" && t("Champion (5)")}
      {npc.rank === "champion6" && t("Champion (6)")}
      {npc.rank === "companion" && t("Companion")}
      {npc.rank === "groupvehicle" && (
        <>
          {npc.sizes === "small" && t("Small")}
          {npc.sizes === "medium" && t("Medium")}
          {npc.sizes === "large" && t("Large")}
          {npc.sizes && " "}
          {t("Group Vehicle")}
        </>
      )}
    </>
  );
}

function VillainPhase({ villain, phases, multipart }) {
  const { t } = useTranslate();

  const getVillainLabel = (villainType) => {
    switch (villainType) {
      case "minor":
        return t("minor_villain");
      case "major":
        return t("major_villain");
      case "supreme":
        return t("supreme_villain");
      default:
        return "";
    }
  };

  const phaseString =
    phases && phases >= 1 ? `${t("Phase", true)} ${phases}` : null;
  const values = [getVillainLabel(villain), phaseString, multipart].filter(
    Boolean,
  );
  const combinedString = values.length > 0 ? values.join(" ⬥ ") : null;

  return <>{combinedString}</>;
}

export function NpcHeader({ npc, npcImage }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [open, setOpen] = useState(false);

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, #4C3D51 100%)`
      : `linear-gradient(90deg, #674168 0%, #b9a9be 100%)`;

  const borderImage =
    theme.mode === "dark"
      ? "linear-gradient(45deg, #b9a9be, #ffffff) 1"
      : "linear-gradient(45deg, #b9a9be, #ffffff) 1";

  const borderImageBody =
    theme.mode === "dark"
      ? "linear-gradient(45deg, #674168, #ffffff) 1"
      : "linear-gradient(45deg, #674168, #ffffff) 1";

  const borderRight =
    theme.mode === "dark" ? `4px solid #1f1f1f` : `4px solid white`;
  const borderLeft =
    theme.mode === "dark" ? "2px solid #4C3D51" : "2px solid #b9a9be";
  const borderBottom =
    theme.mode === "dark" ? "2px solid #4C3D51" : "2px solid #b9a9be";

  return (
    <Grid container sx={{ alignItems: "stretch" }}>
      <Grid
        container
        sx={{
          width: 1,
          flexDirection: "column",
          "@container (min-width: 480px)": { flexDirection: "row" },
        }}
      >
        <Grid
          sx={{
            background,
            borderRight,
            px: 2,
            flex: "1 1 auto",
          }}
        >
          <Typography
            sx={{
              color: "white.main",
              fontFamily: "Antonio",
              fontSize: "1.5rem",
              fontWeight: "medium",
              textTransform: "uppercase",
            }}
          >
            {npc.name}
          </Typography>
        </Grid>
        <Grid
          sx={{
            px: 2,
            py: 0.5,
            borderLeft,
            borderBottom,
            borderImage,
            flex: "0 0 auto",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Antonio",
              fontSize: "1.25rem",
              fontWeight: "medium",
              textTransform: "uppercase",
            }}
          >
            {t("Lvl")} {npc.lvl} <Rank npc={npc} /> <Diamond /> {t(npc.species)}
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", width: 1 }}>
        {npcImage ? (
          <Box
            sx={{
              minWidth: "128px",
              width: "128px",
              height: "auto",
              background: "white",
              border: "1px solid #684268",
              borderTop: "none",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => setOpen(true)}
          >
            <img
              src={npcImage}
              alt="NPC Avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center center",
                display: "block",
              }}
            />
          </Box>
        ) : null}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <img
            src={npc.imgurl}
            alt="Expanded NPC Avatar"
            style={{ width: "100%", height: "auto" }}
            onClick={() => setOpen(false)}
          />
        </Dialog>
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {(npc.villain || npc.phases || npc.multipart) && (
            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderBottom,
                borderImage: borderImageBody,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: "1.25rem",
                  textTransform: "uppercase",
                }}
              >
                <VillainPhase
                  villain={npc.villain}
                  phases={npc.phases}
                  multipart={npc.multipart}
                />
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderBottom,
              borderImage: borderImageBody,
              flexGrow: 1,
            }}
          >
            <StyledMarkdown>{npc.description}</StyledMarkdown>
          </Box>
          <Box sx={{ px: 2, py: 0.5 }}>
            <Typography>
              <strong>{t("Typical Traits:")} </strong>
              {npc.traits}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
}
