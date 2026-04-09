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
} from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import Clock from "../Clock";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: "2px 4px" });

export default function PlayerZeroPower({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [open, setOpen] = useState(false);

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
    const next = [...clockState];
    const i = next.indexOf(false);
    if (i !== -1) { next[i] = true; updateClock(next); }
  };

  const decrement = () => {
    const next = [...clockState];
    const i = next.lastIndexOf(true);
    if (i !== -1) { next[i] = false; updateClock(next); }
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
                <IconButton size="small" onClick={() => setOpen((v) => !v)}>
                  {open ? (
                    <KeyboardArrowUp fontSize="small" />
                  ) : (
                    <KeyboardArrowDown fontSize="small" />
                  )}
                </IconButton>
              ) : null}
            </StyledTableCell>
            <StyledTableCell
              onClick={() => hasDetails && setOpen((v) => !v)}
              sx={{ cursor: hasDetails ? "pointer" : "default" }}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ textTransform: "uppercase" }}
              >
                {zeroPower.name}
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
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, py: 1, bgcolor: "background.default" }}>
                    {triggerName && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>{t("Trigger")}: </strong>
                        {triggerName}
                        {triggerDesc && (
                          <>
                            {" — "}
                            <em>{triggerDesc}</em>
                          </>
                        )}
                      </Typography>
                    )}
                    {effectName && (
                      <Typography variant="body2">
                        <strong>{t("Effect")}: </strong>
                        {effectName}
                        {effectDesc && (
                          <>
                            {" — "}
                            <em>{effectDesc}</em>
                          </>
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
