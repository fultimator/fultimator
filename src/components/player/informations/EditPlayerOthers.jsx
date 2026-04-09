import React, { useCallback, useState } from "react";
import {
  Grid,
  TextField,
  useTheme,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";

const OTHER_SUBTYPES = ["other"];

function emptyOther() {
  return { name: "", description: "", effect: "" };
}

export default function EditPlayerOther({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const others = player.others ?? [];

  const onChangeOther = useCallback(
    (index, key) => (value) => {
      setPlayer((prev) => {
        const updated = [...(prev.others ?? [])];
        updated[index] = { ...updated[index], [key]: value };
        return { ...prev, others: updated };
      });
    },
    [setPlayer]
  );

  const handleAdd = useCallback(() => {
    setPlayer((prev) => ({
      ...prev,
      others: [...(prev.others ?? []), emptyOther()],
    }));
  }, [setPlayer]);

  const handleRemove = useCallback(
    (index) => {
      setPlayer((prev) => {
        const updated = [...(prev.others ?? [])];
        updated.splice(index, 1);
        return { ...prev, others: updated };
      });
    },
    [setPlayer]
  );

  const handleAddFromCompendium = useCallback(
    (item) => {
      setPlayer((prev) => ({
        ...prev,
        others: [
          ...(prev.others ?? []),
          {
            name: item.name ?? "",
            description: item.description ?? "",
            effect: item.effect ?? "",
            ...(item.clock?.sections ? { clock: { sections: item.clock.sections } } : {}),
          },
        ],
      }));
    },
    [setPlayer]
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <CustomHeader
            type="top"
            headerText={t("Other Optionals")}
            showIconButton={isEditMode}
            addItem={handleAdd}
            icon={AddIcon}
            customTooltip={t("Add Optional")}
            openCompendium={isEditMode ? () => setCompendiumOpen(true) : undefined}
          />
        </Grid>

        {others.length === 0 && (
          <Grid item xs={12} sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {t("No optional entries yet.")}
            </Typography>
          </Grid>
        )}

        {others.map((other, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
            )}
            <Grid container spacing={1} sx={{ py: 1 }} alignItems="flex-start">
              <Grid item xs={10} sm={11}>
                <TextField
                  label={t("Name") + ":"}
                  value={other.name ?? ""}
                  onChange={(e) => onChangeOther(index, "name")(e.target.value)}
                  inputProps={{ maxLength: 100 }}
                  InputProps={{ readOnly: !isEditMode }}
                  fullWidth
                  size="small"
                />
              </Grid>
              {isEditMode && (
                <Grid item xs={2} sm={1} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Tooltip title={t("Remove")}>
                    <IconButton size="small" color="error" onClick={() => handleRemove(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
              <Grid item xs={12}>
                <CustomTextarea
                  label={t("Description") + ":"}
                  value={other.description ?? ""}
                  onChange={(e) => onChangeOther(index, "description")(e.target.value)}
                  maxLength={5000}
                  maxRows={8}
                  readOnly={!isEditMode}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextarea
                  label={t("Effect") + ":"}
                  value={other.effect ?? ""}
                  onChange={(e) => onChangeOther(index, "effect")(e.target.value)}
                  maxLength={5000}
                  maxRows={8}
                  readOnly={!isEditMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {isEditMode ? (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={!!other.clock?.sections}
                        onChange={(e) => {
                          setPlayer((prev) => {
                            const updated = [...(prev.others ?? [])];
                            updated[index] = e.target.checked
                              ? { ...updated[index], clock: { sections: 6 } }
                              : { ...updated[index], clock: undefined };
                            return { ...prev, others: updated };
                          });
                        }}
                      />
                    }
                    label={t("Clock")}
                  />
                ) : (
                  other.clock?.sections && (
                    <Typography variant="body2" color="text.secondary">
                      {t("Clock")}: {other.clock.sections}
                    </Typography>
                  )
                )}
              </Grid>
              {other.clock?.sections && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("Clock Sections") + ":"}
                    value={other.clock.sections}
                    onChange={(e) => {
                      setPlayer((prev) => {
                        const updated = [...(prev.others ?? [])];
                        updated[index] = { ...updated[index], clock: { sections: Number(e.target.value) || 6 } };
                        return { ...prev, others: updated };
                      });
                    }}
                    type="number"
                    inputProps={{ min: 2, max: 12, readOnly: !isEditMode }}
                    InputProps={{ readOnly: !isEditMode }}
                    fullWidth
                    size="small"
                  />
                </Grid>
              )}
            </Grid>
          </React.Fragment>
        ))}
      </Grid>

      {isEditMode && (
        <CompendiumViewerModal
          open={compendiumOpen}
          onClose={() => setCompendiumOpen(false)}
          onAddItem={handleAddFromCompendium}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={OTHER_SUBTYPES}
        />
      )}
    </Paper>
  );
}
