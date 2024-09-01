import {
  Select,
  TextField,
  useTheme,
  Paper,
  MenuItem,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  FormHelperText,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslate, languageOptions } from "../../translation/translate";
import { Publish } from "@mui/icons-material";
import emaExample from "../../routes/npc-edit/emaExample.png";

export default function EditPublish({
  npc,
  setNpc,
  user,
  isModerator,
  checkedRules,
  rulesDialogOpen,
  handleDialogOpen,
  handleDialogClose,
  handleCheckboxChange,
  publish,
  unPublish,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  // Function to check if NPC can be published
  const canPublish = () => {
    if (!npc.name || npc.name === "") {
      return {
        disabled: true,
        message: t("It must have a name in order to be published.", true),
      };
    }

    if (!npc.description || npc.description === "") {
      return {
        disabled: true,
        message: t(
          "It must have a description in order to be published.",
          true
        ),
      };
    }

    if (!npc.traits || npc.traits === "") {
      return {
        disabled: true,
        message: t("It must have a traits in order to be published.", true),
      };
    }

    if (!npc.createdBy || npc.createdBy === "") {
      return {
        disabled: true,
        message: t(
          "'Credit By' needs to be filled in order to be published",
          true
        ),
      };
    }

    if (!npc.language || npc.language === "") {
      return {
        disabled: true,
        message: t("Language need to be set in order to be published", true),
      };
    }

    if (
      (npc.weaponattacks && npc.weaponattacks.length) ||
      (npc.attacks && npc.attacks.length)
    ) {
      return { disabled: false };
    }

    return {
      disabled: true,
      message: t(
        "It must have at least one attack, in order to be published.",
        true
      ),
    };
  };

  return (
    <Paper
      elevation={3}
      sx={{
        mt: "4px",
        p: "10px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      {/* Show editing options only if user is the creator */}
      {((user && user.uid === npc.uid) || isModerator) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Input for "Created By" */}
          <TextField
            id="outlined-basic"
            label={t("Created By:")}
            sx={{ marginTop: 2 }}
            size="small"
            helperText={
              npc.published
                ? t("This NPC is part of the Adversary Compendium.")
                : t(
                  "Help the Adversary Compendium grow by publishing your finished work!"
                )
            }
            fullWidth
            value={npc.createdBy}
            onChange={(evt) => setNpc({ ...npc, createdBy: evt.target.value })}
            disabled={user && isModerator && user.uid !== npc.uid}
          />

          {/* Language Selection */}
          <Select
            labelId="study"
            id="study"
            size="small"
            value={npc.language || ""}
            onChange={(evt) => setNpc({ ...npc, language: evt.target.value })}
            fullWidth
            disabled={user && isModerator && user.uid !== npc.uid}
          >
            {languageOptions.map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          <FormHelperText sx={{ textAlign: "center" }}>
            {t("Select language to publish with.")}
          </FormHelperText>

          {/* Publish/Unpublish Buttons */}
          {!npc.published && (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 1,
                }}
              >
                <Typography variant="body2">
                  Ensure that your submission follows the
                </Typography>
                <Link href="#" onClick={handleDialogOpen} style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body1"
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                     {t("Submission Guidelines for Adversary Compendium")}
                  </Typography>
                </Link>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkedRules}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="I Agree"
                />
              </Box>
              <Button
                variant="contained"
                sx={{ marginTop: 1 }}
                startIcon={<Publish />}
                disabled={
                  !checkedRules ||
                  canPublish().disabled ||
                  (user && isModerator && user.uid !== npc.uid)
                }
                onClick={publish}
              >
                {t("Publish to Adversary Compendium")}
              </Button>
              <Dialog
                open={rulesDialogOpen}
                onClose={handleDialogClose}
                PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
              >
                <DialogTitle variant="h3">
                  Submission Guidelines for Adversary Compendium
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <ol>
                      <li>
                        <strong>Original Content Only:</strong> Avoid using NPC
                        data from official publications or translations, and
                        refrain from copyrighted material.
                      </li>
                      <ul>
                        <li>
                          <strong>Deviations from Official Work:</strong> When
                          creating NPCs inspired by official sources (e.g., an
                          ice drake inspired by the core rulebook bestiary
                          drake), ensure changes go beyond the{" "}
                          <strong>"bare minimum"</strong>.
                        </li>
                      </ul>
                      <li>
                        <strong>Respectful Submissions:</strong> Tag sexually
                        explicit content appropriately and provide warnings
                        where necessary.
                      </li>
                      <li>
                        <strong>Supported Languages Only:</strong> Entries must
                        be in supported languages (English, Italian, Spanish,
                        German, Polish, French, Brazilian Portuguese). Entries
                        in unsupported languages will be flagged.
                      </li>
                    </ol>
                    <p>
                      <strong>Note:</strong> Content violating these guidelines
                      may be unpublished. Each submission includes a report
                      button. While I'm hesitant to ban accounts, repeated
                      disregard for guidelines may lead to account termination.
                    </p>
                    <p>
                      <strong>Deviation from Official Work Guidelines:</strong>
                    </p>
                    <ul>
                      <li>
                        <strong>Bare Minimum Modifications:</strong>
                        <ul>
                          <li>
                            Alter NPC names, descriptions, skill names, etc.
                          </li>
                          <li>
                            Avoid using copyrighted names, terms, or mechanics
                            directly from official sources (e.g., "Bite" or
                            "Dragonbreath"). Instead, use unique variations like
                            "Vicious Bite" or "Frost Breath" for compliance and
                            originality.
                          </li>
                        </ul>
                      </li>
                    </ul>
                    <p>
                      Example provided by RoosterEma on what could constitute
                      "bare minimum":
                    </p>
                    <img
                      src={emaExample}
                      alt="emaExample"
                      style={{ maxWidth: "40rem" }}
                    />
                    <p>
                      <a
                        href="https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Fabula Ultima Third Party Tabletop License 1.0
                      </a>
                    </p>
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleDialogClose} color="primary">
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
          {npc.published && (
            <Button
              variant="outlined"
              sx={{ marginTop: 1 }}
              onClick={unPublish}
            >
              {user && isModerator && user.uid !== npc.uid
                ? t("Unpublish as Moderator")
                : t("Unpublish")}
            </Button>
          )}

          {/* Message for Publish Criteria */}
          {canPublish().disabled && (
            <div
              style={{
                fontSize: 12,
                textAlign: "center",
                marginTop: 4,
                color: "red",
              }}
            >
              {canPublish().message}
            </div>
          )}
        </div>
      )}
    </Paper>
  );
}
