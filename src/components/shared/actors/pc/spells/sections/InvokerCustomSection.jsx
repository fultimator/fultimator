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
import DeleteForever from "@mui/icons-material/DeleteForever";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import MenuIcon from "@mui/icons-material/Menu";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SearchIcon from "@mui/icons-material/Search";
import {
  AFFINITY_ICON_OPTIONS,
  affinityIconSrc,
  resolveWellsprings,
} from "/src/libs/player/wellsprings";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import ConfirmConfirmationDialog from "/src/components/common/ConfirmConfirmationDialog";

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
                "&:hover": { borderColor: "primary.main", backgroundColor: "action.hover" },
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
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img
        src={affinityIconSrc(wellspring.icon)}
        width={18}
        height={18}
        style={{ objectFit: "contain", flexShrink: 0 }}
        alt={wellspring.key}
      />
      {wellspring.key}
    </span>
  );
}

function ItemActionMenu({ onAddToCompendium, onAddMissingInvocations, onDelete, t }) {
  const [anchor, setAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <MenuIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {onAddMissingInvocations && (
          <MenuItem onClick={() => { onAddMissingInvocations(); setAnchor(null); }}>
            <ListItemIcon><PlaylistAddIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{t("Add Missing Invocations")}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { onAddToCompendium(); setAnchor(null); }}>
          <ListItemIcon><LibraryAddIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t("Add to Compendium")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); setConfirmOpen(true); }} sx={{ color: "error.main" }}>
          <ListItemIcon><DeleteForever fontSize="small" color="error" /></ListItemIcon>
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

