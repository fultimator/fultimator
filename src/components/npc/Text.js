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
      Tratti tipici: {npc.traits}
      <br />
      <br />
      Des d{npc.attributes.dexterity} · Int d{npc.attributes.insight} · Vig d
      {npc.attributes.might} · Vol d{npc.attributes.insight} ⬥ PV {calcHP(npc)}{" "}
      · PM {calcMP(npc)} · Init {calcInit(npc)}
      <br />
      Dif +{calcDef(npc)} · D. Mag +{calcMDef(npc)} ⬥{" "}
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
