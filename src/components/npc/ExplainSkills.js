import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
} from "../../libs/npcs";

export default function ExplainSkills({ npc }) {
  return (
    <Card>
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
              Abilità totali
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
            <TableCell>Dalla specie</TableCell>
            <TableCell>{calcAvailableSkillsFromSpecies(npc)}</TableCell>
          </TableRow>
          {calcAvailableSkillsFromLevel(npc) > 0 && (
            <TableRow>
              <TableCell>Dal livello</TableCell>
              <TableCell>{calcAvailableSkillsFromLevel(npc)}</TableCell>
            </TableRow>
          )}
          {calcAvailableSkillsFromVulnerabilities(npc) > 0 && (
            <TableRow>
              <TableCell>Dalle vulnerabilità</TableCell>
              <TableCell>
                {calcAvailableSkillsFromVulnerabilities(npc)}
              </TableCell>
            </TableRow>
          )}
          {calcAvailableSkillsFromRank(npc) > 0 && (
            <TableRow>
              <TableCell>Dal rango</TableCell>
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
              Abilità usate
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
              <TableCell>Dagli attacchi speciali</TableCell>
              <TableCell>{calcUsedSkillsFromSpecialAttacks(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromSpells(npc) > 0 && (
            <TableRow>
              <TableCell>Dagli incantesimi</TableCell>
              <TableCell>{calcUsedSkillsFromSpells(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraDefs(npc) > 0 && (
            <TableRow>
              <TableCell>Dalle difese extra</TableCell>
              <TableCell>{calcUsedSkillsFromExtraDefs(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraHP(npc) > 0 && (
            <TableRow>
              <TableCell>Dai PV extra</TableCell>
              <TableCell>{calcUsedSkillsFromExtraHP(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraMP(npc) > 0 && (
            <TableRow>
              <TableCell>Dai PM extra</TableCell>
              <TableCell>{calcUsedSkillsFromExtraMP(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraInit(npc) > 0 && (
            <TableRow>
              <TableCell>Dalla iniziativa extra</TableCell>
              <TableCell>{calcUsedSkillsFromExtraInit(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraPrecision(npc) > 0 && (
            <TableRow>
              <TableCell>Dal bonus ai test di Precisione</TableCell>
              <TableCell>{calcUsedSkillsFromExtraPrecision(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromExtraMagic(npc) > 0 && (
            <TableRow>
              <TableCell>Dal bonus ai test di Magia</TableCell>
              <TableCell>{calcUsedSkillsFromExtraMagic(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromResistances(npc) > 0 && (
            <TableRow>
              <TableCell>Dalle resistenze</TableCell>
              <TableCell>{calcUsedSkillsFromResistances(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromImmunities(npc) > 0 && (
            <TableRow>
              <TableCell>Dalle immunità</TableCell>
              <TableCell>{calcUsedSkillsFromImmunities(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromAbsorbs(npc) > 0 && (
            <TableRow>
              <TableCell>Dagi assorbimenti</TableCell>
              <TableCell>{calcUsedSkillsFromAbsorbs(npc)}</TableCell>
            </TableRow>
          )}
          {calcUsedSkillsFromSpecial(npc) > 0 && (
            <TableRow>
              <TableCell>Dalle regole speciali</TableCell>
              <TableCell>{calcUsedSkillsFromSpecial(npc)}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