export default function InvokerCustomSection({ formState, setFormState, t }) {
  const [wellspringPickerOpen, setWellspringPickerOpen] = useState(false);
  const [invocationPickerOpen, setInvocationPickerOpen] = useState(false);
  const { packs, addItem } = useCompendiumPacks();

  const customWellsprings = formState.customWellsprings || [];
  const invocations = formState.invocations || [];
  const allWellsprings = resolveWellsprings(customWellsprings);

  const setCustomWellsprings = (updater) =>
    setFormState((prev) => ({
      ...prev,
      customWellsprings: typeof updater === "function"
        ? updater(prev.customWellsprings || [])
        : updater,
    }));

  const setInvocations = (updater) =>
    setFormState((prev) => ({
      ...prev,
      invocations: typeof updater === "function"
        ? updater(prev.invocations || [])
        : updater,
    }));

  const addWellspring = () =>
    setCustomWellsprings((prev) => [
      ...prev,
      { name: "", color: "#888888", textColor: "white", icon: "untyped" },
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
      { key: crypto.randomUUID(), customName: "", wellspring: "", type: "Blast", effect: "" },
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

  const addMissingInvocations = (wellspringName) => {
    const nameLower = wellspringName.toLowerCase();
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
      const existingNames = new Set(prev.map((i) => (i.customName || i.key || "").toLowerCase()));
      const toAdd = matching
        .filter((inv) => !existingNames.has(String(inv.name || "").toLowerCase()))
        .map((inv) => ({
          key: crypto.randomUUID(),
          customName: String(inv.name || ""),
          wellspring: wellspringName,
          type: String(inv.type || "Blast"),
          effect: String(inv.effect || ""),
        }));
      return [...prev, ...toAdd];
    });
  };

  const handleImportWellspring = (item) => {
    if (item.spellType !== "wellspring" || !item.name) return;
    setCustomWellsprings((prev) => {
      if (prev.some((w) => w.name.toLowerCase() === item.name.toLowerCase())) return prev;
      return [...prev, { name: item.name, color: item.color || "#888888", textColor: item.textColor || "white", icon: item.icon || "untyped" }];
    });

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
        const existingNames = new Set(prev.map((i) => (i.customName || i.key || "").toLowerCase()));
        const toAdd = matchingInvocations
          .filter((inv) => !existingNames.has(String(inv.name || "").toLowerCase()))
          .map((inv) => ({
            key: crypto.randomUUID(),
            customName: String(inv.name || ""),
            wellspring: item.name,
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
    setInvocations((prev) => [
      ...prev,
      { key: crypto.randomUUID(), customName: item.name, wellspring: item.wellspring || "", type: item.type || "Blast", effect: item.effect || "" },
    ]);
    setInvocationPickerOpen(false);
  };

  // Group invocations by wellspring for display
  const invocationsByWellspring = useMemo(() => {
    const groups = {};
    (formState.invocations || []).forEach((inv) => {
      const ws = inv.wellspring || "";
      if (!groups[ws]) groups[ws] = [];
      groups[ws].push(inv);
    });
    return groups;
  }, [formState.invocations]);

  const wellspringGroupOrder = useMemo(() => {
    const seen = new Set();
    const order = [];
    (formState.invocations || []).forEach((inv) => {
      const ws = inv.wellspring || "";
      if (!seen.has(ws)) { seen.add(ws); order.push(ws); }
    });
    return order;
  }, [formState.invocations]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Custom Wellsprings */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="h6">{t("Custom Wellsprings")}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={t("Import from Compendium")}>
              <IconButton size="small" onClick={() => setWellspringPickerOpen(true)}>
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button size="small" startIcon={<AddIcon />} onClick={addWellspring} variant="outlined">
              {t("Add")}
            </Button>
          </Box>
        </Box>
        {customWellsprings.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            {t("No custom wellsprings. Add one to extend the standard 5.")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {customWellsprings.map((w, i) => (
              <Box
                key={i}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    label={t("Name")}
                    value={w.name}
                    onChange={(e) => updateWellspring(i, "name", e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label={t("Color")}
                    type="color"
                    value={w.color || "#888888"}
                    onChange={(e) => updateWellspring(i, "color", e.target.value)}
                    size="small"
                    sx={{ width: 80 }}
                    slotProps={{ htmlInput: { style: { padding: 4, height: 32, cursor: "pointer" } } }}
                  />
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>{t("Text")}</InputLabel>
                    <Select
                      value={w.textColor || "white"}
                      onChange={(e) => updateWellspring(i, "textColor", e.target.value)}
                      label={t("Text")}
                    >
                      <MenuItem value="white">{t("White")}</MenuItem>
                      <MenuItem value="black">{t("Black")}</MenuItem>
                    </Select>
                  </FormControl>
                  <ItemActionMenu
                    onAddMissingInvocations={w.name ? () => addMissingInvocations(w.name) : undefined}
                    onAddToCompendium={() => addWellspringToCompendium(w)}
                    onDelete={() => removeWellspring(i)}
                    t={t}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                    {t("Icon")}
                  </Typography>
                  <IconPicker value={w.icon || "untyped"} onChange={(val) => updateWellspring(i, "icon", val)} />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Custom Invocations */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="h6">{t("Custom Invocations")}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={t("Import from Compendium")}>
              <IconButton size="small" onClick={() => setInvocationPickerOpen(true)}>
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button size="small" startIcon={<AddIcon />} onClick={addInvocation} variant="outlined">
              {t("Add")}
            </Button>
          </Box>
        </Box>
        {invocations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            {t("No custom invocations. Add one to supplement the standard list.")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {wellspringGroupOrder.map((wsKey) => {
              const group = invocationsByWellspring[wsKey] || [];
              const wellspringEntry = allWellsprings.find((w) => w.key === wsKey);
              const isOrphaned = wsKey && !wellspringEntry;
              return (
                <Box key={wsKey}>
                  {/* Group header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, pb: 0.5, borderBottom: "1px solid", borderColor: isOrphaned ? "error.main" : "divider" }}>
                    {wellspringEntry ? (
                      <>
                        <img
                          src={affinityIconSrc(wellspringEntry.icon)}
                          width={16}
                          height={16}
                          style={{ objectFit: "contain" }}
                          alt={wsKey}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                          {wsKey}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: isOrphaned ? "error.main" : "text.secondary", fontStyle: wsKey ? "normal" : "italic", textDecoration: isOrphaned ? "line-through" : "none" }}>
                        {wsKey || t("No Wellspring")}
                      </Typography>
                    )}
                    {isOrphaned && (
                      <>
                        <Tooltip title={t("invoker_missing_wellspring")} arrow>
                          <Typography variant="caption" sx={{ ml: "auto", color: "error.main", fontStyle: "italic" }}>
                            {t("invoker_missing_wellspring")}
                          </Typography>
                        </Tooltip>
                        <Tooltip title={t("Delete All")} arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => group.forEach((inv) => removeInvocation(inv.key))}
                          >
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {group.map((inv) => (
                      <Box
                        key={inv.key}
                        sx={{
                          p: 1.5,
                          border: "1px solid",
                          borderColor: isOrphaned ? "error.main" : "divider",
                          borderRadius: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                          opacity: isOrphaned ? 0.6 : 1,
                        }}
                      >
                        <Grid container spacing={1.5} sx={{ alignItems: "flex-start" }}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              label={t("Name")}
                              value={inv.customName || ""}
                              onChange={(e) => updateInvocation(inv.key, "customName", e.target.value)}
                              size="small"
                              fullWidth
                              slotProps={isOrphaned ? { input: { sx: { textDecoration: "line-through", color: "error.main" } } } : undefined}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl size="small" fullWidth>
                              <InputLabel>{t("Wellspring")}</InputLabel>
                              <Select
                                value={inv.wellspring || ""}
                                onChange={(e) => updateInvocation(inv.key, "wellspring", e.target.value)}
                                label={t("Wellspring")}
                                renderValue={(val) => {
                                  const w = allWellsprings.find((x) => x.key === val) ?? (val ? { key: val, icon: "untyped" } : null);
                                  return w ? <WellspringSelectOption wellspring={w} /> : val;
                                }}
                              >
                                {[
                                  ...allWellsprings,
                                  ...(inv.wellspring && !allWellsprings.find((w) => w.key === inv.wellspring)
                                    ? [{ key: inv.wellspring, icon: "untyped", color: "#888", textColor: "white" }]
                                    : []),
                                ].map((w) => (
                                  <MenuItem key={w.key} value={w.key}>
                                    <WellspringSelectOption wellspring={w} />
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControl size="small" fullWidth>
                              <InputLabel>{t("Type")}</InputLabel>
                              <Select
                                value={inv.type || "Blast"}
                                onChange={(e) => updateInvocation(inv.key, "type", e.target.value)}
                                label={t("Type")}
                              >
                                {INV_TYPES.map((type) => (
                                  <MenuItem key={type} value={type}>{t(type)}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 1 }} sx={{ display: "flex", alignItems: "center", justifyContent: "center", pt: 0.5 }}>
                            <ItemActionMenu
                              onAddToCompendium={() => addInvocationToCompendium(inv)}
                              onDelete={() => removeInvocation(inv.key)}
                              t={t}
                            />
                          </Grid>
                          <Grid size={12}>
                            <TextField
                              label={t("Effect")}
                              value={inv.effect || ""}
                              onChange={(e) => updateInvocation(inv.key, "effect", e.target.value)}
                              size="small"
                              fullWidth
                              multiline
                              minRows={2}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
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
