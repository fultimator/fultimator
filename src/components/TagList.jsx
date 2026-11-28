import React, { useState } from "react";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useCustomTheme } from "../hooks/useCustomTheme";
import { useTranslate } from "../translation/translate";
import AddIcon from "@mui/icons-material/Add";

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 50;

export const TagEditor = ({ item, setItem, readOnly = false, label }) => {
  const { t } = useTranslate();
  const [inputValue, setInputValue] = useState("");
  const tags = item.tags ?? [];

  const handleDelete = (i) => () => {
    setItem((prevState) => ({
      ...prevState,
      tags: (prevState.tags ?? []).filter((_, idx) => idx !== i),
    }));
  };

  const handleInputChange = (e) => {
    if (e.target.value.length <= MAX_TAG_LENGTH) {
      setInputValue(e.target.value);
    }
  };

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim().toUpperCase();
    if (
      trimmedValue &&
      tags.length < MAX_TAGS &&
      !tags.some((tag) => tag.name?.toUpperCase() === trimmedValue)
    ) {
      setItem((prevState) => ({
        ...prevState,
        tags: [...(prevState.tags ?? []), { name: trimmedValue }],
      }));
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isInputDisabled = tags.length >= MAX_TAGS;

  return (
    <>
      {!readOnly && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
          <TextField
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            label={
              isInputDisabled ? t("Reached tag limit") : (label ?? t("Add Tag"))
            }
            variant="outlined"
            size="small"
            fullWidth
            disabled={isInputDisabled}
            slotProps={{
              htmlInput: { maxLength: MAX_TAG_LENGTH },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleAddTag}
            disabled={isInputDisabled}
            aria-label={t("Add Tag")}
            sx={{
              height: "40px",
              display: isInputDisabled ? "none" : "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0 16px",
            }}
          >
            <AddIcon />
          </Button>
        </Stack>
      )}
      {tags.length > 0 && (
        <div style={{ marginTop: readOnly ? 0 : "8px" }}>
          {tags.map((tag, i) => (
            <Chip
              key={`${tag.name}-${i}`}
              label={tag.name?.toUpperCase()}
              onDelete={readOnly ? undefined : handleDelete(i)}
              color="primary"
              variant="outlined"
              style={{ marginRight: "5px", marginBottom: "5px" }}
            />
          ))}
        </div>
      )}
    </>
  );
};

const TagList = ({ npc, setNpc }) => {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: "10px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: theme.secondary,
      }}
    >
      <Typography
        sx={{
          mb: 1,
          fontFamily: "Antonio",
          textTransform: "uppercase",
          fontSize: "1.3rem",
          color: theme.white,
          background: theme.primary,
          padding: "2px 10px",
          borderRadius: "4px",
        }}
      >
        {t("Personal Tags")}
      </Typography>
      <TagEditor item={npc} setItem={setNpc} />
    </Paper>
  );
};

export default TagList;
