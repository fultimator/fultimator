import { Box } from "@mui/material";
import StatTooltip from "/src/components/common/StatTooltip";
import { TypeAffinity } from "/src/components/shared/actors/common/TypeAffinity";
import {
  AffinityStrip,
  AffinityCell,
} from "/src/components/shared/actors/pc/shared";
import { AFFINITY_TYPES } from "/src/components/shared/actors/core-utils";

export default function PcCompactAffinities({
  pc,
  isInteractive = false,
  onUpdate,
}) {
  const handleChange = (type) => (nextAffinity) => {
    if (!onUpdate) return;
    onUpdate((prev) => ({
      ...prev,
      affinities: { ...(prev.affinities ?? {}), [type]: nextAffinity || "" },
    }));
  };

  return (
    <Box
      sx={{
        containerType: "inline-size",
        containerName: "compact-affinity-strip",
        width: "100%",
      }}
    >
      <AffinityStrip
        sx={{
          gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
          "& .MuiBox-root": { minWidth: 0 },
        }}
      >
        {AFFINITY_TYPES.map((type) => (
          <AffinityCell
            key={type}
            sx={{
              px: 0.3,
              py: 0.3,
              minWidth: 0,
              borderBottom: "none",
              "&:nth-of-type(3n)": {
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
              "&:last-child": { borderRight: "none" },
              "& img, & svg": {
                width: "1.35em !important",
                height: "1.35em !important",
              },
              "& .MuiTypography-root": {
                fontSize: "0.88rem",
                letterSpacing: 0,
              },
              "@container compact-affinity-strip (max-width: 380px)": {
                px: 0.15,
                py: 0.2,
                "& img, & svg": {
                  width: "1.1em !important",
                  height: "1.1em !important",
                },
                "& .MuiTypography-root": { fontSize: "0.72rem" },
              },
              "@container compact-affinity-strip (max-width: 300px)": {
                "& .MuiTypography-root": { display: "none" },
                "& img, & svg": {
                  width: "1.4em !important",
                  height: "1.4em !important",
                },
              },
              ...(isInteractive
                ? {
                    minHeight: 32,
                    "& .MuiButtonBase-root": {
                      minHeight: 26,
                      px: 0.35,
                      py: 0,
                      gap: 0.35,
                    },
                    "& .MuiButtonBase-root .MuiTypography-root": {
                      fontSize: "0.88rem !important",
                    },
                    "& .MuiButtonBase-root .MuiSvgIcon-root": {
                      fontSize: "0.82rem !important",
                    },
                  }
                : {}),
            }}
          >
            {isInteractive ? (
              <TypeAffinity
                type={type}
                affinity={pc.affinities?.[type] || ""}
                iconSize="1.35em"
                editable
                showDropdownArrow={false}
                onChangeAffinity={handleChange(type)}
              />
            ) : (
              <StatTooltip
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                base={pc.affinities?.[type] || ""}
                display="flex"
              >
                <TypeAffinity
                  type={type}
                  affinity={pc.affinities?.[type] || ""}
                  iconSize="1.35em"
                />
              </StatTooltip>
            )}
          </AffinityCell>
        ))}
      </AffinityStrip>
    </Box>
  );
}
