import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, Grid, TextField, Button, Divider } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import classList from "../../../libs/classes";
import PlayerClassCard from "./PlayerClassCard";

export default function EditPlayerClasses({ player, setPlayer, updateMaxStats }) {
  const [selectedClass, setSelectedClass] = useState(null); 
  const [selectedBook, setSelectedBook] = useState(null);

  const handleAddClass = () => {
    if (selectedClass) {
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

  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const filteredClasses = selectedBook
    ? classList.filter((cls) => cls.book === selectedBook)
    : classList;

  return (
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
            <CustomHeader type="top" headerText={t("Classes")} />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Autocomplete
              id="book-select"
              options={Object.values(classList).reduce((books, currentClass) => {
                if (!books.includes(currentClass.book)) {
                  books.push(currentClass.book);
                }
                return books;
              }, [])}
              getOptionLabel={(book) => book || ""}
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
              options={filteredClasses}
              getOptionLabel={(option) => option.name || ""}
              value={selectedClass}
              onChange={(event, newValue) => setSelectedClass(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={t("Classes")}
                  placeholder={t("Classes")}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" onClick={handleAddClass}>
              {t("Add")}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Divider sx={{ my: 2 }} />
      {player.classes &&
        player.classes.map((cls, index) => (
          <React.Fragment key={index}>
            <PlayerClassCard classItem={cls} onRemove={() => handleRemoveClass(index)} />
            {index !== player.classes.length - 1 && <Divider sx={{ my: 2 }} />}
          </React.Fragment>
        ))}
    </>
  );
}
