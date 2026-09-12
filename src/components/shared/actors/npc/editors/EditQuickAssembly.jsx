import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Select,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
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
import {
  ArrowDropDown,
  AutoFixHigh,
  Check,
  Delete,
  Refresh,
  UnfoldLess,
  UnfoldMore,
} from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { useConfirm } from "/src/components/common/useConfirm";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
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
  getAllGrants,
  getRankGrants,
  isGrantApplied,
  isGrantCountable,
  grantSlotId,
} from "/src/libs/quickAssembly/levelGrants";
import {
  DAMAGE_TYPES,
  STATUS_EFFECTS,
} from "/src/libs/quickAssembly/constants";
import { getSpeciesStep } from "/src/libs/quickAssembly/species";
import {
  resolveSpellOptions,
  addOfficialSpell,
  removeSpell,
  npcHasSpell,
  isSpeciesGrantApplied,
} from "/src/libs/quickAssembly/speciesGrants";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";

const ROLE_OPTIONS = QA_ROLE_KEYS.map((key) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));

const NOTE_KEYS = {
  "other than physical": "role_grant_note_not_physical",
};

const FLYING_PATTERN = /\b(fly(ing)?|flight)\b/i;
function findFlyingSpecial(personalPack) {
  const item = (personalPack?.items ?? []).find(
    (i) =>
      i.type === "npc-special" &&
      (FLYING_PATTERN.test(i.data?.name ?? "") ||
        FLYING_PATTERN.test(i.data?.fuid ?? "")),
  );
  return item?.data ?? null;
}

