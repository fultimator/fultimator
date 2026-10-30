import { useState } from "react";

import { doc, setDoc, firestore } from "@platform/db";

import { Button, TextField } from "@mui/material";

export default function NpcUgly({ npc }) {
  const [npcJson, setNpcJson] = useState(JSON.stringify(npc, null, 2));

  const saveNpc = () => {
    const npcData = JSON.parse(npcJson);
    const ref = doc(firestore, "npc-official", npcData.id);
    setDoc(ref, npcData);
  };

  return (
    <>
      <TextField
        fullWidth
        value={npcJson}
        onChange={(e) => {
          setNpcJson(e.target.value);
        }}
      />
      <Button variant="outlined" onClick={saveNpc}>
        Save
      </Button>
    </>
  );
}
