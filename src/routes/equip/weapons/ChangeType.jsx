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

function ChangeType({ value, onChange }) {
  const { t } = useTranslate();

  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="type">{t("Change Type")}</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={value}
        label="Change Type"
        onChange={onChange}
      >
        {Object.entries(types).map((key) => {
          return (
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
          );
        })}
      </Select>
    </FormControl>
  );
}

export default ChangeType;