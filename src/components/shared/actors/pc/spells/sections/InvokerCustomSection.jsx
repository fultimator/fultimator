import { useState, useMemo } from "react";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ChatOutlined } from "@mui/icons-material";
import DeleteForever from "@mui/icons-material/DeleteForever";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import MenuIcon from "@mui/icons-material/Menu";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SearchIcon from "@mui/icons-material/Search";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  AFFINITY_ICON_OPTIONS,
  affinityIconSrc,
  resolveWellsprings,
} from "/src/libs/player/wellsprings";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import ConfirmConfirmationDialog from "/src/components/common/ConfirmConfirmationDialog";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";

const INV_TYPES = ["Blast", "Hex", "Utility"];

export function IconPicker({ value, onChange }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {AFFINITY_ICON_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Tooltip key={opt.value} title={opt.label} arrow>
            <Box
              component="button"
              type="button"
              onClick={() => onChange(opt.value)}
              sx={{
                width: 36,
                height: 36,
                p: 0.5,
                border: "2px solid",
                borderColor: selected ? "primary.main" : "divider",
                borderRadius: 1,
                backgroundColor: selected ? "action.selected" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: (theme) => theme.typography.fontFamily,
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <img
                src={affinityIconSrc(opt.value)}
                width={22}
                height={22}
                style={{ objectFit: "contain", display: "block" }}
                alt={opt.label}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function WellspringSelectOption({ wellspring }) {
  const label = wellspring.label ?? wellspring.key;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img
        src={affinityIconSrc(wellspring.icon)}
        width={18}
        height={18}
        style={{ objectFit: "contain", flexShrink: 0 }}
        alt={label}
      />
      {label}
    </span>
  );
}

function ItemActionMenu({
  onAddToCompendium,
  onAddMissingInvocations,
  onDelete,
  t,
}) {
  const [anchor, setAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <MenuIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        {onAddMissingInvocations && (
          <MenuItem
            onClick={() => {
              onAddMissingInvocations();
              setAnchor(null);
            }}
          >
            <ListItemIcon>
              <PlaylistAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("Add Missing Invocations")}</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onAddToCompendium();
            setAnchor(null);
          }}
        >
          <ListItemIcon>
            <LibraryAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Add to Compendium")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            setConfirmOpen(true);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteForever fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t("Delete")}</ListItemText>
        </MenuItem>
      </Menu>
      <ConfirmConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        message={t("Are you sure you want to delete this item?")}
      />
    </>
  );
}

function WellspringRow({
  wellspring: w,
  index: i,
  onUpdate,
  onAddMissingInvocations,
  onAddToCompendium,
  onDelete,
  t,
}) {
  const [open, setOpen] = useState(false);
  const handleSendToChat = () =>
    sendDisplayMessage("wellspring", w.name || t("Unnamed"));
  const label = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: 0,
        px: "2px",
      }}
    >
      <img
        src={affinityIconSrc(w.icon || "untyped")}
        width={20}
        height={20}
        style={{ objectFit: "contain", flexShrink: 0 }}
        alt={w.name}
      />
      <Typography
        noWrap
        sx={{
          fontFamily: "Antonio",
          fontWeight: 800,
          fontSize: "1rem",
          textTransform: "uppercase",
          flex: 1,
        }}
      >
        {w.name || <em style={{ opacity: 0.5 }}>{t("Unnamed")}</em>}
      </Typography>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          bgcolor: w.color || "#888888",
          border: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      />
    </Box>
  );
  return (
    <ItemRowCard
      label={label}
      onClick={() => setOpen((v) => !v)}
      actions={
        <>
          <Tooltip title={t("Send to chat")} arrow>
            <IconButton size="small" onClick={handleSendToChat}>
              <ChatOutlined />
            </IconButton>
          </Tooltip>
          <ItemActionMenu
            onAddMissingInvocations={onAddMissingInvocations}
            onAddToCompendium={onAddToCompendium}
            onDelete={onDelete}
            t={t}
          />
        </>
      }
    >
      {open && (
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              label={t("Name")}
              value={w.name}
              onChange={(e) => onUpdate(i, "name", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label={t("Color")}
              type="color"
              value={w.color || "#888888"}
              onChange={(e) => onUpdate(i, "color", e.target.value)}
              size="small"
              sx={{ width: 80 }}
              slotProps={{
                htmlInput: {
                  style: { padding: 4, height: 32, cursor: "pointer" },
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>{t("Text")}</InputLabel>
              <Select
                value={w.textColor || "white"}
                onChange={(e) => onUpdate(i, "textColor", e.target.value)}
                label={t("Text")}
              >
                <MenuItem value="white">{t("White")}</MenuItem>
                <MenuItem value="black">{t("Black")}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              {t("Icon")}
            </Typography>
            <IconPicker
              value={w.icon || "untyped"}
              onChange={(val) => onUpdate(i, "icon", val)}
            />
          </Box>
        </Box>
      )}
    </ItemRowCard>
  );
}

function InvocationRow({
  inv,
  allWellsprings,
  isOrphaned,
  open,
  onToggle,
  onUpdate,
  onAddToCompendium,
  onDelete,
  t,
}) {
  const wsEntry = allWellsprings.find((w) => w.key === inv.wellspring);
  const wsLabel = wsEntry?.label ?? wsEntry?.key;
  const handleSendToChat = () =>
    sendDisplayMessage("invocation", inv.customName || t("Unnamed"), {
      tags: [inv.wellspring, inv.type].filter(Boolean),
      effect: inv.effect || undefined,
    });
  const label = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: 0,
        px: "2px",
        opacity: isOrphaned ? 0.6 : 1,
      }}
    >
      {wsEntry && (
        <img
          src={affinityIconSrc(wsEntry.icon)}
          width={20}
          height={20}
          style={{ objectFit: "contain", flexShrink: 0 }}
          alt={wsLabel}
        />
      )}
      <Typography
        noWrap
        sx={{
          fontFamily: "Antonio",
          fontWeight: 800,
          fontSize: "1rem",
          textTransform: "uppercase",
          flex: 1,
          textDecoration: isOrphaned ? "line-through" : "none",
          color: isOrphaned ? "error.main" : "inherit",
        }}
      >
        {inv.customName || <em style={{ opacity: 0.5 }}>{t("Unnamed")}</em>}
      </Typography>
      {inv.type && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0, lineHeight: 1, alignSelf: "center" }}
        >
          {inv.type}
        </Typography>
      )}
    </Box>
  );
  return (
    <ItemRowCard
      label={label}
      minHeight={44}
      onClick={onToggle}
      paperSx={isOrphaned ? { borderColor: "error.main" } : undefined}
      actions={
        <>
          <Tooltip title={t("Send to chat")} arrow>
            <IconButton size="small" onClick={handleSendToChat}>
              <ChatOutlined />
            </IconButton>
          </Tooltip>
          <ItemActionMenu
            onAddToCompendium={onAddToCompendium}
            onDelete={onDelete}
            t={t}
          />
        </>
      }
    >
      {open && (
        <Box
          sx={{
            p: 1.5,
            borderTop: "1px solid",
            borderColor: isOrphaned ? "error.main" : "divider",
          }}
        >
          <Grid container spacing={1.5} sx={{ alignItems: "flex-start" }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label={t("Name")}
                value={inv.customName || ""}
                onChange={(e) =>
                  onUpdate(inv.key, "customName", e.target.value)
                }
                size="small"
                fullWidth
                slotProps={
                  isOrphaned
                    ? {
                        input: {
                          sx: {
                            textDecoration: "line-through",
                            color: "error.main",
                          },
                        },
                      }
                    : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>{t("Wellspring")}</InputLabel>
                <Select
                  value={inv.wellspring || ""}
                  onChange={(e) =>
                    onUpdate(inv.key, "wellspring", e.target.value)
                  }
                  label={t("Wellspring")}
                  renderValue={(val) => {
                    const w =
                      allWellsprings.find((x) => x.key === val) ??
                      (val ? { key: val, icon: "untyped" } : null);
                    return w ? <WellspringSelectOption wellspring={w} /> : val;
                  }}
                >
                  {[
                    ...allWellsprings,
                    ...(inv.wellspring &&
                    !allWellsprings.find((w) => w.key === inv.wellspring)
                      ? [
                          {
                            key: inv.wellspring,
                            icon: "untyped",
                            color: "#888",
                            textColor: "white",
                          },
                        ]
                      : []),
                  ].map((w) => (
                    <MenuItem key={w.key} value={w.key}>
                      <WellspringSelectOption wellspring={w} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>{t("Type")}</InputLabel>
                <Select
                  value={inv.type || "Blast"}
                  onChange={(e) => onUpdate(inv.key, "type", e.target.value)}
                  label={t("Type")}
                >
                  {INV_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {t(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                label={t("Effect")}
                value={inv.effect || ""}
                onChange={(e) => onUpdate(inv.key, "effect", e.target.value)}
                size="small"
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </ItemRowCard>
  );
}

function InvocationGroup({
  wsKey,
  group,
  allWellsprings,
  isOrphaned,
  onUpdate,
  addInvocationToCompendium,
  removeInvocation,
  t,
}) {
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());
  const allExpanded =
    group.length > 0 && group.every((inv) => expandedKeys.has(inv.key));

  const toggle = (key) =>
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAll = () =>
    setExpandedKeys(
      allExpanded ? new Set() : new Set(group.map((inv) => inv.key)),
    );

  const wellspringEntry = allWellsprings.find((w) => w.key === wsKey);
  const wsLabel = wellspringEntry?.label ?? wsKey;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          pb: 0.5,
          borderBottom: "1px solid",
          borderColor: isOrphaned ? "error.main" : "divider",
        }}
      >
        {wellspringEntry ? (
          <>
            <img
              src={affinityIconSrc(wellspringEntry.icon)}
              width={16}
              height={16}
              style={{ objectFit: "contain" }}
              alt={wsLabel}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {wsLabel}
            </Typography>
          </>
        ) : (
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              color: isOrphaned ? "error.main" : "text.secondary",
              fontStyle: wsKey ? "normal" : "italic",
              textDecoration: isOrphaned ? "line-through" : "none",
            }}
          >
            {wsKey || t("No Wellspring")}
          </Typography>
        )}
        {isOrphaned && (
          <>
            <Tooltip title={t("invoker_missing_wellspring")} arrow>
              <Typography
                variant="caption"
                sx={{ ml: "auto", color: "error.main", fontStyle: "italic" }}
              >
                {t("invoker_missing_wellspring")}
              </Typography>
            </Tooltip>
            <Tooltip title={t("Delete All")} arrow>
              <IconButton
                size="small"
                color="error"
                onClick={() =>
                  group.forEach((inv) => removeInvocation(inv.key))
                }
              >
                <DeleteForever fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip
          title={allExpanded ? t("Collapse All") : t("Expand All")}
          arrow
        >
          <IconButton
            size="small"
            sx={{ ml: isOrphaned ? 0 : "auto" }}
            onClick={toggleAll}
          >
            {allExpanded ? (
              <UnfoldLessIcon fontSize="small" />
            ) : (
              <UnfoldMoreIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {group.map((inv) => (
          <InvocationRow
            key={inv.key}
            inv={inv}
            allWellsprings={allWellsprings}
            isOrphaned={isOrphaned}
            open={expandedKeys.has(inv.key)}
            onToggle={() => toggle(inv.key)}
            onUpdate={onUpdate}
            onAddToCompendium={() => addInvocationToCompendium(inv)}
            onDelete={() => removeInvocation(inv.key)}
            t={t}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function InvokerCustomSection({ formState, setFormState, t }) {
  const [wellspringPickerOpen, setWellspringPickerOpen] = useState(false);
  const [invocationPickerOpen, setInvocationPickerOpen] = useState(false);
  const { packs, addItem } = useCompendiumPacks();

  const customWellsprings = useMemo(
    () => formState.customWellsprings || [],
    [formState.customWellsprings],
  );
  const invocations = useMemo(
    () => formState.invocations || [],
    [formState.invocations],
  );
  const allWellsprings = useMemo(
    () => resolveWellsprings(customWellsprings),
    [customWellsprings],
  );

  const setCustomWellsprings = (updater) =>
    setFormState((prev) => ({
      ...prev,
      customWellsprings:
        typeof updater === "function"
          ? updater(prev.customWellsprings || [])
          : updater,
    }));

  const setInvocations = (updater) =>
    setFormState((prev) => ({
      ...prev,
      invocations:
        typeof updater === "function"
          ? updater(prev.invocations || [])
          : updater,
    }));

  const addWellspring = () =>
    setCustomWellsprings((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        color: "#888888",
        textColor: "white",
        icon: "untyped",
      },
    ]);

  const updateWellspring = (i, field, val) =>
    setCustomWellsprings((prev) =>
      prev.map((w, idx) => (idx === i ? { ...w, [field]: val } : w)),
    );

  const removeWellspring = (i) =>
    setCustomWellsprings((prev) => prev.filter((_, idx) => idx !== i));

  const addInvocation = () =>
    setInvocations((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        customName: "",
        wellspring: "",
        type: "Blast",
        effect: "",
      },
    ]);

  const updateInvocation = (key, field, val) =>
    setInvocations((prev) =>
      prev.map((inv) => (inv.key === key ? { ...inv, [field]: val } : inv)),
    );

  const removeInvocation = (key) =>
    setInvocations((prev) => prev.filter((inv) => inv.key !== key));

  const addWellspringToCompendium = (w) =>
    addItem("personal", "player-spell", {
      spellType: "wellspring",
      name: w.name,
      color: w.color || "#888888",
      textColor: w.textColor || "white",
      icon: w.icon || "untyped",
    });

  const addInvocationToCompendium = (inv) =>
    addItem("personal", "player-spell", {
      spellType: "invocation",
      name: inv.customName || inv.key,
      wellspring: inv.wellspring,
      type: inv.type || "Blast",
      effect: inv.effect || "",
    });

  const addMissingInvocations = (wellspring) => {
    const nameLower = wellspring.name.toLowerCase();
    const matching = [];
    for (const pack of packs) {
      for (const item of pack.items) {
        if (
          item.type === "player-spell" &&
          item.data?.spellType === "invocation" &&
          item.data?.name &&
          String(item.data.wellspring || "").toLowerCase() === nameLower
        ) {
          matching.push(item.data);
        }
      }
    }
    if (matching.length === 0) return;
    setInvocations((prev) => {
      const existingNames = new Set(
        prev.map((i) => (i.customName || i.key || "").toLowerCase()),
      );
      const toAdd = matching
        .filter(
          (inv) => !existingNames.has(String(inv.name || "").toLowerCase()),
        )
        .map((inv) => ({
          key: crypto.randomUUID(),
          customName: String(inv.name || ""),
          wellspring: wellspring.id ?? wellspring.name,
          type: String(inv.type || "Blast"),
          effect: String(inv.effect || ""),
        }));
      return [...prev, ...toAdd];
    });
  };

  const handleImportWellspring = (item) => {
    if (item.spellType !== "wellspring" || !item.name) return;
    const existing = customWellsprings.find(
      (w) => w.name.toLowerCase() === item.name.toLowerCase(),
    );
    const newId = existing?.id ?? crypto.randomUUID();
    if (!existing) {
      setCustomWellsprings((prev) => [
        ...prev,
        {
          id: newId,
          name: item.name,
          color: item.color || "#888888",
          textColor: item.textColor || "white",
          icon: item.icon || "untyped",
        },
      ]);
    }

    const nameLower = item.name.toLowerCase();
    const matchingInvocations = [];
    for (const pack of packs) {
      for (const packItem of pack.items) {
        if (
          packItem.type === "player-spell" &&
          packItem.data?.spellType === "invocation" &&
          packItem.data?.name &&
          String(packItem.data.wellspring || "").toLowerCase() === nameLower
        ) {
          matchingInvocations.push(packItem.data);
        }
      }
    }

    if (matchingInvocations.length > 0) {
      setInvocations((prev) => {
        const existingNames = new Set(
          prev.map((i) => (i.customName || i.key || "").toLowerCase()),
        );
        const toAdd = matchingInvocations
          .filter(
            (inv) => !existingNames.has(String(inv.name || "").toLowerCase()),
          )
          .map((inv) => ({
            key: crypto.randomUUID(),
            customName: String(inv.name || ""),
            wellspring: newId,
            type: String(inv.type || "Blast"),
            effect: String(inv.effect || ""),
          }));
        return [...prev, ...toAdd];
      });
    }

    setWellspringPickerOpen(false);
  };

  const handleImportInvocation = (item) => {
    if (item.spellType !== "invocation" || !item.name) return;
    const matchingCustom = customWellsprings.find(
      (w) =>
        w.name.toLowerCase() === String(item.wellspring || "").toLowerCase(),
    );
    setInvocations((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        customName: item.name,
        wellspring: matchingCustom?.id ?? item.wellspring ?? "",
        type: item.type || "Blast",
        effect: item.effect || "",
      },
    ]);
    setInvocationPickerOpen(false);
  };

  const invocationsByWellspring = useMemo(() => {
    const groups = {};
    invocations.forEach((inv) => {
      const ws = inv.wellspring || "";
      if (!groups[ws]) groups[ws] = [];
      groups[ws].push(inv);
    });
    return groups;
  }, [invocations]);

  const wellspringGroupOrder = useMemo(() => {
    const seen = new Set();
    const order = [];
    invocations.forEach((inv) => {
      const ws = inv.wellspring || "";
      if (!seen.has(ws)) {
        seen.add(ws);
        order.push(ws);
      }
    });
    return order;
  }, [invocations]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Custom Wellsprings */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="h6">{t("Custom Wellsprings")}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={t("Import from Compendium")}>
              <IconButton
                size="small"
                onClick={() => setWellspringPickerOpen(true)}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={addWellspring}
              variant="outlined"
            >
              {t("Add")}
            </Button>
          </Box>
        </Box>
        {customWellsprings.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            {t("No custom wellsprings. Add one to extend the standard 5.")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {customWellsprings.map((w, i) => (
              <WellspringRow
                key={w.id ?? i}
                wellspring={w}
                index={i}
                onUpdate={updateWellspring}
                onAddMissingInvocations={
                  w.name ? () => addMissingInvocations(w) : undefined
                }
                onAddToCompendium={() => addWellspringToCompendium(w)}
                onDelete={() => removeWellspring(i)}
                t={t}
              />
            ))}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Custom Invocations */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="h6">{t("Custom Invocations")}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={t("Import from Compendium")}>
              <IconButton
                size="small"
                onClick={() => setInvocationPickerOpen(true)}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={addInvocation}
              variant="outlined"
            >
              {t("Add")}
            </Button>
          </Box>
        </Box>
        {invocations.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            {t(
              "No custom invocations. Add one to supplement the standard list.",
            )}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {wellspringGroupOrder.map((wsKey) => (
              <InvocationGroup
                key={wsKey}
                wsKey={wsKey}
                group={invocationsByWellspring[wsKey] || []}
                allWellsprings={allWellsprings}
                isOrphaned={
                  !!(wsKey && !allWellsprings.find((w) => w.key === wsKey))
                }
                onUpdate={updateInvocation}
                addInvocationToCompendium={addInvocationToCompendium}
                removeInvocation={removeInvocation}
                t={t}
              />
            ))}
          </Box>
        )}
      </Box>

      <CompendiumViewerModal
        open={wellspringPickerOpen}
        onClose={() => setWellspringPickerOpen(false)}
        onAddItem={handleImportWellspring}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Invoker"
        initialCompendium="personal"
        context="player"
      />
      <CompendiumViewerModal
        open={invocationPickerOpen}
        onClose={() => setInvocationPickerOpen(false)}
        onAddItem={handleImportInvocation}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Invoker"
        initialCompendium="personal"
        context="player"
      />
    </Box>
  );
}
