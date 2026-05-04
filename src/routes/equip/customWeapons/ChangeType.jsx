import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  ListItemText,
} from "@mui/material";
import types from "../../../libs/types";
import { useTranslate } from "../../../translation/translate";
import { TypeIcon } from "../../../components/types";

function ChangeType({ value, onChange, disabled }) {
  const { t } = useTranslate();

  return (
    <FormControl fullWidth>
      <InputLabel id="type">{t("weapon_damage_type")}</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={value}
        label={t("weapon_damage_type")}
        onChange={onChange}
        disabled={disabled}
      >
        {Object.entries(types).map((key) => (
          <MenuItem
            key={key[0]}
            value={key[0]}
            sx={{
              display: "flex",
              alignItems: "center",
              paddingY: "6px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                minWidth: 70,
              }}
            >
              <TypeIcon type={key[0]} />
              <ListItemText
                sx={{
                  ml: 1,
                  marginBottom: 0,
                  textTransform: "capitalize",
                }}
              >
                {key[1].long}
              </ListItemText>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default ChangeType;
