import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { GiDiceEightFacesEight } from "react-icons/gi";
import { MdTune } from "react-icons/md";
import type { RollData } from "../types";

const dieCellSx = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 0.25,
  px: 0.75,
  py: 0.5,
  borderRadius: 1.25,
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "background.default",
  minWidth: 50,
};

const gridSx = {
  px: 0.75,
  py: 0.5,
  display: "grid",
  gridTemplateColumns: "24px max-content max-content 24px",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
};

interface RollMessageTemplateProps {
  roll: RollData;
}

export const RollMessageTemplate: React.FC<RollMessageTemplateProps> = ({
  roll,
}) => {
  const theme = useTheme();
  const accentBackgroundImage = `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.72)}, ${alpha(theme.palette.primary.dark, 0.8)})`;

  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        Roll Check
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 0.5,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {roll.results.map((result, index) => (
          <Box key={`${result.sides}-${result.value}-${index}`} sx={dieCellSx}>
            <Box sx={{ p: 0.25, lineHeight: 0 }}>
              <GiDiceEightFacesEight size={28} />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              d{result.sides}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {result.value}
            </Typography>
          </Box>
        ))}
        {roll.modifier !== 0 && (
          <Box sx={dieCellSx}>
            <Box sx={{ p: 0.25, lineHeight: 0 }}>
              <MdTune size={28} />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              Mod
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
            </Typography>
          </Box>
        )}
      </Stack>

      <Box
        sx={{
          mt: 0.5,
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "primary.main",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            ...gridSx,
            backgroundColor: "primary.main",
            backgroundImage: accentBackgroundImage,
          }}
        >
          <Box />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              lineHeight: 1,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              backgroundColor: "background.paper",
              border: "2px solid",
              borderColor: "rgba(255,255,255,0.7)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
              color: "text.primary",
              textAlign: "center",
            }}
          >
            {roll.total}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "primary.contrastText",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 800,
              fontSize: "0.9rem",
              lineHeight: 1.1,
              textShadow:
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
            }}
          >
            Total
          </Typography>
          <Box />
        </Box>
      </Box>
    </>
  );
};
