import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  Add,
  AddLink,
  Delete,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
  LinkOff,
  MoreVert,
  Remove,
  Search as SearchIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import MnemosphereCreateDialog from "../../equipment/technospheres/MnemosphereCreateDialog";
import HoplosphereCreateDialog from "../../equipment/technospheres/HoplosphereCreateDialog";
import CompendiumSphereImportDialog from "../../equipment/technospheres/CompendiumSphereImportDialog";
import {
  getMnemosphereSkillDescription,
  getMnemosphereHeroicDescription,
} from "../../classes/mnemosphereClassUtils";
import MnemosphereClassCard from "../../classes/MnemosphereClassCard";
import useSphereBank from "../../equipment/technospheres/useSphereBank";
import { getHoplosphereCoagKey } from "../../../../libs/technospheres";
import { getIntegratedMnemoLimit } from "../../equipment/technospheres/sphereUtils";
import MnemoReceptaclePickerDialog from "../../equipment/technospheres/MnemoReceptaclePickerDialog";
import SlotTargetDialog from "../../equipment/technospheres/SlotTargetDialog";

const StyledTableCellHeader = styled(TableCell)({
  padding: "4px 8px",
  color: "#fff",
});
const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
});

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
    for (const item of bank ?? []) ids.push(...(item.slotted ?? []));
  }
  return ids;
}

function getCoagCount(player, hoplo, hoplospheres) {
  const key = getHoplosphereCoagKey(hoplo);
  return getAllSlottedIds(player).filter((id) => {
    const h = hoplospheres.find((hh) => hh.id === id);
    return h && getHoplosphereCoagKey(h) === key;
  }).length;
}

