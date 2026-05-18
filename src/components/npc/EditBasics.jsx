import React, { useCallback, useEffect } from "react";
import { Add, Remove } from "@mui/icons-material";
import {
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { EditAttributes } from "./EditAttributes";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../translation/translate";
import CustomHeader from "../common/CustomHeader";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import { npcFieldConfig } from "../../forms/rendering/config/actorConfigs/npc";

export default function EditBasics({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
      : `linear-gradient(to right, ${theme.ternary}, transparent)`;

  const [imgUrlTemp, setImgUrlTemp] = React.useState(npc.imgurl || "");
  const [isImageError, setIsImageError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [snackOpen, setSnackOpen] = React.useState(false);
  const identityFields = React.useMemo(
    () => npcFieldConfig.filter((field) => field.group !== "basics" || field.order <= 1),
    [],
  );
  const detailFields = React.useMemo(
    () => npcFieldConfig.filter((field) => field.group !== "basics" || field.order > 1),
    [],
  );

  const checkImageSize = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        setIsImageError(true);
        setErrorMessage(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
        return false;
      }
      const blob = await response.blob();
      if (blob.size > 5 * 1024 * 1024) {
        setIsImageError(true);
        setErrorMessage("Error: Image size is too large, max 5MB");
        return false;
      }
      setIsImageError(false);
      setErrorMessage("");
      return true;
    } catch (error) {
      setIsImageError(true);
      setErrorMessage(`Error: ${error.message}`);
      return false;
    }
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <CustomHeader
          type="top"
          headerText={t("Basic Information")}
          showIconButton={false}
        />
      </Grid>

      <SchemaFieldRenderer
        config={identityFields}
        state={npc}
        onChange={setNpc}
        surface="edit"
        group="basics"
        cols={2}
      />

      <Grid size={{ xs: 12, sm: 3 }}>
        <EditLevel npc={npc} setnpc={setNpc} />
      </Grid>

      <SchemaFieldRenderer
        config={detailFields}
        state={npc}
        onChange={setNpc}
        surface="edit"
        group="basics"
        cols={2}
      />

      <Grid size={12} container spacing={2} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            label={t("Image URL") + ":"}
            value={imgUrlTemp}
            onChange={(e) => {
              setImgUrlTemp(e.target.value);
              setIsImageError(false);
              setErrorMessage("");
            }}
            fullWidth
            error={imgUrlTemp.length > 0 && isImageError}
            helperText={
              isImageError && imgUrlTemp.length > 0
                ? errorMessage
                : t(
                    "Please ensure to credit the artist in the description or notes section.",
                  )
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              checkImageSize(imgUrlTemp).then((ok) => {
                if (ok) {
                  setNpc((prev) => ({ ...prev, imgurl: imgUrlTemp }));
                  setSnackOpen(true);
                }
              });
            }}
            sx={{ height: "56px", width: "100%" }}
          >
            {t("Update Image")}
          </Button>
          <Snackbar
            open={snackOpen}
            autoHideDuration={3000}
            onClose={() => setSnackOpen(false)}
            message={t("Image uploaded successfully!")}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setImgUrlTemp("");
              setIsImageError(false);
              setErrorMessage("");
              setNpc((prev) => ({ ...prev, imgurl: "" }));
            }}
            sx={{ height: "56px", width: "100%" }}
          >
            {t("Remove Image")}
          </Button>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <EditAttributes npc={npc} setNpc={setNpc} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 1.61, background }}>
          <Typography>
            <strong>{t("Jack of All Trades")}</strong>: d8, d8, d8, d8
          </Typography>
          <Typography>
            <strong>{t("Standard")}</strong>: d10, d8, d8, d6
          </Typography>
          <Typography>
            <strong>{t("Specialized")}</strong>: d10, d10, d6, d6
          </Typography>
          <Typography>
            <strong>{t("Super Specialized")}</strong>: d12, d8, d6, d6
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "Upon reaching levels **20**, **40**, and **60**, the NPC chooses one of its Attributes and increases it by one die size(to a maximum of d12).",
                true,
              )}
            </ReactMarkdown>
          </Typography>
        </Card>
      </Grid>

      <Grid size={12}>
        <CustomHeader
          type="top"
          headerText={t("Defense Override")}
          showIconButton={false}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card sx={{ p: 2, background }}>
          <Typography variant="h6" gutterBottom>
            {t("DEF Override")}
          </Typography>
          <FormControl fullWidth>
            <FormControlLabel
              control={
                <Switch
                  checked={npc.extra?.defOverride || false}
                  onChange={(e) => {
                    setNpc((prev) => ({
                      ...prev,
                      extra: {
                        ...prev.extra,
                        defOverride: e.target.checked,
                        def: e.target.checked
                          ? prev.extra?.def || 0
                          : undefined,
                      },
                    }));
                  }}
                />
              }
              label={t("Override DEF")}
            />
          </FormControl>
          <FormControl variant="standard" fullWidth sx={{ mt: 2 }}>
            <TextField
              type="number"
              label={npc.extra?.defOverride ? t("DEF Value") : t("DEF Bonus")}
              value={npc.extra?.def || 0}
              onChange={(e) => {
                setNpc((prev) => ({
                  ...prev,
                  extra: {
                    ...prev.extra,
                    def: parseInt(e.target.value) || 0,
                  },
                }));
              }}
            />
          </FormControl>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card sx={{ p: 2, background }}>
          <Typography variant="h6" gutterBottom>
            {t("M.DEF Override")}
          </Typography>
          <FormControl fullWidth>
            <FormControlLabel
              control={
                <Switch
                  checked={npc.extra?.mDefOverride || false}
                  onChange={(e) => {
                    setNpc((prev) => ({
                      ...prev,
                      extra: {
                        ...prev.extra,
                        mDefOverride: e.target.checked,
                        mDef: e.target.checked
                          ? prev.extra?.mDef || 0
                          : undefined,
                      },
                    }));
                  }}
                />
              }
              label={t("Override M.DEF")}
            />
          </FormControl>
          <FormControl variant="standard" fullWidth sx={{ mt: 2 }}>
            <TextField
              type="number"
              label={
                npc.extra?.mDefOverride ? t("M.DEF Value") : t("M.DEF Bonus")
              }
              value={npc.extra?.mDef || 0}
              onChange={(e) => {
                setNpc((prev) => ({
                  ...prev,
                  extra: {
                    ...prev.extra,
                    mDef: parseInt(e.target.value) || 0,
                  },
                }));
              }}
            />
          </FormControl>
        </Card>
      </Grid>
    </Grid>
  );
}

