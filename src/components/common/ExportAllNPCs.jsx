import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import JSZip from "jszip";
import useDownload from "../../hooks/useDownload";
import { useTranslate } from "../../translation/translate";
import { Download } from "@mui/icons-material";

function ExportAllNPCs({ npcs }) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [download] = useDownload();
  const { t } = useTranslate();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!isExporting) setOpen(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    npcs.forEach((npc) => {
      const jsonData = JSON.stringify(npc, null, 2);
      zip.file(`${npc.name.replace(/\s/g, "_").toLowerCase()}.json`, jsonData);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);
    download(zipUrl, "npcs.zip");
    setIsExporting(false);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleOpen}
        fullWidth
        disabled={!npcs || npcs.length === 0}
        startIcon={<Download />}
      >
        {t("export_npcs_button")}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h3">
          {t("export_all_npcs_dialog_title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("export_all_npcs_dialog_text")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleClose}
            color="secondary"
            disabled={isExporting}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            color="primary"
            autoFocus
            disabled={isExporting}
            endIcon={
              isExporting && <CircularProgress size={20} color="secondary" />
            }
          >
            {isExporting ? t("exporting_loading_label") : t("Export")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ExportAllNPCs;
