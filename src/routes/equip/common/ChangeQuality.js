import { FormControl, Grid, TextField } from "@mui/material";
import { t } from "../../../translation/translate";

function ChangeQuality({ quality, setQuality, qualityCost, setQualityCost }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="quality"
            label={t("Quality")}
            value={quality}
            onChange={setQuality}
            multiline
            minRows={1}
            maxRows={3}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="cost"
            type="number"
            label={t("Cost of Quality")}
            value={qualityCost}
            onChange={setQualityCost}
          ></TextField>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default ChangeQuality;
