import { useState } from "react";
import {
  Card,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import CopyToClipboard from "react-copy-to-clipboard";
import { Close, ContentCopy } from "@mui/icons-material";

export default function ShareLink({ scope }) {
  const url = window.location.origin + "/roller/" + scope;

  const [snackBarOpen, setSnackbarOpen] = useState(false);

  const snackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  return (
    <Card sx={{ p: 2, width: "100%", margin: "0 auto" }}>
      <Typography sx={{ mb: 1 }}>
        Share this url to other players to see rolls:
      </Typography>
      <TextField
        fullWidth
        size="small"
        value={url}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <CopyToClipboard
                text={url}
                onCopy={() => {
                  setSnackbarOpen(true);
                }}
                title="Copy"
              >
                <IconButton>
                  <ContentCopy />
                </IconButton>
              </CopyToClipboard>
            </InputAdornment>
          ),
        }}
      />
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={5000}
        onClose={snackBarClose}
        message="Copied to Clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={snackBarClose}
          >
            <Close />
          </IconButton>
        }
      />
    </Card>
  );
}
