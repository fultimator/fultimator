import React, { useState } from "react";
import useSphereBank from "/src/hooks/useSphereBank";
import {
  Alert,
  Box,
  Collapse,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Delete,
  Menu as MenuIcon,
  LinkOff,
  AddLink,
  Search,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { SharedHoplosphereCard } from "/src/components/shared/items";
import { getHoplosphereCoagKey } from "/src/libs/technospheres";
import { getMnemosphereCost } from "/src/libs/mnemospheres";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import MnemosphereClassCard from "/src/components/shared/actors/pc/editors/classes/MnemosphereClassCard";
import CompendiumSphereImportDialog from "/src/components/shared/actors/pc/editors/equipment/technospheres/CompendiumSphereImportDialog";
import HoplosphereCreateDialog from "/src/components/shared/actors/pc/editors/equipment/technospheres/HoplosphereCreateDialog";
import MnemosphereCreateDialog from "/src/libs/player/MnemosphereCreateDialog";
import SlotTargetDialog from "/src/components/shared/actors/pc/editors/equipment/technospheres/SlotTargetDialog";
import MnemoReceptaclePanel from "/src/components/shared/actors/pc/editors/equipment/technospheres/MnemoReceptaclePanel";

function isSphereSlotted(player, id) {
  const eq0 = player?.equipment?.[0] ?? {};
  const variant =
    player?.settings?.optionalRules?.technospheresVariant ?? "standard";
  const hasReceptacle =
    (player?.settings?.optionalRules?.technospheres ?? false) &&
    (variant === "integrated" || variant === "mnemospheres");
  return (
    [eq0.customWeapons, eq0.armor].some((bank) =>
      (bank ?? []).some((item) => (item.slotted ?? []).includes(id)),
    ) ||
    (hasReceptacle && (eq0.mnemoReceptacle ?? []).includes(id))
  );
}

function getAllSlottedIds(player) {
  const eq0 = player?.equipment?.[0] ?? {};
  const ids = [];
  for (const bank of [
    eq0.customWeapons,
    eq0.armor,
    eq0.weapons,
    eq0.shields,
    eq0.accessories,
  ]) {
    for (const item of bank ?? []) {
      ids.push(...(item.slotted ?? []));
    }
  }
  return ids;
}

function getCoagCount(player, hoplo, hoplospheres) {
  const allSlotted = getAllSlottedIds(player);
  const key = getHoplosphereCoagKey(hoplo);
  return allSlotted.filter((id) => {
    const h = hoplospheres.find((hh) => hh.id === id);
    return h && getHoplosphereCoagKey(h) === key;
  }).length;
}

function SphereMenu({
  id,
  slotted,
  onDelete,
  onUnslot,
  onSlotOpen,
  deleteLabel,
  deleteMessage,
}) {
  const { t } = useTranslate();
  const [anchor, setAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const open = Boolean(anchor);

  return (
    <>
      <Tooltip title={t("Options")}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setAnchor(e.currentTarget);
          }}
          sx={{
            px: 1,
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.3)",
              transition: "background-color 0.3s ease",
            },
          }}
        >
          <MenuIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {slotted ? (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onUnslot(id);
            }}
          >
            <ListItemIcon>
              <LinkOff fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Unslot")} />
          </MenuItem>
        ) : onSlotOpen ? (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onSlotOpen();
            }}
          >
            <ListItemIcon>
              <AddLink fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Slot")} />
          </MenuItem>
        ) : null}
        <Tooltip
          title={slotted ? t("Remove from all slots first") : ""}
          placement="left"
        >
          <span>
            <MenuItem
              disabled={slotted}
              onClick={() => {
                setAnchor(null);
                setConfirmOpen(true);
              }}
            >
              <ListItemIcon>
                <Delete
                  fontSize="small"
                  color={slotted ? "disabled" : "error"}
                />
              </ListItemIcon>
              <ListItemText primary={t("Delete")} />
            </MenuItem>
          </span>
        </Tooltip>
      </Menu>

      <DeleteConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(id);
        }}
        title={t("Delete") + " " + deleteLabel}
        message={deleteMessage ?? t("This action cannot be undone.")}
      />
    </>
  );
}

