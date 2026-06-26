import React, { useState, useEffect } from "react";
import { Box, Button, Divider, Tooltip, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { Undo as UndoIcon } from "@mui/icons-material";
import { useCombatEncounterStore } from "../../../../../stores/combatEncounterStore";
import { devLog } from "../../../../../utils/devLog";
import type { DamagePipelineTarget } from "../types";
import { TypeIcon } from "../../../../types";
import { normalizeDamageType } from "./primitives-utils";

interface DamagePipelineTargetsProps {
  targets: DamagePipelineTarget[];
  damage: number;
  damageType: string;
  fumble: boolean;
}

export const DamagePipelineTargets: React.FC<DamagePipelineTargetsProps> = ({
  targets,
  damage,
  damageType,
  fumble,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { applyHpDamage, revertHpDamage } = useCombatEncounterStore();
  const normalizedType = normalizeDamageType(damageType);

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

  const toggleHit = (id: string) => {
    if (appliedMap[id]) return;
    setHitMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const applyOne = (id: string) => {
    devLog("[DamagePipelineTargets] applyOne", {
      combatId: id,
      damage,
      normalizedType,
      targets: targets.map((t) => ({ combatId: t.combatId, name: t.name })),
    });
    const success = applyHpDamage(id, damage, normalizedType);
    devLog("[DamagePipelineTargets] applyOne result", {
      combatId: id,
      success,
    });
    if (!success) return;
    setAppliedMap((prev) => ({ ...prev, [id]: true }));
  };

  const revertOne = (id: string) => {
    devLog("[DamagePipelineTargets] revertOne", {
      combatId: id,
      damage,
      normalizedType,
    });
    const success = revertHpDamage(id, damage, normalizedType);
    devLog("[DamagePipelineTargets] revertOne result", {
      combatId: id,
      success,
    });
    if (!success) return;
    setAppliedMap((prev) => ({ ...prev, [id]: false }));
  };

  const applyHits = () => {
    devLog("[DamagePipelineTargets] applyHits start", {
      damage,
      normalizedType,
      hitMap,
      appliedMap,
    });
    const next = { ...appliedMap };
    targets.forEach((t) => {
      if (hitMap[t.combatId] && !appliedMap[t.combatId]) {
        const success = applyHpDamage(t.combatId, damage, normalizedType);
        devLog("[DamagePipelineTargets] applyHits target", {
          combatId: t.combatId,
          success,
        });
        if (success) {
          next[t.combatId] = true;
        }
      }
    });
    setAppliedMap(next);
  };

  const hitTargets = targets.filter((t) => hitMap[t.combatId]);
  const allHitsApplied =
    hitTargets.length > 0 && hitTargets.every((t) => appliedMap[t.combatId]);

  // Keep row tone subtle so it blends with existing chat card styling.
  const hitBg = isDark ? "rgba(91,169,91,0.12)" : "rgba(91,169,91,0.08)";
  const missBg = isDark ? "rgba(180,80,80,0.12)" : "rgba(180,80,80,0.08)";
  const appliedHitBg = isDark ? "rgba(91,169,91,0.2)" : "rgba(91,169,91,0.12)";

  return (
    <Box
      sx={{
        mt: 0.75,
        borderRadius: 1.5,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      {/* Target rows */}
      {targets.map((target, i) => {
        const isHit = hitMap[target.combatId] ?? true;
        const isApplied = appliedMap[target.combatId] ?? false;

        const rowBg = isApplied
          ? isHit
            ? appliedHitBg
            : "action.disabledBackground"
          : isHit
            ? hitBg
            : missBg;

        const statusColor = isHit
          ? theme.palette.success.main
          : theme.palette.error.main;

        return (
          <React.Fragment key={target.combatId}>
            {i > 0 && <Divider />}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1,
                py: 0.55,
                gap: 0.75,
                background: rowBg,
                transition: "background-color 0.15s",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: isApplied ? "text.disabled" : "text.primary",
                  textDecoration: isApplied && !isHit ? "line-through" : "none",
                }}
              >
                {target.name}
              </Typography>

              <Tooltip
                title={isApplied ? "" : isHit ? "Mark as Miss" : "Mark as Hit"}
              >
                <Box
                  component="button"
                  onClick={() => toggleHit(target.combatId)}
                  disabled={isApplied}
                  sx={{
                    minWidth: 52,
                    height: 28,
                    px: 1.1,
                    py: 0,
                    border: "1px solid",
                    borderColor: statusColor,
                    borderRadius: 5,
                    background: alpha(statusColor, isApplied ? 0.18 : 0.1),
                    cursor: isApplied ? "default" : "pointer",
                    lineHeight: 1,
                    "&:hover:not(:disabled)": {
                      background: alpha(statusColor, 0.22),
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      color: statusColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                    }}
                  >
                    {isHit ? "Hit" : "Miss"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip
                title={
                  isApplied
                    ? "Revert damage"
                    : isHit
                      ? "Apply damage"
                      : "No damage (miss)"
                }
              >
                <span>
                  <Button
                    size="small"
                    onClick={() =>
                      isApplied
                        ? revertOne(target.combatId)
                        : applyOne(target.combatId)
                    }
                    disabled={!isApplied && !isHit}
                    sx={{
                      minWidth: 34,
                      width: 42,
                      height: 30,
                      px: 0,
                      py: 0,
                      fontSize: "0.66rem",
                      fontWeight: 800,
                      borderRadius: 5,
                      opacity: !isApplied && !isHit ? 0.35 : 1,
                      textTransform: "uppercase",
                      border: "1px solid",
                      borderColor: "divider",
                      color: "text.primary",
                      backgroundColor: "background.paper",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {isApplied ? (
                      <UndoIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <Box
                        sx={{
                          lineHeight: 0,
                          "& svg": { width: 13, height: 13 },
                        }}
                      >
                        <TypeIcon type={normalizedType} disabled={!isHit} />
                      </Box>
                    )}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </React.Fragment>
        );
      })}

      {/* Stat bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1,
          py: 0.5,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            fontSize: "0.71rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "text.secondary",
          }}
        >
          {damage} {damageType} damage
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          {hitTargets.length}/{targets.length} hit
        </Typography>
      </Box>

      {/* Apply button */}
      <Button
        fullWidth
        variant="contained"
        onClick={applyHits}
        disabled={hitTargets.length === 0 || allHitsApplied}
        sx={{
          borderRadius: 0,
          py: 0.6,
          fontSize: "0.72rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          backgroundImage: undefined,
          backgroundColor:
            hitTargets.length === 0 || allHitsApplied
              ? undefined
              : theme.palette.primary.dark,
          color:
            hitTargets.length === 0 || allHitsApplied
              ? undefined
              : theme.palette.primary.contrastText,
          boxShadow: "none",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            boxShadow: "none",
          },
        }}
      >
        Apply Damage
      </Button>
    </Box>
  );
};
