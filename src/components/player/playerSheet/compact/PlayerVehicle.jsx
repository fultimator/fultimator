import React from "react";
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import SpellVehicle from "./spells/SpellVehicle";

const StyledTableCellHeader = styled(TableCell)({
  padding: "4px 8px",
  color: "#fff",
});

function collectStringValues(value, bag = []) {
  if (typeof value === "string") {
    bag.push(value);
    return bag;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStringValues(entry, bag));
    return bag;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((entry) => collectStringValues(entry, bag));
  }
  return bag;
}

export default function PlayerVehicle({ player, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  // Find all pilot-vehicle spells
  const pilotSpells = (player.classes || [])
    .flatMap((c) => (c.spells || []).map((s) => ({ ...s, className: c.name })))
    .filter(
      (spell) =>
        spell &&
        spell.spellType === "pilot-vehicle" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
    );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visiblePilotSpells = pilotSpells.filter((spell) => {
    if (!normalizedQuery) return true;
    const rawStrings = collectStringValues(spell, []);
    const translatedStrings = rawStrings.map((text) => t(text));
    return [...rawStrings, ...translatedStrings]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  if (visiblePilotSpells.length === 0) return null;

  return (
    <>
      <Table sx={{ mb: 1, tableLayout: "fixed", width: "100%" }} size="small">
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
            <StyledTableCellHeader>
              <Typography variant="h4" sx={{ color: "white" }}>
                {t("pilot_vehicle")}
              </Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
      </Table>
      {visiblePilotSpells.map((spell, index) => (
        <SpellVehicle key={index} spell={spell} searchQuery={searchQuery} />
      ))}
    </>
  );
}
