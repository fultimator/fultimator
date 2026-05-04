import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
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

export default function MnemosphereCreateDialog({
  open,
  onClose,
  onConfirm,
  currentZenit,
}) {
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
  const [isFree, setIsFree] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedClass(mnemosphereClassList[0]?.name ?? "");
      setSelectedLvl(1);
      setIsFree(false);
    }
  }, [open]);

  const cost = getMnemosphereCost(selectedLvl);
  const cannotAfford = !isFree && currentZenit != null && cost > currentZenit;

  const handleConfirm = () => {
    const entry = allClasses.find((c) => c.name === selectedClass);
    const classDef =
      entry?.classDef ?? getMnemosphereClassDefinition(selectedClass);
    const mnemo = {
      ...createMnemosphereFromDef(
        classDef ?? { name: selectedClass },
        selectedLvl,
      ),
      baseLvl: selectedLvl,
    };
    onConfirm(mnemo, isFree ? 0 : cost);
    onClose();
    setSelectedClass(mnemosphereClassList[0]?.name ?? "");
    setSelectedLvl(1);
    setIsFree(false);
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
              <InputLabel>{t("Base Level")}</InputLabel>
              <Select
                value={selectedLvl}
                onChange={(e) => setSelectedLvl(e.target.value)}
                label={t("Base Level")}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  size="small"
                />
              }
              label={t("Free Item?")}
            />
          </Grid>
          <Grid size={12}>
            <Typography
              variant="caption"
              color={cannotAfford ? "error" : "text.secondary"}
            >
              {t("Cost")}: {cost}z
              {currentZenit != null && (
                <>
                  {" "}
                  &nbsp;({t("Current Zenit")}: {currentZenit}z)
                </>
              )}
              {cannotAfford ? ` - ${t("Not enough Zenit")}` : ""}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedClass || cannotAfford}
        >
          {isFree ? t("Add") : t("Buy")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
