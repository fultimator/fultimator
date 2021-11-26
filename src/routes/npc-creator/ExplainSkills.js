import { Card, Typography } from "@mui/material";
import {
  calcSkillsCurrent,
  calcSkillsCurrentAttacks,
  calcSkillsMax,
  calcSkillsMaxType,
  calcSkillsMaxVulnerabilities,
} from "./skills/Skills";

function ExplainSkills({ npc }) {
  const skillsFromAttacks = calcSkillsCurrentAttacks(npc);
  const skillsFromType = calcSkillsMaxType(npc);
  const skillsFromVulnerabilities = calcSkillsMaxVulnerabilities(npc);

  return (
    <Card sx={{ p: 1.61 }}>
      <Typography>
        Abilità totali: <strong>{calcSkillsMax(npc)}</strong>
      </Typography>
      <Typography component="ul">
        <li>
          Specie x <strong>{skillsFromType}</strong>
        </li>
        <li>
          Vulnerabilità x <strong>{skillsFromVulnerabilities}</strong>
        </li>
      </Typography>
      <Typography>
        Abilità usate: <strong>{calcSkillsCurrent(npc)}</strong>
      </Typography>
      <Typography component="ul">
        <li>
          Attacco Speciale x <strong>{skillsFromAttacks}</strong>
        </li>
      </Typography>
    </Card>
  );
}

export default ExplainSkills;
