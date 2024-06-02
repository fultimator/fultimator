import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import classList from "../../../libs/classes";
import PlayerClassCard from "./PlayerClassCard";

export default function EditPlayerClasses({
  player,
  setPlayer,
  updateMaxStats,
  isEditMode,
}) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    checkWarnings();
  }, [player, player.classes, player.lvl]);

  const checkWarnings = () => {
    const newWarnings = [];

    // Check if player has at least 2 classes
    if (!player.classes || player.classes.length < 2) {
      newWarnings.push(t("Player must have at least 2 classes."));
    }

    // Check if class count exceeds 3 beyond the number of classes at level 10
    const maxLevelClasses = player.classes
      ? player.classes.filter((cls) => cls.lvl >= 10).length
      : 0;
    if (player.classes && player.classes.length - maxLevelClasses > 3) {
      newWarnings.push(
        t(
          "The number of classes exceeds the limit beyond the number of classes at level 10."
        )
      );
    }

    // Calculate total levels of classes
    const totalLevels = player.classes
      ? player.classes.reduce((acc, cls) => acc + parseInt(cls.lvl), 0)
      : 0;

    // Check if sum of levels isn't equal to player level
    if (totalLevels !== player.lvl) {
      newWarnings.push(t("Sum of class levels isn't equal to player level."));
    }

    setWarnings(newWarnings);
  };

  const handleAddClass = () => {
    if (selectedClass) {
      // Check if the selected class type already exists in player's classes
      const classExists = player.classes.some(
        (cls) => cls.name === selectedClass.name
      );

      if (classExists) {
        console.error(t("This class type already exists for the player"));
        return;
      }

      const updatedPlayer = {
        ...player,
        classes: Array.isArray(player.classes) ? player.classes : [],
      };

      updatedPlayer.classes.push({
        name: selectedClass.name,
        lvl: 1,
        benefits: selectedClass.benefits,
        skills: [],
        heroic: null,
        spells: [],
      });

      setPlayer(updatedPlayer);
      updateMaxStats();
      setSelectedClass(null);
    }
  };

  const handleRemoveClass = (index) => {
    const updatedPlayer = {
      ...player,
      classes: player.classes.filter((_, i) => i !== index),
    };

    setPlayer(updatedPlayer);
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
    setPlayer(updatedPlayer);
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

    setPlayer(updatedPlayer);
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
    setPlayer(updatedPlayer);
    updateMaxStats();
  };

  const handleAddSkill = (className, skillName, maxLevel, description) => {
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
              },
            ],
          };
        }
        return cls;
      }),
    };
    setPlayer(updatedPlayer);
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
    setPlayer(updatedPlayer);
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
    setPlayer(updatedPlayer);
    updateMaxStats();
  };

  const handleEditSkill = (
    className,
    skillIndex,
    skillName,
    maxLevel,
    description
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
                };
              }
              return skill;
            }),
          };
        }
        return cls;
      }),
    };
    setPlayer(updatedPlayer);
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
    setPlayer(updatedPlayer);
    updateMaxStats();
  };

  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const filteredClasses = selectedBook
    ? classList.filter((cls) => cls.book === selectedBook)
    : classList;

  return (
    <>
      {isEditMode ? (
        <>
          {" "}
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
              <Grid item xs={12}>
                <CustomHeader type="top" headerText={t("Classes")} />
              </Grid>
              {warnings.map((warning, index) => (
                <Grid item xs={12} key={index}>
                  <Typography color="error" variant="body1">
                    {warning}
                  </Typography>
                </Grid>
              ))}
              <Grid item xs={12} sm={5}>
                <Autocomplete
                  id="book-select"
                  options={Object.values(classList)
                    .reduce((books, currentClass) => {
                      if (!books.includes(currentClass.book)) {
                        books.push(currentClass.book);
                      }
                      return books;
                    }, [])
                    .map((book) => ({
                      original: book,
                      translated: t(book) || "",
                    }))
                    .sort((a, b) => a.translated.localeCompare(b.translated))
                    .map((book) => book.original)}
                  getOptionLabel={(book) => t(book) || ""}
                  value={selectedBook}
                  onChange={(event, newValue) => setSelectedBook(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t("Book")}
                      placeholder={t("Book")}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Autocomplete
                  id="class-select"
                  options={filteredClasses
                    .map((classOption) => ({
                      original: classOption,
                      translated: t(classOption.name) || "",
                    }))
                    .sort((a, b) => a.translated.localeCompare(b.translated))
                    .map((classOption) => classOption.original)}
                  getOptionLabel={(option) => t(option.name) || ""}
                  value={selectedClass}
                  onChange={(event, newValue) => setSelectedClass(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t("Class")}
                      placeholder={t("Class")}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  onClick={handleAddClass}
                  sx={{ width: "100%", height: "100%" }}
                >
                  {t("Add")}
                </Button>
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />{" "}
        </>
      ) : null}
      {player.classes &&
        player.classes.map((cls, index) => (
          <React.Fragment key={index}>
            <PlayerClassCard
              classItem={{ ...cls, name: t(cls.name) }}
              onRemove={() => handleRemoveClass(index)}
              onLevelChange={(newLevel) => handleLevelChange(index, newLevel)}
              onSaveBenefits={(benefits) => handleSaveBenefits(index, benefits)}
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
              editClassName={(newClassName) =>
                editClassName(index, newClassName)
              }
            />
            {index !== player.classes.length - 1 && <Divider sx={{ my: 2 }} />}
          </React.Fragment>
        ))}
    </>
  );
}
