import React, { useState } from "react";
import {
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { TypeIcon } from "/src/components/types";
import ReactMarkdown from "react-markdown";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import { substituteKeyValues, volumes } from "./magichantVerseUtils";

export default function ChanterVerseDialog({ open, onClose, magichant, speaker, t }) {
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedKeyIdx, setSelectedKeyIdx] = useState(null);
  const [selectedToneIdx, setSelectedToneIdx] = useState(null);

  React.useEffect(() => {
    if (open) {
      setSelectedVolume(null);
      setSelectedKeyIdx(null);
      setSelectedToneIdx(null);
    }
  }, [open]);

  const keys = magichant.keys ?? [];
  const tones = magichant.tones ?? [];

  const selectedKey = selectedKeyIdx !== null ? (keys[selectedKeyIdx] ?? null) : null;
  const selectedTone = selectedToneIdx !== null ? (tones[selectedToneIdx] ?? null) : null;
  const vol = selectedVolume !== null ? volumes[selectedVolume] : null;

  const canSend = vol !== null && selectedKey !== null && selectedTone !== null;

  const resolvedToneEffect = selectedTone
    ? (selectedTone.key === "magichant_custom_name"
        ? selectedTone.effect
        : t(selectedTone.effect))
    : null;

  const effectWithKeys = resolvedToneEffect && selectedKey
    ? substituteKeyValues(resolvedToneEffect, selectedKey, t)
    : resolvedToneEffect;

  const handleSend = () => {
    const keyName = selectedKey.key === "magichant_custom_name"
      ? selectedKey.customName
      : t(selectedKey.key);
    const toneName = selectedTone.key === "magichant_custom_name"
      ? selectedTone.customName
      : t(selectedTone.key);
    const volName = t(vol.name);

    sendDisplayMessage("spell", t("Sing a Verse"), {
      speaker,
      tags: [
        `${t("magichant_volume")}: ${volName}`,
        `${t("magichant_key")}: ${keyName}`,
        `${t("magichant_tone")}: ${toneName}`,
        `${t("MP Cost")}: ${vol.mp}`,
      ],
      description: `**${t("Target")}:** ${t(vol.target)}`,
      effect: effectWithKeys,
      cost: { resource: "mp", amount: vol.mp },
    });
    onClose();
  };

  const mdInline = { p: ({ node: _n, ...props }) => <span {...props} /> };

  const sectionLabelSx = {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "text.secondary",
    mb: 0.75,
  };

  const rowSx = (selected) => ({
    px: 1.5,
    py: 0.75,
    borderRadius: 1,
    cursor: "pointer",
    border: "1px solid",
    borderColor: selected ? "primary.main" : "divider",
    backgroundColor: selected ? "action.selected" : "transparent",
    transition: "border-color 0.15s, background-color 0.15s",
    "&:hover": {
      borderColor: selected ? "primary.main" : "primary.light",
      backgroundColor: selected ? "action.selected" : "action.hover",
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", pr: 6, pb: 1 }}>
        {t("Sing a Verse")}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Volume */}
          <Box>
            <Typography sx={sectionLabelSx}>{t("magichant_volume")}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {volumes.map((v, i) => (
                <Box
                  key={i}
                  sx={rowSx(selectedVolume === i)}
                  onClick={() => setSelectedVolume(i === selectedVolume ? null : i)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 70 }}>
                      {t(v.name)}
                    </Typography>
                    <Box
                      sx={{
                        px: 0.75,
                        py: 0.1,
                        borderRadius: 0.5,
                        border: "1px solid",
                        borderColor: "primary.main",
                        color: "primary.main",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {v.mp} MP
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1, fontSize: "0.8rem" }}>
                      {t(v.target)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Key */}
          <Box>
            <Typography sx={sectionLabelSx}>{t("magichant_key")}</Typography>
            {keys.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {t("magichant_empty_keys")}
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {keys.map((k, i) => {
                  const isCustom = k.key === "magichant_custom_name";
                  const name = isCustom ? k.customName : t(k.key);
                  const type = isCustom ? k.type : t(k.type);
                  const status = isCustom ? k.status : t(k.status);
                  return (
                    <Box
                      key={i}
                      sx={rowSx(selectedKeyIdx === i)}
                      onClick={() => setSelectedKeyIdx(i === selectedKeyIdx ? null : i)}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 72 }}>
                          {name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                          {k.type && <TypeIcon type={k.type} />}
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {type}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ ml: "auto", fontSize: "0.72rem", whiteSpace: "nowrap" }}
                        >
                          {status}
                          {k.attribute ? ` · ${k.attribute}` : ""}
                          {k.recovery ? ` · ${k.recovery}` : ""}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Tone */}
          <Box>
            <Typography sx={sectionLabelSx}>{t("magichant_tone")}</Typography>
            {tones.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {t("magichant_empty_tones")}
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {tones.map((tone, i) => {
                  const isCustom = tone.key === "magichant_custom_name";
                  const name = isCustom ? tone.customName : t(tone.key);
                  const rawEffect = isCustom ? tone.effect : t(tone.effect);
                  const preview = selectedKey
                    ? substituteKeyValues(rawEffect, selectedKey, t)
                    : rawEffect;
                  return (
                    <Box
                      key={i}
                      sx={rowSx(selectedToneIdx === i)}
                      onClick={() => setSelectedToneIdx(i === selectedToneIdx ? null : i)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: preview ? 0.25 : 0 }}>
                        {name}
                      </Typography>
                      {preview && (
                        <Typography
                          variant="caption"
                          component="div"
                          color="text.secondary"
                          sx={{ lineHeight: 1.4 }}
                        >
                          <ReactMarkdown components={mdInline}>{preview}</ReactMarkdown>
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Verse preview */}
          {canSend && (
            <Box
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: "primary.main",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {t("Verse")}
                </Typography>
              </Box>
              <Box sx={{ px: 1.5, py: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>{t("Target")}:</strong>{" "}{t(vol.target)}
                </Typography>
                <Typography variant="body2" component="div">
                  <ReactMarkdown components={mdInline}>{effectWithKeys}</ReactMarkdown>
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" disabled={!canSend} onClick={handleSend}>
          {t("Send to Chat")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
