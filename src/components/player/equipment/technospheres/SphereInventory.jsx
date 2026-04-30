import React, { useState } from "react";
import useSphereBank from "./useSphereBank";
import {
  Accordion,
  AccordionDetails,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Delete, MoreVert } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../../translation/translate";
import { SharedHoplosphereCard } from "../../../shared/itemCards";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import CustomHeader from "../../../common/CustomHeader";
import CustomHeaderAccordion from "../../../common/CustomHeaderAccordion";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import MnemosphereClassCard from "../../classes/MnemosphereClassCard";
import HoplosphereCreateDialog from "./HoplosphereCreateDialog";
import MnemosphereCreateDialog from "./MnemosphereCreateDialog";

function isSphereSlotted(player, id) {
  const eq0 = player?.equipment?.[0] ?? {};
  return [eq0.customWeapons, eq0.armor].some((bank) =>
    (bank ?? []).some((item) => (item.slotted ?? []).includes(id)),
  );
}

function SphereMenu({ id, slotted, onDelete, deleteLabel }) {
  const { t } = useTranslate();
  const [anchor, setAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const open = Boolean(anchor);

  return (
    <>
      <Tooltip title={t("Options")}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setAnchor(e.currentTarget);
          }}
          sx={{
            color: "#ffffff",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.3)" },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={open}
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
        title={t("Delete") + " " + deleteLabel}
        message={t("This action cannot be undone.")}
      />
    </>
  );
}

export default function SphereInventory({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [mnemoExpanded, setMnemoExpanded] = useState(null);
  const [hoploExpanded, setHoploExpanded] = useState(null);
  const [createMnemoOpen, setCreateMnemoOpen] = useState(false);
  const [createHoploOpen, setCreateHoploOpen] = useState(false);
  const [compendiumType, setCompendiumType] = useState(null);

  const {
    mnemospheres,
    hoplospheres,
    addMnemo: handleAddMnemo,
    addHoplo: handleAddHoplo,
    addFromCompendium: handleAddFromCompendium,
    deleteMnemo: handleDeleteMnemo,
    deleteHoplo: handleDeleteHoplo,
    changeMnemoSkillLevel: handleChangeMnemoSkillLevel,
    getMnemoAvailableLevels,
  } = useSphereBank(player, setPlayer);

  const accordionSx = {
    borderRadius: "8px",
    border: "2px solid",
    borderColor: secondary,
    marginBottom: 3,
  };

  return (
    <>
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
        <Accordion
          key={m.id}
          elevation={3}
          sx={accordionSx}
          expanded={mnemoExpanded === m.id}
          onChange={() =>
            setMnemoExpanded((current) => (current === m.id ? null : m.id))
          }
        >
          <CustomHeaderAccordion
            isExpanded={mnemoExpanded === m.id}
            headerText={`${t(m.class)} ${t("Lvl")} ${m.lvl ?? 1} - ${
              500 + (m.lvl ?? 1) * 300
            }z${isSphereSlotted(player, m.id) ? ` - ${t("Slotted")}` : ""}`}
            actions={
              <SphereMenu
                id={m.id}
                slotted={isSphereSlotted(player, m.id)}
                onDelete={handleDeleteMnemo}
                deleteLabel={`${t(m.class)} Lv.${m.lvl ?? 1}`}
              />
            }
          />
          <AccordionDetails>
            <MnemosphereClassCard
              item={m}
              editable={true}
              onIncreaseSkillLevel={(skillIndex) =>
                handleChangeMnemoSkillLevel(m.id, skillIndex, 1)
              }
              onDecreaseSkillLevel={(skillIndex) =>
                handleChangeMnemoSkillLevel(m.id, skillIndex, -1)
              }
              availableLevels={getMnemoAvailableLevels(m)}
            />
          </AccordionDetails>
        </Accordion>
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
              headerText={`${h.name} - ${h.requiredSlots} ${t("slot")}${
                h.requiredSlots > 1 ? "s" : ""
              } - ${h.cost}z${slotted ? ` - ${t("Slotted")}` : ""}`}
              actions={
                <SphereMenu
                  id={h.id}
                  slotted={slotted}
                  onDelete={handleDeleteHoplo}
                  deleteLabel={h.name}
                />
              }
            />
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <SharedHoplosphereCard item={h} showCard variant="sheet" />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <MnemosphereCreateDialog
        open={createMnemoOpen}
        onClose={() => setCreateMnemoOpen(false)}
        onConfirm={handleAddMnemo}
      />
      <HoplosphereCreateDialog
        open={createHoploOpen}
        onClose={() => setCreateHoploOpen(false)}
        onConfirm={handleAddHoplo}
      />
      <CompendiumViewerModal
        open={Boolean(compendiumType)}
        onClose={() => setCompendiumType(null)}
        onAddItem={handleAddFromCompendium}
        initialType={compendiumType ?? "mnemospheres"}
        restrictToTypes={compendiumType ? [compendiumType] : []}
        context="player"
      />
    </>
  );
}
