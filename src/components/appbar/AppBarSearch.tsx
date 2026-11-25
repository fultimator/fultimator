import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputBase,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { useTranslate } from "../../translation/translate";
import { AppBarSearchSlotContext } from "./appBarSearchSlot";

const DEBOUNCE_MS = 250;

interface AppBarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSubmit?: (value: string) => void;
  maxLength?: number;
  panel?: ReactNode;
  chips?: string[];
}

export default function AppBarSearch({
  value,
  onChange,
  placeholder,
  onSubmit,
  maxLength,
  panel,
  chips,
}: AppBarSearchProps) {
  const { slot } = useContext(AppBarSearchSlotContext);
  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSent = useRef(value);
  const pillRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const compact = useMediaQuery("(max-width: 599px)");
  const { t } = useTranslate();

  useEffect(() => {
    if (!open) return undefined;
    const measure = () => {
      const bar = document.querySelector("header.MuiAppBar-root");
      setTop(bar ? bar.getBoundingClientRect().bottom : 0);
    };
    const onPointerDown = (evt: MouseEvent) => {
      const target = evt.target as Element;
      if (
        pillRef.current?.contains(target) ||
        panelRef.current?.contains(target) ||
        target.closest(".MuiPopover-root, .MuiPopper-root, [role=presentation]")
      )
        return;
      setOpen(false);
    };
    const onKeyDown = (evt: KeyboardEvent) =>
      evt.key === "Escape" && setOpen(false);
    measure();
    window.addEventListener("resize", measure);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = () => {
    clearTimeout(timer.current);
    lastSent.current = text;
    onChange(text);
    onSubmit?.(text);
    setOpen(false);
  };

  const handleChange = (next: string) => {
    setText(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastSent.current = next;
      onChange(next);
    }, DEBOUNCE_MS);
  };

  if (!slot) return null;

  const pill = (
    <InputBase
      ref={pillRef}
      fullWidth
      value={text}
      onChange={(evt) => handleChange(evt.target.value)}
      onFocus={() => panel && setOpen(true)}
      placeholder={placeholder}
      onKeyDown={(evt) => evt.key === "Enter" && submit()}
      startAdornment={
        chips?.length && !compact ? (
          <Box sx={{ display: "flex", gap: 0.5, mr: 1, flexShrink: 0 }}>
            {chips.map((label) => (
              <Chip
                key={label}
                size="small"
                label={label}
                sx={{ bgcolor: "primary.contrastText", color: "primary.main" }}
              />
            ))}
          </Box>
        ) : undefined
      }
      endAdornment={
        compact ? undefined : (
          <Button
            size="small"
            onClick={submit}
            startIcon={<SearchIcon fontSize="small" />}
            sx={{
              mr: -1.5,
              borderRadius: 4,
              px: 1.5,
              py: 0.25,
              bgcolor: "primary.contrastText",
              color: "primary.main",
              "&:hover": {
                bgcolor: (theme) =>
                  alpha(theme.palette.primary.contrastText, 0.85),
              },
            }}
          >
            {t("Search")}
          </Button>
        )
      }
      slotProps={{ input: { maxLength, "aria-label": placeholder } }}
      sx={{
        color: "inherit",
        px: 2,
        py: 0.25,
        borderRadius: 4,
        bgcolor: (theme) => alpha(theme.palette.common.black, 0.3),
        "&:focus-within": {
          bgcolor: (theme) => alpha(theme.palette.common.black, 0.4),
        },
        "& input::placeholder": { color: "inherit", opacity: 0.7 },
      }}
    />
  );

  return (
    <>
      {createPortal(pill, slot)}
      {open &&
        panel &&
        createPortal(
          <Paper
            ref={panelRef}
            elevation={6}
            square
            sx={{
              position: "fixed",
              top,
              left: 0,
              right: 0,
              zIndex: (theme) => theme.zIndex.appBar - 1,
              maxHeight: `calc(100vh - ${top}px)`,
              overflowY: "auto",
              px: 2,
              py: 1.5,
              backgroundImage: "none",
              backgroundColor: (theme) => theme.palette.background.paper,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                position: "relative",
                maxWidth: 1200,
                mx: "auto",
                pl: { sm: 1 },
                pr: { sm: 5 },
              }}
            >
              {compact ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={submit}
                    sx={{ flex: 1 }}
                  >
                    {t("Search")}
                  </Button>
                  <IconButton onClick={() => setOpen(false)} aria-label="Close">
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  sx={{ position: "absolute", top: 5, right: 0, zIndex: 1 }}
                >
                  <CloseIcon />
                </IconButton>
              )}
              {panel}
            </Box>
          </Paper>,
          document.body,
        )}
    </>
  );
}
