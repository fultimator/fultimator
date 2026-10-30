import React from "react";
import { Button, Typography, Tooltip, Box } from "@mui/material";
import { useTheme } from "@mui/system";
import { useTranslate } from "../../translation/translate";
import ActorEditModal from "../../forms/ui/ActorEditModal";

interface SkillLevelModalProps {
  open: boolean;
  onClose: () => void;
  headerText: string;
  currentLvl: number;
  maxLvl: number;
  onIncrease: () => void;
  onDecrease: () => void;
  isEditMode: boolean;
  increaseDisabled?: boolean;
  increaseTooltip?: string;
  investedLevels?: number;
}

const SkillLevelModal: React.FC<SkillLevelModalProps> = ({
  open,
  onClose,
  headerText,
  currentLvl,
  maxLvl,
  onIncrease,
  onDecrease,
  isEditMode,
  increaseDisabled = false,
  increaseTooltip,
  investedLevels,
}) => {
  const { t } = useTranslate();
  const theme = useTheme();

  const starCount = Number(maxLvl) || 0;
  const maxPerRow = 5;
  const rowCount = Math.max(1, Math.ceil(starCount / maxPerRow));
  const baseRowSize = Math.floor(starCount / rowCount);
  const extra = starCount % rowCount;
  const starRows: number[][] = [];
  let cursor = 0;
  for (let r = 0; r < rowCount; r++) {
    const rowSize = baseRowSize + (r < extra ? 1 : 0);
    starRows.push(Array.from({ length: rowSize }, (_, i) => cursor + i));
    cursor += rowSize;
  }

  const EmptyStarSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 95.74 95.98"
      width="28"
      height="28"
    >
      <path
        fill="white"
        opacity=".96"
        stroke={theme.palette.secondary.main}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6px"
        d="M33.55,33.94l-28.7,11.66c-2.5,1.01-2.46,4.56.06,5.52l29,11.08,11.7,28.97c.98,2.43,4.44,2.41,5.39-.04l11.28-29.09,28.57-11.79c2.54-1.05,2.51-4.66-.05-5.66l-28.84-11.27-11.73-28.5c-1.02-2.47-4.54-2.43-5.5.06l-11.18,29.04Z"
      />
    </svg>
  );

  const FilledStarSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 95.74 95.98"
      width="28"
      height="28"
    >
      <path
        fill="gold"
        opacity=".96"
        stroke={theme.palette.secondary.main}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6px"
        d="M33.55,33.94l-28.7,11.66c-2.5,1.01-2.46,4.56.06,5.52l29,11.08,11.7,28.97c.98,2.43,4.44,2.41,5.39-.04l11.28-29.09,28.57-11.79c2.54-1.05,2.51-4.66-.05-5.66l-28.84-11.27-11.73-28.5c-1.02-2.47-4.54-2.43-5.5.06l-11.18,29.04Z"
      />
    </svg>
  );

  const actions = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      {isEditMode && (
        <Tooltip title={currentLvl <= 0 ? "" : t("Decrease Level")}>
          <span>
            <Button
              variant="outlined"
              color="error"
              onClick={onDecrease}
              disabled={currentLvl <= 0}
              sx={{
                minWidth: 48,
                minHeight: 36,
                fontSize: "1.25rem",
                lineHeight: 1,
              }}
            >
              −
            </Button>
          </span>
        </Tooltip>
      )}
      <Button onClick={onClose} color="secondary" variant="contained">
        {t("Close")}
      </Button>
      {isEditMode && (
        <Tooltip
          title={
            currentLvl >= maxLvl || increaseDisabled
              ? (increaseTooltip ?? "")
              : t("Increase Level")
          }
        >
          <span>
            <Button
              variant="outlined"
              color="success"
              onClick={onIncrease}
              disabled={currentLvl >= maxLvl || increaseDisabled}
              sx={{
                minWidth: 48,
                minHeight: 36,
                fontSize: "1.25rem",
                lineHeight: 1,
              }}
            >
              +
            </Button>
          </span>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <ActorEditModal
      open={open}
      onClose={onClose}
      title={headerText}
      maxWidth="xs"
      actions={actions}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {Number.isFinite(investedLevels) && (
          <Typography sx={{ textAlign: "center", opacity: 0.7 }}>
            {t("Invested Class Levels")}: {investedLevels}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {starRows.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{ display: "flex", justifyContent: "center", gap: "4px" }}
            >
              {row.map((index) =>
                index < Number(currentLvl) ? (
                  <span key={index}>{FilledStarSVG}</span>
                ) : (
                  <span key={index}>{EmptyStarSVG}</span>
                ),
              )}
            </Box>
          ))}
        </Box>
        <Typography sx={{ textAlign: "center", opacity: 0.85 }}>
          {t("Skill Level")}: {currentLvl}/{maxLvl}
        </Typography>
      </Box>
    </ActorEditModal>
  );
};

export default SkillLevelModal;
