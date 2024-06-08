import React from "react";
import { Typography, IconButton, Grid } from "@mui/material";
import { Edit } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

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
        <Typography variant="h3" style={{ flexGrow: 1 }}>
          {spellName}
        </Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          {isEditMode && (
            <>
              <IconButton size="small" onClick={onEdit}>
                <Edit style={{ color: "white" }} />
              </IconButton>
            </>
          )}
        </div>
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
            PM x Target
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
            Max Targets
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
            Target Description
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
            Duration
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
            Description
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
      </Grid>
    </>
  );
}
