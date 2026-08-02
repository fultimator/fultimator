import React from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { AutoFixHigh, Check, Refresh } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { useConfirm } from "/src/components/common/useConfirm";
import {
  applyRole,
  attributesMatchRole,
  clampQuickAssemblyLevel,
  getRoleProgression,
  QA_LEVELS,
  QA_ROLE_KEYS,
} from "/src/libs/quickAssembly/roles";
import {
  getUnlockedGrants,
  getRankGrants,
} from "/src/libs/quickAssembly/levelGrants";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";

const ROLE_OPTIONS = QA_ROLE_KEYS.map((key) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));

const DAMAGE_TYPES = [
  "physical",
  "air",
  "bolt",
  "dark",
  "earth",
  "fire",
  "ice",
  "light",
  "poison",
];

const NOTE_KEYS = {
  "other than physical": "role_grant_note_not_physical",
};

// The toggle is derived from role !== "custom"; there is no separate persisted flag.
export default function EditQuickAssembly({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const confirm = useConfirm();
  const [compendiumOpen, setCompendiumOpen] = React.useState(false);
  const background =
    theme.mode === "dark"
      ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
      : `linear-gradient(to right, ${theme.ternary}, transparent)`;

  const isQuickAssembly = npc.role && npc.role !== "custom";
  const level = clampQuickAssemblyLevel(npc.lvl ?? 5);
  const grants = isQuickAssembly ? getUnlockedGrants(npc.role, level) : [];
  const rankGrants = isQuickAssembly ? getRankGrants(npc.rank) : [];
  const progression = isQuickAssembly ? getRoleProgression(npc.role) : [];

  const seedRole = (role, lvl = level) =>
    setNpc((prev) => applyRole(prev, { role, level: lvl }));

  const handleToggle = (checked) =>
    checked ? seedRole("brute") : seedRole("custom");

  // A level change only prompts when the GM has hand-tuned attributes away from the role
  // defaults, so their edits are not silently discarded.
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

  // Toggle a damage-type affinity to the grant's value (rs/im), or delete the key to
  // return it to "no effect" when it already holds that value.
  const toggleAffinity = (type, value) =>
    setNpc((prev) => {
      const affinities = { ...prev.affinities };
      if (affinities[type] === value) {
        delete affinities[type];
      } else {
        affinities[type] = value;
      }
      return { ...prev, affinities };
    });

  const toggleStatusImmunity = (status) =>
    setNpc((prev) => ({
      ...prev,
      immunities: {
        ...prev.immunities,
        [status]: !prev.immunities?.[status],
      },
    }));

  // Toggle a feature grant on/off. The legacy extra.precision flag is cleared alongside
  // features.precision.
  const toggleFeature = (feature) =>
    setNpc((prev) => {
      const enabled = !(
        prev.features?.[feature]?.enabled ??
        (feature === "precision" ? prev.extra?.precision : false)
      );
      const next = {
        ...prev,
        features: {
          ...prev.features,
          [feature]: { ...prev.features?.[feature], enabled },
        },
      };
      if (feature === "precision" && !enabled && prev.extra?.precision) {
        next.extra = { ...prev.extra, precision: false };
      }
      return next;
    });

  // DEF/MDEF grant as a bonus: toggling on bumps extra.def/mDef up to at least the grant
  // amount (keeping any larger existing bonus); toggling off subtracts it back out.
  const toggleDefBonus = (def, mdef, done) =>
    setNpc((prev) => ({
      ...prev,
      extra: {
        ...prev.extra,
        def: done
          ? Math.max(0, (prev.extra?.def ?? 0) - def)
          : Math.max(prev.extra?.def ?? 0, def),
        mDef: done
          ? Math.max(0, (prev.extra?.mDef ?? 0) - mdef)
          : Math.max(prev.extra?.mDef ?? 0, mdef),
      },
    }));

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
        <>
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

          {progression.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t("role_stat_changes")}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                {t("role_stat_changes_hint")}
              </Typography>
              <StatChangesTable rows={progression} currentLevel={level} t={t} />
            </>
          )}

          {grants.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t("role_progression")}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1.5 }}
              >
                {t("role_progression_hint")}
              </Typography>
              <Stack spacing={1}>
                {grants.map((grant, i) => (
                  <GrantRow
                    key={`${grant.level}-${grant.kind}-${i}`}
                    grant={grant}
                    npc={npc}
                    t={t}
                    onToggleAffinity={toggleAffinity}
                    onToggleStatusImmunity={toggleStatusImmunity}
                    onToggleFeature={toggleFeature}
                    onToggleDefBonus={toggleDefBonus}
                    onOpenCompendium={() => setCompendiumOpen(true)}
                  />
                ))}
              </Stack>
            </>
          )}

          {rankGrants.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t("role_rank_grants")}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1.5 }}
              >
                {t("role_rank_grants_hint")}
              </Typography>
              <Stack spacing={1}>
                {rankGrants.map((grant, i) => (
                  <GrantRow
                    key={`rank-${grant.kind}-${i}`}
                    grant={grant}
                    npc={npc}
                    t={t}
                    onToggleAffinity={toggleAffinity}
                    onToggleStatusImmunity={toggleStatusImmunity}
                    onToggleFeature={toggleFeature}
                    onToggleDefBonus={toggleDefBonus}
                    onOpenCompendium={() => setCompendiumOpen(true)}
                  />
                ))}
              </Stack>
            </>
          )}
        </>
      )}

      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        context="npc"
        initialType="special"
        initialCompendium="personal"
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            special: [
              ...(prev.special || []),
              {
                name: item.name,
                effect: item.effect || "",
                spCost: item.spCost ?? 1,
                fuid: item.fuid,
              },
            ],
          }));
        }}
      />
    </Card>
  );
}

