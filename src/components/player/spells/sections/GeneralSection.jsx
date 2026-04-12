import { Grid, FormControlLabel, Switch, Typography, Box, Slider } from "@mui/material";
import CustomTextarea from "../../../common/CustomTextarea";
import ReactMarkdown from "react-markdown";

/**
 * GeneralSection - Reusable base component for spell settings (showInPlayerSheet + custom fields)
 *
 * Props:
 *   formState: object - shared form state from UnifiedSpellModal
 *   setFormState: (newState) => void - update shared state
 *   t: (key) => string - translate function
 *   customFields: Array<FieldConfig> - optional spell-specific fields
 *     FieldConfig: { name, label, type, value, onChange, min?, max?, step?, marks? }
 */
export default function GeneralSection({
  formState,
  setFormState,
  t,
  customFields = [],
}) {
  const markdownComponents = {
    p: ({ _node, ...props }) => <p style={{ margin: 0 }} {...props} />,
  };

  const handleShowInPlayerSheetChange = (checked) => {
    setFormState((prev) => ({ ...prev, showInPlayerSheet: checked }));
  };

  return (
    <Grid container spacing={3}>
      {/* Show in Player Sheet */}
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formState.showInPlayerSheet !== false}
              onChange={(e) => handleShowInPlayerSheetChange(e.target.checked)}
            />
          }
          label={t("Show in Character Sheet")}
        />
      </Grid>

      {/* Custom Fields */}
      {customFields.map((field) => {
        const value = formState[field.name];

        return (
          <Grid item xs={12} key={field.name}>
            {field.type === "toggle" && (
              <FormControlLabel
                control={
                  <Switch
                    checked={value || false}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        [field.name]: e.target.checked,
                      }))
                    }
                  />
                }
                label={t(field.label)}
              />
            )}

            {field.type === "slider" && (
              <>
                <Typography variant="h6" gutterBottom>
                  {t(field.label)}
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={value || field.min || 0}
                    onChange={(e, newValue) =>
                      setFormState((prev) => ({
                        ...prev,
                        [field.name]: newValue,
                      }))
                    }
                    min={field.min || 0}
                    max={field.max || 100}
                    step={field.step || 1}
                    marks={field.marks || []}
                    valueLabelDisplay="auto"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </>
            )}

            {field.type === "textarea" && (
              <>
                <Typography variant="h6" gutterBottom>
                  {t(field.label)}
                </Typography>
                <CustomTextarea
                  label={t(field.inputLabel || field.label)}
                  value={value || ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  placeholder={t(field.placeholder || "")}
                  rows={field.rows || 3}
                />
                {field.helpText && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} component="div">
                    <ReactMarkdown components={markdownComponents}>
                      {t(field.helpText)}
                    </ReactMarkdown>
                  </Typography>
                )}
              </>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}
