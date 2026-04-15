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
} from "@mui/material";
import { styled } from "@mui/system";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import NotesMarkdown from "../../../common/NotesMarkdown";

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
      <mark
        key={`${part}-${idx}`}
        style={{ backgroundColor: "yellow", padding: 0 }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.replace(regex, "<mark>$1</mark>");
}

export default function PlayerQuirk({ player, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();
  const quirkKey = "quirk-0";

  const quirk = player.quirk;
  if (!quirk?.name) return null;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const hasDetails = quirk.description || quirk.effect;
  const matches =
    !normalizedQuery ||
    quirk.name?.toLowerCase().includes(normalizedQuery) ||
    quirk.description?.toLowerCase().includes(normalizedQuery) ||
    quirk.effect?.toLowerCase().includes(normalizedQuery);
  if (!matches) return null;
  const forceOpen =
    !!normalizedQuery &&
    (quirk.description?.toLowerCase().includes(normalizedQuery) ||
      quirk.effect?.toLowerCase().includes(normalizedQuery));
  const isOpen = !!openRows.quirk[quirkKey] || forceOpen;

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
              <Typography variant="h4">{t("Quirk")}</Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <StyledTableCell sx={{ width: 36 }}>
              {hasDetails && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRow("quirk", quirkKey);
                  }}
                >
                  {isOpen ? (
                    <KeyboardArrowUp fontSize="small" />
                  ) : (
                    <KeyboardArrowDown fontSize="small" />
                  )}
                </IconButton>
              )}
            </StyledTableCell>
            <StyledTableCell
              colSpan={4}
              onClick={(e) => {
                e.stopPropagation();
                if (hasDetails) toggleRow("quirk", quirkKey);
              }}
              sx={{
                cursor: hasDetails ? "pointer" : "default",
                minWidth: { xs: 60, sm: 100 },
                wordBreak: "break-word",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {highlightMatch(quirk.name, searchQuery)}
              </Typography>
            </StyledTableCell>
          </TableRow>

          {hasDetails && (
            <TableRow>
              <StyledTableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, py: 1 }}>
                    {quirk.description && (
                      <NotesMarkdown
                        sx={{ fontSize: "0.85rem", fontStyle: "italic" }}
                      >
                        {highlightMarkdownText(quirk.description, searchQuery)}
                      </NotesMarkdown>
                    )}
                    {quirk.effect && (
                      <NotesMarkdown sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                        {highlightMarkdownText(quirk.effect, searchQuery)}
                      </NotesMarkdown>
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
