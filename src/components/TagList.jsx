import React, { useMemo, useState } from "react";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useCustomTheme } from "../hooks/useCustomTheme";
import { useTagSuggestions } from "../hooks/useTagSuggestions";
import { useTranslate } from "../translation/translate";
import AddIcon from "@mui/icons-material/Add";
import { alpha } from "@mui/material/styles";

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 50;
const NO_TAGS = [];
const TAG_CHIP_SX = (theme) =>
  theme.palette.mode === "dark"
    ? {
        color: "text.primary",
        borderColor: alpha(theme.palette.secondary.main, 0.7),
        "& .MuiChip-deleteIcon": {
          color: "text.secondary",
          "&:hover": { color: "text.primary" },
        },
      }
    : {};

export const TagEditor = ({
  item,
  setItem,
  readOnly = false,
  label,
  db,
  collection,
}) => {
  const { t } = useTranslate();
  const [inputValue, setInputValue] = useState("");
  const { suggestions, load } = useTagSuggestions(db, collection);
  const tags = item.tags ?? NO_TAGS;
  const isFull = tags.length >= MAX_TAGS;

  const options = useMemo(() => {
    const used = new Set(tags.map((tag) => tag.name?.toUpperCase()));
    return suggestions.filter((name) => !used.has(name));
  }, [suggestions, tags]);

  const setTags = (update) =>
    setItem((prev) => ({ ...prev, tags: update(prev.tags ?? NO_TAGS) }));

  const addTag = (raw) => {
    const name = raw?.trim().toUpperCase();
    if (
      name &&
      !isFull &&
      !tags.some((tag) => tag.name?.toUpperCase() === name)
    ) {
      setTags((prev) => [...prev, { name }]);
    }
    setInputValue("");
  };

  return (
    <>
      {!readOnly && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
          <Autocomplete
            freeSolo
            fullWidth
            size="small"
            options={options}
            value={null}
            inputValue={inputValue}
            onInputChange={(e, value, reason) => {
              if (reason !== "reset") setInputValue(value);
            }}
            onChange={(e, value) => addTag(value)}
            onFocus={load}
            filterOptions={(opts, state) => {
              const query = state.inputValue.trim().toUpperCase();
              return opts.filter((option) => option.includes(query));
            }}
            disabled={isFull}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  isFull ? t("Reached tag limit") : (label ?? t("Add Tag"))
                }
                slotProps={{
                  ...params.slotProps,
                  htmlInput: {
                    ...params.slotProps.htmlInput,
                    maxLength: MAX_TAG_LENGTH,
                  },
                }}
              />
            )}
          />
          {!isFull && (
            <Button
              variant="contained"
              onClick={() => addTag(inputValue)}
              aria-label={t("Add Tag")}
              sx={{ height: 40, minWidth: 0, px: 2 }}
            >
              <AddIcon />
            </Button>
          )}
        </Stack>
      )}
      {tags.length > 0 && (
        <Box
          sx={{
            mt: readOnly ? 0 : 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.625,
          }}
        >
          {tags.map((tag, i) => (
            <Chip
              key={`${tag.name}-${i}`}
              label={tag.name?.toUpperCase()}
              onDelete={
                readOnly
                  ? undefined
                  : () => setTags((prev) => prev.filter((_, idx) => idx !== i))
              }
              color="primary"
              variant="outlined"
              sx={TAG_CHIP_SX}
            />
          ))}
        </Box>
      )}
    </>
  );
};

const TagList = ({ npc, setNpc, db }) => {
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
      <TagEditor
        item={npc}
        setItem={setNpc}
        db={db}
        collection="npc-personal"
      />
    </Paper>
  );
};

export default TagList;
