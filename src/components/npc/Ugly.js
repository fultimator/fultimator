import { useState } from "react";

import { doc, setDoc } from "firebase/firestore";

import { Button, TextField } from "@mui/material";

import { firestore } from "../../firebase";

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
        multiline
        value={npcJson}
        onChange={(e) => {
          setNpcJson(e.target.value);
        }}
      />
      <Button variant="outlined" onClick={saveNpc}>
        Salva
      </Button>
    </>
  );
}
