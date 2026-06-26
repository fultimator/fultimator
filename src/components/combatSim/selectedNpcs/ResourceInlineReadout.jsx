import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { IoIosWarning } from "react-icons/io";
import { t } from "../../../translation/translate";

function StatLink({
  label,
  current,
  max,
  color,
  hoverColor,
  onClick,
  warn = false,
}) {
  return (
    <Tooltip
      title={t(`combat_sim_edit_${label.toLowerCase()}`)}
      enterDelay={500}
      enterNextDelay={500}
    >
      <Typography
        component="button"
        type="button"
        onClick={onClick}
        sx={{
          all: "unset",
          cursor: "pointer",
          color,
          fontFamily: "Antonio",
          fontWeight: 700,
          fontSize: { xs: "0.84rem", sm: "0.96rem" },
          letterSpacing: "0.02em",
          lineHeight: 1.05,
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          transition: "color 0.16s ease",
          "&:hover": { color: hoverColor, textDecoration: "underline" },
        }}
      >
        {current}/{max} {label}
        {warn && (
          <IoIosWarning
            style={{ fontSize: "1.05em", verticalAlign: "middle" }}
          />
        )}
      </Typography>
    </Tooltip>
  );
}

export default function ResourceInlineReadout({
  currentHp,
  maxHp,
  currentMp,
  maxMp,
  hpColor,
  hpHover,
  mpColor,
  mpHover,
  currentIp = null,
  maxIp = null,
  ipColor = "#4CAF50",
  ipHover = "#388E3C",
  currentFp = null,
  maxFp = null,
  fpColor = "#FF9800",
  fpHover = "#F57C00",
  currentUp = null,
  maxUp = null,
  upColor = "#674168",
  upHover = "#563257",
  onHpClick,
  onMpClick,
  onIpClick,
  onFpClick,
  onUpClick,
}) {
  const lowHp = currentHp <= Math.floor(maxHp / 2);
  const hasIp =
    Number.isFinite(currentIp) && Number.isFinite(maxIp) && maxIp > 0;
  const hasFp =
    Number.isFinite(currentFp) && Number.isFinite(maxFp) && maxFp > 0;
  const hasUp =
    Number.isFinite(currentUp) && Number.isFinite(maxUp) && maxUp > 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.8,
        flexWrap: "wrap",
        mt: 0.15,
      }}
    >
      <StatLink
        label="HP"
        current={currentHp}
        max={maxHp}
        color={hpColor}
        hoverColor={hpHover}
        onClick={onHpClick}
        warn={lowHp}
      />
      <Typography
        sx={{ color: "text.disabled", fontSize: "0.78rem", lineHeight: 1 }}
      >
        |
      </Typography>
      <StatLink
        label="MP"
        current={currentMp}
        max={maxMp}
        color={mpColor}
        hoverColor={mpHover}
        onClick={onMpClick}
      />
      {hasIp && (
        <>
          <Typography
            sx={{ color: "text.disabled", fontSize: "0.78rem", lineHeight: 1 }}
          >
            |
          </Typography>
          <StatLink
            label="IP"
            current={currentIp}
            max={maxIp}
            color={ipColor}
            hoverColor={ipHover}
            onClick={onIpClick}
          />
        </>
      )}
      {hasFp && (
        <>
          <Typography
            sx={{ color: "text.disabled", fontSize: "0.78rem", lineHeight: 1 }}
          >
            |
          </Typography>
          <StatLink
            label="FP"
            current={currentFp}
            max={maxFp}
            color={fpColor}
            hoverColor={fpHover}
            onClick={onFpClick}
          />
        </>
      )}
      {hasUp && (
        <>
          <Typography
            sx={{ color: "text.disabled", fontSize: "0.78rem", lineHeight: 1 }}
          >
            |
          </Typography>
          <StatLink
            label="UP"
            current={currentUp}
            max={maxUp}
            color={upColor}
            hoverColor={upHover}
            onClick={onUpClick}
          />
        </>
      )}
    </Box>
  );
}
