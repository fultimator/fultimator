import React, { useState, useEffect } from "react";
import { Typography, IconButton, Tooltip } from "@mui/material";
import { Add, Edit, Remove } from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";

// Include your SVGs here as React components
const EmptyStarSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 95.74 95.98"
    width="24"
    height="24"
  >
    <path
      fill="white"
      opacity=".96"
      stroke="#78a49a"
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
    width="24"
    height="24"
  >
    <path
      fill="gold" // Adjust the fill color to match the gold star
      opacity=".96"
      stroke="#78a49a"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="6px"
      d="M33.55,33.94l-28.7,11.66c-2.5,1.01-2.46,4.56.06,5.52l29,11.08,11.7,28.97c.98,2.43,4.44,2.41,5.39-.04l11.28-29.09,28.57-11.79c2.54-1.05,2.51-4.66-.05-5.66l-28.84-11.27-11.73-28.5c-1.02-2.47-4.54-2.43-5.5.06l-11.18,29.04Z"
    />
  </svg>
);

interface CustomHeader3Props {
  headerText: string;
  currentLvl: number;
  maxLvl: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onEdit: () => void;
  isEditMode: boolean;
  isHeroicSkill: boolean;
}

const CustomHeader3: React.FC<CustomHeader3Props> = ({
  headerText,
  currentLvl,
  maxLvl,
  onIncrease,
  onDecrease,
  onEdit,
  isEditMode,
  isHeroicSkill,
}) => {
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  const { t } = useTranslate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768); // Adjust the threshold as per your design
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
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
        {headerText}
      </Typography>
      <div style={{ display: "flex", alignItems: "center" }}>
        {isMobileView && !isHeroicSkill ? (
          <Typography
            variant="body1"
            color={"gold"}
            sx={{ fontFamily: "Antonio" }}
          >{`${currentLvl}/${maxLvl}`}</Typography>
        ) : (
          <>
            {[...Array(Number(maxLvl))].map((_, index) =>
              index < Number(currentLvl) ? (
                <span key={index}>{FilledStarSVG}</span>
              ) : (
                <span key={index}>{EmptyStarSVG}</span>
              )
            )}
          </>
        )}
        {isEditMode && !isHeroicSkill && (
          <>
            <Tooltip title={t("Decrease Level")}>
            <IconButton
              size="small"
              onClick={onDecrease}
              disabled={currentLvl <= 0}
            >
              <Remove style={{ color: currentLvl <= 0 ? "gray" : "white" }} />
            </IconButton>
            </Tooltip>
            <Tooltip title={t("Increase Level")}>
            <IconButton
              size="small"
              onClick={onIncrease}
              disabled={currentLvl >= maxLvl}
            >
              <Add style={{ color: currentLvl >= maxLvl ? "gray" : "white" }} />
            </IconButton>
            </Tooltip>
            <Tooltip title={t("Edit Skill")}>
              <IconButton size="small" onClick={onEdit}>
                <Edit style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </>
        )}
        {isEditMode && isHeroicSkill && (
          <>
            <Tooltip title={t("Edit Heroic Skill")}>
              <IconButton size="small" onClick={onEdit}>
                <Edit style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomHeader3;
