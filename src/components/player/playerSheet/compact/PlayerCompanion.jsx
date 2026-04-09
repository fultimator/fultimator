import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import Pretty from "../../../npc/Pretty";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });

export default function PlayerCompanion({ player }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  // Check if the player has a faithful companion skill
  const faithfulCompanionSkills = player.classes
    .flatMap((cls) => cls.skills)
    .filter(
      (skill) =>
        skill.specialSkill === "Faithful Companion" && skill.currentLvl > 0
    );

  // Find the first class with a companion
  let companion = null;
  for (let i = 0; i < player.classes.length; i++) {
    if (player.classes[i].companion) {
      companion = player.classes[i].companion;
      break;
    }
  }

  if (faithfulCompanionSkills.length !== 1 || !companion) return null;

  return (
    <TableContainer component={Paper} sx={{ mb: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ background: theme.primary }}>
            <StyledTableCellHeader sx={{ width: 36 }} />
            <StyledTableCellHeader sx={{ px: 1, py: 0.5 }}>
              <Typography variant="h4" sx={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
                {t("Faithful Companion")} (SL: {faithfulCompanionSkills[0].currentLvl})
              </Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <StyledTableCell sx={{ width: 36 }} />
            <TableCell sx={{ p: 0.5 }}>
              <Pretty npc={companion} collapse={true} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
