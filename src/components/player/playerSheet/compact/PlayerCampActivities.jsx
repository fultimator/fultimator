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
} from "@mui/material";
import { styled } from "@mui/system";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import NotesMarkdown from "../../../common/NotesMarkdown";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: "2px 4px" });

export default function PlayerCampActivities({ player }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [openRows, setOpenRows] = useState({});

  const activities = (player.campActivities ?? []).filter((a) => a?.name);
  if (activities.length === 0) return null;

  const toggleRow = (idx) =>
    setOpenRows((prev) => ({ ...prev, [idx]: !prev[idx] }));

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
              <Typography variant="h4">{t("Camp Activities (Max 2)")}</Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity, index) => {
            const hasDetails = activity.targetDescription || activity.effect;

            return (
              <React.Fragment key={index}>
                <TableRow>
                  <StyledTableCell sx={{ width: 36 }}>
                    {hasDetails && (
                      <IconButton size="small" onClick={() => toggleRow(index)}>
                        {openRows[index] ? (
                          <KeyboardArrowUp fontSize="small" />
                        ) : (
                          <KeyboardArrowDown fontSize="small" />
                        )}
                      </IconButton>
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
                      {activity.name}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: 80 }} />
                  <StyledTableCell sx={{ width: 90 }} />
                  <StyledTableCell sx={{ width: 100 }} />
                </TableRow>

                {hasDetails && (
                  <TableRow>
                    <StyledTableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                      <Collapse in={!!openRows[index]} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 2, py: 1 }}>
                          {activity.targetDescription && (
                            <Typography variant="body2" sx={{ fontSize: "0.85rem", mb: 0.5 }}>
                              <strong>{t("Target")}: </strong>
                              {activity.targetDescription}
                            </Typography>
                          )}
                          {activity.effect && (
                            <NotesMarkdown sx={{ fontSize: "0.85rem" }}>
                              {activity.effect}
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
