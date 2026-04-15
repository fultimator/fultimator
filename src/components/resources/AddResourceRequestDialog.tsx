import React, { useState, useEffect, useCallback } from "react";
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
import { useAuthState, auth } from "@platform/db";
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
    { value: "adventure", label: "resources_type_adventure" },
    { value: "supplement", label: "resources_type_supplement" },
    { value: "bestiary", label: "resources_type_bestiary" },
    { value: "character_sheet", label: "resources_type_character_sheet" },
    { value: "tool", label: "resources_type_tool" },
    { value: "campaign_setting", label: "resources_type_campaign_setting" },
    { value: "module", label: "resources_type_module" },
    { value: "homebrew_rule", label: "resources_type_homebrew_rule" },
    { value: "map", label: "resources_type_map" },
    { value: "other", label: "resources_type_other" },
  ];

  const languages = [
    { value: "en", label: "resources_language_english" },
    { value: "it", label: "resources_language_italian" },
    { value: "es", label: "resources_language_spanish" },
    { value: "fr", label: "resources_language_french" },
    { value: "de", label: "resources_language_german" },
    { value: "pt", label: "resources_language_portuguese" },
    { value: "other", label: "resources_language_other" },
  ];

  const pricingTypes = [
    { value: "free", label: "resources_pricing_free" },
    { value: "paid", label: "resources_pricing_paid" },
    { value: "crowdfunding", label: "resources_pricing_crowdfunding" },
    { value: "donation", label: "resources_pricing_donation" },
    { value: "other", label: "resources_pricing_other" },
  ];

  const checkUser = useCallback(async () => {
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
              ? t("submitting_resources_ban_reason", { reason: author.ban_reason })
              : t("submitting_resources_ban")
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
  }, [user, supabase, t]);

  useEffect(() => {
    checkUser();
  }, [user, checkUser]);

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
      setErrorMessage(t("resources_name_required"));
      return false;
    }
    if (!formData.resourceUrl.trim()) {
      setErrorMessage(t("resources_url_required"));
      return false;
    }
    if (!formData.resourceType) {
      setErrorMessage(t("resources_type_required"));
      return false;
    }
    if (!formData.language) {
      setErrorMessage(t("resources_language_required"));
      return false;
    }
    if (!formData.author.trim()) {
      setErrorMessage(t("resources_author_required"));
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage(t("resources_description_required"));
      return false;
    }
    if (!formData.pricingType) {
      setErrorMessage(t("resources_pricing_required"));
      return false;
    }
    if (!formData.termsAccepted) {
      setErrorMessage(t("resources_terms_required"));
      return false;
    }
    if (!formData.contactConsent) {
      setErrorMessage(
        t("resources_contact_consent_required")
      );
      return false;
    }
    if (!formData.licenseAccepted) {
      setErrorMessage(
        t("resources_license_required")
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
      const { _data, error } = await supabase
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
        setErrorMessage(t("resources_submission_failed") + error.message);
      } else {
        setErrorMessage(t("resources_unexpected_error"));
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
          {t("resources_request_addition")}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1">
              {t("resources_login_required")}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            {t("resources_close")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isUserBlocked) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h3">
          {t("resources_request_addition")}
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body1">{errorMessage}</Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            {t("resources_close")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: "md",
          },
        }
      }}
    >
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography variant={isMobile ? "h5" : "h3"}>
            {t("resources_request_addition")}
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t("resources_submit_high_quality")}
            </Typography>
          </Alert>

          <TextField
            autoFocus
            label={t("resources_resource_name")}
            type="text"
            fullWidth
            required
            value={formData.resourceName}
            onChange={(e) => handleInputChange("resourceName", e.target.value)}
            helperText={t(
              "resources_resource_name_helper"
            )}
            slotProps={{
              htmlInput: {
                maxLength: 200,
              }
            }}
          />

          <TextField
            label={t("resources_resource_url")}
            type="url"
            fullWidth
            required
            value={formData.resourceUrl}
            onChange={(e) => handleInputChange("resourceUrl", e.target.value)}
            helperText={t("resources_resource_url_helper")}
            slotProps={{
              htmlInput: {
                maxLength: 500,
              }
            }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>{t("resources_resource_type")}</InputLabel>
              <Select
                value={formData.resourceType}
                label={t("resources_resource_type")}
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
              <InputLabel>{t("resources_language")}</InputLabel>
              <Select
                value={formData.language}
                label={t("resources_language")}
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
            <InputLabel>{t("resources_pricing_type")}</InputLabel>
            <Select
              value={formData.pricingType}
              label={t("resources_pricing_type")}
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
            label={t("resources_author")}
            type="text"
            fullWidth
            required
            value={formData.author}
            onChange={(e) => handleInputChange("author", e.target.value)}
            helperText={t(
              "resources_author_helper"
            )}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              }
            }}
          />

          <TextField
            label={t("resources_description")}
            fullWidth
            required
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            helperText={t(
              "resources_description_helper"
            )}
            slotProps={{
              htmlInput: {
                maxLength: 1000,
              }
            }}
          />

          <TextField
            label={t("resources_discord_username")}
            type="text"
            fullWidth
            value={formData.discordAccount}
            onChange={(e) =>
              handleInputChange("discordAccount", e.target.value)
            }
            helperText={t(
              "resources_discord_username_helper"
            )}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              }
            }}
          />

          <TextField
            label={t("resources_additional_notes")}
            fullWidth
            multiline
            rows={2}
            value={formData.additionalNotes}
            onChange={(e) =>
              handleInputChange("additionalNotes", e.target.value)
            }
            helperText={t(
              "resources_additional_notes_helper"
            )}
            slotProps={{
              htmlInput: {
                maxLength: 500,
              }
            }}
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
                {t("resources_uses_ai_content")}
              </Typography>
            }
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            {t("resources_terms_and_responsibility")}
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
                  "resources_terms_accepted"
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
                  "resources_license_accepted"
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
                  "resources_contact_consent"
                )}
              </Typography>
            }
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{t("Important:")}</strong>{" "}
              {t(
                "resources_content_removal_info"
              )}{" "}
              <strong>fultimator@gmail.com</strong>.{" "}
              {t(
                "resources_include_submission_details"
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
            ? t(`resources_submit_cooldown`, { seconds: cooldown })
            : isSubmitting
              ? t("resources_submitting")
              : t("resources_submit_request")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddResourceRequestDialog;
