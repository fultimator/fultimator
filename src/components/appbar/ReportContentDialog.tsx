import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { useTranslate } from "../../translation/translate";

interface ReportContentDialogProps {
  open: boolean;
  onClose: () => void;
  contentAuthor: string;
  contentId: string;
  contentName: string;
  contentType: string;
  onSuccess: () => void;
}

const ReportContentDialog: React.FC<ReportContentDialogProps> = ({
  open,
  onClose,
  contentAuthor,
  contentId,
  contentName,
  contentType,
  onSuccess,
}) => {
  const { t } = useTranslate();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const reportReasons = [
    "The content violates copyright as it's not original content",
    "Offensive content",
    "Content language unsupported",
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleReasonChange = (reason: string) => {
    setSelectedReasons((prevReasons) =>
      prevReasons.includes(reason)
        ? prevReasons.filter((r) => r !== reason)
        : [...prevReasons, reason]
    );
  };

  const handleSubmit = async () => {
    const webhookUrl = process.env.REACT_APP_DISCORD_REPORT_CONTENT_WEBHOOK_URL;

    if (!webhookUrl) {
      setErrorMessage("Webhook URL is not defined");
      return;
    }

    if (selectedReasons.length === 0 && message.trim() === "") {
      setErrorMessage("At least one reason must be selected");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      content: null,
      embeds: [
        {
          title: `New Report! (${contentType})`,
          description: `Author UUID: ${contentAuthor}
          \n Reported Content: ${contentName} - ${contentId} (${contentType})
          \n https://fabula-ultima-helper.web.app/npc-gallery/${contentId}
          \n\nReasons:\n${selectedReasons.join("\n")}
          ${message ? `\n\nMessage: ${message}` : ""}`,
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
      setMessage("");
      setSelectedReasons([]);
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
    setMessage("");
    setErrorMessage("");
    setSelectedReasons([]);
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
      <DialogTitle sx={{ fontSize: "1.4rem" }}>
        {t("Report Content")}
      </DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <Typography variant="body2">
            {t("Select the reasons for reporting:")}
          </Typography>
          <FormGroup>
            {reportReasons.map((reason) => (
              <FormControlLabel
                key={reason}
                control={
                  <Checkbox
                    checked={selectedReasons.includes(reason)}
                    onChange={() => handleReasonChange(reason)}
                  />
                }
                label={reason}
              />
            ))}
          </FormGroup>
        </FormControl>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t("Add a message if other reasons.")}
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
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t("Report is anonymous.")}
        </Typography>
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

export default ReportContentDialog;
