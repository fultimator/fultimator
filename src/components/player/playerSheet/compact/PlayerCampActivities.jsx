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

const StyledTableCellHeader = styled(TableCell)({
  padding: "4px 8px",
  color: "#fff",
});
const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
});

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

export default function PlayerCampActivities({ player, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const activities = (player.campActivities ?? [])
    .filter((a) => a?.name)
    .filter(
      (activity) =>
        !normalizedQuery ||
        activity.name?.toLowerCase().includes(normalizedQuery) ||
        activity.targetDescription?.toLowerCase().includes(normalizedQuery) ||
        activity.effect?.toLowerCase().includes(normalizedQuery),
    );
  if (activities.length === 0) return null;

  return (
    <TableContainer component={Paper} sx={{ mb: 1 }}>
      <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
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
              <Typography variant="h4">
                {t("Camp Activities (Max 2)")}
              </Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity, index) => {
            const activityKey = `activity-${index}`;
            const hasDetails = activity.targetDescription || activity.effect;
            const forceOpen =
              !!normalizedQuery &&
              (activity.targetDescription
                ?.toLowerCase()
                .includes(normalizedQuery) ||
                activity.effect?.toLowerCase().includes(normalizedQuery));
            const isOpen = !!openRows.campActivities[activityKey] || forceOpen;

            return (
              <React.Fragment key={index}>
                <TableRow>
                  <StyledTableCell sx={{ width: 36 }}>
                    {hasDetails && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow("campActivities", activityKey);
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
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasDetails) toggleRow("campActivities", activityKey);
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
                      {highlightMatch(activity.name, searchQuery)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: 80 }} />
                  <StyledTableCell sx={{ width: 90 }} />
                  <StyledTableCell sx={{ width: 100 }} />
                </TableRow>
                {hasDetails && (
                  <TableRow>
                    <StyledTableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            p: 1,
                            ml: { xs: 1, sm: 4 },
                            bgcolor: "rgba(0,0,0,0.03)",
                          }}
                        >
                          {activity.targetDescription && (
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.85rem", mb: 0.5 }}
                            >
                              <strong>{t("Target")}: </strong>
                              {highlightMatch(
                                activity.targetDescription,
                                searchQuery,
                              )}
                            </Typography>
                          )}
                          {activity.effect && (
                            <NotesMarkdown sx={{ fontSize: "0.85rem" }}>
                              {highlightMarkdownText(
                                activity.effect,
                                searchQuery,
                              )}
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
