import React from "react";
import { Typography, IconButton, Grid } from "@mui/material";
import { Edit } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { OffensiveSpellIcon } from "../../icons"; // Ensure this path is correct
import attributes from "../../../libs/attributes";
import { CloseBracket, OpenBracket } from "../../Bracket";
import { useTranslate } from "../../../translation/translate";

export default function SpellDefault({
  spellName,
  mp,
  maxTargets,
  targetDesc,
  duration,
  description,
  onEdit,
  isOffensive,
  attr1,
  attr2,
  isEditMode,
}) {
  const { t } = useTranslate();

  return (
    <>
      <div
        style={{
          backgroundColor: "#2B4A42",
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "3px 17px",
          color: "white",
          textAlign: "left",
          marginBottom: "4px",
          marginTop: "10px",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h3" style={{ flexGrow: 1, marginRight: "5px" }}>
            {spellName}
          </Typography>
          {isOffensive && <OffensiveSpellIcon />}
        </div>
        {isEditMode && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton size="small" onClick={onEdit}>
              <Edit style={{ color: "white" }} />
            </IconButton>
          </div>
        )}
      </div>
      <Grid container>
        <Grid item xs={2}>
          <Typography
            variant="body1"
            style={{
              marginLeft: "10px",
              marginTop: "10px",
              fontWeight: "bold",
            }}
          >
            {t("MP x Target")}
          </Typography>
          <Typography
            variant="body1"
            style={{ marginLeft: "10px", marginTop: "10px" }}
          >
            {mp}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography
            variant="body1"
            style={{
              marginLeft: "10px",
              marginTop: "10px",
              fontWeight: "bold",
            }}
          >
            {t("Max Targets")}
          </Typography>
          <Typography
            variant="body1"
            style={{ marginLeft: "10px", marginTop: "10px" }}
          >
            {maxTargets}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography
            variant="body1"
            style={{
              marginLeft: "10px",
              marginTop: "10px",
              fontWeight: "bold",
            }}
          >
            {t("Target Description")}
          </Typography>
          <Typography
            variant="body1"
            style={{ marginLeft: "10px", marginTop: "10px" }}
          >
            {targetDesc}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography
            variant="body1"
            style={{
              marginLeft: "10px",
              marginTop: "10px",
              fontWeight: "bold",
            }}
          >
            {t("Duration")}
          </Typography>
          <Typography
            variant="body1"
            style={{ marginLeft: "10px", marginTop: "10px" }}
          >
            {duration}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            style={{
              marginLeft: "10px",
              marginTop: "10px",
              fontWeight: "bold",
            }}
          >
            {t("Description")}
          </Typography>
          <div
            style={{
              marginLeft: "10px",
              marginRight: "10px",
              marginTop: "10px",
            }}
          >
            <ReactMarkdown>{description}</ReactMarkdown>
          </div>
        </Grid>
        {isOffensive && (
          <Grid item xs={12}>
            <Typography
              variant="body1"
              style={{
                marginLeft: "10px",
                marginTop: "5px",
                fontWeight: "bold",
              }}
            >
              {t("Magic Check") + ": "}
              <strong>
                <OpenBracket />
                {t(attributes[attr1].shortcaps)}
                {t(" + ")}
                {t(attributes[attr2].shortcaps)}
                <CloseBracket />
              </strong>
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
}
