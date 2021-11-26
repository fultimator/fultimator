import { Typography } from "@mui/material";
import Vulnerabilities from "./elements/Vulnerabilities";
import TypeAffinities from "./elements/TypeAffinities";

function ChangeElements({ npc, setnpc }) {
  return (
    <>
      <Typography variant="h6">Affinità</Typography>
      <TypeAffinities npc={npc} setnpc={setnpc} />
      <Vulnerabilities npc={npc} setnpc={setnpc} />
    </>
  );
}

export default ChangeElements;
