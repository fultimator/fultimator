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
  Delete,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVert,
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

const StyledTableCellHeader = styled(TableCell)({
  padding: "2px 6px",
  color: "#fff",
});
const StyledTableCell = styled(TableCell)({
  padding: "2px 6px",
  fontSize: "0.8rem",
});

function isSphereSlotted(player, id) {
  const eq0 = player?.equipment?.[0] ?? {};
  return [eq0.customWeapons, eq0.armor].some((bank) =>
    (bank ?? []).some((item) => (item.slotted ?? []).includes(id)),
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

function SphereDeleteMenu({ id, slotted, onDelete, deleteLabel }) {
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
        <StyledTableCell sx={{ width: 30 }}>
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
              color: slotted ? "success.main" : "text.secondary",
            }}
          >
            {slotted ? t("Slotted") : "—"}
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
                deleteLabel={`${t(mnemo.class)} Lv.${mnemo.lvl ?? 1}`}
              />
            )}
          </Box>
        </StyledTableCell>
      </TableRow>
      <TableRow>
        <StyledTableCell colSpan={5} sx={{ p: 0 }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                {skills.map((skill, i) => (
                  <React.Fragment key={i}>
                    <TableRow>
                      <TableCell
                        sx={{ width: 30, borderBottom: "none", py: 0.5 }}
                      />
                      <TableCell sx={{ py: 0.5, borderBottom: "none" }}>
                        <Typography
                          sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                        >
                          {t(skill.name)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          width: 32,
                          textAlign: "center",
                          borderBottom: "none",
                          py: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ p: 0.25 }}
                          disabled={!isEditMode || (skill.currentLvl ?? 0) <= 0}
                          onClick={() => onChangeSkillLevel(mnemo.id, i, -1)}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              lineHeight: 1,
                              fontWeight: "bold",
                            }}
                          >
                            −
                          </Typography>
                        </IconButton>
                      </TableCell>
                      <TableCell
                        sx={{
                          width: 48,
                          textAlign: "center",
                          borderBottom: "none",
                          py: 0.5,
                        }}
                      >
                        <Typography
                          sx={{ fontSize: "0.8rem", fontWeight: "bold" }}
                        >
                          {skill.currentLvl ?? 0}/{skill.maxLvl ?? 0}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          width: 32,
                          textAlign: "center",
                          borderBottom: "none",
                          py: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ p: 0.25 }}
                          disabled={
                            !isEditMode ||
                            (skill.currentLvl ?? 0) >= (skill.maxLvl ?? 0) ||
                            usedLevels >= mnemoLvl
                          }
                          onClick={() => onChangeSkillLevel(mnemo.id, i, 1)}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              lineHeight: 1,
                              fontWeight: "bold",
                            }}
                          >
                            +
                          </Typography>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ width: 30, pt: 0 }} />
                      <TableCell
                        colSpan={4}
                        sx={{
                          pt: 0,
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
                            getMnemosphereSkillDescription(mnemo, skill) ?? "",
                          )}
                        </ReactMarkdown>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
                {heroic.map((h, i) => (
                  <React.Fragment key={`heroic-${i}`}>
                    <TableRow>
                      <TableCell
                        sx={{ width: 30, borderBottom: "none", py: 0.5 }}
                      />
                      <TableCell
                        colSpan={4}
                        sx={{ borderBottom: "none", py: 0.5 }}
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
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ width: 30, pt: 0 }} />
                      <TableCell
                        colSpan={4}
                        sx={{
                          pt: 0,
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
                          {t(getMnemosphereHeroicDescription(mnemo, h) ?? "")}
                        </ReactMarkdown>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
                {spells.map((sp, i) => (
                  <React.Fragment key={`spell-${i}`}>
                    <TableRow>
                      <TableCell
                        sx={{ width: 30, borderBottom: "none", py: 0.5 }}
                      />
                      <TableCell
                        colSpan={4}
                        sx={{ borderBottom: "none", py: 0.5 }}
                      >
                        <Typography
                          sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                        >
                          {t(sp.name)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ width: 30, pt: 0 }} />
                      <TableCell
                        colSpan={4}
                        sx={{
                          pt: 0,
                          pb: 0.75,
                          color: "text.secondary",
                          fontFamily: "PT Sans Narrow",
                          fontSize: "0.75rem",
                        }}
                      >
                        {t(sp.description ?? "")}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
                {skills.length === 0 &&
                  heroic.length === 0 &&
                  spells.length === 0 && (
                    <TableRow>
                      <TableCell sx={{ width: 30 }} />
                      <TableCell
                        colSpan={4}
                        sx={{
                          color: "text.secondary",
                          fontStyle: "italic",
                          fontSize: "0.75rem",
                        }}
                      >
                        {t("No skills")}
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
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
        <StyledTableCell sx={{ width: 30 }}>
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
              deleteLabel={hoplo.name}
            />
          )}
        </StyledTableCell>
      </TableRow>
      <TableRow>
        <StyledTableCell colSpan={5} sx={{ p: 0 }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box
              sx={{ p: 1, ml: { xs: 1, sm: 4 }, bgcolor: "rgba(0,0,0,0.03)" }}
            >
              {hoplo.description && (
                <Typography
                  sx={{ fontSize: "0.75rem", fontFamily: "PT Sans Narrow" }}
                >
                  {hoplo.description}
                </Typography>
              )}
              <Typography
                sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.25 }}
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
  const { openRows, toggleRow } = usePlayerSheetCompactStore();

  const [createMnemoOpen, setCreateMnemoOpen] = useState(false);
  const [createHoploOpen, setCreateHoploOpen] = useState(false);
  const [compendiumType, setCompendiumType] = useState(null);
  const [compendiumImport, setCompendiumImport] = useState(null);
  const [editMnemoId, setEditMnemoId] = useState(null);
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
  } = useSphereBank(player, setPlayer);

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
            <StyledTableCellHeader sx={{ width: 30 }} />
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {renderTable(
        t("Mnemospheres"),
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
          />
        )),
        () => setCreateMnemoOpen(true),
        "mnemospheres",
      )}

      {renderTable(
        t("Hoplospheres"),
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
        return liveMnemo ? (
          <Dialog
            open
            onClose={() => setEditMnemoId(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: "bold", pb: 0 }}>
              {t(liveMnemo.class)} {t("Lv.")} {liveMnemo.lvl ?? 1}
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <MnemosphereClassCard
                item={liveMnemo}
                editable={true}
                onIncreaseSkillLevel={(skillIndex) =>
                  handleChangeSkillLevel(editMnemoId, skillIndex, 1)
                }
                onDecreaseSkillLevel={(skillIndex) =>
                  handleChangeSkillLevel(editMnemoId, skillIndex, -1)
                }
                availableLevels={
                  (liveMnemo.lvl ?? 1) -
                  (liveMnemo.skills ?? []).reduce(
                    (sum, s) => sum + (s.currentLvl ?? 0),
                    0,
                  )
                }
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditMnemoId(null)}>{t("Close")}</Button>
            </DialogActions>
          </Dialog>
        ) : null;
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
    </Box>
  );
}
