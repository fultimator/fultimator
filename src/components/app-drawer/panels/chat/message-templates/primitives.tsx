import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { GiDiceEightFacesEight } from "react-icons/gi";
import { ATTR_LABEL } from "./primitives-utils";

export function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        mt: 0.5,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {tags.map((tag, i) => (
        <Chip
          key={`${tag}-${i}`}
          size="small"
          label={tag}
          sx={{
            textTransform: "uppercase",
            height: 22,
            backgroundColor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        />
      ))}
    </Stack>
  );
}

export function DiceRow({
  dice,
}: {
  dice: { attribute: string; die: number; result: number }[];
}) {
  return (
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
      {dice.map((die, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.25,
            px: 0.75,
            py: 0.5,
            borderRadius: 1.25,
            border: "1px solid",
            backgroundColor: "background.default",
            borderColor: "divider",
            minWidth: 50,
          }}
        >
          <Box sx={{ lineHeight: 0 }}>
            <GiDiceEightFacesEight size={28} />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            {ATTR_LABEL[die.attribute]} d{die.die}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {die.result}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

export function BreakdownRow({
  label,
  value,
  signed,
  bold,
}: {
  label: string;
  value: number | string;
  signed?: boolean;
  bold?: boolean;
}) {
  const display =
    typeof value === "number" && signed && value > 0
      ? `+${value}`
      : String(value);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 1,
      }}
    >
      <Typography
        variant="body2"
        color={bold ? "text.primary" : "text.secondary"}
        sx={{ fontWeight: bold ? 700 : 400 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: bold ? 700 : 400,
          color: bold ? "text.primary" : "text.secondary",
        }}
      >
        {display}
      </Typography>
    </Box>
  );
}