// Read-only "STAT CHANGES AT HIGHER LEVELS" chart; the NPC's current-level row is
// highlighted.
function StatChangesTable({ rows, currentLevel, t }) {
  const fmtBonus = (n) => (n > 0 ? `+${n}` : "-");
  const fmtDamage = (n) =>
    n > 0 ? `${n} ${t("role_stat_extra_damage")}` : "-";

  const columns = [
    { label: t("Level:") },
    { label: t("role_stat_attribute_changes") },
    { label: t("HP") },
    { label: t("MP") },
    { label: t("role_stat_accuracy_magic") },
    { label: t("role_stat_attacks_spells") },
  ];
  const colWidth = `${100 / columns.length}%`;
  const cellSx = {
    width: colWidth,
    textAlign: "center",
    verticalAlign: "middle",
    px: 1,
  };

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        sx={{ tableLayout: "fixed", minWidth: 560, "& td, & th": cellSx }}
      >
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.label}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const active = row.level === currentLevel;
            return (
              <TableRow
                key={row.level}
                selected={active}
                sx={active ? { "& td": { fontWeight: "bold" } } : undefined}
              >
                <TableCell>{row.level}</TableCell>
                <TableCell>{row.attributeChange || "-"}</TableCell>
                <TableCell>{row.hp}</TableCell>
                <TableCell>{row.mp}</TableCell>
                <TableCell>{fmtBonus(row.accuracyBonus)}</TableCell>
                <TableCell>{fmtDamage(row.damageBonus)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// A single unlocked grant slot: label on the left, kind-specific filler on the right.
// "Done" is derived from the NPC fields, never stored.
function GrantRow({
  grant,
  npc,
  t,
  onToggleAffinity,
  onToggleStatusImmunity,
  onToggleFeature,
  onToggleDefBonus,
  onOpenCompendium,
}) {
  const prefix = grant.level ? `L${grant.level} - ` : "";
  const label = `${prefix}${t(`role_grant_${grant.kind}`)}${
    grant.count > 1 ? ` (${grant.count})` : ""
  }`;
  const noteKey = grant.note ? NOTE_KEYS[grant.note] : null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        justifyContent: "space-between",
      }}
    >
      <Typography variant="body2" sx={{ flex: "1 1 200px" }}>
        {label}
        {noteKey && (
          <Typography component="span" variant="caption" color="text.secondary">
            {" - "}
            {t(noteKey)}
          </Typography>
        )}
      </Typography>
      <Box sx={{ flex: "0 0 auto" }}>
        <GrantFiller
          grant={grant}
          npc={npc}
          t={t}
          onToggleAffinity={onToggleAffinity}
          onToggleStatusImmunity={onToggleStatusImmunity}
          onToggleFeature={onToggleFeature}
          onToggleDefBonus={onToggleDefBonus}
          onOpenCompendium={onOpenCompendium}
        />
      </Box>
    </Box>
  );
}

