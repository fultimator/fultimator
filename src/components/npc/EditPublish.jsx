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
  updatePublishLanguage,
  isUpdated,
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
            disabled={user.uid !== npc.uid && !isModerator}
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
                <Link
                  href="#"
                  onClick={handleDialogOpen}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    variant="body1"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
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
                  {t("submission_rule_title")}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <ol>
                      <li>
                        <strong>{t("submission_rule_1")}</strong>
                        {t("submission_rule_1_desc")}
                      </li>
                      <ul>
                        <li>
                          <strong>{t("submission_rule_2")}</strong>
                          {t("submission_rule_2_desc")}
                        </li>
                      </ul>
                      <li>
                        <strong>{t("submission_rule_3")}</strong>
                        {t("submission_rule_3_desc")}
                      </li>
                      <li>
                        <strong>{t("submission_rule_4")}</strong>
                        {t("submission_rule_4_desc")}
                      </li>
                    </ol>
                    <p>
                      <strong>{t("submission_rule_note")}</strong>
                      {t("submission_rule_note_desc")}
                    </p>
                    <p>
                      <strong>{t("submission_rule_deviation")}</strong>
                    </p>
                    <ul>
                      <li>
                        <strong>{t("submission_rule_bare_minimum")}</strong>
                        <ul>
                          <li>{t("submission_rule_bare_minimum_types")}</li>
                          <li>{t("submission_rule_bare_minimum_example")}</li>
                        </ul>
                      </li>
                    </ul>
                    <p>{t("submission_rule_bare_minimum_caption")}</p>
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
            <>
              <Button
                variant="outlined"
                sx={{ marginTop: 1 }}
                onClick={unPublish}
              >
                {user && isModerator && user.uid !== npc.uid
                  ? t("Unpublish as Moderator")
                  : t("Unpublish")}
              </Button>
              {isUpdated && npc.language !== "" && isModerator && (
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ marginTop: 1 }}
                  onClick={() => updatePublishLanguage(npc.language || "")}
                >
                  {t("Update as Moderator")}
                </Button>
              )}
            </>
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
