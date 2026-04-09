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

export default function PlayerQuirk({ player }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [open, setOpen] = useState(false);

  const quirk = player.quirk;
  if (!quirk?.name) return null;

  const hasDetails = quirk.description || quirk.effect;

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
                <IconButton size="small" onClick={() => setOpen((v) => !v)}>
                  {open ? (
                    <KeyboardArrowUp fontSize="small" />
                  ) : (
                    <KeyboardArrowDown fontSize="small" />
                  )}
                </IconButton>
              )}
            </StyledTableCell>
            <StyledTableCell
              colSpan={4}
              onClick={() => hasDetails && setOpen((v) => !v)}
              sx={{ cursor: hasDetails ? "pointer" : "default" }}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ textTransform: "uppercase" }}
              >
                {quirk.name}
              </Typography>
            </StyledTableCell>
          </TableRow>

          {hasDetails && (
            <TableRow>
              <StyledTableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, py: 1 }}>
                    {quirk.description && (
                      <NotesMarkdown sx={{ fontSize: "0.85rem", fontStyle: "italic" }}>
                        {quirk.description}
                      </NotesMarkdown>
                    )}
                    {quirk.effect && (
                      <NotesMarkdown sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                        {quirk.effect}
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
