import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutlined as HitIcon,
  HighlightOff as MissIcon,
  FlashOn as ApplyIcon,
  PlaylistAddCheck as ApplyAllIcon,
} from "@mui/icons-material";
import { TypeIcon } from "../../../../types";
import { useCombatEncounterStore } from "../../../../../stores/combatEncounterStore";
import { normalizeDamageType } from "./primitives-utils";

interface TargetRow {
  combatId: string;
  name: string;
  source: "npc" | "pc";
}

interface DamagePipelineTargetsProps {
  damage: number;
  damageType: string;
  critical: boolean;
  fumble: boolean;
}

export const DamagePipelineTargets: React.FC<DamagePipelineTargetsProps> = ({
  damage,
  damageType,
  critical,
  fumble,
}) => {
  const { selectedNPCs, selectedPCs } = useCombatEncounterStore();

  const targets: TargetRow[] = [
    ...selectedNPCs.map((n) => ({
      combatId: String(n.combatId ?? n.id ?? ""),
      name: String(n.name ?? "Unknown"),
      source: "npc" as const,
    })),
    ...selectedPCs.map((p) => ({
      combatId: String(p.combatId ?? p.id ?? ""),
      name: String(p.name ?? "Unknown"),
      source: "pc" as const,
    })),
  ];

  const defaultHit = fumble ? false : true;

  const [hitMap, setHitMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(targets.map((t) => [t.combatId, defaultHit])),
  );

  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setHitMap(Object.fromEntries(targets.map((t) => [t.combatId, defaultHit])));
    setAppliedMap({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets.map((t) => t.combatId).join(","), fumble]);

  if (targets.length === 0) return null;

  const normalizedType = normalizeDamageType(damageType);

  const toggleHit = (id: string) => {
    if (appliedMap[id]) return;
    setHitMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const applyOne = (id: string) => {
    setAppliedMap((prev) => ({ ...prev, [id]: true }));
  };

  const applyHits = () => {
    const newApplied = { ...appliedMap };
    targets.forEach((t) => {
      if (hitMap[t.combatId]) newApplied[t.combatId] = true;
    });
    setAppliedMap(newApplied);
  };

  const hitTargets = targets.filter((t) => hitMap[t.combatId]);
  const allHitsApplied =
    hitTargets.length > 0 && hitTargets.every((t) => appliedMap[t.combatId]);

  return (
    <Box
      sx={{
        mt: 0.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 0.5,
          backgroundColor: "action.hover",
          display: "flex",
          alignItems: "center",
          gap: 0.75,
        }}
      >
        <Box sx={{ "& svg": { width: 16, height: 16 } }}>
          <TypeIcon type={normalizedType} disabled={false} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontSize: "0.75rem",
            flex: 1,
          }}
        >
          {damage} {damageType} Damage
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ fontSize: "0.7rem" }}
        >
          {hitTargets.length}/{targets.length} hit
        </Typography>
      </Box>

      <Divider />

      {targets.map((target, i) => {
        const isHit = hitMap[target.combatId] ?? true;
        const isApplied = appliedMap[target.combatId] ?? false;

        return (
          <React.Fragment key={target.combatId}>
            {i > 0 && <Divider />}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1,
                py: 0.4,
                gap: 0.75,
                backgroundColor: isApplied
                  ? isHit
                    ? "success.main"
                    : "action.disabledBackground"
                  : "background.paper",
                opacity: isApplied ? 0.7 : 1,
                transition: "background-color 0.2s",
              }}
            >
              <Tooltip title={isHit ? "Mark as Miss" : "Mark as Hit"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => toggleHit(target.combatId)}
                    disabled={isApplied}
                    sx={{
                      p: 0.25,
                      color: isHit ? "success.main" : "error.main",
                      "&:disabled": {
                        color: isHit ? "success.dark" : "error.dark",
                      },
                    }}
                  >
                    {isHit ? (
                      <HitIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <MissIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>

              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: isApplied ? "text.secondary" : "text.primary",
                  textDecoration: isApplied && !isHit ? "line-through" : "none",
                }}
              >
                {target.name}
              </Typography>

              {isHit && (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: isApplied ? "text.secondary" : "text.primary",
                    minWidth: 24,
                    textAlign: "right",
                  }}
                >
                  {isApplied ? "✓" : `-${damage}`}
                </Typography>
              )}

              <Tooltip
                title={
                  isApplied
                    ? "Applied"
                    : isHit
                      ? "Apply damage"
                      : "No damage (miss)"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => applyOne(target.combatId)}
                    disabled={isApplied || !isHit}
                    sx={{
                      p: 0.25,
                      color: isHit ? "primary.main" : "text.disabled",
                    }}
                  >
                    <ApplyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </React.Fragment>
        );
      })}

      <Divider />

      <Box sx={{ px: 1, py: 0.5 }}>
        <Button
          size="small"
          variant="contained"
          fullWidth
          startIcon={<ApplyAllIcon />}
          onClick={applyHits}
          disabled={hitTargets.length === 0 || allHitsApplied}
          sx={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            py: 0.5,
          }}
        >
          Apply to Hit Targets
        </Button>
      </Box>
    </Box>
  );
};
