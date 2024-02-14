import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme
} from "@mui/material";
import {
  calcAvailableSkills,
  calcAvailableSkillsFromLevel,
  calcAvailableSkillsFromRank,
  calcAvailableSkillsFromSpecies,
  calcAvailableSkillsFromVulnerabilities,
  calcUsedSkills,
  calcUsedSkillsFromExtraDefs,
  calcUsedSkillsFromExtraHP,
  calcUsedSkillsFromExtraMP,
  calcUsedSkillsFromExtraInit,
  calcUsedSkillsFromExtraMagic,
  calcUsedSkillsFromExtraPrecision,
  calcUsedSkillsFromImmunities,
  calcUsedSkillsFromResistances,
  calcUsedSkillsFromSpecial,
  calcUsedSkillsFromSpecialAttacks,
  calcUsedSkillsFromSpells,
  calcUsedSkillsFromAbsorbs,
  calcUsedSkillsFromEquip,
  calcUsedSkillsFromOtherActions,
} from "../../libs/npcs";

import { useTranslate } from "../../translation/translate";

export default function ExplainSkills({ npc }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  return (
    <Card                   
      sx={{
      borderRadius: "8px",
      border: "2px solid ",
      borderColor: secondary,
    }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontFamily: "Antonio",
                textTransform: "uppercase",
                fontSize: "1.3rem",
              }}
            >
              {t("Total Available Skills")}
            </TableCell>
            <TableCell
              sx={{
                fontFamily: "Antonio",
                textTransform: "uppercase",
                fontSize: "1.3rem",
              }}
            >
              {calcAvailableSkills(npc)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{t("Available skills from Species")}</TableCell>
            <TableCell>{calcAvailableSkillsFromSpecies(npc)}</TableCell>
          </TableRow>
          {calcAvailableSkillsFromLevel(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Available skills from levels")}</TableCell>
              <TableCell>{calcAvailableSkillsFromLevel(npc)}</TableCell>
            </TableRow>
          )}
          {calcAvailableSkillsFromVulnerabilities(npc) > 0 && (
            <TableRow>
              <TableCell>
                {t("Available skills from vulnerabilities")}
              </TableCell>
              <TableCell>
                {calcAvailableSkillsFromVulnerabilities(npc)}
              </TableCell>
            </TableRow>
          )}
          {calcAvailableSkillsFromRank(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Available Skills from rank")}</TableCell>
              <TableCell>{calcAvailableSkillsFromRank(npc)}</TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontFamily: "Antonio",
                textTransform: "uppercase",
                fontSize: "1.3rem",
              }}
            >
              {t("Total Used Skills")}
            </TableCell>
            <TableCell
              sx={{
                fontFamily: "Antonio",
                textTransform: "uppercase",
                fontSize: "1.3rem",
              }}
            >
              {calcUsedSkills(npc)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {calcUsedSkillsFromSpecialAttacks(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from special attacks")}</TableCell>
              <TableCell>{calcUsedSkillsFromSpecialAttacks(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromSpells(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from spells")}</TableCell>
              <TableCell>{calcUsedSkillsFromSpells(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraDefs(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from extra defense")}</TableCell>
              <TableCell>{calcUsedSkillsFromExtraDefs(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraHP(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from extra HP")}</TableCell>
              <TableCell>{calcUsedSkillsFromExtraHP(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraMP(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from extra MP")}</TableCell>
              <TableCell>{calcUsedSkillsFromExtraMP(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraInit(npc) > 0 && (
            <TableRow>
              <TableCell>
                {t("Used skills from extra initiative bonus")}
              </TableCell>
              <TableCell>{calcUsedSkillsFromExtraInit(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraPrecision(npc) > 0 && (
            <TableRow>
              <TableCell>
                {t("Used skills from extra accuracy check")}
              </TableCell>
              <TableCell>{calcUsedSkillsFromExtraPrecision(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraMagic(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from extra magic check")}</TableCell>
              <TableCell>{calcUsedSkillsFromExtraMagic(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromResistances(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from resistances")}</TableCell>
              <TableCell>{calcUsedSkillsFromResistances(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromImmunities(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from immunities")}</TableCell>
              <TableCell>{calcUsedSkillsFromImmunities(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromAbsorbs(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from absorption")}</TableCell>
              <TableCell>{calcUsedSkillsFromAbsorbs(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromSpecial(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from special rules")}</TableCell>
              <TableCell>{calcUsedSkillsFromSpecial(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromOtherActions(npc) > 0 && (
            <TableRow>
              <TableCell>{t("Used skills from other actions")}</TableCell>
              <TableCell>{calcUsedSkillsFromOtherActions(npc)}</TableCell>
            </TableRow>
          )}

          {calcUsedSkillsFromEquip(npc) > 0 && (
            <TableRow>
              <TableCell>
                {t("Used skills from equipment")}{" "}
                {npc.species === "Beast" &&
                  t("(but beast shouldn't have equipment)")}{" "}
              </TableCell>
              <TableCell>{calcUsedSkillsFromEquip(npc)}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
