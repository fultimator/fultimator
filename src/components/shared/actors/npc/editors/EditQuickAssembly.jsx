import React from "react";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { AutoFixHigh, Refresh } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { useConfirm } from "/src/components/common/useConfirm";
import {
  applyRole,
  attributesMatchRole,
  clampQuickAssemblyLevel,
  QA_LEVELS,
  QA_ROLE_KEYS,
} from "/src/libs/quickAssembly/roles";

const ROLE_OPTIONS = QA_ROLE_KEYS.map((key) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));

// The toggle is derived from role !== "custom"; there is no separate persisted flag.
export default function EditQuickAssembly({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const confirm = useConfirm();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
      : `linear-gradient(to right, ${theme.ternary}, transparent)`;

  const isQuickAssembly = npc.role && npc.role !== "custom";
  const level = clampQuickAssemblyLevel(npc.lvl ?? 5);

  const seedRole = (role, lvl = level) =>
    setNpc((prev) => applyRole(prev, { role, level: lvl }));

  const handleToggle = (checked) =>
    checked
      ? seedRole("brute")
      : setNpc((prev) => ({ ...prev, role: "custom" }));

  // Selecting a role is itself consent, so apply silently. A level change only prompts
  // when the GM has hand-tuned attributes away from the role defaults (else it would
  // silently discard their edits).
  const handleLevelChange = async (nextLevelRaw) => {
    const nextLevel = clampQuickAssemblyLevel(nextLevelRaw);
    if (attributesMatchRole(npc, npc.role, level)) {
      return seedRole(npc.role, nextLevel);
    }
    const ok = await confirm({
      title: t("role_reapply"),
      message: t("role_reapply_confirm"),
    });
    if (ok) seedRole(npc.role, nextLevel);
    else setNpc((prev) => ({ ...prev, lvl: nextLevel }));
  };

  return (
    <Card sx={{ p: 2, background }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <AutoFixHigh fontSize="small" />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t("quick_assembly")}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={!!isQuickAssembly}
              onChange={(e) => handleToggle(e.target.checked)}
            />
          }
          label={t("role_use_quick_assembly")}
          labelPlacement="start"
          sx={{ m: 0 }}
        />
      </Box>

      <Typography variant="body2" sx={{ mb: isQuickAssembly ? 2 : 0 }}>
        {t("role_edit_hint")}
      </Typography>

      {isQuickAssembly && (
        <Grid container spacing={2} sx={{ alignItems: "flex-end" }}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption">{t("role")}</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={npc.role}
                onChange={(e) => seedRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption">{t("Level:")}</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={level}
                onChange={(e) => handleLevelChange(e.target.value)}
              >
                {QA_LEVELS.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Tooltip title={t("role_reapply_hint")}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => seedRole(npc.role)}
              >
                {t("role_reapply")}
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      )}
    </Card>
  );
}
