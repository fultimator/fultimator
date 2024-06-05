import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";

export default function BattleModeToggle({ battleMode, setBattleMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  return (
    <Button
      variant="contained"
      sx={{ width: "100%", marginTop: "10px", marginBottom: "10px" }}
      onClick={() => setBattleMode(!battleMode)}
      color={battleMode? "secondary" : "primary"}
    >
        {battleMode? t("Go To Info Sheet") : t("Go To Battle Sheet")}
    </Button>
  );
}
