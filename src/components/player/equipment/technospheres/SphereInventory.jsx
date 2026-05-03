import React, { useState } from "react";
import useSphereBank from "./useSphereBank";
import {
  Accordion,
  AccordionDetails,
  Alert,
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
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
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../../translation/translate";
import { SharedHoplosphereCard } from "../../../shared/itemCards";
import { getHoplosphereCoagKey } from "../../../../libs/technospheres";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import CustomHeader from "../../../common/CustomHeader";
import CustomHeaderAccordion from "../../../common/CustomHeaderAccordion";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import MnemosphereClassCard from "../../classes/MnemosphereClassCard";
import CompendiumSphereImportDialog from "./CompendiumSphereImportDialog";
import HoplosphereCreateDialog from "./HoplosphereCreateDialog";
import MnemosphereCreateDialog from "./MnemosphereCreateDialog";
import SlotTargetDialog from "./SlotTargetDialog";
import MnemoReceptaclePanel from "./MnemoReceptaclePanel";

function isSphereSlotted(player, id) {
  const eq0 = player?.equipment?.[0] ?? {};
  const isIntegrated =
    (player?.settings?.optionalRules?.technospheres ?? false) &&
    (player?.settings?.optionalRules?.technospheresVariant ?? "standard") ===
      "integrated";
  return (
    [eq0.customWeapons, eq0.armor].some((bank) =>
      (bank ?? []).some((item) => (item.slotted ?? []).includes(id)),
    ) ||
    (isIntegrated && (eq0.mnemoReceptacle ?? []).includes(id))
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
        message={t("This action cannot be undone.")}
      />
    </>
  );
}

export default function SphereInventory({ player, setPlayer, advancement }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const isIntegrated =
    (player?.settings?.optionalRules?.technospheres ?? false) &&
    (player?.settings?.optionalRules?.technospheresVariant ?? "standard") ===
      "integrated";

  const [mnemoExpanded, setMnemoExpanded] = useState(null);
  const [hoploExpanded, setHoploExpanded] = useState(null);
  const [createMnemoOpen, setCreateMnemoOpen] = useState(false);
  const [createHoploOpen, setCreateHoploOpen] = useState(false);
  const [compendiumType, setCompendiumType] = useState(null);
  const [compendiumImport, setCompendiumImport] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [slotTarget, setSlotTarget] = useState(null); // { sphere } — open SlotTargetDialog

  const {
    mnemospheres,
    hoplospheres,
    addMnemo: handleAddMnemo,
    addHoplo: handleAddHoplo,
    addFromCompendium: handleAddFromCompendium,
    deleteMnemo: handleDeleteMnemo,
    deleteHoplo: handleDeleteHoplo,
    changeMnemoSkillLevel: handleChangeMnemoSkillLevel,
    investMnemoLevel: handleInvestMnemoLevel,
    refundMnemoLevel: handleRefundMnemoLevel,
    getMnemoAvailableLevels,
  } = useSphereBank(player, setPlayer);

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
      if (isIntegrated && eq0New.mnemoReceptacle?.includes(id)) {
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

  const accordionSx = {
    borderRadius: "8px",
    border: "2px solid",
    borderColor: secondary,
    marginBottom: 3,
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
      {isIntegrated && (
        <MnemoReceptaclePanel player={player} setPlayer={setPlayer} />
      )}

      <Paper
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          mb: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <CustomHeader
              type="top"
              headerText={t("Mnemospheres")}
              icon={Add}
              customTooltip={t("Add Mnemosphere")}
              addItem={() => setCreateMnemoOpen(true)}
              openCompendium={() => setCompendiumType("mnemospheres")}
            />
          </Grid>
          {mnemospheres.length === 0 && (
            <Grid size={12}>
              <Typography variant="h3" align="center">
                {t("No mnemospheres added yet")}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {mnemospheres.map((m) => (
        <Box key={m.id} sx={{ mb: 3 }}>
          <MnemosphereClassCard
            item={m}
            editable={true}
            isAccordion
            showHeaderMeta
            isSlotted={isSphereSlotted(player, m.id)}
            isExpanded={mnemoExpanded === m.id}
            onToggleExpand={() =>
              setMnemoExpanded((current) => (current === m.id ? null : m.id))
            }
            actions={
              <SphereMenu
                id={m.id}
                slotted={isSphereSlotted(player, m.id)}
                onDelete={handleDeleteMnemo}
                onUnslot={handleUnslot}
                onSlotOpen={isIntegrated ? null : () => setSlotTarget(m)}
                deleteLabel={`${t(m.class)} Lv.${m.lvl ?? 1}`}
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
        </Box>
      ))}

      <Paper
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          mb: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <CustomHeader
              type="top"
              headerText={t("Hoplospheres")}
              icon={Add}
              customTooltip={t("Add Hoplosphere")}
              addItem={() => setCreateHoploOpen(true)}
              openCompendium={() => setCompendiumType("hoplospheres")}
            />
          </Grid>
          {hoplospheres.length === 0 && (
            <Grid size={12}>
              <Typography variant="h3" align="center">
                {t("No hoplospheres added yet")}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {hoplospheres.map((h) => {
        const slotted = isSphereSlotted(player, h.id);
        const coagCount = getCoagCount(player, h, hoplospheres);
        return (
          <Accordion
            key={h.id}
            elevation={3}
            sx={accordionSx}
            expanded={hoploExpanded === h.id}
            onChange={() =>
              setHoploExpanded((current) => (current === h.id ? null : h.id))
            }
          >
            <CustomHeaderAccordion
              isExpanded={hoploExpanded === h.id}
              headerText={`${h.name}${coagCount > 1 ? ` ×${coagCount}` : ""} - ${h.requiredSlots} ${t("slot")}${
                h.requiredSlots > 1 ? "s" : ""
              } - ${h.cost}z${slotted ? ` - ${t("Slotted")}` : ""}`}
              actions={
                <SphereMenu
                  id={h.id}
                  slotted={slotted}
                  onDelete={handleDeleteHoplo}
                  onUnslot={handleUnslot}
                  onSlotOpen={() => setSlotTarget(h)}
                  deleteLabel={h.name}
                />
              }
            />
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <SharedHoplosphereCard
                    item={h}
                    showCard
                    variant="sheet"
                    coagCount={coagCount}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

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
