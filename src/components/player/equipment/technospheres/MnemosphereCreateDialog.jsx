import React, { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  IconButton,
  InputLabel,
  ListSubheader,
  Select,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import {
  createMnemosphereFromDef,
  getMnemosphereCost,
  getMnemosphereClassDefinition,
  MNEMOSPHERE_LEVELS,
  mnemosphereClassList,
} from "../../../../libs/mnemospheres";
import { useCompendiumPacks } from "../../../../hooks/useCompendiumPacks";

export default function MnemosphereCreateDialog({ open, onClose, onConfirm }) {
  const { t } = useTranslate();
  const { packs } = useCompendiumPacks();

  const compendiumClasses = useMemo(() => {
    const seen = new Set(mnemosphereClassList.map((c) => c.name));
    const result = [];
    for (const pack of packs) {
      for (const item of pack.items ?? []) {
        if (
          item.type === "class" &&
          item.data?.name &&
          !seen.has(item.data.name)
        ) {
          seen.add(item.data.name);
          result.push({
            name: item.data.name,
            classDef: item.data,
            packName: pack.name,
          });
        }
      }
    }
    return result;
  }, [packs]);

  const allClasses = useMemo(
    () => [
      ...mnemosphereClassList.map((c) => ({
        name: c.name,
        source: "official",
      })),
      ...compendiumClasses.map((c) => ({
        name: c.name,
        source: c.packName,
        classDef: c.classDef,
      })),
    ],
    [compendiumClasses],
  );

  const [selectedClass, setSelectedClass] = useState(
    mnemosphereClassList[0]?.name ?? "",
  );
  const [selectedLvl, setSelectedLvl] = useState(1);

  const handleConfirm = () => {
    const entry = allClasses.find((c) => c.name === selectedClass);
    const classDef =
      entry?.classDef ?? getMnemosphereClassDefinition(selectedClass);
    const mnemo = createMnemosphereFromDef(
      classDef ?? { name: selectedClass },
      selectedLvl,
    );
    onConfirm(mnemo);
    onClose();
    setSelectedClass(mnemosphereClassList[0]?.name ?? "");
    setSelectedLvl(1);
  };

  const hasCompendium = compendiumClasses.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Add Mnemosphere")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Class")}</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label={t("Class")}
              >
                {hasCompendium && (
                  <ListSubheader>{t("Official")}</ListSubheader>
                )}
                {mnemosphereClassList.map((c) => (
                  <MenuItem key={c.name} value={c.name}>
                    {t(c.name)}
                  </MenuItem>
                ))}
                {hasCompendium && (
                  <ListSubheader>{t("Compendium")}</ListSubheader>
                )}
                {compendiumClasses.map((c) => (
                  <MenuItem key={c.name} value={c.name}>
                    {c.name}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {c.packName}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Level")}</InputLabel>
              <Select
                value={selectedLvl}
                onChange={(e) => setSelectedLvl(e.target.value)}
                label={t("Level")}
              >
                {MNEMOSPHERE_LEVELS.map((lvl) => (
                  <MenuItem key={lvl} value={lvl}>
                    {lvl}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Typography variant="caption" color="text.secondary">
              {t("Cost")}: {getMnemosphereCost(selectedLvl)}z
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedClass}
        >
          {t("Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
