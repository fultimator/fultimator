// Drive sync button for the Local db mode.
// Auth is lazy: the first Sync/Restore click triggers the Google OAuth popup
// if no token is stored (same flow as Firebase sign-in, drive.file scope included).

import { useState } from "react";
import {
  ButtonGroup,
  Button,
  CircularProgress,
  Snackbar,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { syncToDrive, restoreFromDrive, usePendingSync } from "@platform/db";
import { useTranslate } from "../translation/translate";
import { useDatabaseContext } from "../context/useDatabaseContext";

type Status = "idle" | "syncing" | "restoring" | "success" | "error";

export default function DriveSync() {
  const { t } = useTranslate();
  const { cloudUser } = useDatabaseContext();
  const [status, setStatus] = useState<Status>("idle");
  const hasPending = usePendingSync();
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setStatus("syncing");
    try {
      await syncToDrive();
      setMessage(t("Local data synced to Google Drive"));
      setStatus("success");
    } catch (e) {
      console.error("[DriveSync] sync failed:", e);
      setMessage(e instanceof Error ? e.message : t("Sync failed"));
      setStatus("error");
    }
  };

  const handleRestore = async () => {
    const confirmed = window.confirm(
      t(
        "This will overwrite your local data with the Google Drive backup. Continue?",
      ),
    );
    if (!confirmed) return;
    setStatus("restoring");
    try {
      await restoreFromDrive();
      setMessage(t("Local data restored from Google Drive"));
      setStatus("success");
    } catch (e) {
      console.error("[DriveSync] restore failed:", e);
      setMessage(e instanceof Error ? e.message : t("Restore failed"));
      setStatus("error");
    }
  };

  const busy = status === "syncing" || status === "restoring";
  const signedIn = Boolean(cloudUser);

  return (
    <>
      <Tooltip
        title={
          !signedIn
            ? t("Have a Cloud account? Sign in to enable Drive sync.")
            : ""
        }
      >
        <span>
          <ButtonGroup
            variant="outlined"
            size="small"
            disabled={!signedIn || busy}
          >
            <Tooltip
              title={
                signedIn
                  ? hasPending
                    ? t("Unsaved changes - sync to Google Drive")
                    : t("Sync local data to Google Drive")
                  : ""
              }
            >
              <span>
                <Button
                  startIcon={
                    status === "syncing" ? (
                      <CircularProgress size={14} />
                    ) : (
                      <CloudUploadIcon />
                    )
                  }
                  onClick={handleSync}
                  disabled={!signedIn || busy}
                  sx={
                    signedIn && hasPending
                      ? {
                          color: "#c9963a",
                          borderColor: "#c9963a",
                          boxShadow: "0 0 6px #c9963a, 0 0 14px #c9963a55",
                          "&:hover": {
                            borderColor: "#c9963a",
                            backgroundColor: "#c9963a15",
                            boxShadow: "0 0 10px #c9963a, 0 0 22px #c9963a66",
                          },
                        }
                      : undefined
                  }
                >
                  {t("Sync")}
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                signedIn ? t("Restore local data from Google Drive backup") : ""
              }
            >
              <span>
                <Button
                  startIcon={
                    status === "restoring" ? (
                      <CircularProgress size={14} />
                    ) : (
                      <CloudDownloadIcon />
                    )
                  }
                  onClick={handleRestore}
                  disabled={!signedIn || busy}
                >
                  {t("Restore")}
                </Button>
              </span>
            </Tooltip>
          </ButtonGroup>
        </span>
      </Tooltip>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={status === "success" || status === "error"}
        autoHideDuration={3000}
        onClose={() => setStatus("idle")}
        message={message}
      />
    </>
  );
}
