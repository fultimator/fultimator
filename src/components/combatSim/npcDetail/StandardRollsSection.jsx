import React, { useState } from "react";
import { Box, Button, MenuItem, Select } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Casino } from "@mui/icons-material";
import { t } from "../../../translation/translate";

const StandardRollsSection = ({ selectedNPC, calcAttr, handleRoll }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const attributes = [
    {
      label: "DEX",
      value: calcAttr("Slow", "Enraged", "dexterity", selectedNPC),
    },
    {
      label: "INS",
      value: calcAttr("Dazed", "Enraged", "insight", selectedNPC),
    },
    {
      label: "MIG",
      value: calcAttr("Weak", "Poisoned", "might", selectedNPC),
    },
    {
      label: "WLP",
      value: calcAttr("Shaken", "Poisoned", "will", selectedNPC),
    },
  ];

  const [selectedAttr1, setSelectedAttr1] = useState(attributes[0].label);
  const [selectedAttr2, setSelectedAttr2] = useState(attributes[1].label);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        py: 1,
        minHeight: 60,

      }}
    >
      {/* Attribute Selectors */}
      <Box sx={{ flexGrow: 1, px: 2 }}>
        <Select
          value={selectedAttr1}
          onChange={(e) => setSelectedAttr1(e.target.value)}
          size="small"
          sx={{
            minWidth: 100,
            mx: 1,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: isDarkMode ? "#fff" : "primary",
            },
          }}
        >
          {attributes.map((attr) => (
            <MenuItem key={attr.label} value={attr.label}>
              {t(attr.label)}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={selectedAttr2}
          onChange={(e) => setSelectedAttr2(e.target.value)}
          size="small"
          sx={{
            minWidth: 100,
            mx: 1,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: isDarkMode ? "#fff" : "primary",
            },
          }}
        >
          {attributes.map((attr) => (
            <MenuItem key={attr.label} value={attr.label}>
              {t(attr.label)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Roll Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "stretch",
          my: -1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            handleRoll(
              attributes.find((attr) => attr.label === selectedAttr1).value,
              attributes.find((attr) => attr.label === selectedAttr2).value,
              selectedAttr1,
              selectedAttr2
            );
          }}
          sx={{
            color: "#fff",
            minWidth: 40,
            width: 90,
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 0,
          }}
        >
          {t("Roll") + " "}
          <Casino />
        </Button>
      </Box>
    </Box>
  );
};

export default StandardRollsSection;
