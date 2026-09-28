import React, { useState } from "react";
import { Typography, IconButton, Tooltip } from "@mui/material";
import { Add, Edit, Remove, Search } from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";
import { useTheme } from "@mui/system";
import SkillLevelModal from "./SkillLevelModal";

interface CustomHeader3Props {
  headerText: string;
  currentLvl: number;
  maxLvl: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onEdit: () => void;
  onOpenCompendium?: () => void;
  isEditMode: boolean;
  isHeroicSkill: boolean;
  hideEditButton?: boolean;
  increaseDisabled?: boolean;
  increaseTooltip?: string;
}

const CustomHeader3: React.FC<CustomHeader3Props> = ({
  headerText,
  currentLvl,
  maxLvl,
  onIncrease,
  onDecrease,
  onEdit,
  onOpenCompendium,
  isEditMode,
  isHeroicSkill,
  hideEditButton = false,
  increaseDisabled = false,
  increaseTooltip,
}) => {
  const [levelModalOpen, setLevelModalOpen] = useState<boolean>(false);

  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <div
      style={{
        backgroundColor: primary,
        fontFamily: "Antonio",
        fontWeight: "normal",
        fontSize: "1.1em",
        padding: "3px 17px",
        color: "white",
        textAlign: "left",
        marginBottom: "4px",
        marginTop: "4px",
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
        {!isHeroicSkill && (
          <Tooltip title={t("View Skill Level")}>
            <Typography
              component="span"
              onClick={() => setLevelModalOpen(true)}
              variant="body1"
              color={"gold"}
              sx={{
                fontFamily: "Antonio",
                cursor: "pointer",
                px: "6px",
                "&:hover": { textDecoration: "underline" },
              }}
            >{`SL ${currentLvl}/${maxLvl}`}</Typography>
          </Tooltip>
        )}
        {isEditMode && !isHeroicSkill && (
          <>
            <span>
              <Tooltip title={currentLvl <= 0 ? "" : t("Decrease Level")}>
                <span>
                  <IconButton
                    size="small"
                    onClick={onDecrease}
                    disabled={currentLvl <= 0}
                  >
                    <Remove
                      style={{ color: currentLvl <= 0 ? "gray" : "white" }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </span>
            <span>
              <Tooltip
                title={
                  currentLvl >= maxLvl || increaseDisabled
                    ? (increaseTooltip ?? "")
                    : t("Increase Level")
                }
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={onIncrease}
                    disabled={currentLvl >= maxLvl || increaseDisabled}
                  >
                    <Add
                      style={{
                        color:
                          currentLvl >= maxLvl || increaseDisabled
                            ? "gray"
                            : "white",
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </span>
            {!hideEditButton && (
              <span>
                <Tooltip title={t("Edit Skill")}>
                  <span>
                    <IconButton size="small" onClick={onEdit}>
                      <Edit style={{ color: "white" }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </span>
            )}
          </>
        )}
        {isEditMode && isHeroicSkill && (
          <>
            {onOpenCompendium && (
              <span>
                <Tooltip title={t("Search Heroic Skills")}>
                  <span>
                    <IconButton size="small" onClick={onOpenCompendium}>
                      <Search style={{ color: "white" }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </span>
            )}
            <span>
              <Tooltip title={t("Edit Heroic Skill")}>
                <span>
                  <IconButton size="small" onClick={onEdit}>
                    <Edit style={{ color: "white" }} />
                  </IconButton>
                </span>
              </Tooltip>
            </span>
          </>
        )}
      </div>
      {!isHeroicSkill && (
        <SkillLevelModal
          open={levelModalOpen}
          onClose={() => setLevelModalOpen(false)}
          headerText={headerText}
          currentLvl={currentLvl}
          maxLvl={maxLvl}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          isEditMode={isEditMode}
          increaseDisabled={increaseDisabled}
          increaseTooltip={increaseTooltip}
        />
      )}
    </div>
  );
};

export default CustomHeader3;
