import React from "react";
import { Badge, Box, Stack, Typography } from "@mui/material";
import { GiDiceEightFacesEight } from "react-icons/gi";
import { MdTune } from "react-icons/md";
import type { RollData } from "../types";

const dieCellSx = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 0.5,
  px: 1,
  py: 0.75,
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "background.default",
  minWidth: 56,
};

const badgeSx = {
  "& .MuiBadge-badge": {
    fontSize: "0.65rem",
    fontWeight: 700,
    minWidth: 18,
    height: 18,
    padding: "0 3px",
    backgroundColor: "action.selected",
    color: "text.primary",
    border: "1px solid",
    borderColor: "divider",
    top: 6,
    right: 6,
  },
};

interface RollMessageTemplateProps {
  roll: RollData;
}

export const RollMessageTemplate: React.FC<RollMessageTemplateProps> = ({
  roll,
}) => {
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
        spacing={1.5}
        sx={{
          mt: 0.75,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {roll.results.map((result, index) => (
          <Box key={`${result.sides}-${result.value}-${index}`} sx={dieCellSx}>
            <Badge
              badgeContent={`d${result.sides}`}
              color="default"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              sx={badgeSx}
            >
              <Box sx={{ p: 0.5, lineHeight: 0 }}>
                <GiDiceEightFacesEight size={32} />
              </Box>
            </Badge>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {result.value}
            </Typography>
          </Box>
        ))}
        {roll.modifier !== 0 && (
          <Box sx={dieCellSx}>
            <Badge
              badgeContent="Mod"
              color="default"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              sx={badgeSx}
            >
              <Box sx={{ p: 0.5, lineHeight: 0 }}>
                <MdTune size={32} />
              </Box>
            </Badge>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
            </Typography>
          </Box>
        )}
      </Stack>

      <Box
        sx={{
          mt: 1,
          px: 1,
          py: 0.65,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            lineHeight: 1,
            px: 1,
            py: 0.4,
            borderRadius: 1,
            backgroundColor: "background.paper",
            color: "text.primary",
            minWidth: 56,
            textAlign: "center",
          }}
        >
          {roll.total}
        </Typography>
      </Box>
    </>
  );
};
