import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

interface HelpFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  userUUID: string;
}

const HelpFeedbackDialog: React.FC<HelpFeedbackDialogProps> = ({
  open,
  onClose,
  userEmail,
  userUUID,
}) => {
  const [discordAccount, setDiscordAccount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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
      console.error("Webhook URL is not defined");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      content: null,
      embeds: [
        {
          title: "New Support Request!",
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
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }

    setIsSubmitting(false);
    setCooldown(30);
    onClose();
    setDiscordAccount("");
    setMessage("");
  };

  const handleClose = () => {
    onClose();
    setDiscordAccount("");
    setMessage("");
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ fontSize: "1.4rem" }}>Help & Feedback</DialogTitle>
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
