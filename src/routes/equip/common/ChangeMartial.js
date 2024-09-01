import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import {
  MartialOutline,
  Martial,
} from "../../../components/icons";
import { useCustomTheme } from '../../../hooks/useCustomTheme';

function ChangeMartial({ martial, setMartial }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";


  const handleMartialChange = () => {
    setMartial((prev) => !prev);
  };

  const labelStyle = {
    position: 'absolute',
    top: '-16px',
    backgroundColor: isDarkMode ? "#333333" : "white",
    left: '6px',
    fontSize: '0.75rem',
    transition: 'top 0.2s ease, font-size 0.2s ease',
    color: isDarkMode ? 'white' : 'black',
    pointerEvents: 'none',
  };

  return (
    <div style={{ border: "1px solid rgba(255, 255, 255, 0.23)", borderRadius: "4px", padding: "6px 0", display: "flex", justifyContent: "center" }}>
      <FormControl component="fieldset">
        <FormControlLabel
          control={
            <Checkbox
              sx={{ display: "flex", alignItems: "center", justifyContent: "center", margin: 0 }}
              checked={martial}
              onChange={handleMartialChange}
              icon={<MartialOutline />}
              checkedIcon={<Martial />}
            />
          }
          sx={{ margin: 0 }}
          title={t("Martial", true)}
        //labelPlacement="center"
        />
        <label style={labelStyle}>{t("Martial", true)}</label>
      </FormControl>
    </div>
  );
}

export default ChangeMartial;
