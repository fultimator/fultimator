import { Box } from "@mui/material";
import StatTooltip from "../../../../common/StatTooltip";
import { TypeAffinity } from "../../common/TypeAffinity";
import { AffinityStrip, AffinityCell } from "../shared";
import { AFFINITY_TYPES } from "../../core-utils";

function AffinityIconOnly({ type, affinity, iconSize, editable, onChangeAffinity }) {
  return (
    <Box
      sx={{
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minWidth: 0,
        "& > .MuiBox-root": { minWidth: 0, gap: 0.3 },
        "& .MuiTypography-root": { fontSize: "0.88rem", letterSpacing: 0 },
        "& img, & svg": { width: "1.35em !important", height: "1.35em !important" },
        "@container affinity-strip (max-width: 380px)": {
          "& .MuiTypography-root": { fontSize: "0.72rem" },
          "& img, & svg": { width: "1.1em !important", height: "1.1em !important" },
          "& > .MuiBox-root": { gap: 0.2 },
        },
        "@container affinity-strip (max-width: 300px)": {
          "& .MuiTypography-root": { display: "none" },
          "& img, & svg": { width: "1.4em !important", height: "1.4em !important" },
        },
      }}
    >
      <TypeAffinity
        type={type}
        affinity={affinity}
        iconSize={iconSize}
        editable={editable}
        onChangeAffinity={onChangeAffinity}
        showDropdownArrow={false}
      />
    </Box>
  );
}

export default function PcAffinities({ pc, isInteractive = false, onUpdate }) {
  const handleChange = (type) => (nextAffinity) => {
    if (!onUpdate) return;
    onUpdate((prev) => ({
      ...prev,
      affinities: { ...(prev.affinities ?? {}), [type]: nextAffinity || "" },
    }));
  };

  return (
    <Box sx={{ containerType: "inline-size", containerName: "affinity-strip", width: "100%" }}>
      <AffinityStrip
        sx={{
          gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {AFFINITY_TYPES.map((type) => (
          <AffinityCell
            key={type}
            sx={{ minWidth: 0, px: 0.3, py: 0.3 }}
          >
            <StatTooltip
              title={type.charAt(0).toUpperCase() + type.slice(1)}
              base={pc.affinities?.[type] || ""}
              display="flex"
            >
              <AffinityIconOnly
                type={type}
                affinity={pc.affinities?.[type] || ""}
                iconSize="1.35em"
                editable={isInteractive}
                onChangeAffinity={isInteractive ? handleChange(type) : undefined}
              />
            </StatTooltip>
          </AffinityCell>
        ))}
      </AffinityStrip>
    </Box>
  );
}
