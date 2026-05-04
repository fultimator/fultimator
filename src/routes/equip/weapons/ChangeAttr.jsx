import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import attributes from "../../../libs/attributes";
import { useTranslate } from "../../../translation/translate";

function ChangeAttr({ att1, att2, setAtt1, setAtt2 }) {
  const { t } = useTranslate();
  return (
    <Grid container spacing={1}>
      <Grid size={6}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="att1">{t("Change Attr 1")}</InputLabel>
          <Select
            labelId="att1"
            id="select-att1"
            value={att1}
            label={t("Change Attr 1")}
            onChange={setAtt1}
            sx={{
              "& .MuiSelect-select": {
                minHeight: "1.4375em",
                py: "16.5px",
              },
            }}
          >
            {Object.entries(attributes).map((key, _i) => {
              return (
                <MenuItem key={key[0]} value={key[0]}>
                  {key[1].shortcaps}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={6}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="att2">{t("Change Attr 2")}</InputLabel>
          <Select
            labelId="att2"
            id="select-att2"
            value={att2}
            label={t("Change Attr 2")}
            onChange={setAtt2}
            sx={{
              "& .MuiSelect-select": {
                minHeight: "1.4375em",
                py: "16.5px",
              },
            }}
          >
            {Object.entries(attributes).map((key, _i) => {
              return (
                <MenuItem key={key[0]} value={key[0]}>
                  {key[1].shortcaps}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default ChangeAttr;
