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
  StickyNote2Outlined,
} from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import NotesMarkdown from "../../../common/NotesMarkdown";
import Clock from "../Clock";

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

export default function PlayerOthers({ player, setPlayer, isEditMode, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const others = (player.others ?? [])
    .filter((o) => o?.name)
    .filter((other) =>
      !normalizedQuery ||
      other.name?.toLowerCase().includes(normalizedQuery) ||
      other.description?.toLowerCase().includes(normalizedQuery) ||
      other.effect?.toLowerCase().includes(normalizedQuery)
    );
  if (others.length === 0) return null;

  const updateClock = (index, newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => {
      const updated = [...(prev.others ?? [])];
      updated[index] = { ...updated[index], clockState: newState };
      return { ...prev, others: updated };
    });
  };

  const increment = (index, clockState) => {
    const next = [...clockState];
    const i = next.indexOf(false);
    if (i !== -1) { next[i] = true; updateClock(index, next); }
  };

  const decrement = (index, clockState) => {
    const next = [...clockState];
    const i = next.lastIndexOf(true);
    if (i !== -1) { next[i] = false; updateClock(index, next); }
  };

  const reset = (index, sections) =>
    updateClock(index, new Array(sections).fill(false));

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
              <Typography variant="h4">{t("Other Optionals")}</Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {others.map((other, index) => {
            const sections = other.clock?.sections ?? 0;
            const hasClock = sections > 0;
            const clockState = hasClock
              ? (other.clockState ?? new Array(sections).fill(false))
              : [];
            const filled = hasClock ? clockState.filter(Boolean).length : 0;
            const otherKey = `other-${index}`;
            const hasDetails = other.description || other.effect;
            const forceOpen =
              !!normalizedQuery &&
              (other.description?.toLowerCase().includes(normalizedQuery) ||
                other.effect?.toLowerCase().includes(normalizedQuery));
            const isOpen = !!openRows.others[otherKey] || forceOpen;

            return (
              <React.Fragment key={index}>
                {/* Name row */}
                <TableRow>
                  <StyledTableCell sx={{ width: 36 }}>
                    {hasDetails ? (
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleRow('others', otherKey); }}>
                        {isOpen ? (
                          <KeyboardArrowUp fontSize="small" />
                        ) : (
                          <KeyboardArrowDown fontSize="small" />
                        )}
                      </IconButton>
                    ) : (
                      <Tooltip title={t("Optional")}>
                        <StickyNote2Outlined
                          fontSize="small"
                          sx={{ ml: "4px", color: theme.secondary }}
                        />
                      </Tooltip>
                    )}
                  </StyledTableCell>
                  <StyledTableCell
                    onClick={(e) => { e.stopPropagation(); hasDetails && toggleRow('others', otherKey); }}
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
                      {highlightMatch(other.name, searchQuery)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: { xs: 55, sm: 80 }, display: { xs: 'none', sm: 'table-cell' } }} />
                  <StyledTableCell sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
                  <StyledTableCell sx={{ width: { xs: 110, sm: 110 } }} />
                </TableRow>
                {/* Clock row */}
                {hasClock && (
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
                    <StyledTableCell sx={{ width: { xs: 55, sm: 80 }, display: { xs: 'none', sm: 'table-cell' }, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: "bold"
                        }}>
                        {filled}/{sections}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
                    <StyledTableCell sx={{ width: { xs: 110, sm: 110 }, textAlign: "right" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <IconButton
                          size="small"
                          disabled={filled === 0}
                          onClick={() => decrement(index, clockState)}
                          sx={{ p: "2px" }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={filled >= sections}
                          onClick={() => increment(index, clockState)}
                          sx={{ p: "2px" }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                        <Tooltip title={t("Reset")} arrow>
                          <IconButton
                            size="small"
                            onClick={() => reset(index, sections)}
                            sx={{ p: "2px" }}
                          >
                            <RestartAlt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </StyledTableCell>
                  </TableRow>
                )}
                {/* Collapsible description + effect */}
                {hasDetails && (
                  <TableRow>
                    <StyledTableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 2, py: 1 }}>
                          {other.description && (
                            <NotesMarkdown sx={{ fontSize: "0.85rem", fontStyle: "italic" }}>
                              {highlightMarkdownText(other.description, searchQuery)}
                            </NotesMarkdown>
                          )}
                          {other.effect && (
                            <NotesMarkdown sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                              {highlightMarkdownText(other.effect, searchQuery)}
                            </NotesMarkdown>
                          )}
                        </Box>
                      </Collapse>
                    </StyledTableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
