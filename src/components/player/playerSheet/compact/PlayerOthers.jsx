import React, { useState } from "react";
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
import NotesMarkdown from "../../../common/NotesMarkdown";
import Clock from "../Clock";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: "2px 4px" });

export default function PlayerOthers({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [openRows, setOpenRows] = useState({});

  const others = (player.others ?? []).filter((o) => o?.name);
  if (others.length === 0) return null;

  const toggleRow = (idx) =>
    setOpenRows((prev) => ({ ...prev, [idx]: !prev[idx] }));

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
            const hasDetails = other.description || other.effect;

            return (
              <React.Fragment key={index}>
                {/* Name row */}
                <TableRow>
                  <StyledTableCell sx={{ width: 36 }}>
                    {hasDetails ? (
                      <IconButton size="small" onClick={() => toggleRow(index)}>
                        {openRows[index] ? (
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
                    onClick={() => hasDetails && toggleRow(index)}
                    sx={{ cursor: hasDetails ? "pointer" : "default" }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ textTransform: "uppercase" }}
                    >
                      {other.name}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: 80 }} />
                  <StyledTableCell sx={{ width: 90 }} />
                  <StyledTableCell sx={{ width: 100 }} />
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
                    <StyledTableCell sx={{ width: 80, textAlign: "center" }}>
                      <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">
                        {filled}/{sections}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell sx={{ width: 90 }} />
                    <StyledTableCell sx={{ width: 100, textAlign: "right" }}>
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
                      <Collapse in={!!openRows[index]} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 2, py: 1 }}>
                          {other.description && (
                            <NotesMarkdown sx={{ fontSize: "0.85rem", fontStyle: "italic" }}>
                              {other.description}
                            </NotesMarkdown>
                          )}
                          {other.effect && (
                            <NotesMarkdown sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                              {other.effect}
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
