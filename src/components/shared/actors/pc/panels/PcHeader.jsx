import React, { useState, useRef, useLayoutEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  IconButton,
  Tooltip,
  Dialog,
} from "@mui/material";
import { Add, Remove, Edit as EditIcon } from "@mui/icons-material";
import PortraitModal from "./PortraitModal";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import CropFreeIcon from "@mui/icons-material/CropFree";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import Diamond from "../../../../Diamond";
import avatar_image from "/images/components/avatar.jpg";
import ExpIcon from "/src/components/svgs/exp.svg?react";
import ExpDisabledIcon from "/src/components/svgs/exp_disabled.svg?react";
import { StyledMarkdown } from "../shared";

const THEMES = [
  "Ambition",
  "Anger",
  "Belonging",
  "Doubt",
  "Duty",
  "Guilt",
  "Hope",
  "Justice",
  "Mercy",
  "Vengeance",
];

const ANTONIO = { fontFamily: "Antonio, fantasy, sans-serif" };
const NAME_FONT = {
  ...ANTONIO,
  fontSize: { xs: "1.15rem", sm: "1.5rem", md: "1.7rem", lg: "1.85rem" },
  fontWeight: "medium",
  textTransform: "uppercase",
};
const META_FONT = {
  ...ANTONIO,
  fontSize: { xs: "0.96rem", sm: "1.25rem", md: "1.35rem", lg: "1.45rem" },
  fontWeight: "medium",
  textTransform: "uppercase",
};
const LABEL_FONT = {
  ...ANTONIO,
  fontSize: { xs: "0.9rem", sm: "1rem" },
  textTransform: "uppercase",
  lineHeight: 1,
};
const SECTION_HEADER = {
  ...ANTONIO,
  fontSize: { xs: "0.85rem", lg: "1.16rem" },
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
const TRAIT_FONT = {
  ...ANTONIO,
  fontSize: { xs: "0.85rem", lg: "1rem" },
  textTransform: "uppercase",
};

function LevelUpButton({ canLevelUpFromExp, onLevelUpRequest, size = 18, t }) {
  return (
    <Tooltip title={canLevelUpFromExp ? t("Level Up") : t("Need 10 EXP")}>
      <span>
        <IconButton
          size="small"
          onClick={onLevelUpRequest}
          disabled={!canLevelUpFromExp}
          sx={{
            animation: canLevelUpFromExp ? "flash 1s infinite" : "none",
            p: 0.25,
          }}
        >
          {canLevelUpFromExp ? (
            <ExpIcon style={{ width: size, height: size }} />
          ) : (
            <ExpDisabledIcon style={{ width: size, height: size }} />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export function PcNameBar({
  pc,
  isInteractive = false,
  onUpdate,
  canLevelUpFromExp = false,
  onLevelUpRequest,
  updateMaxStats,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const bumpExp = (delta) => {
    const current = parseInt(pc.info?.exp, 10) || 0;
    onUpdate?.((prev) => ({
      ...prev,
      info: { ...prev.info, exp: Math.max(0, current + delta) },
    }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        "@container (max-width: 520px)": {
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          flex: 1,
          background: `linear-gradient(90deg, ${primary} 0%, ${theme.palette.secondary.main} 100%)`,
          px: { xs: 1, sm: 2 },
          py: { xs: 0.75, sm: 1, md: 1.2 },
          display: "flex",
          alignItems: "center",
        }}
      >
        {isInteractive ? (
          <TextField
            value={pc.name}
            onChange={(e) =>
              onUpdate?.((p) => ({ ...p, name: e.target.value }))
            }
            variant="standard"
            size="small"
            sx={{
              flex: 1,
              minWidth: 0,
              "& .MuiInputBase-input": { color: "#fff", ...NAME_FONT },
              "& .MuiInputBase-input:hover": { backgroundColor: "transparent" },
              "& .MuiInput-underline:before": {
                borderBottomColor: "rgba(255,255,255,0.5)",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: "#fff",
              },
              "& .MuiInput-underline:after": { borderBottomColor: "#fff" },
            }}
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
        ) : (
          <Typography sx={{ color: "#fff", ...NAME_FONT }}>
            {pc.name}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          px: { xs: 1, sm: 2 },
          py: { xs: 0.4, sm: 0.5, md: 0.65 },
          borderLeft: "2px solid #fff",
          borderBottom: `2px solid ${primary}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          "@container (max-width: 520px)": {
            borderLeft: "none",
            justifyContent: "center",
          },
        }}
      >
        {isInteractive ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.35, sm: 0.75 },
              flexWrap: "nowrap",
              "@container (max-width: 520px)": {
                flexWrap: "wrap",
                justifyContent: "center",
              },
            }}
          >
            <TextField
              value={pc.info.pronouns || ""}
              onChange={(e) =>
                onUpdate?.((p) => ({
                  ...p,
                  info: { ...p.info, pronouns: e.target.value },
                }))
              }
              variant="standard"
              size="small"
              placeholder={t("Pronouns")}
              sx={{
                width: { xs: 110, sm: 130 },
                "& .MuiInputBase-input": {
                  ...ANTONIO,
                  fontSize: { xs: "0.95rem", sm: "1.08rem" },
                  textTransform: "uppercase",
                },
              }}
            />
            <Diamond color={primary} />
            <Box
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.45 }}
            >
              <Typography sx={LABEL_FONT}>{t("Lvl")}</Typography>
              <TextField
                value={pc.lvl}
                onChange={(e) => {
                  const next = parseInt(e.target.value, 10);
                  const lvl = Number.isNaN(next)
                    ? 5
                    : Math.max(5, Math.min(50, next));
                  onUpdate?.((p) => ({ ...p, lvl }));
                  updateMaxStats?.();
                }}
                variant="standard"
                size="small"
                type="number"
                sx={{
                  width: { xs: 48, sm: 54 },
                  "& .MuiInputBase-input": {
                    ...ANTONIO,
                    fontSize: { xs: "1.2rem", sm: "1.3rem" },
                    fontWeight: "medium",
                    textAlign: "center",
                  },
                }}
                slotProps={{ htmlInput: { min: 5, max: 50 } }}
              />
            </Box>
            <Diamond color={primary} />
            <Typography sx={LABEL_FONT}>{t("Exp")}</Typography>
            <IconButton size="small" onClick={() => bumpExp(-1)}>
              <Remove fontSize="small" />
            </IconButton>
            <TextField
              value={pc.info.exp || 0}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                onUpdate?.((p) => ({
                  ...p,
                  info: {
                    ...p.info,
                    exp: Math.max(0, Number.isNaN(v) ? 0 : v),
                  },
                }));
              }}
              size="small"
              variant="standard"
              sx={{
                width: { xs: "48px", sm: "54px" },
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  ...ANTONIO,
                  fontSize: { xs: "1.2rem", sm: "1.3rem" },
                },
              }}
              slotProps={{ htmlInput: { maxLength: 2 } }}
            />
            <IconButton size="small" onClick={() => bumpExp(1)}>
              <Add fontSize="small" />
            </IconButton>
            <LevelUpButton
              canLevelUpFromExp={canLevelUpFromExp}
              onLevelUpRequest={onLevelUpRequest}
              size={18}
              t={t}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 0.35,
              flexWrap: "wrap",
              "@container (max-width: 520px)": {
                justifyContent: "center",
              },
            }}
          >
            <Typography sx={META_FONT}>
              {pc.info.pronouns && (
                <>
                  {pc.info.pronouns} <Diamond color={primary} />{" "}
                </>
              )}
              {t("Lvl")} {pc.lvl} <Diamond color={primary} />
            </Typography>
            <Typography sx={META_FONT}>
              {t("Exp")} {pc.info.exp || 0}
            </Typography>
            {onLevelUpRequest && (
              <LevelUpButton
                canLevelUpFromExp={canLevelUpFromExp}
                onLevelUpRequest={onLevelUpRequest}
                size={16}
                t={t}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}


export default function PcHeader({
  pc,
  isInteractive = false,
  onUpdate,
  characterImage,
  canLevelUpFromExp = false,
  onLevelUpRequest,
  updateMaxStats,
  hideNameBar = false,
  compactPortraitOnly = false,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showFade, setShowFade] = useState(false);
  const [portraitModalOpen, setPortraitModalOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const descRef = useRef(null);

  const themes = THEMES.map(t);
  const avatarSrc = characterImage || pc.info.imgurl || avatar_image;

  useLayoutEffect(() => {
    if (descRef.current) setShowFade(descRef.current.scrollHeight > 80);
  }, [pc.info.description]);

  if (compactPortraitOnly) {
    const fitMode =
      pc.info?.portraitFitMode === "contain" ? "contain" : "cover";
    const toggleFit = (e) => {
      e.stopPropagation();
      onUpdate?.((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          portraitFitMode: fitMode === "contain" ? "cover" : "contain",
        },
      }));
    };

    return (
      <>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            cursor: "pointer",
          }}
          onClick={() => isInteractive && onUpdate ? setPortraitModalOpen(true) : setImageDialogOpen(true)}
        >
          <img
            src={avatarSrc}
            alt="Player Avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: fitMode,
              objectPosition: "center top",
              display: "block",
            }}
          />
          <Box
            data-html2canvas-ignore="true"
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.15s",
              background: "rgba(0,0,0,0.35)",
              "&:hover": { opacity: 1 },
            }}
          >
            {isInteractive && onUpdate
              ? <EditIcon sx={{ color: "#fff", fontSize: "2rem" }} />
              : <CropFreeIcon sx={{ color: "#fff", fontSize: "2rem" }} />
            }
          </Box>
          {onUpdate && (
            <Tooltip
              title={
                fitMode === "contain"
                  ? t("Switch to Cover")
                  : t("Switch to Contain")
              }
            >
              <IconButton
                size="small"
                onClick={toggleFit}
                data-html2canvas-ignore="true"
                sx={{
                  position: "absolute",
                  right: 4,
                  bottom: 4,
                  p: 0.25,
                  color: "rgba(255,255,255,0.72)",
                  backgroundColor: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.4)",
                    color: "#fff",
                  },
                }}
              >
                {fitMode === "contain" ? (
                  <CropFreeIcon sx={{ fontSize: "0.8rem" }} />
                ) : (
                  <FitScreenIcon sx={{ fontSize: "0.8rem" }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {isInteractive && onUpdate && (
          <PortraitModal
            open={portraitModalOpen}
            onClose={() => setPortraitModalOpen(false)}
            pc={pc}
            onUpdate={onUpdate}
          />
        )}
        <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="md" fullWidth>
          <img
            src={avatarSrc}
            alt="Player Avatar"
            style={{ width: "100%", height: "auto", display: "block", cursor: "pointer" }}
            onClick={() => setImageDialogOpen(false)}
          />
        </Dialog>
      </>
    );
  }

  const inCrisis = pc.stats.hp.current <= pc.stats.hp.max / 2;

  return (
    <Box>
      {!hideNameBar && (
        <PcNameBar
          pc={pc}
          isInteractive={isInteractive}
          onUpdate={onUpdate}
          canLevelUpFromExp={canLevelUpFromExp}
          onLevelUpRequest={onLevelUpRequest}
          updateMaxStats={updateMaxStats}
        />
      )}

      <Box
        sx={{
          position: "relative",
          backgroundColor: theme.palette.background.paper,
          cursor: "pointer",
        }}
        onClick={() => isInteractive && onUpdate ? setPortraitModalOpen(true) : setImageDialogOpen(true)}
      >
        <img
          src={avatarSrc}
          alt="Player Avatar"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "320px",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
          }}
        />
        <Box
          data-html2canvas-ignore="true"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.15s",
            background: "rgba(0,0,0,0.35)",
            "&:hover": { opacity: 1 },
          }}
        >
          {isInteractive && onUpdate
            ? <EditIcon sx={{ color: "#fff", fontSize: "2rem" }} />
            : <CropFreeIcon sx={{ color: "#fff", fontSize: "2rem" }} />
          }
        </Box>
        {inCrisis && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              background: "rgba(0,0,0,0.65)",
              color: "#fff",
              textAlign: "center",
              py: "3px",
              ...ANTONIO,
              fontSize: { xs: "0.62rem", sm: "0.7rem", md: "0.78rem" },
              letterSpacing: "0.1em",
              textShadow: "0 0 4px red",
            }}
          >
            !! {t("CRISIS")} !!
          </Box>
        )}
      </Box>
      {isInteractive && onUpdate && (
        <PortraitModal
          open={portraitModalOpen}
          onClose={() => setPortraitModalOpen(false)}
          pc={pc}
          onUpdate={onUpdate}
        />
      )}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="md" fullWidth>
        <img
          src={avatarSrc}
          alt="Player Avatar"
          style={{ width: "100%", height: "auto", display: "block", cursor: "pointer" }}
          onClick={() => setImageDialogOpen(false)}
        />
      </Dialog>

      {pc.info.description && (
        <Box
          sx={{
            border: `0.5px solid ${theme.palette.divider}`,
            borderRadius: "6px",
            overflow: "hidden",
            m: 1,
          }}
        >
          <Box sx={{ background: primary, px: 1, py: "2px" }}>
            <Typography sx={{ color: custom.white, ...SECTION_HEADER }}>
              {t("Description")}
            </Typography>
          </Box>
          <Box
            ref={descRef}
            sx={{
              position: "relative",
              maxHeight: isDescExpanded ? "none" : "80px",
              overflow: "hidden",
              cursor: "pointer",
              px: 1,
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: !isDescExpanded && showFade ? "30px" : 0,
                background: `linear-gradient(to bottom, transparent, ${theme.palette.background.paper})`,
                pointerEvents: "none",
              },
            }}
            onClick={() => setIsDescExpanded((v) => !v)}
          >
            <StyledMarkdown>{pc.info.description}</StyledMarkdown>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          border: `0.5px solid ${theme.palette.divider}`,
          borderRadius: "6px",
          overflow: "hidden",
          m: 1,
        }}
      >
        <Box sx={{ background: primary, px: 1, py: "2px" }}>
          <Typography sx={{ color: custom.white, ...SECTION_HEADER }}>
            {t("Traits")}
          </Typography>
        </Box>
        <Box
          sx={{
            px: { xs: 1, md: 1.25 },
            py: { xs: "5px", md: "8px" },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: "2px 8px", md: "6px 12px" },
          }}
        >
          <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
            {isInteractive ? (
              <TextField
                fullWidth
                label={t("Identity")}
                variant="standard"
                value={pc.info.identity}
                onChange={(e) =>
                  onUpdate?.((p) => ({
                    ...p,
                    info: { ...p.info, identity: e.target.value },
                  }))
                }
                slotProps={{
                  htmlInput: {
                    maxLength: 300,
                    style: {
                      ...ANTONIO,
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                    },
                  },
                }}
              />
            ) : (
              <Typography sx={TRAIT_FONT}>
                <strong>{t("Identity")}: </strong>
                {pc.info.identity}
              </Typography>
            )}
          </Box>
          {isInteractive ? (
            <Autocomplete
              options={themes}
              value={pc.info.theme}
              onChange={(_, v) =>
                onUpdate?.((p) => ({
                  ...p,
                  info: { ...p.info, theme: v ?? "" },
                }))
              }
              onInputChange={(_, v) =>
                onUpdate?.((p) => ({ ...p, info: { ...p.info, theme: v } }))
              }
              freeSolo
              sx={{
                "& input": {
                  ...ANTONIO,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                },
              }}
              renderInput={(params) => (
                <TextField {...params} label={t("Theme")} variant="standard" />
              )}
            />
          ) : (
            <Typography sx={TRAIT_FONT}>
              <strong>{t("Theme")}: </strong>
              {t(pc.info.theme)}
            </Typography>
          )}
          {isInteractive ? (
            <TextField
              fullWidth
              label={t("Origin")}
              variant="standard"
              value={pc.info.origin}
              onChange={(e) =>
                onUpdate?.((p) => ({
                  ...p,
                  info: { ...p.info, origin: e.target.value },
                }))
              }
              slotProps={{
                htmlInput: {
                  maxLength: 50,
                  style: {
                    ...ANTONIO,
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                  },
                },
              }}
            />
          ) : (
            <Typography sx={TRAIT_FONT}>
              <strong>{t("Origin")}: </strong>
              {pc.info.origin}
            </Typography>
          )}
        </Box>
      </Box>

      <style>{`@keyframes flash { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </Box>
  );
}
