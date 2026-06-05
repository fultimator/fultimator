import { useState } from "react";
import { IconButton, Tooltip, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import PlayerOthers from "/src/components/shared/actors/pc/playerSheet/optional/PlayerOthers";
import { EditPlayerOthers } from "/src/components/shared/actors/pc/editors";
import { useTranslate } from "/src/translation/translate";

export default function PcOthers({ pc, isInteractive = false, onUpdate }) {
  const { t } = useTranslate();
  const [editIndex, setEditIndex] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const headerActions = isInteractive ? (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title={t("Add")} arrow>
        <IconButton size="small" onClick={() => setAddOpen(true)} sx={{ color: "#fff" }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Open Compendium")} arrow>
        <IconButton size="small" onClick={() => setCompendiumOpen(true)} sx={{ color: "#fff" }}>
          <SearchIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  ) : undefined;

  return (
    <>
      <PlayerOthers
        player={pc}
        setPlayer={isInteractive ? onUpdate : undefined}
        isEditMode={isInteractive}
        onEdit={isInteractive ? (index) => setEditIndex(index) : undefined}
        speaker={pc?.name || ""}
        isCharacterSheet={true}
        headerActions={headerActions}
      />
      {isInteractive && (
        <EditPlayerOthers
          player={pc}
          setPlayer={onUpdate}
          isEditMode={isInteractive}
          externalEditIndex={editIndex}
          onExternalClose={() => setEditIndex(null)}
          externalCreateOpen={addOpen}
          onExternalCreateClose={() => setAddOpen(false)}
          externalCompendiumOpen={compendiumOpen}
          onExternalCompendiumClose={() => setCompendiumOpen(false)}
          modalOnly
        />
      )}
    </>
  );
}
