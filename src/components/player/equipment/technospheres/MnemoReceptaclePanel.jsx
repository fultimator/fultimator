import React, { useState } from "react";
import {
  Alert,
  Box,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, LinkOff } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { getIntegratedMnemoLimit } from "./sphereUtils";
import MnemosphereClassCard from "../../classes/MnemosphereClassCard";
import MnemoReceptaclePickerDialog from "./MnemoReceptaclePickerDialog";
import CustomHeader from "../../../common/CustomHeader";
import useSphereBank from "./useSphereBank";

export default function MnemoReceptaclePanel({
  player,
  setPlayer,
  readOnly = false,
}) {
  const { t } = useTranslate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  const { addFromCompendium: handleAddFromCompendium } = useSphereBank(
    player,
    setPlayer,
  );

  const eq0 = player?.equipment?.[0] ?? {};
  const mnemospheres = eq0.mnemospheres ?? [];
  const loaded = eq0.mnemoReceptacle ?? [];
  const limit = getIntegratedMnemoLimit(player?.lvl ?? 1);
  const atLimit = loaded.length >= limit;
  const overCapacity = loaded.length > limit;

  const loadedItems = loaded
    .map((id) => mnemospheres.find((m) => m.id === id))
    .filter(Boolean);

  const handleLoad = (id) => {
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

  const handleUnload = (id) => {
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

  const handleAddToBank = (item, type, options = {}) => {
    handleAddFromCompendium(item, type, options);
    const cost = options.cost ?? 0;
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
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: "secondary.main",
          mb: 2,
        }}
      >
        <CustomHeader
          type="top"
          headerText={t("Mnemosphere Receptacle")}
          icon={Add}
          rightLabel={t("Slots")}
          rightValue={loaded.length}
          rightMax={limit}
          addItem={() => setPickerOpen(true)}
          showIconButton={!readOnly}
          disableIconButton={atLimit}
          customTooltip={
            atLimit ? t("Device at capacity") : t("Load Mnemosphere")
          }
        />

        {overCapacity && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mb: 1 }}
          >
            {t("Over capacity — unload mnemospheres to match current limit")}
          </Typography>
        )}

        {loadedItems.length === 0 ? (
          <Typography variant="h3" align="center">
            {t("No mnemospheres loaded")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {loadedItems.map((m) => (
              <MnemosphereClassCard
                key={m.id}
                item={m}
                showAllSkills={!readOnly}
                isSlotted={true}
                isAccordion
                showHeaderMeta
                isExpanded={expanded === m.id}
                onToggleExpand={() =>
                  setExpanded((cur) => (cur === m.id ? null : m.id))
                }
                actions={
                  !readOnly ? (
                    <Tooltip title={t("Unload")}>
                      <IconButton
                        onClick={() => handleUnload(m.id)}
                        sx={{
                          px: 1,
                          color: "#ffffff",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.3)",
                            transition: "background-color 0.3s ease",
                          },
                        }}
                      >
                        <LinkOff fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  ) : null
                }
              />
            ))}
          </Box>
        )}
      </Paper>

      {!readOnly && (
        <MnemoReceptaclePickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          player={player}
          onLoad={handleLoad}
          onAddToBank={handleAddToBank}
        />
      )}

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
    </>
  );
}
