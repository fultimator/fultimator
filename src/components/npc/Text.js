import { Typography } from "@mui/material";
import { Fragment } from "react";
import { calcDef, calcHP, calcInit, calcMDef, calcMP } from "../../libs/npcs";
import { typeList, TypeName } from "../types";

export default function NpcText({ npc }) {
  return (
    <Typography sx={{ border: "1px solid black", p: 1 }}>
      {npc.name} ⬥ {npc.species} lvl {npc.lvl}
      <br />
      {npc.description} <br />
      Typical Traits: {npc.traits}
      <br />
      <br />
      Dex d{npc.attributes.dexterity} · Ins d{npc.attributes.insight} · Mig d
      {npc.attributes.might} · Wip d{npc.attributes.willpower} ⬥ HP{" "}
      {calcHP(npc)} · MP {calcMP(npc)} · Init {calcInit(npc)}
      <br />
      Def +{calcDef(npc)} · D. Mag +{calcMDef(npc)} ⬥{" "}
      {typeList.map((type) => {
        if (!npc.affinities[type]) {
          return null;
        }
        return (
          <Fragment key={type}>
            <TypeName type={type} /> {npc.affinities[type].toUpperCase()} ·{" "}
          </Fragment>
        );
      })}
    </Typography>
  );
}
