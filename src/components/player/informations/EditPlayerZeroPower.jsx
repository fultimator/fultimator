import React, { useCallback, useState } from "react";
import { Grid, TextField, useTheme, Paper } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";

const ZERO_POWER_SUBTYPES = ["zero-power", "zero-trigger", "zero-effect"];

export default function EditPlayerZeroPower({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const onChangePower = useCallback(
    (key) => (value) => {
      setPlayer((prev) => ({
        ...prev,
        zeroPower: {
          ...prev.zeroPower,
          [key]: value,
        },
      }));
    },
    [setPlayer],
  );

  const onChangeTrigger = useCallback(
    (key) => (value) => {
      setPlayer((prev) => ({
        ...prev,
        zeroPower: {
          ...prev.zeroPower,
          zeroTrigger: {
            ...(prev.zeroPower?.zeroTrigger ?? {}),
            [key]: value,
          },
        },
      }));
    },
    [setPlayer],
  );

  const onChangeEffect = useCallback(
    (key) => (value) => {
      setPlayer((prev) => ({
        ...prev,
        zeroPower: {
          ...prev.zeroPower,
          zeroEffect: {
            ...(prev.zeroPower?.zeroEffect ?? {}),
            [key]: value,
          },
        },
      }));
    },
    [setPlayer],
  );

  const handleAddFromCompendium = useCallback(
    (item) => {
      if (item.subtype === "zero-trigger") {
        setPlayer((prev) => ({
          ...prev,
          zeroPower: {
            ...prev.zeroPower,
            zeroTrigger: {
              name: item.name ?? "",
              description: item.description ?? item.effect ?? "",
            },
          },
        }));
      } else if (item.subtype === "zero-effect") {
        setPlayer((prev) => ({
          ...prev,
          zeroPower: {
            ...prev.zeroPower,
            zeroEffect: {
              name: item.name ?? "",
              description: item.description ?? item.effect ?? "",
            },
          },
        }));
      } else {
        // zero-power: populate everything
        const triggerName =
          typeof item.zeroTrigger === "string"
            ? item.zeroTrigger
            : (item.zeroTrigger?.name ?? "");
        const triggerDesc =
          typeof item.zeroTrigger === "object"
            ? (item.zeroTrigger?.description ?? "")
            : "";
        const effectName =
          typeof item.zeroEffect === "string"
            ? item.zeroEffect
            : (item.zeroEffect?.name ?? "");
        const effectDesc =
          typeof item.zeroEffect === "object"
            ? (item.zeroEffect?.description ?? "")
            : "";

        setPlayer((prev) => ({
          ...prev,
          zeroPower: {
            name: item.name ?? "",
            zeroTrigger: { name: triggerName, description: triggerDesc },
            zeroEffect: { name: effectName, description: effectDesc },
            clock: { sections: item.clock?.sections ?? 6 },
          },
        }));
      }
    },
    [setPlayer],
  );

  const zeroPower = player.zeroPower ?? {};
  const triggerName = zeroPower.zeroTrigger?.name ?? "";
  const triggerDesc = zeroPower.zeroTrigger?.description ?? "";
  const effectName = zeroPower.zeroEffect?.name ?? "";
  const effectDesc = zeroPower.zeroEffect?.description ?? "";
  const clockSections = zeroPower.clock?.sections ?? 6;

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container>
        <Grid size={12}>
          <CustomHeader
            type="top"
            headerText={t("Zero Power")}
            showIconButton={false}
            openCompendium={
              isEditMode ? () => setCompendiumOpen(true) : undefined
            }
          />
        </Grid>
        <Grid container spacing={1} sx={{ py: 1, alignItems: "center" }}>
          <Grid
            size={{
              xs: 12,
              sm: 8,
            }}
          >
            <TextField
              label={t("Zero Power Name") + ":"}
              value={zeroPower.name ?? ""}
              onChange={(e) => onChangePower("name")(e.target.value)}
              fullWidth
              slotProps={{
                input: { readOnly: !isEditMode },
                htmlInput: { maxLength: 100 },
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <TextField
              label={t("Clock Sections") + ":"}
              value={clockSections}
              onChange={(e) =>
                setPlayer((prev) => ({
                  ...prev,
                  zeroPower: {
                    ...prev.zeroPower,
                    clock: { sections: Number(e.target.value) || 6 },
                  },
                }))
              }
              type="number"
              fullWidth
              slotProps={{
                input: { readOnly: !isEditMode },
                htmlInput: { min: 2, max: 12, readOnly: !isEditMode },
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <TextField
              label={t("Trigger Name") + ":"}
              value={triggerName}
              onChange={(e) => onChangeTrigger("name")(e.target.value)}
              fullWidth
              slotProps={{
                input: { readOnly: !isEditMode },
                htmlInput: { maxLength: 100 },
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <CustomTextarea
              label={t("Trigger Description") + ":"}
              value={triggerDesc}
              onChange={(e) => onChangeTrigger("description")(e.target.value)}
              maxLength={2000}
              maxRows={6}
              readOnly={!isEditMode}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <TextField
              label={t("Effect Name") + ":"}
              value={effectName}
              onChange={(e) => onChangeEffect("name")(e.target.value)}
              fullWidth
              slotProps={{
                input: { readOnly: !isEditMode },
                htmlInput: { maxLength: 100 },
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <CustomTextarea
              label={t("Effect Description") + ":"}
              value={effectDesc}
              onChange={(e) => onChangeEffect("description")(e.target.value)}
              maxLength={2000}
              maxRows={6}
              readOnly={!isEditMode}
            />
          </Grid>
        </Grid>
      </Grid>
      {isEditMode && (
        <CompendiumViewerModal
          open={compendiumOpen}
          onClose={() => setCompendiumOpen(false)}
          onAddItem={handleAddFromCompendium}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={ZERO_POWER_SUBTYPES}
        />
      )}
    </Paper>
  );
}