function SphereDeleteMenu({
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

  return (
    <>
      <Tooltip title={t("Options")}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setAnchor(e.currentTarget);
          }}
          sx={{ color: "#fff", p: 0.25 }}
        >
          <MoreVert sx={{ fontSize: "1.1rem" }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {slotted ? (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onUnslot?.(id);
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
        title={`${t("Delete")} ${deleteLabel}`}
        message={t("This action cannot be undone.")}
      />
    </>
  );
}

function MnemoRow({
  mnemo,
  player,
  isEditMode,
  openRows,
  toggleRow,
  onDelete,
  onChangeSkillLevel,
  onEdit,
  onUnslot,
  onSlotOpen,
  isLoaded = false,
}) {
  const { t } = useTranslate();
  const rowKey = `mnemo-${mnemo.id}`;
  const isOpen = !!openRows[rowKey];
  const slotted = isSphereSlotted(player, mnemo.id);
  const skills = mnemo.skills ?? [];
  const heroic = mnemo.heroic ?? [];
  const spells = mnemo.spells ?? [];
  const usedLevels = skills.reduce((sum, s) => sum + (s.currentLvl ?? 0), 0);
  const mnemoLvl = mnemo.lvl ?? 1;

  return (
    <React.Fragment>
      <TableRow
        sx={{ backgroundColor: isOpen ? "rgba(0,0,0,0.02)" : "inherit" }}
      >
        <StyledTableCell sx={{ width: 36 }}>
          <IconButton
            onClick={() => toggleRow(rowKey)}
            size="small"
            sx={{ p: 0.25 }}
          >
            {isOpen ? (
              <KeyboardArrowUp fontSize="small" />
            ) : (
              <KeyboardArrowDown fontSize="small" />
            )}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell
          onClick={() => toggleRow(rowKey)}
          sx={{
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
            noWrap
          >
            {t(mnemo.class)} {t("Lv.")} {mnemo.lvl ?? 1}
          </Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.75rem" }}>
            {usedLevels}/{mnemoLvl} · {500 + mnemoLvl * 300}z
          </Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: slotted || isLoaded ? "success.main" : "text.secondary",
            }}
          >
            {slotted ? t("Slotted") : isLoaded ? t("Loaded") : "—"}
          </Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ width: { xs: 80, sm: 92 }, textAlign: "right" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Tooltip title={t("Edit")}>
              <IconButton
                size="small"
                sx={{ p: 0.25 }}
                onClick={() => onEdit(mnemo)}
              >
                <Edit sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Tooltip>
            {isEditMode && (
              <SphereDeleteMenu
                id={mnemo.id}
                slotted={slotted}
                onDelete={onDelete}
                onUnslot={onUnslot}
                onSlotOpen={onSlotOpen}
                deleteLabel={`${t(mnemo.class)} Lv.${mnemo.lvl ?? 1}`}
              />
            )}
          </Box>
        </StyledTableCell>
      </TableRow>
      <TableRow>
        <StyledTableCell colSpan={5} sx={{ p: 0 }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box
              sx={{
                ml: { xs: 1, sm: 2 },
                bgcolor: "rgba(0,0,0,0.03)",
                py: 0.5,
              }}
            >
              <Table size="small" sx={{ width: "100%" }}>
                <TableBody>
                  {skills
                    .filter(
                      (skill) => isEditMode || (skill.currentLvl ?? 0) >= 1,
                    )
                    .map((skill, i) => {
                      const skillKey = `mnemo-skill-${mnemo.id}-${i}`;
                      const isSkillOpen = !!openRows[skillKey];
                      return (
                        <React.Fragment key={skillKey}>
                          <TableRow sx={{ "& td": { border: 0 } }}>
                            <StyledTableCell sx={{ width: 36 }}>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(skillKey);
                                }}
                                size="small"
                                sx={{ p: 0.25 }}
                              >
                                {isSkillOpen ? (
                                  <KeyboardArrowUp fontSize="small" />
                                ) : (
                                  <KeyboardArrowDown fontSize="small" />
                                )}
                              </IconButton>
                            </StyledTableCell>
                            <StyledTableCell
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(skillKey);
                              }}
                              sx={{ py: 0.5, cursor: "pointer" }}
                            >
                              <Typography
                                sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                              >
                                {t(skill.name)}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell
                              sx={{ textAlign: "center", py: 0.5 }}
                            />
                            <StyledTableCell
                              sx={{ textAlign: "center", py: 0.5 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 0.25,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  sx={{ p: 0.25 }}
                                  disabled={
                                    !isEditMode || (skill.currentLvl ?? 0) <= 0
                                  }
                                  onClick={() =>
                                    onChangeSkillLevel(mnemo.id, i, -1)
                                  }
                                >
                                  <Remove fontSize="small" />
                                </IconButton>
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: "bold",
                                    minWidth: 32,
                                    textAlign: "center",
                                  }}
                                >
                                  {skill.currentLvl ?? 0}/{skill.maxLvl ?? 0}
                                </Typography>
                                <IconButton
                                  size="small"
                                  sx={{ p: 0.25 }}
                                  disabled={
                                    !isEditMode ||
                                    (skill.currentLvl ?? 0) >=
                                      (skill.maxLvl ?? 0) ||
                                    usedLevels >= mnemoLvl
                                  }
                                  onClick={() =>
                                    onChangeSkillLevel(mnemo.id, i, 1)
                                  }
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell
                              sx={{ width: { xs: 80, sm: 92 } }}
                            />
                          </TableRow>
                          <TableRow>
                            <StyledTableCell colSpan={5} sx={{ p: 0 }}>
                              <Collapse
                                in={isSkillOpen}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box
                                  sx={{
                                    px: 1,
                                    pb: 0.75,
                                    color: "text.secondary",
                                    fontFamily: "PT Sans Narrow",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  <ReactMarkdown
                                    allowedElements={["strong", "em"]}
                                    unwrapDisallowed
                                  >
                                    {t(
                                      getMnemosphereSkillDescription(
                                        mnemo,
                                        skill,
                                      ) ?? "",
                                    )}
                                  </ReactMarkdown>
                                </Box>
                              </Collapse>
                            </StyledTableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  {heroic.map((h, i) => {
                    const heroicKey = `mnemo-heroic-${mnemo.id}-${i}`;
                    const isHeroicOpen = !!openRows[heroicKey];
                    return (
                      <React.Fragment key={heroicKey}>
                        <TableRow sx={{ "& td": { border: 0 } }}>
                          <StyledTableCell sx={{ width: 36 }}>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(heroicKey);
                              }}
                              size="small"
                              sx={{ p: 0.25 }}
                            >
                              {isHeroicOpen ? (
                                <KeyboardArrowUp fontSize="small" />
                              ) : (
                                <KeyboardArrowDown fontSize="small" />
                              )}
                            </IconButton>
                          </StyledTableCell>
                          <StyledTableCell
                            colSpan={3}
                            sx={{ py: 0.5, cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(heroicKey);
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.8rem",
                                fontStyle: "italic",
                              }}
                            >
                              {t(h.name)}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: { xs: 80, sm: 92 } }} />
                        </TableRow>
                        <TableRow>
                          <StyledTableCell colSpan={5} sx={{ p: 0 }}>
                            <Collapse
                              in={isHeroicOpen}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box
                                sx={{
                                  px: 1,
                                  pb: 0.75,
                                  color: "text.secondary",
                                  fontFamily: "PT Sans Narrow",
                                  fontSize: "0.75rem",
                                }}
                              >
                                <ReactMarkdown
                                  allowedElements={["strong", "em"]}
                                  unwrapDisallowed
                                >
                                  {t(
                                    getMnemosphereHeroicDescription(mnemo, h) ??
                                      "",
                                  )}
                                </ReactMarkdown>
                              </Box>
                            </Collapse>
                          </StyledTableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                  {spells.filter(Boolean).map((sp, i) => {
                    const spellKey = `mnemo-spell-${mnemo.id}-${i}`;
                    const isSpellOpen = !!openRows[spellKey];
                    return (
                      <React.Fragment key={spellKey}>
                        <TableRow sx={{ "& td": { border: 0 } }}>
                          <StyledTableCell sx={{ width: 36 }}>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(spellKey);
                              }}
                              size="small"
                              sx={{ p: 0.25 }}
                            >
                              {isSpellOpen ? (
                                <KeyboardArrowUp fontSize="small" />
                              ) : (
                                <KeyboardArrowDown fontSize="small" />
                              )}
                            </IconButton>
                          </StyledTableCell>
                          <StyledTableCell
                            colSpan={3}
                            sx={{ py: 0.5, cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(spellKey);
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                            >
                              {t(sp.name)}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: { xs: 80, sm: 92 } }} />
                        </TableRow>
                        <TableRow>
                          <StyledTableCell colSpan={5} sx={{ p: 0 }}>
                            <Collapse
                              in={isSpellOpen}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box
                                sx={{
                                  px: 1,
                                  pb: 0.75,
                                  color: "text.secondary",
                                  fontFamily: "PT Sans Narrow",
                                  fontSize: "0.75rem",
                                }}
                              >
                                <ReactMarkdown
                                  allowedElements={["strong", "em"]}
                                  unwrapDisallowed
                                >
                                  {t(sp.description ?? "")}
                                </ReactMarkdown>
                              </Box>
                            </Collapse>
                          </StyledTableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                  {skills.length === 0 &&
                    heroic.length === 0 &&
                    spells.length === 0 && (
                      <TableRow>
                        <StyledTableCell sx={{ width: 36 }} />
                        <StyledTableCell
                          colSpan={4}
                          sx={{
                            color: "text.secondary",
                            fontStyle: "italic",
                            fontSize: "0.75rem",
                          }}
                        >
                          {t("No skills")}
                        </StyledTableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </StyledTableCell>
      </TableRow>
    </React.Fragment>
  );
}

function HoploRow({
  hoplo,
  player,
  hoplospheres,
  isEditMode,
  openRows,
  toggleRow,
  onDelete,
  onUnslot,
  onSlotOpen,
}) {
  const { t } = useTranslate();
  const rowKey = `hoplo-${hoplo.id}`;
  const isOpen = !!openRows[rowKey];
  const slotted = isSphereSlotted(player, hoplo.id);
  const coagCount = getCoagCount(player, hoplo, hoplospheres);

  return (
    <React.Fragment>
      <TableRow
        sx={{ backgroundColor: isOpen ? "rgba(0,0,0,0.02)" : "inherit" }}
      >
        <StyledTableCell sx={{ width: 36 }}>
          <IconButton
            onClick={() => toggleRow(rowKey)}
            size="small"
            sx={{ p: 0.25 }}
          >
            {isOpen ? (
              <KeyboardArrowUp fontSize="small" />
            ) : (
              <KeyboardArrowDown fontSize="small" />
            )}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell
          onClick={() => toggleRow(rowKey)}
          sx={{
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
            noWrap
          >
            {hoplo.name}
            {coagCount > 1 ? ` ×${coagCount}` : ""}
          </Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.75rem" }}>
            {hoplo.requiredSlots} {t("slot")}
            {hoplo.requiredSlots > 1 ? "s" : ""}
          </Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: slotted ? "success.main" : "text.secondary",
            }}
          >
            {slotted ? t("Slotted") : "—"}
          </Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ width: { xs: 80, sm: 92 }, textAlign: "right" }}>
          {isEditMode && (
            <SphereDeleteMenu
              id={hoplo.id}
              slotted={slotted}
              onDelete={onDelete}
              onUnslot={onUnslot}
              onSlotOpen={onSlotOpen}
              deleteLabel={hoplo.name}
            />
          )}
        </StyledTableCell>
      </TableRow>
      <TableRow>
        <StyledTableCell colSpan={5} sx={{ p: 0 }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box
              sx={{ p: 1, ml: { xs: 1, sm: 2 }, bgcolor: "rgba(0,0,0,0.03)" }}
            >
              {hoplo.description && (
                <Typography
                  sx={{ fontSize: "0.75rem", fontFamily: "PT Sans Narrow" }}
                >
                  {hoplo.description}
                </Typography>
              )}
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  mt: hoplo.description ? 0.25 : 0,
                }}
              >
                {hoplo.cost}z
                {hoplo.socketable === "weapon" && ` · ${t("Weapon only")}`}
              </Typography>
              {hoplo.coagEffects &&
                Object.keys(hoplo.coagEffects).length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    {Object.entries(hoplo.coagEffects)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([threshold, effect]) => {
                        const active = coagCount >= Number(threshold);
                        return (
                          <Typography
                            key={threshold}
                            sx={{
                              fontSize: "0.7rem",
                              opacity: active ? 1 : 0.4,
                              py: 0.1,
                            }}
                          >
                            <strong>×{threshold}:</strong> {effect}
                          </Typography>
                        );
                      })}
                  </Box>
                )}
            </Box>
          </Collapse>
        </StyledTableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CompactSphereInventory({
  player,
  setPlayer,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isIntegrated =
    (player?.settings?.optionalRules?.technospheres ?? false) &&
    (player?.settings?.optionalRules?.technospheresVariant ?? "standard") ===
      "integrated";
  const isMnemospheresOnly =
    (player?.settings?.optionalRules?.technospheres ?? false) &&
    (player?.settings?.optionalRules?.technospheresVariant ?? "standard") ===
      "mnemospheres";
  const advancement = player?.settings?.advancement ?? false;
  const loadedIds = player?.equipment?.[0]?.mnemoReceptacle ?? [];
  const receptacleLimit = getIntegratedMnemoLimit(player?.lvl ?? 1);
  const eq0 = player?.equipment?.[0] ?? {};
  const { openRows, toggleRow } = usePlayerSheetCompactStore();

  const [createMnemoOpen, setCreateMnemoOpen] = useState(false);
  const [receptaclePickerOpen, setReceptaclePickerOpen] = useState(false);
  const [createHoploOpen, setCreateHoploOpen] = useState(false);
  const [compendiumType, setCompendiumType] = useState(null);
  const [compendiumImport, setCompendiumImport] = useState(null);
  const [editMnemoId, setEditMnemoId] = useState(null);
  const [slotTarget, setSlotTarget] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  const {
    mnemospheres,
    hoplospheres,
    addMnemo: handleAddMnemo,
    addHoplo: handleAddHoplo,
    addFromCompendium: handleAddFromCompendium,
    deleteMnemo: handleDeleteMnemo,
    deleteHoplo: handleDeleteHoplo,
    changeMnemoSkillLevel: handleChangeSkillLevel,
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

  const handleReceptacleLoad = (id) => {
    setPlayer((prev) => {
      const prevEq0 = prev?.equipment?.[0] ?? {};
      const current = prevEq0.mnemoReceptacle ?? [];
      if (current.includes(id)) return prev;
      const equipment = prev?.equipment
        ? [
            { ...prevEq0, mnemoReceptacle: [...current, id] },
            ...prev.equipment.slice(1),
          ]
        : [{ ...prevEq0, mnemoReceptacle: [...current, id] }];
      return { ...prev, equipment };
    });
  };

  const handleReceptacleUnload = (id) => {
    setPlayer((prev) => {
      const prevEq0 = prev?.equipment?.[0] ?? {};
      const current = prevEq0.mnemoReceptacle ?? [];
      const equipment = prev?.equipment
        ? [
            {
              ...prevEq0,
              mnemoReceptacle: current.filter((sid) => sid !== id),
            },
            ...prev.equipment.slice(1),
          ]
        : [
            {
              ...prevEq0,
              mnemoReceptacle: current.filter((sid) => sid !== id),
            },
          ];
      return { ...prev, equipment };
    });
  };

  const headerSx = {
    background: theme.primary,
    "& .MuiTypography-root": {
      fontSize: { xs: "0.75rem", sm: "0.875rem" },
      textTransform: "uppercase",
    },
  };

  const renderTable = (label, rows, addAction, compendiumKey) => (
    <TableContainer component={Paper} sx={{ mb: 1 }}>
      <Table size="small" sx={{ width: "100%" }}>
        <TableHead>
          <TableRow sx={headerSx}>
            <StyledTableCellHeader sx={{ width: 36 }} />
            <StyledTableCellHeader>
              <Typography
                variant="h4"
                sx={{
                  textTransform: "uppercase",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                {label}
              </Typography>
            </StyledTableCellHeader>
            <StyledTableCellHeader
              sx={{ width: { xs: 62, sm: 92 }, textAlign: "center" }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#fff",
                  opacity: 0.8,
                  fontSize: "0.65rem",
                }}
              >
                {t("Cost")}
              </Typography>
            </StyledTableCellHeader>
            <StyledTableCellHeader
              sx={{ width: { xs: 62, sm: 92 }, textAlign: "center" }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#fff",
                  opacity: 0.8,
                  fontSize: "0.65rem",
                }}
              >
                {t("Status")}
              </Typography>
            </StyledTableCellHeader>
            <StyledTableCellHeader
              sx={{ width: { xs: 80, sm: 92 }, textAlign: "right" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {isEditMode && (
                  <>
                    <Tooltip title={`${t("Add")} ${label}`}>
                      <IconButton
                        size="small"
                        onClick={addAction}
                        sx={{ color: "#fff", p: 0.25 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("Search Compendium")}>
                      <IconButton
                        size="small"
                        onClick={() => setCompendiumType(compendiumKey)}
                        sx={{ color: "#fff", p: 0.25 }}
                      >
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );

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

  const handleEditDialogClose = (_event, reason) => {
    if (reason === "backdropClick") return;
    setEditMnemoId(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {isIntegrated && (
        <>
          <TableContainer component={Paper} sx={{ mb: 1 }}>
            <Table size="small" sx={{ width: "100%" }}>
              <TableHead>
                <TableRow sx={headerSx}>
                  <StyledTableCellHeader sx={{ width: 36 }} />
                  <StyledTableCellHeader>
                    <Typography
                      variant="h4"
                      sx={{ textTransform: "uppercase", color: "#fff" }}
                    >
                      {t("Mnemosphere Receptacle")}
                    </Typography>
                  </StyledTableCellHeader>
                  <StyledTableCellHeader
                    sx={{ width: { xs: 62, sm: 80 }, textAlign: "center" }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: "#fff",
                        opacity: 0.8,
                        fontSize: "0.65rem",
                      }}
                    >
                      {t("Skills")}
                    </Typography>
                  </StyledTableCellHeader>
                  <StyledTableCellHeader
                    sx={{ width: { xs: 62, sm: 80 }, textAlign: "center" }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: "#fff",
                        opacity: 0.8,
                        fontSize: "0.65rem",
                      }}
                    >
                      {loadedIds.length}/{receptacleLimit} {t("slots")}
                    </Typography>
                  </StyledTableCellHeader>
                  <StyledTableCellHeader
                    sx={{ width: { xs: 80, sm: 92 }, textAlign: "right" }}
                  >
                    {isEditMode && (
                      <Tooltip title={t("Load Mnemosphere")}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => setReceptaclePickerOpen(true)}
                            disabled={loadedIds.length >= receptacleLimit}
                            sx={{ color: "#fff", p: 0.25 }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </StyledTableCellHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadedIds.length === 0 ? (
                  <TableRow>
                    <StyledTableCell
                      colSpan={5}
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      {t("No mnemospheres loaded")}
                    </StyledTableCell>
                  </TableRow>
                ) : (
                  loadedIds.map((id) => {
                    const m = (eq0.mnemospheres ?? []).find(
                      (mn) => mn.id === id,
                    );
                    if (!m) return null;
                    const rowKey = `receptacle-${m.id}`;
                    const isOpen = !!openRows.equipment?.[rowKey];
                    const skills = m.skills ?? [];
                    const heroic = m.heroic ?? [];
                    const usedLevels = skills.reduce(
                      (sum, s) => sum + (s.currentLvl ?? 0),
                      0,
                    );
                    const mnemoLvl = m.lvl ?? 1;
                    return (
                      <React.Fragment key={m.id}>
                        <TableRow
                          sx={{
                            backgroundColor: isOpen
                              ? "rgba(0,0,0,0.02)"
                              : "inherit",
                          }}
                        >
                          <StyledTableCell sx={{ width: 36 }}>
                            <IconButton
                              onClick={() => toggleRow("equipment", rowKey)}
                              size="small"
                              sx={{ p: 0.25 }}
                            >
                              {isOpen ? (
                                <KeyboardArrowUp fontSize="small" />
                              ) : (
                                <KeyboardArrowDown fontSize="small" />
                              )}
                            </IconButton>
                          </StyledTableCell>
                          <StyledTableCell
                            onClick={() => toggleRow("equipment", rowKey)}
                            sx={{ cursor: "pointer" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                py: 0.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold" }}
                              >
                                {t(m.class)} {t("Lv.")} {mnemoLvl}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell sx={{ textAlign: "center" }}>
                            <Typography sx={{ fontSize: "0.75rem" }}>
                              {usedLevels}/{mnemoLvl}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell sx={{ textAlign: "center" }}>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "success.main",
                              }}
                            >
                              {t("Loaded")}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{
                              width: { xs: 80, sm: 92 },
                              textAlign: "right",
                            }}
                          >
                            {isEditMode && (
                              <Tooltip title={t("Unload")}>
                                <IconButton
                                  size="small"
                                  sx={{ p: 0.25 }}
                                  onClick={() => handleReceptacleUnload(m.id)}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.85rem",
                                      lineHeight: 1,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    ✕
                                  </Typography>
                                </IconButton>
                              </Tooltip>
                            )}
                          </StyledTableCell>
                        </TableRow>
                        <TableRow>
                          <StyledTableCell
                            colSpan={5}
                            sx={{
                              p: 0,
                              borderBottom: isOpen
                                ? "1px solid rgba(0,0,0,0.12)"
                                : "none",
                            }}
                          >
                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                              <Box
                                sx={{
                                  ml: { xs: 1, sm: 2 },
                                  bgcolor: "rgba(0,0,0,0.03)",
                                  mt: 0.5,
                                }}
                              >
                                {skills
                                  .filter((s) => (s.currentLvl ?? 0) >= 1)
                                  .map((skill, i) => {
                                    const skillKey = `receptacle-skill-${m.id}-${i}`;
                                    const desc = t(
                                      getMnemosphereSkillDescription(
                                        m,
                                        skill,
                                      ) ?? "",
                                    );
                                    const isSkillOpen =
                                      !!openRows.equipment?.[skillKey];
                                    return (
                                      <React.Fragment key={skillKey}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            py: 0.25,
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRow("equipment", skillKey)
                                          }
                                        >
                                          <IconButton
                                            size="small"
                                            sx={{ p: 0.25, mr: 0.5 }}
                                          >
                                            {isSkillOpen ? (
                                              <KeyboardArrowUp fontSize="small" />
                                            ) : (
                                              <KeyboardArrowDown fontSize="small" />
                                            )}
                                          </IconButton>
                                          <Typography
                                            variant="body2"
                                            sx={{ fontWeight: "bold", flex: 1 }}
                                          >
                                            {t(skill.name)}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            sx={{ mr: 1 }}
                                          >
                                            {skill.currentLvl}/{skill.maxLvl}
                                          </Typography>
                                        </Box>
                                        <Collapse
                                          in={isSkillOpen}
                                          timeout="auto"
                                          unmountOnExit
                                        >
                                          <Box
                                            sx={{
                                              pl: 5,
                                              pb: 0.5,
                                              color: "text.secondary",
                                              fontFamily: "PT Sans Narrow",
                                              fontSize: "0.8rem",
                                            }}
                                          >
                                            <ReactMarkdown
                                              allowedElements={["strong", "em"]}
                                              unwrapDisallowed
                                            >
                                              {desc}
                                            </ReactMarkdown>
                                          </Box>
                                        </Collapse>
                                      </React.Fragment>
                                    );
                                  })}
                                {heroic.map((h, i) => {
                                  const heroicKey = `receptacle-heroic-${m.id}-${i}`;
                                  const desc = t(
                                    getMnemosphereHeroicDescription(m, h) ?? "",
                                  );
                                  const isHeroicOpen =
                                    !!openRows.equipment?.[heroicKey];
                                  return (
                                    <React.Fragment key={heroicKey}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          py: 0.25,
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          toggleRow("equipment", heroicKey)
                                        }
                                      >
                                        <IconButton
                                          size="small"
                                          sx={{ p: 0.25, mr: 0.5 }}
                                        >
                                          {isHeroicOpen ? (
                                            <KeyboardArrowUp fontSize="small" />
                                          ) : (
                                            <KeyboardArrowDown fontSize="small" />
                                          )}
                                        </IconButton>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: "bold",
                                            flex: 1,
                                            fontStyle: "italic",
                                          }}
                                        >
                                          {t(h.name)}
                                        </Typography>
                                      </Box>
                                      <Collapse
                                        in={isHeroicOpen}
                                        timeout="auto"
                                        unmountOnExit
                                      >
                                        <Box
                                          sx={{
                                            pl: 5,
                                            pb: 0.5,
                                            color: "text.secondary",
                                            fontFamily: "PT Sans Narrow",
                                            fontSize: "0.8rem",
                                          }}
                                        >
                                          <ReactMarkdown
                                            allowedElements={["strong", "em"]}
                                            unwrapDisallowed
                                          >
                                            {desc}
                                          </ReactMarkdown>
                                        </Box>
                                      </Collapse>
                                    </React.Fragment>
                                  );
                                })}
                                {skills.filter((s) => (s.currentLvl ?? 0) >= 1)
                                  .length === 0 &&
                                  heroic.length === 0 && (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "text.secondary",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      {t("No skills")}
                                    </Typography>
                                  )}
                              </Box>
                            </Collapse>
                          </StyledTableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {isEditMode && (
            <MnemoReceptaclePickerDialog
              open={receptaclePickerOpen}
              onClose={() => setReceptaclePickerOpen(false)}
              player={player}
              onLoad={handleReceptacleLoad}
            />
          )}
        </>
      )}
      {renderTable(
        t("Mnemosphere Bank"),
        mnemospheres.map((m) => (
          <MnemoRow
            key={m.id}
            mnemo={m}
            player={player}
            isEditMode={isEditMode}
            openRows={openRows.equipment}
            toggleRow={(key) => toggleRow("equipment", key)}
            onDelete={handleDeleteMnemo}
            onChangeSkillLevel={handleChangeSkillLevel}
            onEdit={(m) => setEditMnemoId(m.id)}
            onUnslot={handleUnslot}
            onSlotOpen={
              isIntegrated || isMnemospheresOnly ? null : () => setSlotTarget(m)
            }
            isLoaded={loadedIds.includes(m.id)}
          />
        )),
        () => setCreateMnemoOpen(true),
        "mnemospheres",
      )}

      {renderTable(
        t("Hoplosphere Bank"),
        hoplospheres.map((h) => (
          <HoploRow
            key={h.id}
            hoplo={h}
            player={player}
            hoplospheres={hoplospheres}
            isEditMode={isEditMode}
            openRows={openRows.equipment}
            toggleRow={(key) => toggleRow("equipment", key)}
            onDelete={handleDeleteHoplo}
            onUnslot={handleUnslot}
            onSlotOpen={() => setSlotTarget(h)}
          />
        )),
        () => setCreateHoploOpen(true),
        "hoplospheres",
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
      <HoplosphereCreateDialog
        open={createHoploOpen}
        onClose={() => setCreateHoploOpen(false)}
        onConfirm={handleConfirmHoplo}
        currentZenit={player?.info?.zenit}
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
      {(() => {
        const liveMnemo = editMnemoId
          ? mnemospheres.find((m) => m.id === editMnemoId)
          : null;
        return (
          <Dialog
            open={Boolean(editMnemoId)}
            onClose={handleEditDialogClose}
            maxWidth="sm"
            fullWidth
          >
            {liveMnemo ? (
              <>
                <DialogTitle sx={{ fontWeight: "bold", pb: 0 }}>
                  {t(liveMnemo.class)} {t("Lv.")} {liveMnemo.lvl ?? 1}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                  <MnemosphereClassCard
                    item={liveMnemo}
                    showHeader={false}
                    editable={isEditMode}
                    onIncreaseSkillLevel={(skillIndex) =>
                      handleChangeSkillLevel(editMnemoId, skillIndex, 1)
                    }
                    onDecreaseSkillLevel={(skillIndex) =>
                      handleChangeSkillLevel(editMnemoId, skillIndex, -1)
                    }
                    availableLevels={getMnemoAvailableLevels(liveMnemo)}
                    onInvestLevel={
                      !advancement
                        ? () => handleInvestMnemoLevel(editMnemoId)
                        : null
                    }
                    onRefundLevel={
                      !advancement
                        ? () => handleRefundMnemoLevel(editMnemoId)
                        : null
                    }
                  />
                </DialogContent>
              </>
            ) : (
              <DialogContent sx={{ pt: 2, pb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t("Loading...")}
                </Typography>
              </DialogContent>
            )}
            <DialogActions>
              <Button onClick={() => setEditMnemoId(null)}>{t("Close")}</Button>
            </DialogActions>
          </Dialog>
        );
      })()}
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
      <SlotTargetDialog
        open={Boolean(slotTarget)}
        onClose={() => setSlotTarget(null)}
        player={player}
        sphere={slotTarget}
        onPick={(item) => {
          if (slotTarget && item) handleSlot(slotTarget, item);
          setSlotTarget(null);
        }}
      />
    </Box>
  );
}
