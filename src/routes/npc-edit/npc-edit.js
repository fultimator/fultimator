import { useParams } from "react-router-dom";
import { firestore } from "../../firebase";

import { Grid, Divider, Fab } from "@mui/material";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "@firebase/firestore";
import EditBasics from "../../components/npc/EditBasics";
import { Save } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
// import NpcUgly from "../../components/npc/Ugly";
import ExplainSkills from "../../components/npc/ExplainSkills";
import EditAttacks from "../../components/npc/EditAttacks";
import EditAffinities from "../../components/npc/EditAffinities";
import EditSpecial from "../../components/npc/EditSpecial";
import ExplainAffinities from "../../components/npc/ExplainAffinities";
import EditExtra from "../../components/npc/EditExtra";
import EditSpells from "../../components/npc/EditSpells";
import EditActions from "../../components/npc/EditActions";

export default function NpcEdit() {
  let params = useParams();
  const ref = doc(firestore, "npc-personal", params.npcId);

  const [npc] = useDocumentData(ref, {
    idField: "id",
  });

  const [npcTemp, setNpcTemp] = useState(npc);

  useEffect(() => {
    setNpcTemp(npc);
  }, [npc]);

  const handleCtrlS = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        setDoc(ref, npcTemp);
      }
    },
    [ref, npcTemp]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleCtrlS);
    return () => {
      document.removeEventListener("keydown", handleCtrlS);
    };
  });

  if (!npcTemp) {
    return null;
  }

  return (
    <Layout>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <NpcPretty npc={npcTemp} />
        </Grid>
        <Grid item xs={5}>
          <ExplainSkills npc={npcTemp} />
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />

      <EditBasics npc={npcTemp} setNpc={setNpcTemp} />

      <Divider sx={{ my: 2 }} />

      <Grid container>
        <Grid item xs={6}>
          <EditAffinities npc={npcTemp} setNpc={setNpcTemp} />
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={5}>
          <ExplainAffinities npc={npcTemp} />
          <Divider sx={{ py: 1 }} />
          <EditExtra npc={npcTemp} setNpc={setNpcTemp} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <EditAttacks npc={npcTemp} setNpc={setNpcTemp} />

      <Divider sx={{ my: 2 }} />

      <EditSpells npc={npcTemp} setNpc={setNpcTemp} />

      <Divider sx={{ my: 2 }} />

      <Grid container>
        <Grid item xs={6}>
          <EditActions npc={npcTemp} setNpc={setNpcTemp} />
        </Grid>
        <Grid item xs={6}>
          <EditSpecial npc={npcTemp} setNpc={setNpcTemp} />
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />

      {/* <NpcUgly npc={npcTemp} /> */}

      <Fab
        color="primary"
        aria-label="save"
        sx={{ position: "absolute", bottom: 0, right: 0 }}
        onClick={() => {
          setDoc(ref, npcTemp);
        }}
        onKeyDown={(e) => {
          console.debug(e);
        }}
        disabled={JSON.stringify(npc) === JSON.stringify(npcTemp)}
      >
        <Save />
      </Fab>
    </Layout>
  );
}
