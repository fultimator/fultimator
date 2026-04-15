import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Add,
  Remove,
  RestartAlt,
} from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import Clock from "../Clock";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: "2px 4px" });

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.split(regex).map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={`${part}-${idx}`} style={{ backgroundColor: "yellow", padding: 0 }}>{part}</mark>
    ) : part
  );
}

function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.replace(regex, "<mark>$1</mark>");
}

export default function PlayerZeroPower({ player, setPlayer, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();
  const zeroPowerKey = 'zeroPower-0';

  const zeroPower = player.zeroPower;
  if (!zeroPower?.name) return null;

  const sections = zeroPower.clock?.sections ?? 6;
  const clockState = zeroPower.clockState ?? new Array(sections).fill(false);
  const filled = clockState.filter(Boolean).length;

  const updateClock = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      zeroPower: { ...prev.zeroPower, clockState: newState },
    }));
  };

  const increment = () => {
    const currentFilled = clockState.filter(Boolean).length;
    if (currentFilled < sections) {
      const next = new Array(sections).fill(false);
      for (let i = 0; i <= currentFilled; i++) {
        next[i] = true;
      }
      updateClock(next);
    }
  };

  const decrement = () => {
    const currentFilled = clockState.filter(Boolean).length;
    if (currentFilled > 0) {
      const next = [...clockState];
      next[currentFilled - 1] = false;
      updateClock(next);
    }
  };

  const reset = () => updateClock(new Array(sections).fill(false));

  const triggerName =
    typeof zeroPower.zeroTrigger === "string"
      ? zeroPower.zeroTrigger
      : zeroPower.zeroTrigger?.name ?? "";
  const triggerDesc =
    typeof zeroPower.zeroTrigger === "object"
      ? zeroPower.zeroTrigger?.description ?? ""
      : "";
  const effectName =
    typeof zeroPower.zeroEffect === "string"
      ? zeroPower.zeroEffect
      : zeroPower.zeroEffect?.name ?? "";
  const effectDesc =
    typeof zeroPower.zeroEffect === "object"
      ? zeroPower.zeroEffect?.description ?? ""
      : "";

  const hasDetails = triggerName || effectName;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matches =
    !normalizedQuery ||
    zeroPower.name?.toLowerCase().includes(normalizedQuery) ||
    triggerName?.toLowerCase().includes(normalizedQuery) ||
    triggerDesc?.toLowerCase().includes(normalizedQuery) ||
    effectName?.toLowerCase().includes(normalizedQuery) ||
    effectDesc?.toLowerCase().includes(normalizedQuery);
  if (!matches) return null;
  const forceOpen =
    !!normalizedQuery &&
    (triggerName?.toLowerCase().includes(normalizedQuery) ||
      triggerDesc?.toLowerCase().includes(normalizedQuery) ||
      effectName?.toLowerCase().includes(normalizedQuery) ||
      effectDesc?.toLowerCase().includes(normalizedQuery));
  const isOpen = !!openRows.zeroPower[zeroPowerKey] || forceOpen;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              background: theme.primary,
              "& .MuiTypography-root": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                textTransform: "uppercase",
              },
            }}
          >
            <StyledTableCellHeader sx={{ width: 36 }} />
            <StyledTableCellHeader colSpan={4}>
              <Typography variant="h4">{t("Zero Power")}</Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Name row */}
          <TableRow>
            <StyledTableCell sx={{ width: 36 }}>
              {hasDetails ? (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleRow('zeroPower', zeroPowerKey); }}>
                  {isOpen ? (
                    <KeyboardArrowUp fontSize="small" />
                  ) : (
                    <KeyboardArrowDown fontSize="small" />
                  )}
                </IconButton>
              ) : null}
            </StyledTableCell>
            <StyledTableCell
              onClick={(e) => { e.stopPropagation(); if (hasDetails) toggleRow('zeroPower', zeroPowerKey); }}
              sx={{ cursor: hasDetails ? "pointer" : "default", minWidth: { xs: 60, sm: 100 }, wordBreak: "break-word" }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  wordBreak: "break-word",
                  overflowWrap: "break-word"
                }}>
                {highlightMatch(zeroPower.name, searchQuery)}
              </Typography>
            </StyledTableCell>
            <StyledTableCell sx={{ width: 80 }} />
            <StyledTableCell sx={{ width: 90 }} />
            <StyledTableCell sx={{ width: 100 }} />
          </TableRow>

          {/* Clock row */}
          <TableRow sx={{ bgcolor: "action.hover" }}>
            <StyledTableCell sx={{ width: 36 }}>
              <Clock
                numSections={sections}
                size={28}
                state={clockState}
                setState={() => {}}
                isCharacterSheet={true}
              />
            </StyledTableCell>
            <StyledTableCell>
              <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                {t("Clock")}
              </Typography>
            </StyledTableCell>
            <StyledTableCell sx={{ width: 80, textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}>
                {filled}/{sections}
              </Typography>
            </StyledTableCell>
            <StyledTableCell sx={{ width: 90 }} />
            <StyledTableCell sx={{ width: 100, textAlign: "right" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <IconButton
                  size="small"
                  disabled={filled === 0}
                  onClick={decrement}
                  sx={{ p: "2px" }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={filled >= sections}
                  onClick={increment}
                  sx={{ p: "2px" }}
                >
                  <Add fontSize="small" />
                </IconButton>
                <Tooltip title={t("Reset")} arrow>
                  <IconButton size="small" onClick={reset} sx={{ p: "2px" }}>
                    <RestartAlt fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </StyledTableCell>
          </TableRow>

          {/* Collapsible details */}
          {hasDetails && (
            <TableRow>
              <StyledTableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, py: 1 }}>
                    {triggerName && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>{t("Trigger")}: </strong>
                        {highlightMatch(triggerName, searchQuery)}
                        {triggerDesc && (
                          <Typography
                            variant="body2"
                            component="div"
                          >
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{highlightMarkdownText(triggerDesc, searchQuery)}</ReactMarkdown>
                          </Typography>
                        )}
                      </Typography>
                    )}
                    {effectName && (
                      <Typography variant="body2">
                        <strong>{t("Effect")}: </strong>
                        {highlightMatch(effectName, searchQuery)}
                        {effectDesc && (
                          <Typography
                            variant="body2"
                            component="div"
                          >
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{highlightMarkdownText(effectDesc, searchQuery)}</ReactMarkdown>
                          </Typography>
                        )}
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </StyledTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
