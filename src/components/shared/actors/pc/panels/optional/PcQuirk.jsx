import { useState } from "react";
import { IconButton, Tooltip, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import PlayerQuirk from "/src/components/shared/actors/pc/playerSheet/optional/PlayerQuirk";
import { EditPlayerQuirk } from "/src/components/shared/actors/pc/editors";
import { useTranslate } from "/src/translation/translate";

export default function PcQuirk({ pc, isInteractive = false, onUpdate }) {
  const { t } = useTranslate();
  const [editorOpen, setEditorOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const headerActions = isInteractive ? (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title={t("Add")} arrow>
        <IconButton
          size="small"
          onClick={() => {
            setAddOpen(true);
            setEditorOpen(true);
          }}
          sx={{ color: "#fff" }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Open Compendium")} arrow>
        <IconButton
          size="small"
          onClick={() => setCompendiumOpen(true)}
          sx={{ color: "#fff" }}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  ) : undefined;

  return (
    <>
      <PlayerQuirk
        player={pc}
        setPlayer={isInteractive ? onUpdate : undefined}
        isEditMode={isInteractive}
        onEdit={isInteractive ? () => setEditorOpen(true) : undefined}
        speaker={pc?.name || ""}
        headerActions={headerActions}
      />
      {isInteractive && (
        <EditPlayerQuirk
          player={pc}
          setPlayer={onUpdate}
          isEditMode={isInteractive}
          externalOpen={editorOpen}
          onExternalClose={() => {
            setEditorOpen(false);
            setAddOpen(false);
          }}
          externalCreating={addOpen}
          externalCompendiumOpen={compendiumOpen}
          onExternalCompendiumClose={() => setCompendiumOpen(false)}
          modalOnly
        />
      )}
    </>
  );
}
