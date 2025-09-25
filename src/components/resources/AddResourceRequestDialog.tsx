import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTranslate } from "../../translation/translate";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { createClient } from "@supabase/supabase-js";

interface AddResourceRequestDialogProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  userUUID: string;
  webhookUrl: string;
  onSuccess: () => void;
}

const AddResourceRequestDialog: React.FC<AddResourceRequestDialogProps> = ({
  open,
  onClose,
  userEmail = "",
  userUUID = "",
  webhookUrl,
  onSuccess,
}) => {
  const [user] = useAuthState(auth);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { t } = useTranslate();
  const [formData, setFormData] = useState({
    resourceName: "",
    resourceUrl: "",
    resourceType: "",
    language: "",
    author: "",
    description: "",
    discordAccount: "",
    additionalNotes: "",
    pricingType: "",
    usesAIContent: false,
    termsAccepted: false,
    contactConsent: false,
    licenseAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");

  const resourceTypes = [
    { value: "adventure", label: "Adventure" },
    { value: "supplement", label: "Supplement" },
    { value: "bestiary", label: "Bestiary" },
    { value: "character_sheet", label: "Character Sheet" },
    { value: "tool", label: "Tool" },
    { value: "campaign_setting", label: "Campaign Setting" },
    { value: "module", label: "Module" },
    { value: "homebrew_rule", label: "Homebrew Rule" },
    { value: "map", label: "Map" },
    { value: "other", label: "Other" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "it", label: "Italian" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "pt", label: "Portuguese" },
    { value: "other", label: "Other" },
  ];

  const pricingTypes = [
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid/Commercial" },
    { value: "crowdfunding", label: "Crowdfunding (Kickstarter, etc.)" },
    { value: "donation", label: "Donation/Pay-what-you-want" },
    { value: "other", label: "Other" },
  ];

  const checkUser = async () => {
    if (!user) return;

    try {
      const { data: author, error } = await supabase
        .from("authors")
        .select("uuid, is_banned, ban_reason")
        .eq("uuid", user.uid)
        .single();

      if (author) {
        setIsUserBlocked(author.is_banned || false);
        if (author.is_banned) {
          setErrorMessage(
            author.ban_reason
              ? `You are blocked from submitting resources. Reason: ${author.ban_reason}`
              : "You are blocked from submitting resources."
          );
          return;
        }
      }

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error checking user:", error);
        return;
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  useEffect(() => {
    checkUser();
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.resourceName.trim()) {
      setErrorMessage(t("Resource name is required"));
      return false;
    }
    if (!formData.resourceUrl.trim()) {
      setErrorMessage(t("Resource URL is required"));
      return false;
    }
    if (!formData.resourceType) {
      setErrorMessage(t("Resource type is required"));
      return false;
    }
    if (!formData.language) {
      setErrorMessage(t("Language is required"));
      return false;
    }
    if (!formData.author.trim()) {
      setErrorMessage(t("Author name is required"));
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage(t("Description is required"));
      return false;
    }
    if (!formData.pricingType) {
      setErrorMessage(t("Pricing type is required"));
      return false;
    }
    if (!formData.termsAccepted) {
      setErrorMessage(t("You must accept the terms and conditions"));
      return false;
    }
    if (!formData.contactConsent) {
      setErrorMessage(
        t("You must consent to contact regarding your submission")
      );
      return false;
    }
    if (!formData.licenseAccepted) {
      setErrorMessage(
        t(
          "You must confirm compliance with the Fabula Ultima Third Party License"
        )
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Save submission to submissions table
      const { data, error } = await supabase
        .from("submissions")
        .insert([
          {
            title: formData.resourceName,
            descr_short: formData.description,
            url: formData.resourceUrl,
            type: formData.resourceType,
            language: formData.language,
            author: formData.author,
            pricing_type: formData.pricingType,
            uses_ai_content: formData.usesAIContent,
            additional_notes: formData.additionalNotes,
            discord_account: formData.discordAccount,
            requester_email: userEmail,
            requester_uuid: userUUID,
            requester_display_name: user?.displayName,
            terms_accepted: formData.termsAccepted,
            contact_consent: formData.contactConsent,
            license_accepted: formData.licenseAccepted,
            status: 'pending'
          }
        ])
        .select();

      if (error) {
        // Handle rate limiting errors specifically
        if (error.message && error.message.includes('new row violates row-level security policy')) {
          throw new Error('Rate limit exceeded. Please wait before submitting again. (Max 3 per hour, 10 per day)');
        }
        throw new Error(`Submission failed: ${error.message}`);
      }

      // Try to update author info if possible
      if (user?.uid) {
        try {
          await supabase
            .from("authors")
            .upsert({
              uuid: user.uid,
              name: user.displayName || formData.author,
              contact: userEmail,
            }, {
              onConflict: 'uuid'
            });
        } catch (authorError) {
          console.warn("Could not update author info:", authorError);
        }
      }

      // Also send Discord notification if webhook is configured
      if (webhookUrl) {
        const embedDescription = `
**Resource Details:**
• **Name:** ${formData.resourceName}
• **URL:** ${formData.resourceUrl}
• **Type:** ${formData.resourceType}
• **Language:** ${formData.language}
• **Author:** ${formData.author}
• **Pricing:** ${formData.pricingType}
• **Description:** ${formData.description}

**Requester Information:**
• **Discord:** ${formData.discordAccount || "Not provided"}
• **Email:** ${userEmail || "User Not Logged-In"}
• **UUID:** ${userUUID || "User Not Logged-In"}
• **Google Display Name:** ${user?.displayName || "Not provided"}
• **Google Phone Number:** ${user?.phoneNumber || "Not provided"}
• **Google Photo URL:** ${user?.photoURL || "Not provided"}

**Additional Details:**
• **Additional Notes:**
${formData.additionalNotes || "None"}

**Confirmations:**
• **Terms Accepted:** ✅
• **Contact Consent:** ✅
• **License Compliance:** ✅
• **AI Content:** ${formData.usesAIContent ? "❌ Contains AI" : "✅ No AI Content"}


**Status:** 🟡 Pending Manual Review
*A moderator will manually add this resource to the database after review.*

**Moderator Instructions:**
To approve this resource, accept it through moderate submissions dialog or manually add it to the Supabase resources table with:
- Title: "${formData.resourceName}"
- URL: "${formData.resourceUrl}"
- Type: "${formData.resourceType}"
- Author: "${formData.author}"
- Language: "${formData.language}"
- Collection: "homebrew"
- is_official: false
- is_visible: true
      `.trim();

        const payload = {
          content: null,
          embeds: [
            {
              title: "📚 New Homebrew Resource Submission",
              description: embedDescription,
              color: 16776960, // Yellow color for pending
              footer: {
                text: "Fultimator Resource System",
              },
            },
          ],
          username: "Fultimator-Resources",
          attachments: [],
        };

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Discord notification failed: HTTP ${response.status}`);
        }
      }

      console.log("Resource request submitted successfully");
      setCooldown(60); // Increased cooldown to prevent spam
      resetForm();
      onClose();
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(t("Failed to submit your request: ") + error.message);
      } else {
        setErrorMessage(t("An unexpected error occurred. Please try again."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      resourceName: "",
      resourceUrl: "",
      resourceType: "",
      language: "",
      author: "",
      description: "",
      discordAccount: "",
      additionalNotes: "",
      pricingType: "",
      usesAIContent: false,
      termsAccepted: false,
      contactConsent: false,
      licenseAccepted: false,
    });
    setErrorMessage("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!user) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h3">
          {t("Request Homebrew Resource Addition")}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1">
              {t("You must be logged in to submit a resource request.")}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isUserBlocked) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h3">
          {t("Request Homebrew Resource Addition")}
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body1">{errorMessage}</Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "md",
        },
      }}
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography variant={isMobile ? "h5" : "h3"}>
            {t("Request Homebrew Resource Addition")}
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t(
                "Submit high-quality homebrew resources for community review. All submissions are manually reviewed before approval."
              )}
            </Typography>
          </Alert>

          <TextField
            autoFocus
            label={t("Resource Name")}
            type="text"
            fullWidth
            required
            value={formData.resourceName}
            onChange={(e) => handleInputChange("resourceName", e.target.value)}
            inputProps={{
              maxLength: 200,
            }}
            helperText={t(
              "The title/name of the homebrew resource (max 200 characters)"
            )}
          />

          <TextField
            label={t("Resource URL")}
            type="url"
            fullWidth
            required
            value={formData.resourceUrl}
            onChange={(e) => handleInputChange("resourceUrl", e.target.value)}
            inputProps={{
              maxLength: 500,
            }}
            helperText={t(
              "Direct link to the resource (PDF, webpage, etc.). Must be publicly accessible."
            )}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>{t("Resource Type")}</InputLabel>
              <Select
                value={formData.resourceType}
                label={t("Resource Type")}
                onChange={(e) =>
                  handleInputChange("resourceType", e.target.value)
                }
              >
                {resourceTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {t(type.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>{t("Language")}</InputLabel>
              <Select
                value={formData.language}
                label={t("Language")}
                onChange={(e) => handleInputChange("language", e.target.value)}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {t(lang.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth required>
            <InputLabel>{t("Pricing Type")}</InputLabel>
            <Select
              value={formData.pricingType}
              label={t("Pricing Type")}
              onChange={(e) => handleInputChange("pricingType", e.target.value)}
            >
              {pricingTypes.map((pricing) => (
                <MenuItem key={pricing.value} value={pricing.value}>
                  {t(pricing.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t("Author/Creator Name")}
            type="text"
            fullWidth
            required
            value={formData.author}
            onChange={(e) => handleInputChange("author", e.target.value)}
            inputProps={{
              maxLength: 100,
            }}
            helperText={t(
              "The original creator/author of this homebrew content"
            )}
          />

          <TextField
            label={t("Resource Description")}
            fullWidth
            required
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            inputProps={{
              maxLength: 1000,
            }}
            helperText={t(
              "Detailed description of the resource content, mechanics, and intended use (max 1000 characters)"
            )}
          />

          <TextField
            label={t("Discord Username (Optional)")}
            type="text"
            fullWidth
            value={formData.discordAccount}
            onChange={(e) =>
              handleInputChange("discordAccount", e.target.value)
            }
            inputProps={{
              maxLength: 100,
            }}
            helperText={t(
              "Your Discord username for follow-up questions or community discussions"
            )}
          />

          <TextField
            label={t("Additional Notes (Optional)")}
            fullWidth
            multiline
            rows={2}
            value={formData.additionalNotes}
            onChange={(e) =>
              handleInputChange("additionalNotes", e.target.value)
            }
            inputProps={{
              maxLength: 500,
            }}
            helperText={t(
              "Any special considerations, dependencies, or installation notes (max 500 characters)"
            )}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.usesAIContent}
                onChange={(e) =>
                  handleInputChange("usesAIContent", e.target.checked)
                }
              />
            }
            label={
              <Typography variant="body2">
                {t("This resource contains AI-generated content")}
              </Typography>
            }
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            {t("Terms and Responsibility")}
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.termsAccepted}
                onChange={(e) =>
                  handleInputChange("termsAccepted", e.target.checked)
                }
                required
              />
            }
            label={
              <Typography variant="body2">
                {t(
                  "I confirm that this content complies with community standards and applicable laws, is not plagiarized, stolen, duplicated, offensive, inappropriate, or sexual in nature. I accept full legal and moral responsibility for this submission. I understand that violations, spam, or inappropriate content may result in account suspension or permanent ban, and immediate content removal."
                )}
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.licenseAccepted}
                onChange={(e) =>
                  handleInputChange("licenseAccepted", e.target.checked)
                }
                required
              />
            }
            label={
              <Typography variant="body2">
                {t(
                  "I confirm that this resource complies with the Fabula Ultima Third Party Tabletop License 1.0 and all applicable copyright laws. I understand that my content must respect the intellectual property rights of Need Games and Rooster Games."
                )}
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.contactConsent}
                onChange={(e) =>
                  handleInputChange("contactConsent", e.target.checked)
                }
                required
              />
            }
            label={
              <Typography variant="body2">
                {t(
                  "I consent to being contacted via my account email regarding this submission, including approval status, feedback, or content-related questions."
                )}
              </Typography>
            }
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{t("Important:")}</strong>{" "}
              {t(
                "For content removal requests, additional information, or appeals, contact us at"
              )}{" "}
              <strong>fultimator@gmail.com</strong>.{" "}
              {t(
                "Include your submission details and account information in your message."
              )}
            </Typography>
          </Alert>

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">{errorMessage}</Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isSubmitting || cooldown > 0}
        >
          {cooldown > 0
            ? t(`Please wait ${cooldown}s before submitting again`)
            : isSubmitting
              ? t("Submitting...")
              : t("Submit Request")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddResourceRequestDialog;
