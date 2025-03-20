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
import { styled } from "@mui/system";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { Close } from "@mui/icons-material";
import Diamond from "../../Diamond";
import { OffensiveSpellIcon } from "../../icons";
import { spellList } from "../../../libs/classes";

const SpellCompendiumModal = ({ open, onClose, typeName, onSave }) => {
  const { t } = useTranslate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("Elementalist");
  const [filteredSpells, setFilteredSpells] = useState([]);
  const [isMagisphere, setIsMagisphere] = useState(false);

  // Extract unique classes from spellList
  useEffect(() => {
    const uniqueClasses = [...new Set(spellList.map((spell) => spell.class))];
    setClasses(uniqueClasses);
  }, []);

  // Filter spells based on the selected class
  useEffect(() => {
    const spellsForClass = spellList.filter(
      (spell) => spell.class === selectedClass
    );
    setFilteredSpells(spellsForClass);
    setSelectedItem(spellsForClass.length > 0 ? spellsForClass[0] : null);
  }, [selectedClass]);

  // Effect to set the default selectedClass when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedClass(typeName || "Elementalist");
    }
  }, [open, typeName]);

  const handleSave = () => {
    if (selectedItem) {
      // Include isMagisphere in the selectedItem if checkbox is checked
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

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
    display: "inline",
  });

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
        <Grid container alignItems="center" justifyContent="space-between">
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
        </Grid>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container>
          <Grid item xs={4} sx={{ maxHeight: "40vh", overflowY: "auto" }}>
            <List component="nav">
              {filteredSpells.map((item, index) => (
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
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SpellCompendiumModal;
