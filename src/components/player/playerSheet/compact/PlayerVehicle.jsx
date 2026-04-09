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

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });

export default function PlayerVehicle({ player }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  // Find all pilot-vehicle spells
  const pilotSpells = (player.classes || [])
    .flatMap((c) => (c.spells || []).map(s => ({ ...s, className: c.name })))
    .filter(
      (spell) =>
        spell &&
        spell.spellType === "pilot-vehicle" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    );

  if (pilotSpells.length === 0) return null;

  return (
    <>
      <Table sx={{ mb: 0 }}>
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
              <Typography variant="h4" sx={{ color: 'white' }}>{t("pilot_vehicle")}</Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
      </Table>
      {pilotSpells.map((spell, index) => (
        <SpellVehicle key={index} spell={spell} />
      ))}
    </>
  );
}