export default function EditQuickAssembly({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const confirm = useConfirm();
  const { personalPack } = useCompendiumPacks();
  const [compendiumOpen, setCompendiumOpen] = React.useState(false);
  const [compendiumType, setCompendiumType] = React.useState("special");
  const [activeSlot, setActiveSlot] = React.useState(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [showAll, setShowAll] = React.useState(false);
  const background =
    theme.mode === "dark"
      ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
      : `linear-gradient(to right, ${theme.ternary}, transparent)`;

  const isQuickAssembly = npc.role && npc.role !== "custom";
  const level = clampQuickAssemblyLevel(npc.lvl ?? 5);
  const grants = isQuickAssembly ? getUnlockedGrants(npc.role, level) : [];
  const allGrants = isQuickAssembly ? getAllGrants(npc.role, level) : [];
  const rankGrants = isQuickAssembly ? getRankGrants(npc.rank) : [];
  const progression = isQuickAssembly ? getRoleProgression(npc.role) : [];
  const speciesStep = isQuickAssembly ? getSpeciesStep(npc.species) : null;

  // Construct/Elemental/Undead unlock their option list only once the user adds the
  // extra restricted Vulnerability.
  const optionalVulnTypes = speciesStep?.optionalVuln ?? null;
  const optionalVulnSatisfied =
    !speciesStep?.optionsRequireVuln ||
    (optionalVulnTypes ?? []).some((type) => npc.affinities?.[type] === "vu");

  const speciesChooseTarget = speciesStep?.choose ?? 0;

  const countableGrants = [...grants, ...rankGrants].filter((g) =>
    isGrantCountable(g),
  );
  const grantsTotal = countableGrants.length;
  const grantsApplied = countableGrants.filter((g) =>
    isGrantApplied(g, npc),
  ).length;
  const grantsDone = grantsTotal === 0 || grantsApplied >= grantsTotal;

  const openCompendium = (type = "special", slot = null) => {
    setCompendiumType(type);
    setActiveSlot(slot);
    setCompendiumOpen(true);
  };

  const toggleSpell = (fuid) =>
    setNpc((prev) =>
      npcHasSpell(prev, fuid)
        ? removeSpell(prev, fuid)
        : addOfficialSpell(prev, fuid),
    );

  // Adds a compendium Flying rule if the user has one, else a "Flying" stub.
  const addFlying = (slot) => {
    const match = findFlyingSpecial(personalPack);
    const item = match
      ? {
          name: match.name || "Flying",
          effect: match.effect || "",
          spCost: match.spCost ?? 1,
          fuid: match.fuid,
        }
      : {
          name: "Flying",
          effect: t("role_species_note_flying_desc"),
          spCost: 1,
        };
    setNpc((prev) => ({
      ...prev,
      special: [
        ...(prev.special || []),
        { ...item, _qaAdded: true, _qaSlot: slot },
      ],
    }));
  };

  const toggleSelection = (slot) =>
    setNpc((prev) => ({
      ...prev,
      qaSelections: {
        ...prev.qaSelections,
        [slot]: !prev.qaSelections?.[slot],
      },
    }));

  const qaSpecials = ["special", "actions"].flatMap((list) =>
    (npc[list] ?? [])
      .map((s, index) => ({ ...s, index, list }))
      .filter((s) => s._qaAdded),
  );

  const removeReference = (ref) =>
    setNpc((prev) => ({
      ...prev,
      [ref.list]: (prev[ref.list] ?? []).filter((_, i) => i !== ref.index),
    }));

  // Route and combat-sim modal use different anchor ids; try both.
  const scrollToSection = (list) => {
    const suffix = { spells: "spells", actions: "actions" }[list] ?? "special";
    const el =
      document.getElementById(`edit-section-${suffix}`) ??
      document.getElementById(`npc-modal-${suffix}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const isSkillGrant = (g) => g.kind === "roleSkill" || g.kind === "bossSkill";

  // First skill slot: credits one species roleSkill, and homes legacy un-stamped specials.
  const speciesSkillIndex = (speciesStep?.options ?? []).findIndex(
    isSkillGrant,
  );
  const firstLevelRankSkill = [...grants, ...rankGrants].find(isSkillGrant);
  const firstSlotId =
    speciesSkillIndex >= 0
      ? grantSlotId(
          speciesStep.options[speciesSkillIndex],
          "species",
          speciesSkillIndex,
        )
      : firstLevelRankSkill
        ? grantSlotId(firstLevelRankSkill, firstLevelRankSkill.source)
        : null;

  // Un-stamped legacy specials fall back to the first slot.
  const qaSpecialsForSlot = (slotId) =>
    qaSpecials.filter((s) => (s._qaSlot ?? firstSlotId) === slotId);

  const isSlotBackedOption = (grant) =>
    grant.kind === "roleSkill" ||
    (grant.kind === "reminder" && grant.note === "flying");

  const isManualSelectOption = (grant) =>
    grant.kind === "replaceAffinity" ||
    (grant.kind === "reminder" && grant.note !== "flying");

  const isOptionApplied = (grant, index) => {
    if (isSlotBackedOption(grant)) {
      return qaSpecialsForSlot(grantSlotId(grant, "species", index)).length > 0;
    }
    if (isManualSelectOption(grant)) {
      return !!npc.qaSelections?.[grantSlotId(grant, "species", index)];
    }
    return isSpeciesGrantApplied(grant, npc);
  };

  const speciesChosen = (speciesStep?.options ?? []).filter(
    isOptionApplied,
  ).length;

  // resources.hp.bonus (post-v10) with an extra.hp fallback.
  const toggleHpBonus = (amount, done) =>
    setNpc((prev) => {
      const current = prev.resources?.hp?.bonus ?? prev.extra?.hp ?? 0;
      const next = done ? Math.max(0, current - amount) : current + amount;
      if (prev.resources?.hp) {
        return {
          ...prev,
          resources: {
            ...prev.resources,
            hp: { ...prev.resources.hp, bonus: next },
          },
        };
      }
      return { ...prev, extra: { ...prev.extra, hp: next } };
    });

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

  // Sets "no" rather than deleting: ActorAffinities requires every key present.
  const toggleAffinity = (type, value) =>
    setNpc((prev) => ({
      ...prev,
      affinities: {
        ...prev.affinities,
        [type]: prev.affinities?.[type] === value ? "no" : value,
      },
    }));

  const toggleStatusImmunity = (status) =>
    setNpc((prev) => ({
      ...prev,
      immunities: {
        ...prev.immunities,
        [status]: !prev.immunities?.[status],
      },
    }));

  // Clears the legacy extra.precision flag alongside features.precision.
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

  // On: bump extra.def/mDef to at least the grant amount (keep larger). Off: subtract.
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
        {isQuickAssembly && (
          <Tooltip
            title={showAll ? t("role_collapse_all") : t("role_expand_all")}
          >
            <IconButton size="small" onClick={() => setShowAll((v) => !v)}>
              {showAll ? (
                <UnfoldLess fontSize="small" />
              ) : (
                <UnfoldMore fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Typography variant="body2" sx={{ mb: isQuickAssembly ? 2 : 0 }}>
        {t("role_edit_hint")}
      </Typography>

      {isQuickAssembly && (
        <Grid
          container
          spacing={2}
          sx={{ alignItems: "flex-end", mt: 0.5, mb: 1 }}
        >
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

      {isQuickAssembly && (
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          nonLinear
          sx={{ mt: 1 }}
        >
          <Step expanded completed={progression.length > 0}>
            <StepLabel
              onClick={() => setActiveStep(0)}
              sx={{ cursor: "pointer" }}
              optional={
                <Typography variant="caption" color="text.secondary">
                  {t("role_step_auto")}
                </Typography>
              }
            >
              {t("role_step_attributes")}
            </StepLabel>
            <StepContent>
              {progression.length > 0 && (
                <Box sx={{ pr: 1, pb: 1 }}>
                  <StatChangesTable
                    rows={
                      activeStep === 0 || showAll
                        ? progression
                        : progression.filter((row) => row.level <= level)
                    }
                    currentLevel={level}
                    t={t}
                  />
                </Box>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {t("role_stat_changes_hint")}
              </Typography>
            </StepContent>
          </Step>

          <Step
            expanded={showAll || undefined}
            completed={grantsDone}
            active={activeStep === 1}
          >
            <StepLabel
              onClick={() => setActiveStep(1)}
              sx={{ cursor: "pointer" }}
            >
              {t("role_step_grants")}
            </StepLabel>
            <StepContent>
              {allGrants.length > 0 && (
                <>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1.5 }}
                  >
                    {t("role_progression_hint")}
                  </Typography>
                  <Stack spacing={1} sx={{ mb: rankGrants.length ? 2 : 0 }}>
                    {allGrants
                      .filter(
                        (grant) => !grant.locked || activeStep === 1 || showAll,
                      )
                      .map((grant, i) => {
                        const slotId = grantSlotId(grant, grant.source, i);
                        return (
                          <GrantRow
                            key={`${grant.level}-${grant.kind}`}
                            grant={grant}
                            locked={grant.locked}
                            npc={npc}
                            t={t}
                            onToggleAffinity={toggleAffinity}
                            onToggleStatusImmunity={toggleStatusImmunity}
                            onToggleFeature={toggleFeature}
                            onToggleDefBonus={toggleDefBonus}
                            onOpenCompendium={openCompendium}
                            slotId={slotId}
                            qaSpecials={qaSpecialsForSlot(slotId)}
                            onRemoveReference={removeReference}
                            onScrollTo={scrollToSection}
                          />
                        );
                      })}
                  </Stack>
                </>
              )}
              {rankGrants.length > 0 && (
                <>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ display: "block", lineHeight: 1.6 }}
                  >
                    {t("role_rank_grants")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    {t("role_rank_grants_hint")}
                  </Typography>
                  <Stack spacing={1}>
                    {rankGrants.map((grant, i) => {
                      const slotId = grantSlotId(grant, "rank", i);
                      return (
                        <GrantRow
                          key={`rank-${grant.kind}-${i}`}
                          grant={grant}
                          npc={npc}
                          t={t}
                          onToggleAffinity={toggleAffinity}
                          onToggleStatusImmunity={toggleStatusImmunity}
                          onToggleFeature={toggleFeature}
                          onToggleDefBonus={toggleDefBonus}
                          onOpenCompendium={openCompendium}
                          slotId={slotId}
                          qaSpecials={qaSpecialsForSlot(slotId)}
                          onRemoveReference={removeReference}
                          onScrollTo={scrollToSection}
                        />
                      );
                    })}
                  </Stack>
                </>
              )}
            </StepContent>
          </Step>

          {speciesStep && (
            <Step
              expanded={showAll || undefined}
              completed={speciesChosen >= speciesChooseTarget}
            >
              <StepLabel
                onClick={() => setActiveStep(2)}
                sx={{ cursor: "pointer" }}
                optional={
                  <Typography variant="caption" color="text.secondary">
                    {t("role_species_chosen", [
                      speciesChosen,
                      speciesChooseTarget,
                    ])}
                  </Typography>
                }
              >
                {t("role_species_options")}
              </StepLabel>
              <StepContent>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    100,
                    speciesChooseTarget
                      ? (speciesChosen / speciesChooseTarget) * 100
                      : 0,
                  )}
                  color={
                    speciesChosen >= speciesChooseTarget ? "success" : "primary"
                  }
                  sx={{ borderRadius: 1, height: 6, mb: 1 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1.5 }}
                >
                  {t("role_species_options_hint", [
                    t(npc.species, undefined, true),
                    speciesStep.choose,
                  ])}
                </Typography>

                {(speciesStep.fixed ?? []).length > 0 && (
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ display: "block", lineHeight: 1.6 }}
                    >
                      {t("role_species_always_applied")}
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                      {speciesStep.fixed.map((grant, i) => (
                        <SpeciesGrantRow
                          key={`species-fixed-${i}`}
                          grant={grant}
                          fixed
                          npc={npc}
                          t={t}
                          onToggleAffinity={toggleAffinity}
                          onToggleStatusImmunity={toggleStatusImmunity}
                          onToggleSpell={toggleSpell}
                          onToggleHpBonus={toggleHpBonus}
                          onOpenCompendium={openCompendium}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {optionalVulnTypes && (
                  <Alert
                    severity={optionalVulnSatisfied ? "success" : "info"}
                    icon={optionalVulnSatisfied ? <Check /> : undefined}
                    sx={{ mb: 1.5, "& .MuiAlert-message": { width: "100%" } }}
                  >
                    <AlertTitle sx={{ mb: 0.5 }}>
                      {t("role_species_optional_vuln")}
                    </AlertTitle>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ flexWrap: "wrap", gap: 0.5 }}
                    >
                      {optionalVulnTypes.map((type) => {
                        const on = npc.affinities?.[type] === "vu";
                        return (
                          <Chip
                            key={type}
                            size="small"
                            label={t(type)}
                            color={on ? "warning" : "default"}
                            variant={on ? "filled" : "outlined"}
                            onClick={() => toggleAffinity(type, "vu")}
                          />
                        );
                      })}
                    </Stack>
                  </Alert>
                )}

                <Box
                  sx={{
                    opacity: optionalVulnSatisfied ? 1 : 0.5,
                    pointerEvents: optionalVulnSatisfied ? "auto" : "none",
                  }}
                >
                  <Stack spacing={1}>
                    {speciesStep.options.map((grant, i) => {
                      const slotId = grantSlotId(grant, "species", i);
                      return (
                        <SpeciesOptionCard
                          key={`species-opt-${i}`}
                          grant={grant}
                          applied={isOptionApplied(grant, i)}
                          npc={npc}
                          t={t}
                          onToggleAffinity={toggleAffinity}
                          onToggleStatusImmunity={toggleStatusImmunity}
                          onToggleSpell={toggleSpell}
                          onToggleHpBonus={toggleHpBonus}
                          onOpenCompendium={openCompendium}
                          onAddFlying={addFlying}
                          onToggleSelection={toggleSelection}
                          selected={!!npc.qaSelections?.[slotId]}
                          slotId={slotId}
                          qaSpecials={qaSpecialsForSlot(slotId)}
                          onRemoveReference={removeReference}
                          onScrollTo={scrollToSection}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              </StepContent>
            </Step>
          )}
        </Stepper>
      )}

      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        context="npc"
        initialType={compendiumType}
        initialCompendium="personal"
        onAddItem={(item) => {
          if (compendiumType === "spells") {
            setNpc((prev) => ({
              ...prev,
              spells: [...(prev.spells || []), { ...item, _qaAdded: true }],
            }));
            return;
          }
          const list = compendiumType === "actions" ? "actions" : "special";
          setNpc((prev) => ({
            ...prev,
            [list]: [
              ...(prev[list] || []),
              {
                name: item.name,
                effect: item.effect || "",
                spCost: item.spCost ?? 1,
                fuid: item.fuid,
                _qaAdded: true,
                _qaSlot: activeSlot,
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
  locked,
  npc,
  t,
  onToggleAffinity,
  onToggleStatusImmunity,
  onToggleFeature,
  onToggleDefBonus,
  onOpenCompendium,
  slotId,
  qaSpecials,
  onRemoveReference,
  onScrollTo,
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
        opacity: locked ? 0.45 : 1,
        pointerEvents: locked ? "none" : "auto",
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
          slotId={slotId}
          qaSpecials={qaSpecials}
          onRemoveReference={onRemoveReference}
          onScrollTo={onScrollTo}
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
  slotId,
  qaSpecials,
  onRemoveReference,
  onScrollTo,
}) {
  switch (grant.kind) {
    case "roleSkill":
    case "bossSkill":
      return (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            flexWrap: "wrap",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "flex-end",
          }}
        >
          {(qaSpecials ?? []).map((ref) => (
            <QaReferenceChip
              key={ref.id ?? ref.index}
              reference={ref}
              t={t}
              onClick={() => onScrollTo(ref.list)}
              onDelete={() => onRemoveReference(ref)}
            />
          ))}
          <AddSkillButton
            t={t}
            label={
              grant.kind === "bossSkill"
                ? t("role_grant_add_boss_skill")
                : undefined
            }
            onPick={(type) => onOpenCompendium(type, slotId)}
          />
        </Stack>
      );

    case "resistance":
    case "immunity": {
      const value = grant.kind === "resistance" ? "rs" : "im";
      // "other than physical" grants don't count physical, so don't offer it.
      const types =
        grant.note === "other than physical"
          ? DAMAGE_TYPES.filter((type) => type !== "physical")
          : DAMAGE_TYPES;
      return (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: "wrap", gap: 0.5, justifyContent: "flex-end" }}
        >
          {types.map((type) => {
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

function SelectButton({ selected, t, onClick }) {
  return (
    <Button
      size="small"
      variant={selected ? "contained" : "outlined"}
      color={selected ? "success" : "primary"}
      startIcon={selected ? <Check /> : undefined}
      onClick={onClick}
    >
      {selected ? t("role_species_selected") : t("role_species_select")}
    </Button>
  );
}

// Dropdown calls `onPick` with the viewer type to open: "special" or "actions".
function AddSkillButton({ t, onPick, label }) {
  const [anchor, setAnchor] = React.useState(null);
  const pick = (type) => {
    setAnchor(null);
    onPick(type);
  };
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        endIcon={<ArrowDropDown />}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        {label ?? t("role_grant_add_skill")}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => pick("special")}>
          {t("role_grant_add_special_rule")}
        </MenuItem>
        <MenuItem onClick={() => pick("actions")}>
          {t("role_grant_add_other_action")}
        </MenuItem>
      </Menu>
    </>
  );
}

function QaReferenceChip({ reference, t, onClick, onDelete }) {
  const name = reference.name || t("role_grant_roleSkill");
  return (
    <Tooltip title={t("role_qa_ref_jump", [name])}>
      <Chip
        size="small"
        color="secondary"
        variant="outlined"
        label={name}
        onClick={onClick}
        onDelete={onDelete}
        deleteIcon={<Delete fontSize="small" />}
        sx={{ maxWidth: 180 }}
      />
    </Tooltip>
  );
}

function speciesGrantLabel(grant, t) {
  const base = t(`role_species_${grant.kind}`);
  const count = grant.count > 1 ? ` (${grant.count})` : "";
  const noteKey = grant.note ? SPECIES_NOTE_KEYS[grant.note] : null;
  return { base: `${base}${count}`, noteKey };
}

const SPECIES_NOTE_KEYS = {
  "other than physical": "role_grant_note_not_physical",
  "another type": "role_species_note_another_type",
  thorns: "role_species_note_thorns",
  flying: "role_species_note_flying",
  opposed_instinct: "role_species_note_opposed_instinct",
  opposed_design: "role_species_note_opposed_design",
  opposed_background: "role_species_note_opposed_background",
};

// `applied` tints the card with a left accent.
function SpeciesOptionCard({ applied, ...rowProps }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: 3,
        borderLeftColor: applied ? "success.main" : "transparent",
        bgcolor: applied ? "action.hover" : "transparent",
        transition: "border-color 120ms, background-color 120ms",
      }}
    >
      <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
        <SpeciesGrantRow {...rowProps} />
      </CardContent>
    </Card>
  );
}

// `fixed` marks an always-applied grant (a chip, not a choice).
function SpeciesGrantRow({
  grant,
  fixed,
  npc,
  t,
  onToggleAffinity,
  onToggleStatusImmunity,
  onToggleSpell,
  onToggleHpBonus,
  onOpenCompendium,
  onAddFlying,
  onToggleSelection,
  selected,
  slotId,
  qaSpecials,
  onRemoveReference,
  onScrollTo,
}) {
  const { base, noteKey } = speciesGrantLabel(grant, t);

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
        {fixed && (
          <Chip
            size="small"
            label={t("role_species_fixed")}
            sx={{ mr: 0.5, height: 18 }}
          />
        )}
        {base}
        {noteKey && (
          <Typography component="span" variant="caption" color="text.secondary">
            {" - "}
            {t(noteKey)}
          </Typography>
        )}
      </Typography>
      <Box sx={{ flex: "0 0 auto" }}>
        <SpeciesGrantFiller
          grant={grant}
          npc={npc}
          t={t}
          onToggleAffinity={onToggleAffinity}
          onToggleStatusImmunity={onToggleStatusImmunity}
          onToggleSpell={onToggleSpell}
          onToggleHpBonus={onToggleHpBonus}
          onOpenCompendium={onOpenCompendium}
          onAddFlying={onAddFlying}
          onToggleSelection={onToggleSelection}
          selected={selected}
          slotId={slotId}
          qaSpecials={qaSpecials}
          onRemoveReference={onRemoveReference}
          onScrollTo={onScrollTo}
        />
      </Box>
    </Box>
  );
}

function SpeciesGrantFiller({
  grant,
  npc,
  t,
  slotId,
  qaSpecials,
  onRemoveReference,
  onScrollTo,
  onToggleAffinity,
  onToggleStatusImmunity,
  onToggleSpell,
  onToggleHpBonus,
  onOpenCompendium,
  onAddFlying,
  onToggleSelection,
  selected,
}) {
  switch (grant.kind) {
    case "affinity": {
      // Fixed type -> one chip; else the options (or all types), minus physical when restricted.
      const all =
        grant.note === "other than physical"
          ? DAMAGE_TYPES.filter((type) => type !== "physical")
          : DAMAGE_TYPES;
      const types = grant.type ? [grant.type] : (grant.options ?? all);
      return (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: "wrap", gap: 0.5, justifyContent: "flex-end" }}
        >
          {types.map((type) => {
            const on = npc.affinities?.[type] === grant.value;
            return (
              <Chip
                key={type}
                size="small"
                label={t(type)}
                color={on ? "primary" : "default"}
                variant={on ? "filled" : "outlined"}
                onClick={() => onToggleAffinity(type, grant.value)}
              />
            );
          })}
        </Stack>
      );
    }

    case "statusImmunity": {
      const options = grant.options ?? STATUS_EFFECTS;
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

    case "hp": {
      const amount = grant.amount ?? 10;
      const current = npc.resources?.hp?.bonus ?? npc.extra?.hp ?? 0;
      const done = current >= amount;
      return (
        <ApplyButton
          done={done}
          t={t}
          label={`+${amount} HP`}
          onClick={() => onToggleHpBonus(amount, done)}
        />
      );
    }

    case "spell": {
      const options = resolveSpellOptions(grant.fuids);
      return (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: "wrap", gap: 0.5, justifyContent: "flex-end" }}
        >
          {options.map((opt) => {
            const on = npcHasSpell(npc, opt.fuid);
            return (
              <Chip
                key={opt.fuid}
                size="small"
                icon={on ? <Check /> : undefined}
                label={opt.name}
                color={on ? "success" : "default"}
                variant={on ? "filled" : "outlined"}
                onClick={() => onToggleSpell(opt.fuid)}
                onDelete={on ? () => onToggleSpell(opt.fuid) : undefined}
              />
            );
          })}
        </Stack>
      );
    }

    case "roleSkill":
      return (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            flexWrap: "wrap",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "flex-end",
          }}
        >
          {(qaSpecials ?? []).map((ref) => (
            <QaReferenceChip
              key={ref.id ?? ref.index}
              reference={ref}
              t={t}
              onClick={() => onScrollTo(ref.list)}
              onDelete={() => onRemoveReference(ref)}
            />
          ))}
          <AddSkillButton
            t={t}
            onPick={(type) => onOpenCompendium(type, slotId)}
          />
        </Stack>
      );

    case "reminder":
      // Flying slots a special rule; other reminders use the manual Select flag.
      if (grant.note === "flying") {
        return (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0.5,
              justifyContent: "flex-end",
            }}
          >
            {(qaSpecials ?? []).map((ref) => (
              <QaReferenceChip
                key={ref.id ?? ref.index}
                reference={ref}
                t={t}
                onClick={() => onScrollTo(ref.list)}
                onDelete={() => onRemoveReference(ref)}
              />
            ))}
            <Button
              size="small"
              variant="outlined"
              onClick={() => onAddFlying(slotId)}
            >
              {t("role_grant_add_skill")}
            </Button>
          </Stack>
        );
      }
      return (
        <SelectButton
          selected={selected}
          t={t}
          onClick={() => onToggleSelection(slotId)}
        />
      );

    case "replaceAffinity":
      return (
        <SelectButton
          selected={selected}
          t={t}
          onClick={() => onToggleSelection(slotId)}
        />
      );

    default:
      return null;
  }
}
