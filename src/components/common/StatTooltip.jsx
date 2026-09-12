import React, { useState, useRef } from "react";
import { Box, Divider, Popover, Tooltip, Typography } from "@mui/material";

function BreakdownRow({ label, value, signed, bold, dim, delta }) {
  const display =
    typeof value === "number" && signed && value > 0
      ? `+${value}`
      : String(value);

  const color = dim
    ? "text.disabled"
    : delta !== undefined && delta > 0
      ? "success.main"
      : delta !== undefined && delta < 0
        ? "error.main"
        : bold
          ? "text.primary"
          : "text.secondary";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 1,
        opacity: dim ? 0.5 : 1,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: bold ? 700 : 400, color }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: bold ? 700 : 400, color }}>
        {display}
      </Typography>
    </Box>
  );
}

function affinityLabel(value) {
  const labels = {
    rs: "Resistance",
    im: "Immunity",
    ab: "Absorption",
    vu: "Vulnerability",
    no: "None",
    "": "None",
  };
  return labels[value] ?? value ?? "None";
}

const AFFINITY_RANK = { vu: 0, "": 1, no: 1, rs: 2, im: 3, ab: 4 };

function affinityDelta(base, current) {
  const b = AFFINITY_RANK[base ?? ""] ?? 1;
  const c = AFFINITY_RANK[current ?? ""] ?? 1;
  return c - b;
}

function TooltipContent({ title, formula, breakdown, total, base, current }) {
  const isAffinityMode = base !== undefined || current !== undefined;
  return (
    <Box sx={{ width: isAffinityMode ? 180 : 260, p: 1.5 }}>
      <Typography
        sx={{
          fontFamily: "Antonio",
          textTransform: "uppercase",
          fontWeight: "bold",
          fontSize: "1rem",
          lineHeight: 1.2,
          mb: 0.25,
        }}
      >
        {title}
      </Typography>
      {formula && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontStyle: "italic",
            mb: 1,
            lineHeight: 1.3,
          }}
        >
          {formula}
        </Typography>
      )}
      {isAffinityMode && (
        <>
          <Divider sx={{ mb: 0.75 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35 }}>
            <BreakdownRow label="Base" value={affinityLabel(base)} />
            <BreakdownRow
              label="Current"
              value={affinityLabel(current ?? base)}
              bold
              delta={affinityDelta(base, current ?? base)}
            />
            {breakdown?.filter((e) => e.value !== undefined).length > 0 && (
              <>
                <Divider sx={{ my: 0.5 }} />
                {breakdown
                  .filter((e) => e.value !== undefined)
                  .map((entry, i) => (
                    <BreakdownRow key={i} {...entry} />
                  ))}
              </>
            )}
          </Box>
        </>
      )}
      {!isAffinityMode && breakdown?.length > 0 && (
        <>
          <Divider sx={{ mb: 0.75 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35 }}>
            {breakdown.map((entry, i) => (
              <BreakdownRow key={i} {...entry} />
            ))}
            {total !== undefined && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <BreakdownRow label="Total" value={total} bold />
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

export default function StatTooltip({
  title,
  formula,
  breakdown,
  total,
  base,
  current,
  children,
  display = "block",
  sx,
  disabled = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const _touchRef = useRef(false);

  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const handleClick = (e) => {
    if (!isTouch || disabled) return;
    setAnchorEl(e.currentTarget);
  };

  const content = (
    <TooltipContent
      title={title}
      formula={formula}
      breakdown={breakdown}
      total={total}
      base={base}
      current={current}
    />
  );

  if (isTouch) {
    return (
      <>
        <Box onClick={handleClick} sx={{ cursor: "pointer", display, ...sx }}>
          {children}
        </Box>
        <Popover
          open={!disabled && Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                boxShadow: 6,
                border: "1px solid",
                borderColor: "divider",
              },
            },
          }}
        >
          {content}
        </Popover>
      </>
    );
  }

  return (
    <Tooltip
      title={disabled ? "" : content}
      placement="bottom"
      arrow
      slotProps={{
        popper: {
          modifiers: [{ name: "flip", enabled: false }],
        },
        tooltip: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 6,
            borderRadius: 2,
            p: 0,
            maxWidth: "none",
          },
        },
        arrow: {
          sx: { color: "background.paper" },
        },
      }}
    >
      <Box sx={{ display, cursor: "help", ...sx }}>{children}</Box>
    </Tooltip>
  );
}
