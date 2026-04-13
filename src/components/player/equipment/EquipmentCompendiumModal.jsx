import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Select,
  MenuItem,
  Divider,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import { useCompendiumPacks } from "../../../hooks/useCompendiumPacks";
import Diamond from "../../Diamond";
import { Martial } from "../../icons";
import { OpenBracket, CloseBracket } from "../../Bracket";
import attributes from "../../../libs/attributes";

// Pack item types available for equipment import
const EQUIP_TYPES = [
  { value: "weapon", label: "Weapons" },
  { value: "armor", label: "Armor" },
  { value: "shield", label: "Shields" },
];

const EquipmentCompendiumModal = ({ open, onClose, onSave }) => {
  const { t } = useTranslate();
  const { packs } = useCompendiumPacks();

  const [selectedPackId, setSelectedPackId] = useState("");
  const [selectedEquipType, setSelectedEquipType] = useState("weapon");
  const [selectedItem, setSelectedItem] = useState(null);

  // Items from the selected pack of the selected type
  const displayItems = React.useMemo(() => {
    if (!selectedPackId) return [];
    const pack = packs.find((p) => p.id === selectedPackId);
    if (!pack) return [];
    return pack.items.filter((i) => i.type === selectedEquipType).map((i) => i.data);
  }, [selectedPackId, selectedEquipType, packs]);

  // Auto-select first item when list changes
  useEffect(() => {
    setSelectedItem(displayItems.length > 0 ? displayItems[0] : null);
  }, [displayItems]);

  // Set default pack on open
  useEffect(() => {
    if (open && packs.length > 0) {
      setSelectedPackId(packs[0].id);
      setSelectedEquipType("weapon");
    }
  }, [open]);

  // Set default pack when packs first load
  useEffect(() => {
    if (packs.length > 0 && !selectedPackId) {
      setSelectedPackId(packs[0].id);
    }
  }, [packs, selectedPackId]);

  const handleSave = () => {
    if (selectedItem) {
      onSave(selectedEquipType, selectedItem);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: "80%", maxWidth: "lg" } }
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        <Grid container sx={{ alignItems: "center", justifyContent: "space-between" }} spacing={1}>
          <Grid  size={5}>
            <Select
              value={selectedEquipType}
              onChange={(e) => setSelectedEquipType(e.target.value)}
              fullWidth
              inputProps={{ "aria-label": "Select equipment type" }}
            >
              {EQUIP_TYPES.map((et) => (
                <MenuItem key={et.value} value={et.value}>
                  {t(et.label)}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid  size={5}>
            <Select
              value={selectedPackId}
              onChange={(e) => setSelectedPackId(e.target.value)}
              fullWidth
              displayEmpty
            >
              {packs.length === 0 ? (
                <MenuItem value="" disabled>
                  {t("No packs available")}
                </MenuItem>
              ) : (
                packs.map((pack) => (
                  <MenuItem key={pack.id} value={pack.id}>
                    {pack.isPersonal ? `⭐ ${pack.name}` : pack.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </Grid>
          <Grid >
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{ color: (theme) => theme.palette.grey[500] }}
            >
              <Close />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container>
          <Grid  sx={{ maxHeight: "40vh", overflowY: "auto" }} size={4}>
            {displayItems.length === 0 ? (
              <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                {t("No items in this pack for the selected type.")}
              </Typography>
            ) : (
              <List component="nav">
                {displayItems.map((item, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => setSelectedItem(item)}
                    selected={selectedItem === item}
                  >
                    <ListItemText
                      primary={
                        <>
                          {item.name}
                          {item.martial && <Martial />}
                        </>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Grid>
          <Grid  sx={{ maxHeight: "40vh", overflowY: "auto", px: 2 }} size={8}>
            {selectedItem && (
              <div>
                <Typography variant="h3">
                  {selectedItem.name}
                  {selectedItem.martial && <Martial />}
                </Typography>
                {selectedEquipType === "weapon" && (
                  <>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {t(selectedItem.category)}
                      <Box component="span" sx={{
                        mx: 1
                      }}><Diamond /></Box>
                      {selectedItem.hands === 1 ? t("One-handed") : t("Two-handed")}
                      <Box component="span" sx={{
                        mx: 1
                      }}><Diamond /></Box>
                      {selectedItem.melee ? t("Melee") : t("Ranged")}
                    </Typography>
                    <Typography variant="body1">
                      <strong>
                        <OpenBracket />
                        {selectedItem.att1 && attributes[selectedItem.att1]?.shortcaps}
                        {" + "}
                        {selectedItem.att2 && attributes[selectedItem.att2]?.shortcaps}
                        <CloseBracket />
                      </strong>
                      <Box component="span" sx={{
                        mx: 1
                      }}><Diamond /></Box>
                      <strong>
                        <OpenBracket />{t("HR")} + {selectedItem.damage || 0}<CloseBracket />
                      </strong>
                      <Box component="span" sx={{
                        mx: 1
                      }}><Diamond /></Box>
                      {t(selectedItem.type)}
                    </Typography>
                    <Typography variant="body2">
                      {t("Cost")}: {selectedItem.cost} {t("zenit")}
                    </Typography>
                  </>
                )}
                {(selectedEquipType === "armor" || selectedEquipType === "shield") && (
                  <>
                    <Typography variant="body1">
                      {t("DEF")} +{selectedItem.def ?? 0}
                      <Box component="span" sx={{
                        mx: 1
                      }}><Diamond /></Box>
                      {t("MDEF")} +{selectedItem.mdef ?? 0}
                      {selectedItem.init !== undefined && selectedItem.init !== 0 && (
                        <>
                          <Box component="span" sx={{
                            mx: 1
                          }}><Diamond /></Box>
                          {t("Initiative")} {selectedItem.init}
                        </>
                      )}
                    </Typography>
                    <Typography variant="body2">
                      {t("Cost")}: {selectedItem.cost} {t("zenit")}
                    </Typography>
                  </>
                )}
              </div>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSave}
          disabled={!selectedItem}
        >
          {t("Add Item")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EquipmentCompendiumModal;
