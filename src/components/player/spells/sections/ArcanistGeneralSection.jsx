import { Grid, TextField, FormControlLabel, Switch } from "@mui/material";
import CustomTextarea from "../../../common/CustomTextarea";

export default function ArcanistGeneralSection({
  formState,
  setFormState,
  t,
}) {
  const isRework = formState.spellType === "arcanist-rework";

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
        <TextField
          label={t("Arcana Name")}
          variant="outlined"
          fullWidth
          value={formState.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          slotProps={{
            htmlInput: { maxLength: 50 }
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
        <TextField
          label={t("Domain")}
          variant="outlined"
          fullWidth
          value={formState.domain || ""}
          onChange={(e) => handleChange("domain", e.target.value)}
          slotProps={{
            htmlInput: { maxLength: 50 }
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <TextField
          label={t("Arcana Description")}
          variant="outlined"
          fullWidth
          value={formState.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          slotProps={{
            htmlInput: { maxLength: 50 }
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <CustomTextarea
          label={t("Domain Description")}
          fullWidth
          value={formState.domainDesc || ""}
          onChange={(e) => handleChange("domainDesc", e.target.value)}
          maxRows={10}
          maxLength={1500}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <TextField
          label={t("Merge Name")}
          variant="outlined"
          fullWidth
          value={formState.merge || ""}
          onChange={(e) => handleChange("merge", e.target.value)}
          slotProps={{
            htmlInput: { maxLength: 50 }
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <CustomTextarea
          label={t("Merge Description")}
          fullWidth
          value={formState.mergeDesc || ""}
          onChange={(e) => handleChange("mergeDesc", e.target.value)}
          maxRows={10}
          maxLength={1500}
        />
      </Grid>
      {isRework && (
        <>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <TextField
              label={t("Pulse Name")}
              variant="outlined"
              fullWidth
              value={formState.pulse || ""}
              onChange={(e) => handleChange("pulse", e.target.value)}
              slotProps={{
                htmlInput: { maxLength: 50 }
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <CustomTextarea
              label={t("Pulse Description")}
              fullWidth
              value={formState.pulseDesc || ""}
              onChange={(e) => handleChange("pulseDesc", e.target.value)}
              maxRows={10}
              maxLength={1500}
            />
          </Grid>
        </>
      )}
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <TextField
          label={t("Dismiss Name")}
          variant="outlined"
          fullWidth
          value={formState.dismiss || ""}
          onChange={(e) => handleChange("dismiss", e.target.value)}
          slotProps={{
            htmlInput: { maxLength: 50 }
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <CustomTextarea
          label={t("Dismiss Description")}
          fullWidth
          value={formState.dismissDesc || ""}
          onChange={(e) => handleChange("dismissDesc", e.target.value)}
          maxRows={10}
          maxLength={1500}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <FormControlLabel
          control={
            <Switch
              checked={
                formState.showInPlayerSheet === undefined ||
                formState.showInPlayerSheet ||
                false
              }
              onChange={(e) =>
                handleChange("showInPlayerSheet", e.target.checked)
              }
            />
          }
          label={t("Show in Character Sheet")}
        />
      </Grid>
    </Grid>
  );
}
