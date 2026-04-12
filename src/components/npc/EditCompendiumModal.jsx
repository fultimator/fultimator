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
import { useTranslate } from "../../translation/translate";
import ReactMarkdown from "react-markdown";
import { Close } from "@mui/icons-material";
import Diamond from "../Diamond";
import { OffensiveSpellIcon } from "../icons";
import { Martial } from "../icons";
import { npcSpells } from "../../libs/npcSpells";
import { npcAttacks } from "../../libs/npcAttacks";
import attributes from "../../libs/attributes";
import { CloseBracket, OpenBracket } from "../Bracket";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";

// Maps selectedType → CompendiumItemType stored in packs
const TYPE_TO_PACK_TYPE = {
  spell: "npc-spell",
  basic: "npc-attack",
};

const EditCompendiumModal = ({ open, onClose, typeName, onSave }) => {
  const { t } = useTranslate();
  const { packs, loading: packsLoading } = useCompendiumPacks();

  const [selectedItem, setSelectedItem] = useState(null);
  const [type, setType] = useState([]);
  const [selectedType, setSelectedType] = useState(typeName || "spell");
  const [source, setSource] = useState("official");
  const [selectedPackId, setSelectedPackId] = useState("");

  const damageTypeLabels = {
    physical: "physical_damage",
    wind: "air_damage",
    bolt: "bolt_damage",
    dark: "dark_damage",
    earth: "earth_damage",
    fire: "fire_damage",
    ice: "ice_damage",
    light: "light_damage",
    poison: "poison_damage",
  };

  // Compute the list of items to display based on source
  const packItemsForType = React.useMemo(() => {
    if (source !== "packs" || !selectedPackId) return [];
    const pack = packs.find((p) => p.id === selectedPackId);
    if (!pack) return [];
    const packType = TYPE_TO_PACK_TYPE[selectedType];
    return pack.items.filter((i) => i.type === packType).map((i) => i.data);
  }, [source, selectedPackId, packs, selectedType]);

  // Effect to set the correct official type list
  useEffect(() => {
    if (source !== "official") return;
    let newType = [];
    switch (selectedType) {
      case "spell":
        newType = npcSpells;
        break;
      case "basic":
        newType = npcAttacks;
        break;
      default:
        newType = [];
        break;
    }
    setType(newType);
    setSelectedItem(newType.length > 0 ? newType[0] : null);
  }, [selectedType, source]);

  // When switching to packs source, reset selection
  useEffect(() => {
    if (source === "packs") {
      setSelectedItem(packItemsForType.length > 0 ? packItemsForType[0] : null);
    }
  }, [source, packItemsForType]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedType(typeName || "spell");
      setSource("official");
      setSelectedPackId(packs.length > 0 ? packs[0].id : "");
    }
  }, [open, typeName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set default pack when packs load
  useEffect(() => {
    if (packs.length > 0 && !selectedPackId) {
      setSelectedPackId(packs[0].id);
    }
  }, [packs, selectedPackId]);

  const displayItems = source === "packs" ? packItemsForType : type;

  const handleSave = () => {
    if (selectedItem) {
      onSave(selectedItem);
    }
    onClose();
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 1,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: ({ _node, ...props }) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: ({ _node, ...props }) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: ({ _node, ...props }) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: ({ _node, ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ _node, ...props }) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
          <Grid  size="grow">
            <Select
              value={selectedType}
              onChange={handleTypeChange}
              fullWidth
              displayEmpty
              inputProps={{ "aria-label": "Select type" }}
            >
              <MenuItem value="spell">{t("Spells")}</MenuItem>
              <MenuItem value="basic">{t("Basic Attacks")}</MenuItem>
            </Select>
          </Grid>
          <Grid >
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Close />
            </IconButton>
          </Grid>
          {/* Source selector row */}
          <Grid  size={12}>
            <Grid container spacing={1} alignItems="center">
              <Grid  size={source === "packs" ? 4 : 12}>
                <Select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ "aria-label": "Select source" }}
                >
                  <MenuItem value="official">{t("Official Data")}</MenuItem>
                  <MenuItem value="packs" disabled={packs.length === 0}>
                    {t("My Packs")}
                  </MenuItem>
                </Select>
              </Grid>
              {source === "packs" && (
                <Grid  size={8}>
                  <Select
                    value={selectedPackId}
                    onChange={(e) => setSelectedPackId(e.target.value)}
                    fullWidth
                    size="small"
                    displayEmpty
                  >
                    {packs.map((pack) => (
                      <MenuItem key={pack.id} value={pack.id}>
                        {pack.isPersonal ? `⭐ ${pack.name}` : pack.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container>
          <Grid  sx={{ maxHeight: "40vh", overflowY: "auto" }} size={4}>
            {displayItems.length === 0 ? (
              <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                {source === "packs"
                  ? t("No items in this pack for the selected type.")
                  : t("No items available.")}
              </Typography>
            ) : (
              <List component="nav">
                {displayItems.map((item, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => handleItemClick(item)}
                    selected={selectedItem === item}
                  >
                    <ListItemText
                      primary={
                        <>
                          {item.name}
                          {item.type === "offensive" && <OffensiveSpellIcon />}
                          {item.martial === true && <Martial />}
                        </>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Grid>
          <Grid sx={{ maxHeight: "40vh", overflowY: "auto", px: 2 }} size={8}>
            {selectedItem && (
              <div>
                <Typography variant="h3">
                  {selectedItem.name}{" "}
                  {selectedItem.type === "offensive" && <OffensiveSpellIcon />}
                </Typography>
                {selectedType === "basic" && (
                  <>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {t(selectedItem.category)}
                      <Box component="span" mx={1}>
                        <Diamond />
                      </Box>
                      {selectedItem.hands === 1
                        ? t("One-handed")
                        : t("Two-handed")}
                      <Box component="span" mx={1}>
                        <Diamond />
                      </Box>
                      {selectedItem.melee ? t("Melee") : t("Ranged")}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      <strong>
                        <OpenBracket />
                        {selectedItem.attr1 &&
                          attributes[selectedItem.attr1]?.shortcaps}
                        {" + "}
                        {selectedItem.attr2 &&
                          attributes[selectedItem.attr2]?.shortcaps}
                        <CloseBracket />
                      </strong>
                      <Box component="span" mx={1}>
                        <Diamond />
                      </Box>
                      <strong>
                        <OpenBracket />
                        {t("HR")} + {5 + (selectedItem.flatdmg || 0)}
                        <CloseBracket />
                      </strong>{" "}
                      <span>
                        <ReactMarkdown
                          allowedElements={["strong"]}
                          unwrapDisallowed={true}
                        >
                          {t(damageTypeLabels[selectedItem.type])}
                        </ReactMarkdown>
                      </span>
                    </Typography>
                    <Typography variant="body2">
                      {selectedItem.specials}
                    </Typography>
                  </>
                )}
                {selectedType === "spell" && (
                  <>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {selectedItem.mp}{" "}
                      {selectedItem.maxTargets !== 1 ? " × " + t("T") : ""}{" "}
                      {t("MP")}
                      <Box component="span" mx={1}>
                        <Diamond />
                      </Box>
                      <StyledMarkdown
                        allowedElements={["strong"]}
                        unwrapDisallowed={true}
                      >
                        {selectedItem.target}
                      </StyledMarkdown>
                      <Box component="span" mx={1}>
                        <Diamond />
                      </Box>
                      <StyledMarkdown
                        allowedElements={["strong"]}
                        unwrapDisallowed={true}
                      >
                        {selectedItem.duration}
                      </StyledMarkdown>
                    </Typography>
                    <StyledMarkdown
                      allowedElements={["strong"]}
                      unwrapDisallowed={true}
                    >
                      {selectedItem.effect}
                    </StyledMarkdown>
                  </>
                )}
              </div>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid
            size={{
              xs: 12,
              sm: "auto"
            }}>
            <Typography variant="body2">
              <strong>Disclaimer:</strong> For personal use only; do not share
              exported data on official channels.
            </Typography>
          </Grid>
          <Grid
            container
            justifyContent="flex-end"
            size={{
              xs: 12,
              sm: "auto"
            }}>
            <Button
              disabled
              variant="contained"
              color="secondary"
              sx={{ mr: 1 }}
            >
              {t("Export JSON")}
            </Button>
            <Button
              disabled
              variant="contained"
              color="secondary"
              sx={{ mr: 1 }}
            >
              {t("Import JSON")}
            </Button>
            <Button variant="contained" color="secondary" onClick={handleSave}>
              {t("Add Item")}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default EditCompendiumModal;