export default function SphereInventory({ player, setPlayer, advancement }) {
  const { t } = useTranslate();
  const technospheresVariant =
    player?.settings?.optionalRules?.technospheresVariant ?? "standard";
  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;
  const isIntegrated = isTechnospheres && technospheresVariant === "integrated";
  const isMnemospheresOnly =
    isTechnospheres && technospheresVariant === "mnemospheres";
  const isHoplospheresOnly =
    isTechnospheres && technospheresVariant === "hoplospheres";
  const mnemoHidden = isMnemospheresOnly || isHoplospheresOnly;

  const [mnemoExpanded, setMnemoExpanded] = useState(null);
  const [hoploExpanded, setHoploExpanded] = useState(null);
  const [createMnemoOpen, setCreateMnemoOpen] = useState(false);
  const [createHoploOpen, setCreateHoploOpen] = useState(false);
  const [compendiumType, setCompendiumType] = useState(null);
  const [compendiumImport, setCompendiumImport] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [slotTarget, setSlotTarget] = useState(null); // { sphere } - open SlotTargetDialog

  const {
    mnemospheres,
    hoplospheres,
    addMnemo: handleAddMnemo,
    addHoplo: handleAddHoplo,
    addFromCompendium: handleAddFromCompendium,
    sellMnemo: handleSellMnemo,
    deleteHoplo: handleDeleteHoplo,
    changeMnemoSkillLevel: handleChangeMnemoSkillLevel,
    investMnemoLevel: handleInvestMnemoLevel,
    refundMnemoLevel: handleRefundMnemoLevel,
    getMnemoAvailableLevels,
  } = useSphereBank(player, setPlayer);

  const handleSellMnemoWithSnackbar = (id) => {
    const mnemo = mnemospheres.find((m) => m.id === id);
    handleSellMnemo(id);
    if (mnemo) {
      const refund = getMnemosphereCost(mnemo.lvl ?? 1);
      setSnackbar({
        severity: "success",
        message: `${t("Mnemosphere sold for")} ${refund}z`,
      });
    }
  };

  const handleUnslot = (id) => {
    setPlayer((prev) => {
      const prevEq0 = prev?.equipment?.[0] ?? {};
      const banks = [
        "customWeapons",
        "armor",
        "weapons",
        "shields",
        "accessories",
      ];
      const eq0New = { ...prevEq0 };
      for (const bank of banks) {
        if (eq0New[bank]) {
          eq0New[bank] = eq0New[bank].map((item) =>
            item.slotted?.includes(id)
              ? { ...item, slotted: item.slotted.filter((sid) => sid !== id) }
              : item,
          );
        }
      }
      if (
        (isIntegrated || isMnemospheresOnly) &&
        eq0New.mnemoReceptacle?.includes(id)
      ) {
        eq0New.mnemoReceptacle = eq0New.mnemoReceptacle.filter(
          (sid) => sid !== id,
        );
      }
      const equipment = prev?.equipment
        ? [eq0New, ...prev.equipment.slice(1)]
        : [eq0New];
      return { ...prev, equipment };
    });
  };

  const handleSlot = (sphere, targetItem) => {
    setPlayer((prev) => {
      const prevEq0 = prev?.equipment?.[0] ?? {};
      const banks = [
        "customWeapons",
        "armor",
        "weapons",
        "shields",
        "accessories",
      ];
      const eq0New = { ...prevEq0 };
      for (const bank of banks) {
        if (eq0New[bank]) {
          eq0New[bank] = eq0New[bank].map((item) =>
            (item.id ?? item.name) === (targetItem.id ?? targetItem.name)
              ? { ...item, slotted: [...(item.slotted ?? []), sphere.id] }
              : item,
          );
        }
      }
      const equipment = prev?.equipment
        ? [eq0New, ...prev.equipment.slice(1)]
        : [eq0New];
      return { ...prev, equipment };
    });
  };

  const handleCompendiumAdd = (item, type) => {
    if (type === "mnemospheres" || type === "hoplospheres") {
      setCompendiumImport({ item, type });
      return;
    }
    handleAddFromCompendium(item, type);
  };

  const handleConfirmCompendiumImport = ({ level, cost, quantity = 1 }) => {
    if (!compendiumImport) return;
    const copies =
      compendiumImport.type === "hoplospheres"
        ? Math.max(1, Number(quantity) || 1)
        : 1;
    for (let i = 0; i < copies; i += 1) {
      handleAddFromCompendium(compendiumImport.item, compendiumImport.type, {
        level,
      });
    }
    if (cost > 0) {
      setPlayer((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          zenit: Math.max(0, (prev.info?.zenit ?? 0) - cost),
        },
      }));
      setSnackbar({
        severity: "success",
        message:
          compendiumImport.type === "hoplospheres"
            ? `${t("Hoplosphere purchased for")} ${cost}z`
            : `${t("Mnemosphere purchased for")} ${cost}z`,
      });
    } else {
      setSnackbar({
        severity: "success",
        message:
          compendiumImport.type === "hoplospheres"
            ? t("Hoplosphere added for free")
            : t("Mnemosphere added for free"),
      });
    }
    setCompendiumImport(null);
  };

  const handleConfirmHoplo = (hoplo, cost = 0, quantity = 1) => {
    const copies = Math.max(1, Number(quantity) || 1);
    for (let i = 0; i < copies; i += 1) {
      handleAddHoplo(hoplo);
    }
    if (cost > 0) {
      setPlayer((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          zenit: Math.max(0, (prev.info?.zenit ?? 0) - cost),
        },
      }));
      setSnackbar({
        severity: "success",
        message: `${t("Hoplosphere purchased for")} ${cost}z`,
      });
    } else {
      setSnackbar({
        severity: "success",
        message: t("Hoplosphere added for free"),
      });
    }
  };

  return (
    <>
      {(isIntegrated || isMnemospheresOnly) && (
        <>
          <MnemoReceptaclePanel player={player} setPlayer={setPlayer} />
          <Divider sx={{ my: 3 }} />
        </>
      )}

      {!mnemoHidden && (
        <>
          <SectionCard
            title={t("Mnemosphere Bank")}
            sx={{ mb: 2 }}
            actions={
              <Box sx={{ display: "flex", gap: "2px" }}>
                <Tooltip title={t("Search Compendium")} arrow>
                  <IconButton
                    size="small"
                    sx={{ color: "#fff", p: "4px" }}
                    onClick={() => setCompendiumType("mnemospheres")}
                  >
                    <Search sx={{ fontSize: "1.3rem" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("Add Mnemosphere")} arrow>
                  <IconButton
                    size="small"
                    sx={{ color: "#fff", p: "4px" }}
                    onClick={() => setCreateMnemoOpen(true)}
                  >
                    <Add sx={{ fontSize: "1.3rem" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            {mnemospheres.length === 0 ? (
              <Typography variant="h3" align="center" sx={{ p: 2 }}>
                {t("No mnemospheres added yet")}
              </Typography>
            ) : (
              <Box
                sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1 }}
              >
                {mnemospheres.map((m) => (
                  <MnemosphereClassCard
                    key={m.id}
                    item={m}
                    editable={true}
                    isAccordion
                    showHeaderMeta
                    isSlotted={isSphereSlotted(player, m.id)}
                    isExpanded={mnemoExpanded === m.id}
                    onToggleExpand={() =>
                      setMnemoExpanded((current) =>
                        current === m.id ? null : m.id,
                      )
                    }
                    actions={
                      <SphereMenu
                        id={m.id}
                        slotted={isSphereSlotted(player, m.id)}
                        onDelete={handleSellMnemoWithSnackbar}
                        onUnslot={handleUnslot}
                        onSlotOpen={
                          isIntegrated ? null : () => setSlotTarget(m)
                        }
                        deleteLabel={`${t(m.class)} Lv.${m.lvl ?? 1}`}
                        deleteMessage={`${t("You will receive")} ${getMnemosphereCost(m.lvl ?? 1)}z. ${t("Invested levels are permanently lost.")}`}
                      />
                    }
                    onIncreaseSkillLevel={(skillIndex) =>
                      handleChangeMnemoSkillLevel(m.id, skillIndex, 1)
                    }
                    onDecreaseSkillLevel={(skillIndex) =>
                      handleChangeMnemoSkillLevel(m.id, skillIndex, -1)
                    }
                    availableLevels={getMnemoAvailableLevels(m)}
                    onInvestLevel={
                      !advancement ? () => handleInvestMnemoLevel(m.id) : null
                    }
                    onRefundLevel={
                      !advancement ? () => handleRefundMnemoLevel(m.id) : null
                    }
                  />
                ))}
              </Box>
            )}
          </SectionCard>
        </>
      )}

      {!isMnemospheresOnly && (
        <>
          {!isHoplospheresOnly && <Divider sx={{ my: 3 }} />}

          <SectionCard
            title={t("Hoplosphere Bank")}
            sx={{ mb: 2 }}
            actions={
              <Box sx={{ display: "flex", gap: "2px" }}>
                <Tooltip title={t("Search Compendium")} arrow>
                  <IconButton
                    size="small"
                    sx={{ color: "#fff", p: "4px" }}
                    onClick={() => setCompendiumType("hoplospheres")}
                  >
                    <Search sx={{ fontSize: "1.3rem" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("Add Hoplosphere")} arrow>
                  <IconButton
                    size="small"
                    sx={{ color: "#fff", p: "4px" }}
                    onClick={() => setCreateHoploOpen(true)}
                  >
                    <Add sx={{ fontSize: "1.3rem" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            {hoplospheres.length === 0 ? (
              <Typography variant="h3" align="center" sx={{ p: 2 }}>
                {t("No hoplospheres added yet")}
              </Typography>
            ) : (
              <Box
                sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1 }}
              >
                {hoplospheres.map((h) => {
                  const slotted = isSphereSlotted(player, h.id);
                  const coagCount = getCoagCount(player, h, hoplospheres);
                  const isExpanded = hoploExpanded === h.id;
                  const label = `${h.name}${coagCount > 1 ? ` ×${coagCount}` : ""} - ${h.requiredSlots} ${t("slot")}${h.requiredSlots > 1 ? "s" : ""} - ${h.cost}z${slotted ? ` - ${t("Slotted")}` : ""}`;
                  return (
                    <SectionCard
                      key={h.id}
                      title={label}
                      onHeaderClick={() =>
                        setHoploExpanded((c) => (c === h.id ? null : h.id))
                      }
                      actions={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <SphereMenu
                            id={h.id}
                            slotted={slotted}
                            onDelete={handleDeleteHoplo}
                            onUnslot={handleUnslot}
                            onSlotOpen={() => setSlotTarget(h)}
                            deleteLabel={h.name}
                          />
                          <IconButton
                            size="small"
                            sx={{ color: "#fff", p: "2px" }}
                            onClick={() =>
                              setHoploExpanded((c) =>
                                c === h.id ? null : h.id,
                              )
                            }
                          >
                            {isExpanded ? (
                              <KeyboardArrowUp sx={{ fontSize: "1.2rem" }} />
                            ) : (
                              <KeyboardArrowDown sx={{ fontSize: "1.2rem" }} />
                            )}
                          </IconButton>
                        </Box>
                      }
                    >
                      <Collapse in={isExpanded}>
                        <Box sx={{ p: 1 }}>
                          <SharedHoplosphereCard
                            item={h}
                            showCard
                            variant="sheet"
                            coagCount={coagCount}
                          />
                        </Box>
                      </Collapse>
                    </SectionCard>
                  );
                })}
              </Box>
            )}
          </SectionCard>
        </>
      )}

      <MnemosphereCreateDialog
        open={createMnemoOpen}
        onClose={() => setCreateMnemoOpen(false)}
        onConfirm={(mnemo, cost) => {
          handleAddMnemo(mnemo);
          if (cost > 0) {
            setPlayer((prev) => ({
              ...prev,
              info: {
                ...prev.info,
                zenit: Math.max(0, (prev.info?.zenit ?? 0) - cost),
              },
            }));
            setSnackbar({
              severity: "success",
              message: `${t("Mnemosphere purchased for")} ${cost}z`,
            });
          } else {
            setSnackbar({
              severity: "success",
              message: t("Mnemosphere added for free"),
            });
          }
        }}
        currentZenit={player?.info?.zenit}
      />
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar?.severity ?? "success"}
          onClose={() => setSnackbar(null)}
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
      <HoplosphereCreateDialog
        open={createHoploOpen}
        onClose={() => setCreateHoploOpen(false)}
        onConfirm={handleConfirmHoplo}
        currentZenit={player?.info?.zenit}
      />
      <SlotTargetDialog
        open={Boolean(slotTarget)}
        onClose={() => setSlotTarget(null)}
        sphere={slotTarget}
        player={player}
        onSlot={(targetItem) => handleSlot(slotTarget, targetItem)}
      />
      <CompendiumViewerModal
        open={Boolean(compendiumType)}
        onClose={() => setCompendiumType(null)}
        onAddItem={handleCompendiumAdd}
        initialType={compendiumType ?? "mnemospheres"}
        restrictToTypes={compendiumType ? [compendiumType] : []}
        context="player"
      />
      <CompendiumSphereImportDialog
        open={Boolean(compendiumImport)}
        item={compendiumImport?.item}
        type={compendiumImport?.type}
        onClose={() => setCompendiumImport(null)}
        onConfirm={handleConfirmCompendiumImport}
        currentZenit={player?.info?.zenit}
      />
    </>
  );
}