function EditLevel({ npc, setnpc }) {
  const { t } = useTranslate();
  const [levelInput, setLevelInput] = React.useState(String(npc.lvl ?? ""));

  useEffect(() => {
    setLevelInput(String(npc.lvl ?? ""));
  }, [npc.lvl]);

  const normalizeLevel = (value, rank = npc.rank) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return npc.lvl;
    const min = rank === "groupvehicle" ? 1 : 5;
    const step = rank === "groupvehicle" ? 1 : 5;
    const stepped = min + Math.round((parsed - min) / step) * step;
    return Math.min(60, Math.max(min, stepped));
  };

  const commitLevel = () => {
    const next = normalizeLevel(levelInput);
    setLevelInput(String(next));
    setnpc((prev) => ({ ...prev, lvl: next }));
  };

  const onRaiseLevel = () => {
    setnpc((prev) => {
      if (prev.lvl >= 60) return prev;
      const step = prev.rank === "groupvehicle" ? 1 : 5;
      const min = prev.rank === "groupvehicle" ? 1 : 5;
      const next = min + Math.floor((prev.lvl - min) / step + 1) * step;
      const lvl = Math.min(60, next);
      setLevelInput(String(lvl));
      return { ...prev, lvl };
    });
  };

  const onLowerLevel = () => {
    setnpc((prev) => {
      const step = prev.rank === "groupvehicle" ? 1 : 5;
      const min = prev.rank === "groupvehicle" ? 1 : 5;
      if (prev.lvl <= min) return prev;
      const next = min + Math.ceil((prev.lvl - min) / step - 1) * step;
      const lvl = Math.max(min, next);
      setLevelInput(String(lvl));
      return { ...prev, lvl };
    });
  };

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        label={t("Level:")}
        size="small"
        min={5}
        max={60}
        value={levelInput}
        type="number"
        onChange={(e) => setLevelInput(e.target.value)}
        onBlur={commitLevel}
        slotProps={{
          htmlInput: {
            min: npc.rank === "groupvehicle" ? 1 : 5,
            max: 60,
            step: npc.rank === "groupvehicle" ? 1 : 5,
          },
          input: {
            startAdornment: (
              <IconButton edge="start" size="small" onClick={onLowerLevel}>
                <Remove fontSize="small" />
              </IconButton>
            ),
            endAdornment: (
              <IconButton edge="end" size="small" onClick={onRaiseLevel}>
                <Add fontSize="small" />
              </IconButton>
            ),
          },
        }}
      />
    </FormControl>
  );
}