function GrantFiller({
  grant,
  npc,
  t,
  onToggleAffinity,
  onToggleStatusImmunity,
  onToggleFeature,
  onToggleDefBonus,
  onOpenCompendium,
}) {
  switch (grant.kind) {
    case "roleSkill":
      return (
        <Button size="small" variant="outlined" onClick={onOpenCompendium}>
          {t("role_grant_add_skill")}
        </Button>
      );

    case "bossSkill":
      return (
        <Button size="small" variant="outlined" onClick={onOpenCompendium}>
          {t("role_grant_add_boss_skill")}
        </Button>
      );

    case "resistance":
    case "immunity": {
      const value = grant.kind === "resistance" ? "rs" : "im";
      return (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: "wrap", gap: 0.5, justifyContent: "flex-end" }}
        >
          {DAMAGE_TYPES.map((type) => {
            const on = npc.affinities?.[type] === value;
            return (
              <Chip
                key={type}
                size="small"
                label={t(type)}
                color={on ? "primary" : "default"}
                variant={on ? "filled" : "outlined"}
                onClick={() => onToggleAffinity(type, value)}
              />
            );
          })}
        </Stack>
      );
    }

    case "statusImmunity": {
      const options = grant.options ?? ["poisoned", "shaken", "weak"];
      return (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: "wrap", gap: 0.5 }}
        >
          {options.map((status) => (
            <Chip
              key={status}
              size="small"
              label={t(status)}
              color={npc.immunities?.[status] ? "primary" : "default"}
              variant={npc.immunities?.[status] ? "filled" : "outlined"}
              onClick={() => onToggleStatusImmunity(status)}
            />
          ))}
        </Stack>
      );
    }

    case "accuracyBonus":
      return (
        <ApplyButton
          done={!!(npc.features?.precision?.enabled ?? npc.extra?.precision)}
          t={t}
          onClick={() => onToggleFeature("precision")}
        />
      );

    case "magicBonus":
      return (
        <ApplyButton
          done={!!npc.features?.magic?.enabled}
          t={t}
          onClick={() => onToggleFeature("magic")}
        />
      );

    case "accuracyOrMagic": {
      const precisionOn = !!(
        npc.features?.precision?.enabled ?? npc.extra?.precision
      );
      const magicOn = !!npc.features?.magic?.enabled;
      // Exclusive choice: picking one feature clears the other automatically.
      return (
        <Stack direction="row" spacing={0.5}>
          <Button
            size="small"
            variant={precisionOn ? "contained" : "outlined"}
            startIcon={precisionOn ? <Check /> : undefined}
            onClick={() => {
              onToggleFeature("precision");
              if (!precisionOn && magicOn) onToggleFeature("magic");
            }}
          >
            {t("role_grant_accuracy")}
          </Button>
          <Button
            size="small"
            variant={magicOn ? "contained" : "outlined"}
            startIcon={magicOn ? <Check /> : undefined}
            onClick={() => {
              onToggleFeature("magic");
              if (!magicOn && precisionOn) onToggleFeature("precision");
            }}
          >
            {t("role_grant_magic")}
          </Button>
        </Stack>
      );
    }

    case "defBonus": {
      const done =
        (npc.extra?.def ?? 0) >= grant.def &&
        (npc.extra?.mDef ?? 0) >= grant.mdef;
      return (
        <ApplyButton
          done={done}
          t={t}
          label={`+${grant.def} DEF / +${grant.mdef} MDEF`}
          onClick={() => onToggleDefBonus(grant.def, grant.mdef, done)}
        />
      );
    }

    case "attackMod":
      return (
        <Typography variant="caption" color="text.secondary">
          {grant.text ? t(grant.text) : ""}
        </Typography>
      );

    case "hp":
      return (
        <Typography variant="caption" color="text.secondary">
          {t("role_grant_hp_auto")}
        </Typography>
      );

    default:
      return null;
  }
}

function ApplyButton({ done, t, onClick, label }) {
  return (
    <Tooltip title={done ? t("role_grant_undo_hint") : ""}>
      <Button
        size="small"
        variant={done ? "contained" : "outlined"}
        color={done ? "success" : "primary"}
        startIcon={done ? <Check /> : undefined}
        onClick={onClick}
      >
        {done ? t("role_grant_applied") : (label ?? t("role_grant_apply"))}
      </Button>
    </Tooltip>
  );
}
