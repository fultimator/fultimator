import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { useTranslate } from "../../translation/translate";
import ContentPacksTab from "./ContentPacksTab";
import InstallContentTab from "./InstallContentTab";

interface ManageModulesModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful import so the viewer can navigate to the new pack */
  onImportSuccess?: (packId: string) => void;
}

export default function ManageModulesModal({ open, onClose, onImportSuccess }: ManageModulesModalProps) {
  const { t } = useTranslate();
  const { packs, setPackActive, deletePack, importFromFile, importFromManifestUrl } = useCompendiumPacks();
  const [tab, setTab] = useState(0);

  const handleImportSuccess = (packId: string) => {
    setTab(0); // switch to Content Packs to show the new entry
    onImportSuccess?.(packId);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {t("Manage Modules")}
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={t("Content Packs")} />
          <Tab label={t("Install Content")} />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 2, minHeight: 340 }}>
        {tab === 0 && (
          <ContentPacksTab
            packs={packs}
            onSetActive={setPackActive}
            onDelete={deletePack}
          />
        )}
        {tab === 1 && (
          <InstallContentTab
            onImportFile={importFromFile}
            onImportUrl={importFromManifestUrl}
            onImportSuccess={handleImportSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
