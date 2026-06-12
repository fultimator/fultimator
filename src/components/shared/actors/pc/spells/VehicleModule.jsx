import { memo, useState } from "react";
import {
  Button,
  Typography,
  IconButton,
  Collapse,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Delete,
  ContentCopy,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Chat,
  Casino,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { calculateAttribute } from "/src/libs/playerCalculations";
import { OpenBracket, CloseBracket } from "/src/components/Bracket";
import attributes from "/src/libs/attributes";
import types from "/src/libs/types";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/accuracy-checks";
import {
  accuracyModifiersFromEffects,
  outgoingDamageBonusFromEffects,
} from "/src/components/app-drawer/panels/chat/domain/effect-modifiers";
import { sendRollMessage, sendDisplayMessage } from "/src/hooks/useRollToChat";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import { vehicleModuleGroupLabels } from "/src/forms/rendering/config/itemConfigs/vehicleModule";
import {
  pilotModuleItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/pilotModule";

const VehicleModule = memo(
  ({
    module,
    moduleIndex,
    vehicleIndex,
    canEquip,
    onModuleChange,
    onDeleteModule,
    onCloneModule,
    vehicle,
    player,
  }) => {
    const { t } = useTranslate();
    const theme = useCustomTheme();
    const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };
    const [open, setOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);

    const handleRoll = (e) => {
      e.stopPropagation();
      if (!player) return;
      const attrCfg = {
        dexterity: [["slow", "enraged"], ["dexUp"]],
        insight: [["dazed", "enraged"], ["insUp"]],
        might: [["weak", "poisoned"], ["migUp"]],
        willpower: [["shaken", "poisoned"], ["wlpUp"]],
      };
      const attrDie = (key) => {
        const base = player.attributes?.[key]?.base ?? 8;
        const cfg = attrCfg[key] ?? [[], []];
        return calculateAttribute(player, base, cfg[0], cfg[1], 6, 12);
      };
      const acc = module.accuracy || {};
      const dmg = module.damage || {};
      const attr1 = acc.attr1 || "dexterity";
      const attr2 = acc.attr2 || "might";
      const name =
        module.name === "pilot_custom_weapon"
          ? module.customName
          : t(module.name);
      const rawDescription = module.description
        ? module.name === "pilot_custom_weapon"
          ? module.description
          : t(module.description)
        : undefined;
      const rawQuality = module.quality || undefined;
      const description =
        [rawDescription, rawQuality].filter(Boolean).join("\n\n") || undefined;
      const range =
        module.range === "Ranged" || module.range === "ranged"
          ? "ranged"
          : "melee";
      const damageType = dmg.type ?? "physical";
      const effectModifiers = accuracyModifiersFromEffects(player, {
        range,
        category: module.category,
      });
      const damageOutgoingBonus = outgoingDamageBonusFromEffects(player, {
        range,
        category: module.category,
        damageType,
      });

      const intent = prepareAccuracyCheck(
        {
          arg: name,
          name,
          attr1,
          attr2,
          accuracyBonus: acc.value ?? 0,
          baseDamage: dmg.value ?? 0,
          damageType,
          accuracyDefense: acc.defense ?? "def",
          category: module.category,
          isWeaponModule: true,
          damageHrZero: dmg.hrZero === true,
          range,
          description: description,
        },
        effectModifiers,
        { damageOutgoingBonus },
      );
      const dieSizes = { primary: attrDie(attr1), secondary: attrDie(attr2) };
      const rolls = rollAccuracyCheck(dieSizes);
      const result = processAccuracyCheck(
        intent,
        rolls,
        dieSizes,
        player?.info?.name || "",
      );
      sendRollMessage(buildAccuracyCheckMessage(result));
    };

    const handleSendToChat = (e) => {
      e.stopPropagation();
      const name =
        module.name === "pilot_custom_armor" ||
        module.name === "pilot_custom_weapon" ||
        module.name === "pilot_custom_support"
          ? module.customName
          : t(module.name);
      const tags = [];
      if (module.type === "pilot_module_armor") {
        if (module.martial) tags.push(t("Martial"));
        if (module.def != null)
          tags.push(`DEF ${module.def >= 0 ? "+" : ""}${module.def}`);
        if (module.mdef != null)
          tags.push(`M.DEF ${module.mdef >= 0 ? "+" : ""}${module.mdef}`);
      }
      sendDisplayMessage("item", name, {
        description: module.description ? t(module.description) : undefined,
        speaker: player?.info?.name || "",
        tags: tags.length > 0 ? tags : undefined,
      });
    };
    const {
      isOpen: deleteDialogOpen,
      closeDialog: setDeleteDialogOpen,
      handleDelete,
    } = useDeleteConfirmation({
      onConfirm: () => onDeleteModule(vehicleIndex, moduleIndex),
    });

    const moduleKey = module.key ?? module.name;
    const vehicleSlots = vehicle?.slots ?? {};
    const isEquipped =
      vehicleSlots.main === moduleKey ||
      vehicleSlots.off === moduleKey ||
      vehicleSlots.armor === moduleKey ||
      (vehicleSlots.support ?? []).includes(moduleKey);
    const moduleSlot =
      vehicleSlots.main === moduleKey && vehicleSlots.off === moduleKey
        ? "both"
        : vehicleSlots.main === moduleKey
          ? "main"
          : vehicleSlots.off === moduleKey
            ? "off"
            : vehicleSlots.armor === moduleKey
              ? "armor"
              : (vehicleSlots.support ?? []).includes(moduleKey)
                ? "support"
                : null;

    const handleEquipToggle = (e) => {
      e.stopPropagation();
      onModuleChange(vehicleIndex, moduleIndex, "equipped", !isEquipped);
    };

    const handleClone = (e) => {
      e.stopPropagation();
      if (onCloneModule) {
        onCloneModule(vehicleIndex, moduleIndex);
      }
    };

    const isGenericModuleTypeName = (name) =>
      name === "pilot_module_armor" ||
      name === "pilot_module_weapon" ||
      name === "pilot_module_support";

    const moduleName = module.name ?? module.key;
    const resolvedModuleName =
      isGenericModuleTypeName(moduleName) &&
      module.key &&
      !isGenericModuleTypeName(module.key)
        ? module.key
        : moduleName;

    const isCustomModule =
      resolvedModuleName === "pilot_custom_armor" ||
      resolvedModuleName === "pilot_custom_weapon" ||
      resolvedModuleName === "pilot_custom_support";

    const moduleDisplayName = isCustomModule
      ? module.customName || t("pilot_custom")
      : t(resolvedModuleName);

    const makeSlotBtn = (value, label, disabled = false) => {
      const isActive = moduleSlot === value;
      return (
        <Button
          key={value}
          size="small"
          variant="outlined"
          color="inherit"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onModuleChange(vehicleIndex, moduleIndex, "equippedSlot", value);
          }}
          style={{
            minWidth: 32,
            height: 32,
            padding: 0,
            fontSize: "0.75rem",
            fontWeight: 800,
            border: "none",
            color: disabled
              ? `${theme.primary}44`
              : isActive
                ? theme.primary
                : `${theme.primary}88`,
            backgroundColor: disabled ? "rgba(255,255,255,0.2)" : theme.white,
          }}
        >
          {label}
        </Button>
      );
    };

    const slotToggle =
      isEquipped && module.type === "pilot_module_weapon" ? (
        module.cumbersome ? (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled
            style={{
              minWidth: 36,
              height: 26,
              padding: 0,
              fontSize: "0.75rem",
              fontWeight: 800,
              border: "none",
              color: `${theme.primary}55`,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            {t("mo_abbr")}
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: "2px" }}>
            {makeSlotBtn("main", t("m_abbr"))}
            {makeSlotBtn(
              "off",
              t("o_abbr"),
              !module.isShield &&
                vehicle.modules.some((m) => {
                  const mk = m.key ?? m.name;
                  return (
                    m.isShield && vehicleSlots.off === mk && mk !== moduleKey
                  );
                }),
            )}
          </Box>
        )
      ) : null;

    const actions = (
      <>
        {slotToggle}
        <Button
          variant="outlined"
          color="inherit"
          disabled={!isEquipped && !canEquip}
          onClick={handleEquipToggle}
          size="small"
          style={{
            minWidth: 72,
            height: 32,
            fontSize: "0.8rem",
            fontWeight: 800,
            border: "none",
            gap: 4,
            color:
              !isEquipped && !canEquip ? `${theme.primary}55` : theme.primary,
            backgroundColor:
              !isEquipped && !canEquip ? "rgba(255,255,255,0.3)" : theme.white,
          }}
        >
          {isEquipped ? (
            <>
              <RadioButtonChecked sx={{ fontSize: "1rem" }} />
              {t("Equipped")}
            </>
          ) : (
            <>
              <RadioButtonUnchecked sx={{ fontSize: "1rem" }} />
              {t("Equip")}
            </>
          )}
        </Button>
        {module.type === "pilot_module_weapon" ? (
          <Tooltip title={t("Roll")}>
            <IconButton size="small" onClick={handleRoll}>
              <Casino />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" onClick={handleSendToChat}>
              <Chat />
            </IconButton>
          </Tooltip>
        )}
        {(onCloneModule || onDeleteModule) && (
          <>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchor(e.currentTarget);
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              slotProps={{ root: { sx: { zIndex: 1400 } } }}
            >
              {onCloneModule && (
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAnchor(null);
                    handleClone(e);
                  }}
                >
                  <ListItemIcon>
                    <ContentCopy fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t("Clone to Custom")}</ListItemText>
                </MenuItem>
              )}
              {onDeleteModule && (
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAnchor(null);
                    handleDelete(e);
                  }}
                >
                  <ListItemIcon>
                    <Delete fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText sx={{ color: "error.main" }}>
                    {t("Delete")}
                  </ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </>
    );

    const normalizeAttr = (raw) => {
      const k = String(raw || "").toLowerCase();
      if (k === "dex" || k === "dexterity") return "dexterity";
      if (k === "ins" || k === "insight") return "insight";
      if (k === "mig" || k === "might") return "might";
      if (k === "wlp" || k === "will" || k === "willpower") return "willpower";
      return "dexterity";
    };

    const statLine = (() => {
      if (module.type === "pilot_module_weapon") {
        const acc = module.accuracy ?? {};
        const dmg = module.damage ?? {};
        const attr1 = normalizeAttr(acc.attr1 ?? "dexterity");
        const attr2 = normalizeAttr(acc.attr2 ?? "might");
        const prec = acc.value ?? 0;
        const dmgVal = dmg.value ?? 0;
        const dmgType = dmg.type ?? "physical";
        return (
          <span>
            <OpenBracket />
            {attributes[attr1]?.shortcaps ?? "DEX"}+
            {attributes[attr2]?.shortcaps ?? "MIG"}
            <CloseBracket />
            {prec !== 0 ? (prec > 0 ? "+" : "") + prec : ""} <OpenBracket />
            {t("HR")}
            {dmgVal >= 0 ? "+" : ""}
            {dmgVal}
            <CloseBracket /> {types[dmgType]?.long ?? types.physical.long}
          </span>
        );
      }
      if (module.type === "pilot_module_armor") {
        const def = module.def ?? 0;
        const mdef = module.mdef ?? 0;
        const signed = (v) => `${v >= 0 ? "+" : ""}${v}`;
        return (
          <span>
            {t("DEF")} {signed(def)}
            {" · "}
            {t("M.DEF")} {signed(mdef)}
          </span>
        );
      }
      return null;
    })();

    const subtitle = (
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", lineHeight: 1.4, fontWeight: "bold" }}
      >
        {t(module.type)}
        {isEquipped && module.type === "pilot_module_weapon" && (
          <>
            {" | "}
            {module.cumbersome
              ? t("both_hand")
              : moduleSlot === "main"
                ? t("main_hand")
                : t("off_hand")}
          </>
        )}
        {module.cumbersome && " ⚠"}
        {module.isShield && " 🛡"}
        {module.isComplex && " ⚙⚙"}
        {statLine && (
          <>
            {" · "}
            {statLine}
          </>
        )}
      </Typography>
    );

    const gradientColor = theme.mode === "dark" ? "#1f1f1f" : "#fff";

    return (
      <>
        <Box
          sx={{
            border: `1px solid ${theme.secondary}`,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {/* Row header */}
          <Box
            onClick={() => setOpen((v) => !v)}
            sx={{
              display: "flex",
              alignItems: "stretch",
              minHeight: 44,
              fontSize: "0.9rem",
              background:
                moduleIndex % 2 === 0
                  ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                  : "transparent",
              borderBottom: open ? `1px solid ${theme.secondary}` : "none",
              cursor: "pointer",
              "&:hover": { filter: "brightness(0.97)" },
            }}
          >
            {/* Label area */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                px: "10px",
                py: "4px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                noWrap
                sx={{
                  fontFamily: "Antonio",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  lineHeight: 1.3,
                }}
              >
                {moduleDisplayName}
              </Typography>
              {subtitle}
            </Box>
            {/* Actions area */}
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                bgcolor: theme.primary,
                display: "flex",
                alignItems: "center",
                px: "6px",
                gap: 0.25,
                flexShrink: 0,
                "& .MuiIconButton-root": {
                  p: "2px",
                  width: 32,
                  height: 32,
                  color: theme.white,
                },
                "& .MuiSvgIcon-root": { fontSize: "1.15rem" },
              }}
            >
              {actions}
            </Box>
          </Box>
          <Collapse in={open}>
            <Box sx={{ px: 2, py: 1.5 }}>
              {!isCustomModule && module.description && (
                <Box
                  sx={{
                    mb: 1.5,
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", mb: 0.5, display: "block" }}
                  >
                    {t("Description")}
                  </Typography>
                  <Box sx={bodyTextSx}>
                    <ReactMarkdown
                      components={{
                        p: ({ node: _n, ...props }) => (
                          <p style={{ margin: 0 }} {...props} />
                        ),
                      }}
                    >
                      {t(module.description)}
                    </ReactMarkdown>
                  </Box>
                </Box>
              )}
              <TabbedSchemaFormRenderer
                tabs={DEFAULT_SUBITEM_TABS}
                config={pilotModuleItemFields}
                state={{ behaviors: [], ...module }}
                onChange={(next) => {
                  onModuleChange(vehicleIndex, moduleIndex, "_replace", next);
                }}
                surface="edit"
                groupLabels={vehicleModuleGroupLabels}
                cols={3}
              />
            </Box>
          </Collapse>
        </Box>
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={setDeleteDialogOpen}
          onConfirm={() => onDeleteModule(vehicleIndex, moduleIndex)}
          title={t("Delete")}
          message={t("Are you sure you want to delete this module?")}
          itemPreview={
            <Typography variant="h4">{moduleDisplayName}</Typography>
          }
        />
      </>
    );
  },
);

VehicleModule.displayName = "VehicleModule";

export default VehicleModule;
