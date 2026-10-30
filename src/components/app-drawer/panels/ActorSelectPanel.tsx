import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { NpcSelector, PcSelector } from "../../combatSim/ActorSelector";
import { useCombatActorSelectStore } from "../../../store/combatActorSelectStore";

export const ActorSelectPanel: React.FC = () => {
  const [selectorTab, setSelectorTab] = useState(0);
  const npcList = useCombatActorSelectStore((s) => s.npcList);
  const playerList = useCombatActorSelectStore((s) => s.playerList);
  const loadingNpcs = useCombatActorSelectStore((s) => s.loadingNpcs);
  const loadingPlayers = useCombatActorSelectStore((s) => s.loadingPlayers);
  const handleSelectNPC = useCombatActorSelectStore((s) => s.handleSelectNPC);
  const handleSelectPC = useCombatActorSelectStore((s) => s.handleSelectPC);

  return (
    <Box
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Tabs
        value={selectorTab}
        onChange={(_, v) => setSelectorTab(v)}
        variant="fullWidth"
        sx={{ mb: 1, minHeight: 36 }}
      >
        <Tab label="NPCs" sx={{ minHeight: 36, py: 0.5 }} />
        <Tab label="PCs" sx={{ minHeight: 36, py: 0.5 }} />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {selectorTab === 0 ? (
          <NpcSelector
            contentOnly
            npcList={npcList}
            handleSelectNPC={(npc) => handleSelectNPC?.(npc)}
            loading={loadingNpcs}
          />
        ) : (
          <PcSelector
            playerList={playerList}
            handleSelectPC={(pc) => handleSelectPC?.(pc)}
            loading={loadingPlayers}
          />
        )}
      </Box>
    </Box>
  );
};
