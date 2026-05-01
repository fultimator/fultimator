import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  Box,
  TextField,
  Button,
  Divider,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { UnfoldLess, UnfoldMore } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import CustomHeader from "../../common/CustomHeader";
import PlayerClassCard from "./PlayerClassCard";
import useUploadJSON from "../../../hooks/useUploadJSON";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import MnemosphereClassCard from "./MnemosphereClassCard";
import { getSlottedMnemospheres } from "./mnemosphereClassUtils";
import useSphereBank from "../equipment/technospheres/useSphereBank";
import {
  getDerivedClassLevel,
  isAutomaticClassLevelEnabled,
  syncAutomaticClassLevels,
} from "./classLevelUtils";

export default function EditPlayerClasses({
  player,
  setPlayer,
  updateMaxStats,
  isEditMode,
}) {
  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;
  const automaticClassLevel = isAutomaticClassLevelEnabled(player);
  const canAddMoreClasses = !isTechnospheres || player.classes.length < 3;
  const slottedMnemospheres = isTechnospheres
    ? getSlottedMnemospheres(player)
    : [];

  const [warnings, setWarnings] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState({});
  const [expandedMnemos, setExpandedMnemos] = useState({});
  const allExpanded =
    (player.classes ?? []).every((_, i) => expandedClasses[i]) &&
    (slottedMnemospheres ?? []).every((m) => expandedMnemos[m.id]);

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedClasses({});
      setExpandedMnemos({});
    } else {
      setExpandedClasses(
        Object.fromEntries((player.classes ?? []).map((_, i) => [i, true])),
      );
      setExpandedMnemos(
        Object.fromEntries(
          (slottedMnemospheres ?? []).map((m) => [m.id, true]),
        ),
      );
    }
  };

  const {
    changeMnemoSkillLevel,
    getMnemoAvailableLevels,
    investMnemoLevel,
    refundMnemoLevel,
  } = useSphereBank(player, setPlayer);

  const advancement = player?.settings?.advancement ?? false;

  const totalInnateLevel = (player.classes ?? []).reduce(
    (acc, cls) =>
      acc +
      (automaticClassLevel
        ? getDerivedClassLevel(cls)
        : parseInt(cls.lvl) || 0),
    0,
  );
  const getMnemoInvested = (m) => (m.lvl ?? 1) - (m.baseLvl ?? m.lvl ?? 1);

  const totalMnemoLevel = slottedMnemospheres.reduce(
    (acc, m) => acc + getMnemoInvested(m),
    0,
  );

  const classSummary = (player.classes ?? [])
    .map((cls) => {
      const lvl = automaticClassLevel
        ? getDerivedClassLevel(cls)
        : parseInt(cls.lvl) || 0;
      return `${cls.name || "?"} Lv.${lvl}`;
    })
    .join(" · ");

  const mnemoSummary = slottedMnemospheres
    .map((m) => {
      const invested = getMnemoInvested(m);
      return invested > 0
        ? `${m.class || "?"} Lv.${m.lvl ?? 1} (+${invested})`
        : `${m.class || "?"} Lv.${m.lvl ?? 1}`;
    })
    .join(" · ");

  const fileInputRef = useRef(null);
  const customTheme = useCustomTheme();

  const syncInnateClasses = (nextPlayer) => {
    if (!isTechnospheres) return nextPlayer;

    const innateClasses = (nextPlayer.classes ?? [])
      .map((cls) => cls.name)
      .filter(Boolean)
      .slice(0, 3);

    return {
      ...nextPlayer,
      settings: {
        ...(nextPlayer.settings ?? {}),
        optionalRules: {
          ...(nextPlayer.settings?.optionalRules ?? {}),
          innateClasses,
        },
      },
    };
  };

  const syncClassLevels = (nextPlayer) =>
    automaticClassLevel ? syncAutomaticClassLevels(nextPlayer) : nextPlayer;

  useEffect(() => {
    checkWarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, player.classes, player.lvl]);

  const checkWarnings = () => {
    const newWarnings = [];

    if (isTechnospheres) {
      if (!player.classes || player.classes.length < 3) {
        newWarnings.push(
          "Technospheres characters must have exactly 3 innate classes.",
        );
      }
    } else {
      if (!player.classes || player.classes.length < 2) {
        newWarnings.push("Character must have at least 2 classes.");
      }

      // Check if class count exceeds 3 beyond the number of classes at level 10
      const maxLevelClasses = player.classes
        ? player.classes.filter((cls) => cls.lvl >= 10).length
        : 0;
      if (player.classes && player.classes.length - maxLevelClasses > 3) {
        newWarnings.push(
          "The number of classes exceeds the limit beyond the number of classes at level 10.",
        );
      }
    }

    // Calculate total levels of classes
    const totalLevels = player.classes
      ? player.classes.reduce(
          (acc, cls) =>
            acc +
            (automaticClassLevel
              ? getDerivedClassLevel(cls)
              : parseInt(cls.lvl)),
          0,
        )
      : 0;

    // Check if sum of levels isn't equal to player level
    if (isTechnospheres) {
      if (totalLevels > player.lvl) {
        newWarnings.push("Sum of innate class levels exceeds character level.");
      }
    } else if (totalLevels !== player.lvl) {
      newWarnings.push("Sum of class levels isn't equal to character level.");
    }

    setWarnings(newWarnings);
  };

  const { handleFileUpload } = useUploadJSON((data) => {
    if (data) {
      const { name, lvl, benefits, skills, heroic, spells, isHomebrew } = data;

      /* Add class from data */
      const classExists = player.classes.some(
        (cls) => cls.name.toLowerCase() === name.toLowerCase(),
      );

      if (classExists) {
        alert("This class type already exists for the character");
        fileInputRef.current.value = null;
        return;
      }

      if (!canAddMoreClasses) {
        alert("Technospheres players are limited to 3 innate classes");
        fileInputRef.current.value = null;
        return;
      }

      const updatedPlayer = {
        ...player,
        classes: Array.isArray(player.classes) ? player.classes : [],
      };

      updatedPlayer.classes.push({
        name: name,
        lvl: lvl,
        benefits: benefits,
        skills: skills,
        heroic: heroic,
        spells: spells,
        isHomebrew: isHomebrew || false,
      });

      setPlayer(syncInnateClasses(syncClassLevels(updatedPlayer)));
      updateMaxStats();
    }

    fileInputRef.current.value = null;
  });

  const addClassToPlayer = (name, isHomebrew) => {
    // Check if the selected class type already exists in player's classes
    const classExists = player.classes.some(
      (cls) => cls.name.toLowerCase() === name.toLowerCase(),
    );

    if (classExists) {
      alert(t("This class type already exists for the character"));
      return;
    }

    const updatedPlayer = {
      ...player,
      classes: Array.isArray(player.classes) ? player.classes : [],
    };

    updatedPlayer.classes.push({
      name: name,
      lvl: 1,
      benefits: {},
      skills: [],
      heroic: {
        name: "",
        description: "",
      },
      spells: [],
      isHomebrew: isHomebrew,
    });

    setPlayer(syncInnateClasses(syncClassLevels(updatedPlayer)));
    updateMaxStats();
    setDialogOpen(false);
    setNewClassName("");
  };

  const handleRemoveClass = (index) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.filter((_, i) => i !== index),
    };

    setPlayer(syncInnateClasses(syncClassLevels(updatedPlayer)));
    updateMaxStats();
  };

  const editClassName = (index, newClassName) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls, i) => {
        if (i === index) {
          return { ...cls, name: newClassName };
        }
        return cls;
      }),
    };
    setPlayer(syncInnateClasses(syncClassLevels(updatedPlayer)));
  };

  const handleLevelChange = (index, newLevel) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls, i) => {
        if (i === index) {
          return { ...cls, lvl: newLevel };
        }
        return cls;
      }),
    };

    if (newLevel === 10 && !updatedPlayer.classes[index].heroic) {
      updatedPlayer.classes[index].heroic = {
        name: "",
        description: "",
      };
    }

    // Update player level to match sum of class levels
    const totalLevels = updatedPlayer.classes.reduce(
      (acc, cls) => acc + parseInt(cls.lvl),
      0,
    );
    updatedPlayer.lvl = totalLevels;

    setPlayer(syncInnateClasses(updatedPlayer));
    updateMaxStats();
  };

  const handleSaveBenefits = (index, benefits) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls, i) => {
        if (i === index) {
          return { ...cls, benefits };
        }
        return cls;
      }),
    };
    setPlayer(syncClassLevels(updatedPlayer));
    updateMaxStats();
  };

  const handleAddSkill = (
    className,
    skillName,
    maxLevel,
    description,
    specialSkill,
  ) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls) => {
        if (cls.name === className) {
          return {
            ...cls,
            skills: [
              ...cls.skills,
              {
                skillName: skillName,
                currentLvl: 1,
                maxLvl: maxLevel, // Ensure maxLevel is parsed as a number
                description: description,
                specialSkill: specialSkill,
              },
            ],
          };
        }
        return cls;
      }),
    };
    setPlayer(syncClassLevels(updatedPlayer));
    updateMaxStats();
  };

  const handleEditSkill = (
    className,
    skillIndex,
    skillName,
    maxLevel,
    description,
    specialSkill,
  ) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls) => {
        if (cls.name === className) {
          return {
            ...cls,
            skills: cls.skills.map((skill, index) => {
              if (index === skillIndex) {
                const newMaxLevel = parseInt(maxLevel); // Ensure maxLevel is parsed as a number
                const newCurrentLevel = Math.min(skill.currentLvl, newMaxLevel); // Adjust current level if necessary
                return {
                  ...skill,
                  skillName,
                  maxLvl: newMaxLevel,
                  currentLvl: newCurrentLevel,
                  description,
                  specialSkill,
                };
              }
              return skill;
            }),
          };
        }
        return cls;
      }),
    };
    setPlayer(syncClassLevels(updatedPlayer));
    updateMaxStats();
  };

  const handleDeleteSkill = (classIndex, skillIndex) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls, i) => {
        if (i === classIndex) {
          return {
            ...cls,
            skills: cls.skills.filter((_, index) => index !== skillIndex),
          };
        }
        return cls;
      }),
    };
    setPlayer(syncClassLevels(updatedPlayer));
    updateMaxStats();
  };

  const handleIncreaseSkillLevel = (classIndex, skillIndex) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls, i) => {
        if (i === classIndex) {
          return {
            ...cls,
            skills: cls.skills.map((skill, j) => {
              if (j === skillIndex && skill.currentLvl < skill.maxLvl) {
                return { ...skill, currentLvl: skill.currentLvl + 1 };
              }
              return skill;
            }),
          };
        }
        return cls;
      }),
    };
    setPlayer(syncClassLevels(updatedPlayer));
    updateMaxStats();
  };

  const handleDecreaseSkillLevel = (classIndex, skillIndex) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls, i) => {
        if (i === classIndex) {
          return {
            ...cls,
            skills: cls.skills.map((skill, j) => {
              if (j === skillIndex && skill.currentLvl > 0) {
                return { ...skill, currentLvl: skill.currentLvl - 1 };
              }
              return skill;
            }),
          };
        }
        return cls;
      }),
    };
    setPlayer(syncClassLevels(updatedPlayer));
    updateMaxStats();
  };

  const editCompanion = (index, newCompanion) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls, i) => {
        if (i === index) {
          return { ...cls, companion: newCompanion };
        }
        return cls;
      }),
    };
    setPlayer(updatedPlayer);
  };

  const editHeroic = (index, newHeroic) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.map((cls, i) => {
        if (i === index) {
          return { ...cls, heroic: newHeroic };
        }
        return cls;
      }),
    };

    setPlayer(updatedPlayer);
  };

  const handleAddFromCompendium = (item, type) => {
    if (type !== "classes") return;

    const classExists = player.classes.some(
      (cls) => cls.name.toLowerCase() === item.name.toLowerCase(),
    );
    if (classExists) {
      alert(t("This class type already exists for the character"));
      return;
    }

    const sortedSkills = (item.skills || []).slice().sort((a, b) => {
      if (a.skillName < b.skillName) return -1;
      if (a.skillName > b.skillName) return 1;
      return 0;
    });

    const updatedPlayer = {
      ...player,
      classes: Array.isArray(player.classes) ? [...player.classes] : [],
    };

    updatedPlayer.classes.push({
      name: item.name,
      lvl: 1,
      _packItemId: item._packItemId,
      benefits: item.benefits,
      skills: sortedSkills,
      heroic: item.heroic || { name: "", description: "" },
      spells: item.spells || [],
      isHomebrew: item.isHomebrew || false,
    });

    setPlayer(syncInnateClasses(syncClassLevels(updatedPlayer)));
    updateMaxStats();
  };

  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: customTheme.primary,
          color: customTheme.white,
          fontFamily: "Antonio, sans-serif",
          textTransform: "uppercase",
          fontSize: "0.85em",
          px: "10px",
          py: "5px",
          borderRadius: "8px 8px 0 0",
          mb: 0,
        }}
      >
        <Box sx={{ flex: 1 }}>
          {classSummary && (
            <Typography
              variant="body2"
              sx={{
                color: customTheme.white,
                fontFamily: "inherit",
                textTransform: "none",
              }}
            >
              {isTechnospheres && <strong>{t("Classes")}: </strong>}
              {classSummary}
            </Typography>
          )}
          {mnemoSummary && (
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.75)",
                fontFamily: "inherit",
                textTransform: "none",
              }}
            >
              <strong>{t("Mnemospheres")}: </strong>
              {mnemoSummary}
            </Typography>
          )}
          {!classSummary && !mnemoSummary && (
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.75)",
                fontFamily: "inherit",
                textTransform: "none",
              }}
            >
              {t("No classes or mnemospheres yet.")}
            </Typography>
          )}
        </Box>
        <Tooltip title={allExpanded ? t("Collapse All") : t("Expand All")}>
          <IconButton
            onClick={toggleAll}
            size="small"
            sx={{ color: customTheme.white }}
          >
            {allExpanded ? <UnfoldLess /> : <UnfoldMore />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ borderColor: secondary, borderBottomWidth: 2, mb: 2 }} />

      {isEditMode ? (
        <>
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <CustomHeader
                  type="top"
                  headerText={t(isTechnospheres ? "Innate Classes" : "Classes")}
                  rightLabel={t("Total Invested Levels")}
                  rightValue={totalInnateLevel}
                  rightMax={player.lvl}
                  showIconButton={canAddMoreClasses}
                  icon={AddIcon}
                  customTooltip={t(
                    isTechnospheres
                      ? "Add Blank Innate Class"
                      : "Add Blank Class",
                  )}
                  addItem={
                    canAddMoreClasses ? () => setDialogOpen(true) : undefined
                  }
                  openCompendium={
                    canAddMoreClasses
                      ? () => setCompendiumOpen(true)
                      : undefined
                  }
                />
              </Grid>
              {warnings.map((warning, index) => (
                <Grid key={index} size={12}>
                  <Alert
                    variant="filled"
                    severity="warning"
                    sx={{
                      color: customTheme.text.primary,
                      "& .MuiAlert-icon": {
                        color: customTheme.text.primary,
                      },
                    }}
                  >
                    {t(warning)}
                  </Alert>
                </Grid>
              ))}
            </Grid>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </Paper>
          <Divider sx={{ my: 2 }} />{" "}
        </>
      ) : null}
      {player.classes.length === 0 && (
        <Paper
          elevation={3}
          sx={{
            p: "15px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          <Grid size={12}>
            <Typography variant="h3" align="center">
              {t(
                isTechnospheres
                  ? "No innate classes added yet"
                  : "No classes added yet",
              )}
            </Typography>
          </Grid>
        </Paper>
      )}
      {player.classes &&
        player.classes.map((cls, index) => {
          const clsLvl = automaticClassLevel
            ? getDerivedClassLevel(cls)
            : cls.lvl;
          return (
            <Box key={index} sx={{ mb: 2 }}>
              <PlayerClassCard
                allClasses={player.classes}
                classItem={{ ...cls, name: cls.name, lvl: clsLvl }}
                onRemove={() => handleRemoveClass(index)}
                onLevelChange={
                  automaticClassLevel
                    ? () => {}
                    : (newLevel) => handleLevelChange(index, newLevel)
                }
                onSaveBenefits={(benefits) =>
                  handleSaveBenefits(index, benefits)
                }
                onAddSkill={handleAddSkill}
                onEditSkill={handleEditSkill}
                onDeleteSkill={(skillIndex) =>
                  handleDeleteSkill(index, skillIndex)
                }
                onIncreaseSkillLevel={(skillIndex) =>
                  handleIncreaseSkillLevel(index, skillIndex)
                }
                onDecreaseSkillLevel={(skillIndex) =>
                  handleDecreaseSkillLevel(index, skillIndex)
                }
                isEditMode={isEditMode}
                editCompanion={(companion) => editCompanion(index, companion)}
                editClassName={(newClassName) =>
                  editClassName(index, newClassName)
                }
                editHeroic={(heroic) => editHeroic(index, heroic)}
                userId={player.uid}
                isHomebrew={
                  cls.isHomebrew === undefined ? true : cls.isHomebrew
                }
                isClassLevelReadOnly={automaticClassLevel}
                isAccordion
                isExpanded={!!expandedClasses[index]}
                onToggleExpand={() =>
                  setExpandedClasses((prev) => ({
                    ...prev,
                    [index]: !prev[index],
                  }))
                }
              />
            </Box>
          );
        })}
      {isTechnospheres && (
        <>
          <Divider
            sx={{ borderColor: secondary, borderBottomWidth: 2, mb: 2 }}
          />
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              mb: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <CustomHeader
                  type="top"
                  headerText={t("Slotted Mnemospheres")}
                  rightLabel={t("Total Invested Levels")}
                  rightValue={totalMnemoLevel}
                  showIconButton={false}
                />
              </Grid>
              {slottedMnemospheres.length === 0 ? (
                <Grid size={12}>
                  <Typography variant="h3" align="center">
                    {t("No slotted mnemospheres")}
                  </Typography>
                </Grid>
              ) : (
                <Grid size={12}>
                  <Alert severity="info" variant="outlined">
                    {t(
                      "Each mnemosphere has its own level (1–5). Equipping one grants access to its skills. Use +/- to set its level and allocate skill points within it.",
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
          <Divider
            sx={{ borderColor: secondary, borderBottomWidth: 2, mb: 2 }}
          />
          {slottedMnemospheres.map((mnemo) => (
            <Box key={mnemo.id} sx={{ mb: 2 }}>
              <MnemosphereClassCard
                item={mnemo}
                editable={isEditMode}
                onIncreaseSkillLevel={(skillIndex) =>
                  changeMnemoSkillLevel(mnemo.id, skillIndex, 1)
                }
                onDecreaseSkillLevel={(skillIndex) =>
                  changeMnemoSkillLevel(mnemo.id, skillIndex, -1)
                }
                availableLevels={getMnemoAvailableLevels(mnemo)}
                onInvestLevel={
                  isEditMode && !advancement
                    ? () => investMnemoLevel(mnemo.id)
                    : null
                }
                onRefundLevel={
                  isEditMode && !advancement
                    ? () => refundMnemoLevel(mnemo.id)
                    : null
                }
                isAccordion
                showHeaderMeta
                isSlotted
                isExpanded={!!expandedMnemos[mnemo.id]}
                onToggleExpand={() =>
                  setExpandedMnemos((prev) => ({
                    ...prev,
                    [mnemo.id]: !prev[mnemo.id],
                  }))
                }
              />
            </Box>
          ))}
        </>
      )}
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleAddFromCompendium}
        initialType="classes"
        restrictToTypes={["classes"]}
        context="player"
      />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle variant="h3">{t("Enter Class Name")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Please enter the name for the new class")}.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t("Class Name")}
            fullWidth
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            color="secondary"
            variant="contained"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => addClassToPlayer(newClassName, true)}
            color="primary"
            variant="contained"
            disabled={!newClassName}
          >
            {t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
