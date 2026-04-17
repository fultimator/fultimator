import React from "react";
import { Box } from "@mui/material";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";

const AttributeSection = ({ selectedNPC, calcAttr }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const attributes = [
    {
      label: "DEX",
      value: calcAttr("Slow", "Enraged", "dexterity", selectedNPC),
      color: theme.palette.info.main,
      originalValue: selectedNPC.attributes?.dexterity,
    },
    {
      label: "INS",
      value: calcAttr("Dazed", "Enraged", "insight", selectedNPC),
      color: theme.palette.secondary.main,
      originalValue: selectedNPC.attributes?.insight,
    },
    {
      label: "MIG",
      value: calcAttr("Weak", "Poisoned", "might", selectedNPC),
      color: theme.palette.error.light,
      originalValue: selectedNPC.attributes?.might,
    },
    {
      label: "WLP",
      value: calcAttr("Shaken", "Poisoned", "will", selectedNPC),
      color: theme.palette.warning.main,
      originalValue: selectedNPC.attributes?.will,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTop: `1px solid ${theme.palette.divider}`,
        paddingY: 1,
        bgcolor: isDarkMode ? theme.palette.grey[800] : theme.palette.grey[200],
      }}
    >
      {attributes.map((attr) => (
        <Box
          key={attr.label}
          sx={{
            display: "flex",
            alignItems: "center",
            borderRadius: "16px",
            overflow: "hidden",
            bgcolor: isDarkMode
              ? theme.palette.grey[700]
              : theme.palette.grey[300],
          }}
        >
          {/* Label Part */}
          <Box
            sx={{
              bgcolor: attr.color,
              color: "white",
              paddingX: 1,
              paddingY: 0.5,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            {t(attr.label)}
          </Box>
          {/* Value Part */}
          <Box
            sx={{
              paddingX: 1.5,
              paddingY: 0.5,
              fontSize: "1rem",
              fontWeight: "bold",
              color:
                attr.value === attr.originalValue
                  ? "inherit"
                  : attr.value > attr.originalValue
                    ? theme.palette.success.main + " !important"
                    : theme.palette.error.main + " !important",
            }}
          >
            {attr.value}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default AttributeSection;
