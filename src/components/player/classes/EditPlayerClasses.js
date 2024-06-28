import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
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
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import classList from "../../../libs/classes";
import PlayerClassCard from "./PlayerClassCard";
import useUploadJSON from "../../../hooks/useUploadJSON";

export default function EditPlayerClasses({
  player,
  setPlayer,
  updateMaxStats,
  isEditMode,
}) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    checkWarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, player.classes, player.lvl]);

  const checkWarnings = () => {
    const newWarnings = [];

    // Check if player has at least 2 classes
    if (!player.classes || player.classes.length < 2) {
      newWarnings.push("Character must have at least 2 classes.");
    }

    // Check if class count exceeds 3 beyond the number of classes at level 10
    const maxLevelClasses = player.classes
      ? player.classes.filter((cls) => cls.lvl >= 10).length
      : 0;
    if (player.classes && player.classes.length - maxLevelClasses > 3) {
      newWarnings.push(
        "The number of classes exceeds the limit beyond the number of classes at level 10."
      );
    }

    // Calculate total levels of classes
    const totalLevels = player.classes
      ? player.classes.reduce((acc, cls) => acc + parseInt(cls.lvl), 0)
      : 0;

    // Check if sum of levels isn't equal to player level
    if (totalLevels !== player.lvl) {
      newWarnings.push("Sum of class levels isn't equal to character level.");
    }

    setWarnings(newWarnings);
  };

  const { handleFileUpload } = useUploadJSON((data) => {
    if (data) {
      const { name, lvl, benefits, skills, heroic, spells } = data;

      /* Add class from data */
      const classExists = player.classes.some(
        (cls) => cls.name.toLowerCase() === name.toLowerCase()
      );

      if (classExists) {
        alert("This class type already exists for the character");
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
      });

      setPlayer(updatedPlayer);
      updateMaxStats();
      setSelectedClass(null);
    }

    fileInputRef.current.value = null;
  });

  const handleAddClass = () => {
    if (selectedClass) {
      if (selectedClass.name === "Blank Class") {
        setDialogOpen(true);
      } else {
        addClassToPlayer(selectedClass.name);
      }
    }
  };

  const addClassToPlayer = (name) => {
    // Check if the selected class type already exists in player's classes
    const classExists = player.classes.some(
      (cls) => cls.name.toLowerCase() === name.toLowerCase()
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
      benefits: selectedClass.benefits,
      skills: [],
      heroic: {
        name: "",
        description: "",
      },
      spells: [],
    });

    setPlayer(updatedPlayer);
    updateMaxStats();
    setSelectedBook(null);
    setSelectedClass(null);
    setDialogOpen(false);
    setNewClassName("");
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

    if (newLevel === 10 && !updatedPlayer.classes[index].heroic) {
      updatedPlayer.classes[index].heroic = {
        name: "",
        description: "",
      };
    }

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

  const handleAddSkill = (
    className,
    skillName,
    maxLevel,
    description,
    specialSkill
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
    setPlayer(updatedPlayer);
    updateMaxStats();
  };

  const handleEditSkill = (
    className,
    skillIndex,
    skillName,
    maxLevel,
    description,
    specialSkill
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
    setPlayer(updatedPlayer);
    updateMaxStats();
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
                <CustomHeader
                  type="top"
                  headerText={t("Classes")}
                  showIconButton={false}
                />
              </Grid>
              {warnings.map((warning, index) => (
                <Grid item xs={12} key={index}>
                  <Alert variant="filled" severity="warning">
                    {t(warning)}
                  </Alert>
                </Grid>
              ))}
              <Grid item xs={12} sm={4}>
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
                    .map((book) => book.original)}
                  getOptionLabel={(book) => t(book) || ""}
                  value={selectedBook}
                  onChange={(event, newValue) => {
                    setSelectedBook(newValue);
                    setSelectedClass(null); // Reset selected class when a new book is selected
                  }}
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
                  options={
                    selectedBook
                      ? filteredClasses
                          .filter(
                            (classOption) => classOption.book === selectedBook
                          ) // Filter classes based on selected book
                          .map((classOption) => ({
                            original: classOption,
                            translated: t(classOption.name) || "",
                          }))
                          .sort((a, b) =>
                            a.translated.localeCompare(b.translated)
                          )
                          .map((classOption) => classOption.original)
                      : []
                  } // Disable options if no book is selected
                  getOptionLabel={(option) => t(option.name) || ""}
                  value={selectedClass}
                  disabled={!selectedBook}
                  onChange={(event, newValue) => setSelectedClass(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t("Class")}
                      placeholder={t("Class")}
                      disabled={!selectedBook} // Disable the input if no book is selected
                    />
                  )}
                />
              </Grid>
              <Grid item xs={10} sm={2}>
                <Button
                  variant="contained"
                  onClick={handleAddClass}
                  sx={{ width: "100%", height: "100%" }}
                  disabled={!selectedBook || !selectedClass} // Disable button if no book or class is selected
                >
                  {t("Add")}
                </Button>
              </Grid>
              <Grid item xs={2} sm={1}>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current.click()}
                >
                  {t("Upload JSON")}
                </Button>
              </Grid>
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
          <Grid item sx={12}>
            <Typography variant="h3" align="center">
              {t("No classes added yet")}
            </Typography>
          </Grid>
        </Paper>
      )}
      {player.classes &&
        player.classes.map((cls, index) => (
          <React.Fragment key={index}>
            <PlayerClassCard
              classItem={{ ...cls, name: cls.name }}
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
              editHeroic={(heroic) => editHeroic(index, heroic)}
            />
            {index !== player.classes.length - 1 && <Divider sx={{ my: 2 }} />}
          </React.Fragment>
        ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{t("Enter Class Name")}</DialogTitle>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => addClassToPlayer(newClassName)}
            color="primary"
            disabled={!newClassName}
          >
            {t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
