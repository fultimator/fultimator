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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { Close } from "@mui/icons-material";
import Diamond from "../../Diamond";
import { OffensiveSpellIcon } from "../../icons";
import { spellList } from "../../../libs/classes";
import { useCompendiumPacks } from "../../../hooks/useCompendiumPacks";

const SpellCompendiumModal = ({ open, onClose, typeName, onSave }) => {
  const { t } = useTranslate();
  const { packs } = useCompendiumPacks();

  const [selectedItem, setSelectedItem] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("Elementalist");
  const [filteredSpells, setFilteredSpells] = useState([]);
  const [isMagisphere, setIsMagisphere] = useState(false);
  const [source, setSource] = useState("official");
  const [selectedPackId, setSelectedPackId] = useState("");

  // Extract unique classes from spellList
  useEffect(() => {
    const uniqueClasses = [...new Set(spellList.map((spell) => spell.class))];
    setClasses(uniqueClasses);
  }, []);

  // Filter official spells based on the selected class
  useEffect(() => {
    if (source !== "official") return;
    const spellsForClass = spellList.filter(
      (spell) => spell.class === selectedClass
    );
    setFilteredSpells(spellsForClass);
    setSelectedItem(spellsForClass.length > 0 ? spellsForClass[0] : null);
  }, [selectedClass, source]);

  // Pack spell items (player-spell type)
  const packSpells = React.useMemo(() => {
    if (source !== "packs" || !selectedPackId) return [];
    const pack = packs.find((p) => p.id === selectedPackId);
    if (!pack) return [];
    return pack.items.filter((i) => i.type === "player-spell").map((i) => i.data);
  }, [source, selectedPackId, packs]);

  // Reset selection when pack spells change
  useEffect(() => {
    if (source === "packs") {
      setSelectedItem(packSpells.length > 0 ? packSpells[0] : null);
    }
  }, [source, packSpells]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedClass(typeName || "Elementalist");
      setSource("official");
      setIsMagisphere(false);
      if (packs.length > 0 && !selectedPackId) {
        setSelectedPackId(packs[0].id);
      }
    }
  }, [open, typeName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set default pack when packs load
  useEffect(() => {
    if (packs.length > 0 && !selectedPackId) {
      setSelectedPackId(packs[0].id);
    }
  }, [packs, selectedPackId]);

  const displayItems = source === "packs" ? packSpells : filteredSpells;

  const handleSave = () => {
    if (selectedItem) {
      const updatedItem = {
        ...selectedItem,
        isMagisphere,
      };
      onSave(updatedItem);
    }
    onClose();
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div style={{ whiteSpace: "pre-line", display: "inline", margin: 0, padding: 1 }}>
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

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleToggleChange = (event) => {
    setIsMagisphere(event.target.checked);
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
          {source === "official" && (
            <Grid item xs>
              <Select
                value={selectedClass}
                onChange={handleClassChange}
                fullWidth
                displayEmpty
                inputProps={{ "aria-label": "Select class" }}
              >
                {classes.map((className) => (
                  <MenuItem key={className} value={className}>
                    {t(className)}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          )}
          {source === "packs" && (
            <Grid item xs>
              <Select
                value={selectedPackId}
                onChange={(e) => setSelectedPackId(e.target.value)}
                fullWidth
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
          <Grid item>
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
          <Grid item xs={12}>
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
        </Grid>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container>
          <Grid item xs={4} sx={{ maxHeight: "40vh", overflowY: "auto" }}>
            {displayItems.length === 0 ? (
              <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                {source === "packs"
                  ? t("No player spells in this pack.")
                  : t("No spells available.")}
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
                          {t(item.name) || t(item.spellName)}
                          {item.isOffensive && <OffensiveSpellIcon />}
                        </>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Grid>
          <Grid
            item
            xs={8}
            sx={{ maxHeight: "40vh", overflowY: "auto", px: 2 }}
          >
            {selectedItem && selectedItem.spellType === "default" && (
              <div>
                <Typography variant="h3">
                  {t(selectedItem.name)}{" "}
                  {selectedItem.isOffensive && <OffensiveSpellIcon />}
                </Typography>
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
                    {t(selectedItem.targetDesc)}
                  </StyledMarkdown>
                  <Box component="span" mx={1}>
                    <Diamond />
                  </Box>
                  <StyledMarkdown
                    allowedElements={["strong"]}
                    unwrapDisallowed={true}
                  >
                    {t(selectedItem.duration)}
                  </StyledMarkdown>
                </Typography>
                <StyledMarkdown
                  allowedElements={["strong"]}
                  unwrapDisallowed={true}
                >
                  {t(selectedItem.description)}
                </StyledMarkdown>
              </div>
            )}
            {selectedItem && selectedItem.spellType === "gamble" && (
              <div>
                <Typography variant="h3">
                  {t(selectedItem.name)}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {t("Up to")} {selectedItem.mp * selectedItem.maxTargets} {t("MP")}
                  <Box component="span" mx={1}>
                    <Diamond />
                  </Box>
                  <StyledMarkdown
                    allowedElements={["strong"]}
                    unwrapDisallowed={true}
                  >
                    {t(selectedItem.targetDesc)}
                  </StyledMarkdown>
                  <Box component="span" mx={1}>
                    <Diamond />
                  </Box>
                  <StyledMarkdown
                    allowedElements={["strong"]}
                    unwrapDisallowed={true}
                  >
                    {t(selectedItem.duration)}
                  </StyledMarkdown>
                </Typography>
                <StyledMarkdown
                  allowedElements={["strong"]}
                  unwrapDisallowed={true}
                >
                  {t("GambleSpell_desc")}
                </StyledMarkdown>
              </div>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <FormControlLabel
          control={
            <Checkbox
              checked={isMagisphere}
              onChange={handleToggleChange}
              name="isMagisphere"
              color="primary"
            />
          }
          label={t("Add as Magisphere")}
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SpellCompendiumModal;
