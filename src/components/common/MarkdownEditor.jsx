import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Typography,
  Popover,
  useMediaQuery,
  Grid,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Title,
  Link as LinkIcon,
  TableChart,
  FormatColorText,
  HorizontalRule,
  Category,
} from "@mui/icons-material";
import NotesMarkdown from "./NotesMarkdown"; // Using your existing component for preview
import { useTheme } from "@mui/material/styles";
import { TypeIcon, typeList } from "../types"; // Import TypeIcon and typeList
import {
  D4Icon,
  D6Icon,
  D8Icon,
  D10Icon,
  D12Icon,
  D20Icon,
  Martial,
  MeleeIcon,
  DistanceIcon,
  SpellIcon,
  OffensiveSpellIcon,
} from "../icons";
import { useTranslate } from "../../translation/translate";

const MarkdownEditor = ({ initialValue = "", onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [value, setValue] = useState(initialValue);
  const [view, setView] = useState("edit"); // 'edit' or 'preview'
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState(null);
  const textFieldRef = useRef(null);
  const { t } = useTranslate();

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleTabChange = (event, newValue) => {
    setView(newValue);
  };

  const insertAtCursor = (prefix, suffix = "") => {
    const textField = textFieldRef.current;
    if (!textField) return;

    const start = textField.selectionStart;
    const end = textField.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      value.substring(end);

    setValue(newText);
    if (onChange) onChange(newText);

    // Set cursor position after the operation
    setTimeout(() => {
      textField.focus();
      textField.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const handlePopoverOpen = (event, content) => {
    setAnchorEl(event.currentTarget);
    setPopoverContent(content);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverContent(null);
  };

  // Function to insert type icon
  const insertIcon = (type) => {
    insertAtCursor(`[ICON:${type}]`);
    handlePopoverClose();
  };

  const buttons = [
    {
      tooltip: t("mkeditor_tooltip_bold"),
      icon: <FormatBold />,
      action: () => insertAtCursor("**", "**"),
    },
    {
      tooltip: t("mkeditor_tooltip_italic"),
      icon: <FormatItalic />,
      action: () => insertAtCursor("*", "*"),
    },
    {
      tooltip: t("mkeditor_tooltip_h1"),
      icon: <Title sx={{ transform: "scale(1.2)" }} />,
      action: () => insertAtCursor("# "),
    },
    {
      tooltip: t("mkeditor_tooltip_h2"),
      icon: <Title />,
      action: () => insertAtCursor("## "),
    },
    {
      tooltip: t("mkeditor_tooltip_h3"),
      icon: <Title sx={{ transform: "scale(0.9)" }} />,
      action: () => insertAtCursor("### "),
    },
    {
      tooltip: t("mkeditor_tooltip_h4"),
      icon: <Title sx={{ transform: "scale(0.8)" }} />,
      action: () => insertAtCursor("#### "),
    },
    {
      tooltip: t("mkeditor_tooltip_h5"),
      icon: <Title sx={{ transform: "scale(0.7)" }} />,
      action: () => insertAtCursor("##### "),
    },
    {
      tooltip: t("mkeditor_tooltip_bullet_list"),
      icon: <FormatListBulleted />,
      action: () => insertAtCursor("- "),
    },
    {
      tooltip: t("mkeditor_tooltip_numbered_list"),
      icon: <FormatListNumbered />,
      action: () => insertAtCursor("1. "),
    },
    {
      tooltip: t("mkeditor_tooltip_blockquote"),
      icon: <FormatQuote />,
      action: () => insertAtCursor("> "),
    },
    {
      tooltip: t("mkeditor_tooltip_link"),
      icon: <LinkIcon />,
      action: () => insertAtCursor("[", "](url)"),
    },
    {
      tooltip: t("mkeditor_tooltip_jp_brackets"),
      icon: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "16px",
            width: "24px",
            height: "24px",
            position: "relative",
            top: "0px", // Adjust this value as needed, try -1px or -2px if needed
            lineHeight: 1,
          }}
        >
          【】
        </Box>
      ),
      action: () => insertAtCursor("【", "】"),
    },
    {
      tooltip: t("mkeditor_tooltip_table"),
      icon: <TableChart />,
      action: (event) =>
        handlePopoverOpen(
          event,
          <Box p={2} sx={{ width: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t("mkeditor_table_title")}
            </Typography>

            {/* Predefined table sizes */}
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("mkeditor_table_quick")}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {[
                { size: "2×2", cols: 2, rows: 2 },
                { size: "2×3", cols: 2, rows: 3 },
                { size: "3×2", cols: 3, rows: 2 },
                { size: "3×3", cols: 3, rows: 3 },
                { size: "3×4", cols: 3, rows: 4 },
                { size: "4×3", cols: 4, rows: 3 },
                { size: "4×4", cols: 4, rows: 4 },
                { size: "4×5", cols: 4, rows: 5 },
                { size: "5×4", cols: 5, rows: 4 },
              ].map(({ size, cols, rows }) => (
                <Button
                  key={size}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Generate table based on dimensions
                    const header =
                      "| " +
                      Array(cols)
                        .fill(0)
                        .map((_, i) => `Header ${i + 1}`)
                        .join(" | ") +
                      " |";
                    const separator =
                      "| " + Array(cols).fill("---").join(" | ") + " |";
                    const tableRows = Array(rows)
                      .fill(0)
                      .map(
                        (_, rowIdx) =>
                          "| " +
                          Array(cols)
                            .fill(0)
                            .map(
                              (_, colIdx) =>
                                `Row ${rowIdx + 1}, Col ${colIdx + 1}`
                            )
                            .join(" | ") +
                          " |"
                      )
                      .join("\n");

                    insertAtCursor(`${header}\n${separator}\n${tableRows}`);
                    handlePopoverClose();
                  }}
                >
                  {size}
                </Button>
              ))}
            </Box>

            {/* Custom table builder */}
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("mkeditor_table_custom")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  id="table-cols"
                  label={t("mkeditor_table_columns")}
                  type="number"
                  size="small"
                  defaultValue={3}
                  inputProps={{ min: 1, max: 10 }}
                  sx={{ width: 90, mr: 1 }}
                />
                <Typography>×</Typography>
                <TextField
                  id="table-rows"
                  label={t("mkeditor_table_rows")}
                  type="number"
                  size="small"
                  defaultValue={3}
                  inputProps={{ min: 1, max: 20 }}
                  sx={{ width: 90, ml: 1 }}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  const cols =
                    parseInt(document.getElementById("table-cols").value) || 3;
                  const rows =
                    parseInt(document.getElementById("table-rows").value) || 3;

                  // Generate table based on input dimensions
                  const header =
                    "| " +
                    Array(cols)
                      .fill(0)
                      .map((_, i) => `Header ${i + 1}`)
                      .join(" | ") +
                    " |";
                  const separator =
                    "| " + Array(cols).fill("---").join(" | ") + " |";
                  const tableRows = Array(rows)
                    .fill(0)
                    .map(
                      (_, rowIdx) =>
                        "| " +
                        Array(cols)
                          .fill(0)
                          .map(
                            (_, colIdx) => `Cell ${rowIdx + 1},${colIdx + 1}`
                          )
                          .join(" | ") +
                        " |"
                    )
                    .join("\n");

                  insertAtCursor(`${header}\n${separator}\n${tableRows}`);
                  handlePopoverClose();
                }}
              >
                {t("mkeditor_table_create")}
              </Button>
            </Box>

            {/* Option for empty table with just headers */}
            <Button
              variant={isDark ? "outlined" : "text"}
              size="small"
              fullWidth
              color={isDark ? "inherit" : "primary"}
              onClick={() => {
                const cols =
                  parseInt(document.getElementById("table-cols").value) || 3;

                // Generate table with empty cells
                const header =
                  "| " +
                  Array(cols)
                    .fill(0)
                    .map((_, i) => `Header ${i + 1}`)
                    .join(" | ") +
                  " |";
                const separator =
                  "| " + Array(cols).fill("---").join(" | ") + " |";
                const emptyRow = "| " + Array(cols).fill("").join(" | ") + " |";

                insertAtCursor(
                  `${header}\n${separator}\n${emptyRow}\n${emptyRow}\n${emptyRow}`
                );
                handlePopoverClose();
              }}
            >
              {t("mkeditor_table_empty")}
            </Button>
          </Box>
        ),
    },
    {
      tooltip: t("mkeditor_tooltip_hr"),
      icon: <HorizontalRule />,
      action: () => insertAtCursor("\n---\n"),
    },
    {
      tooltip: t("mkeditor_tooltip_callout"),
      icon: <FormatColorText />,
      action: (event) =>
        handlePopoverOpen(
          event,
          <Box p={2} sx={{ maxWidth: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t("mkeditor_callout_title")}
            </Typography>
            <ButtonGroup orientation="vertical" variant="outlined" fullWidth>
              {[
                "primary",
                "secondary",
                "ternary",
                "quaternary",
                "warning",
                "info",
                "success",
                "danger",
              ].map((type) => (
                <Button
                  key={type}
                  color={type === "danger" ? "error" : type}
                  variant="contained"
                  onClick={() => {
                    insertAtCursor(`{{${type}\n `, "\n}}\n");
                    handlePopoverClose();
                  }}
                >
                  {t(`mkeditor_callout_${type}`)}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        ),
    },
    {
      tooltip: t("mkeditor_tooltip_icon"),
      icon: <Category />,
      action: (event) =>
        handlePopoverOpen(
          event,
          <Box p={2} sx={{ maxWidth: 320 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t("mkeditor_tooltip_icon")}
            </Typography>
            <Grid container spacing={1}>
              {/* Type Icons */}
              {typeList.map((type) => (
                <Grid item key={type} xs={3}>
                  <Tooltip
                    title={t(type).charAt(0).toUpperCase() + t(type).slice(1)}
                    enterDelay={500}
                    leaveDelay={30}
                    enterNextDelay={500}
                  >
                    <IconButton
                      onClick={() => insertIcon(type)}
                      sx={{
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                        borderRadius: "8px",
                        padding: 1,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <TypeIcon type={type} />
                    </IconButton>
                  </Tooltip>
                </Grid>
              ))}

              {/* Dice Icons */}
              {["d4", "d6", "d8", "d10", "d12", "d20"].map((dice) => (
                <Grid item key={dice} xs={3}>
                  <Tooltip
                    title={dice.toUpperCase()}
                    enterDelay={500}
                    leaveDelay={30}
                    enterNextDelay={500}
                  >
                    <IconButton
                      onClick={() => insertIcon(dice)}
                      sx={{
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                        borderRadius: "8px",
                        padding: 1,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {dice === "d4" && <D4Icon />}
                      {dice === "d6" && <D6Icon />}
                      {dice === "d8" && <D8Icon />}
                      {dice === "d10" && <D10Icon />}
                      {dice === "d12" && <D12Icon />}
                      {dice === "d20" && <D20Icon />}
                    </IconButton>
                  </Tooltip>
                </Grid>
              ))}
              {/* Other Icons */}
              {["melee", "ranged", "magic", "spell", "martial"].map((icon) => (
                <Grid item key={icon} xs={3}>
                  <Tooltip
                    title={
                      icon === "melee"
                        ? t("Melee")
                        : icon === "ranged"
                        ? t("Ranged")
                        : icon === "magic"
                        ? t("Spell")
                        : icon === "spell"
                        ? t("offensive_spell")
                        : t("martial")
                    }
                    enterDelay={500}
                    leaveDelay={30}
                    enterNextDelay={500}
                  >
                    <IconButton
                      onClick={() => insertIcon(icon)}
                      sx={{
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                        borderRadius: "8px",
                        padding: 1,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {icon === "melee" && <MeleeIcon />}
                      {icon === "ranged" && <DistanceIcon />}
                      {icon === "spell" && <OffensiveSpellIcon />}
                      {icon === "magic" && <SpellIcon />}
                      {icon === "martial" && <Martial />}
                    </IconButton>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Box>
        ),
    },
  ];

  return (
    <Paper elevation={3} sx={{ mb: 4, width: "100%", height: "100%" }}>
      <Tabs
        value={view}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="inherit"
        variant="fullWidth"
        sx={{
          backgroundColor: isDark
            ? theme.palette.background.paper
            : theme.palette.grey[100],
          color: isDark ? theme.palette.grey[100] : theme.palette.text.primary,
          borderRadius: 1,
          boxShadow: isDark
            ? "0 2px 4px rgba(0,0,0,0.6)"
            : "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Tab value="edit" label={t("mkeditor_tab_edit")} />
        <Tab value="preview" label={t("mkeditor_tab_preview")} />
        {!isMobile && <Tab value="split" label={t("mkeditor_tab_split")} />}
      </Tabs>

      <Box p={2}>
        <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1 }}>
          {buttons.map((btn, idx) => (
            <Tooltip key={idx} title={btn.tooltip}>
              <IconButton
                size="small"
                onClick={
                  typeof btn.action === "function" ? btn.action : undefined
                }
                sx={{ mr: 0.5, mb: 0.5 }}
              >
                {btn.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        <Box sx={{ display: view === "split" ? "flex" : "block", gap: 2 }}>
          {(view === "edit" || view === "split") && (
            <TextField
              inputRef={textFieldRef}
              multiline
              fullWidth
              minRows={10}
              maxRows={30}
              value={value}
              onChange={handleChange}
              variant="outlined"
              placeholder={t("mkeditor_placeholder")}
              sx={{
                fontFamily: "monospace",
                flex: view === "split" ? 1 : "auto",
                "& .MuiInputBase-root": {
                  fontFamily: "monospace",
                },
              }}
              inputProps={{
                maxLength: 5000,
              }}
            />
          )}

          {(view === "preview" || view === "split") && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                minHeight: "238px",
                flex: view === "split" ? 1 : "auto",
                maxHeight: "calc(100vh - 200px)",
                overflow: "auto",
              }}
            >
              <NotesMarkdown>{value}</NotesMarkdown>
            </Paper>
          )}
        </Box>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {popoverContent}
      </Popover>
    </Paper>
  );
};

export default MarkdownEditor;
