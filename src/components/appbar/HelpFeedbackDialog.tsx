import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../translation/translate";

interface HelpFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  userUUID: string;
  title: string;
  placeholder: string;
  onSuccess: () => void; // New prop for success callback
}

const HelpFeedbackDialog: React.FC<HelpFeedbackDialogProps> = ({
  open,
  onClose,
  userEmail,
  userUUID,
  title,
  placeholder,
  onSuccess,
}) => {
  const { t } = useTranslate();
  const [discordAccount, setDiscordAccount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async () => {
    const webhookUrl = process.env.REACT_APP_DISCORD_FEEDBACK_WEBHOOK_URL;

    if (!webhookUrl) {
      setErrorMessage("Webhook URL is not defined");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Message is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      content: null,
      embeds: [
        {
          title: `New Support Request! (${title})`,
          description: `Discord: ${discordAccount}\nEmail: ${
            userEmail ? userEmail : "User Not Logged-In"
          }\nUUID: ${
            userUUID ? userUUID : "User Not Logged-In"
          }\n\nMessage: ${message}`,
          color: 16248815,
        },
      ],
      username: "Fultimator-Support",
      attachments: [],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log("Message sent successfully");
      setCooldown(30);
      onClose();
      setDiscordAccount("");
      setMessage("");
      onSuccess(); // Call the success callback
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(
          "There was a problem with the fetch operation: " + error.message
        );
      } else {
        setErrorMessage("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setDiscordAccount("");
    setMessage("");
    setErrorMessage("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "sm",
        },
      }}
    >
      <DialogTitle sx={{ fontSize: "1.4rem" }}>{t(title)}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Discord Account"
          type="text"
          fullWidth
          value={discordAccount}
          onChange={(e) => setDiscordAccount(e.target.value)}
          inputProps={{
            maxLength: 100,
          }}
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          {placeholder}
        </Typography>
        <TextField
          margin="dense"
          label="Message"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          inputProps={{
            maxLength: 5000,
          }}
        />
        {errorMessage && (
          <Typography color="error" variant="body2">
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={isSubmitting || cooldown > 0}
        >
          {cooldown > 0 ? `Submit (wait ${cooldown}s)` : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpFeedbackDialog;
