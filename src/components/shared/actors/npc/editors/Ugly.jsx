import { useState } from "react";

import { doc, setDoc, firestore } from "@platform/db";

import { Button, TextField } from "@mui/material";

export default function NpcUgly({ npc }) {
  const [npcJson, setNpcJson] = useState(JSON.stringify(npc, null, 2));
  const [error, setError] = useState(null);

  const saveNpc = async () => {
    let npcData;
    try {
      npcData = JSON.parse(npcJson);
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
      return;
    }
    if (!npcData?.id) {
      setError("JSON must include an id field.");
      return;
    }
    try {
      const ref = doc(firestore, "npc-official", npcData.id);
      await setDoc(ref, npcData);
      setError(null);
    } catch (e) {
      setError(`Failed to save: ${e.message}`);
    }
  };

  return (
    <>
      <TextField
        fullWidth
        multiline
        error={Boolean(error)}
        helperText={error}
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
