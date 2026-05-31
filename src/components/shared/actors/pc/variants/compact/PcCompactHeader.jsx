import React, { useEffect, useRef, useState } from "react";
import avatar_image from "/images/components/avatar.jpg";
import {
  Box,
  Grid,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  Autocomplete,
  Divider,
} from "@mui/material";
import PortraitModal from "/src/components/shared/actors/pc/panels/PortraitModal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Add, Remove, Edit as EditIcon } from "@mui/icons-material";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import CropFreeIcon from "@mui/icons-material/CropFree";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { useTranslate } from "/src/translation/translate";
import Diamond from "/src/components/Diamond";
import CustomTextarea from "/src/components/common/CustomTextarea";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import ExpIcon from "/src/components/svgs/exp.svg?react";
import ExpDisabledIcon from "/src/components/svgs/exp_disabled.svg?react";

function RenderTraits({ pc, isInteractive = false, onUpdate }) {
  const { t } = useTranslate();
  const themeOptions = [
    t("Ambition"),
    t("Anger"),
    t("Belonging"),
    t("Doubt"),
    t("Duty"),
    t("Guilt"),
    t("Hope"),
    t("Justice"),
    t("Mercy"),
    t("Vengeance"),
  ];
  const traits = [
    { key: "identity", label: t("Identity"), value: pc.info.identity },
    {
      key: "theme",
      label: t("Theme"),
      value: pc.info.theme ? t(pc.info.theme) : "",
    },
    { key: "origin", label: t("Origin"), value: pc.info.origin },
  ];

  const updateInfo = (key, value) => {
    onUpdate?.((prev) => ({
      ...prev,
      info: {
        ...prev.info,
        [key]: value,
      },
    }));
  };

  const editFieldSx = {
    "& .MuiInputBase-root": {
      minHeight: 34,
      fontSize: "0.84rem",
      borderRadius: "3px",
      backgroundColor: "background.paper",
    },
    "& .MuiInputBase-input": {
      py: 0.5,
    },
  };

  return (
    <Grid
      container
      sx={{
        alignContent: isInteractive ? "stretch" : "center",
        height: "100%",
        rowGap: isInteractive ? 0.5 : 0,
      }}
    >
      {traits.map(({ key, label, value }) => (
        <Grid
          key={label}
          sx={{
            display: "flex",
            alignItems: "center",
            marginTop: isInteractive ? 0 : 0.5,
            flexGrow: isInteractive ? 1 : undefined,
            minHeight: 0,
          }}
          size={12}
        >
          <Grid
            container
            sx={{
              alignItems: "center",
              height: isInteractive ? "100%" : "auto",
              width: "100%",
            }}
            spacing={1}
          >
            <Grid size={3}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: isInteractive ? "0.76rem" : "0.82rem",
                  lineHeight: 1.2,
                }}
              >
                {label}:
              </Typography>
            </Grid>
            <Grid size={9}>
              {isInteractive ? (
                key === "theme" ? (
                  <Autocomplete
                    fullWidth
                    freeSolo
                    size="small"
                    options={themeOptions}
                    value={pc.info.theme || ""}
                    onChange={(_, newValue) =>
                      updateInfo("theme", newValue || "")
                    }
                    onInputChange={(_, newInputValue) =>
                      updateInfo("theme", newInputValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder={label}
                        sx={editFieldSx}
                      />
                    )}
                  />
                ) : (
                  <TextField
                    value={pc.info[key] || ""}
                    onChange={(event) => updateInfo(key, event.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder={label}
                    sx={editFieldSx}
                    slotProps={{
                      htmlInput: {
                        maxLength: key === "identity" ? 300 : 50,
                      },
                    }}
                  />
                )
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.86rem",
                    lineHeight: 1.25,
                    fontStyle: value ? "normal" : "italic",
                    color: value ? "inherit" : "text.secondary",
                  }}
                >
                  {value || `No ${label.toLowerCase()}`}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
}

export default function PcCompactHeader({
  pc,
  isInteractive = false,
  onUpdate,
  characterImage,
  canLevelUpFromExp = false,
  onLevelUpRequest,
  updateMaxStats,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const headerRef = useRef(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [portraitModalOpen, setPortraitModalOpen] = useState(false);
  const [isPortraitImage, setIsPortraitImage] = useState(false);
  const [imageFitFallback, setImageFitFallback] = useState("contain");
  const [isNarrowHeader, setIsNarrowHeader] = useState(false);
  const imageFitMode =
    pc?.info?.portraitFitMode === "cover"
      ? "cover"
      : pc?.info?.portraitFitMode === "contain"
        ? "contain"
        : imageFitFallback;

  const background =
    custom.mode === "dark"
      ? `linear-gradient(90deg, ${custom.primary} 0%, ${custom.ternary} 100%)`
      : `linear-gradient(90deg, ${custom.primary} 0%, ${custom.secondary} 100%)`;

  const borderImage =
    custom.mode === "dark"
      ? `linear-gradient(45deg, ${custom.primary}, ${custom.ternary}) 1`
      : `linear-gradient(45deg, ${custom.primary}, #ffffff) 1`;

  const borderRight =
    custom.mode === "dark" ? `4px solid #1f1f1f` : `4px solid white`;

  const borderLeft =
    custom.mode === "dark"
      ? `2px solid ${custom.ternary}`
      : `2px solid ${custom.primary}`;

  const borderBottom =
    custom.mode === "dark"
      ? `2px solid ${custom.ternary}`
      : `2px solid ${custom.primary}`;

  const bumpInfoNumber = (key, delta) => {
    const current = parseInt(pc.info?.[key], 10) || 0;
    onUpdate?.((prev) => ({
      ...prev,
      info: { ...prev.info, [key]: Math.max(0, current + delta) },
    }));
  };

  const hasDescription = Boolean(pc.info?.description?.trim());
  const [descExpanded, setDescExpanded] = useState(false);
  const imgSrc = characterImage || pc.info?.imgurl || avatar_image;
  const imageColumnWidth = isPortraitImage ? "152px" : "128px";
  const topSectionHeight = { xs: "128px", sm: "144px" };
  const nameRowDirection = isNarrowHeader ? "column" : "row";
  const nameColumnSize = isNarrowHeader ? 12 : "grow";
  const metaColumnSize = isNarrowHeader ? 12 : "auto";
  const metaJustify = isNarrowHeader ? "center" : "flex-start";
  const metaWrap = isNarrowHeader ? "wrap" : "nowrap";

  useEffect(() => {
    if (!headerRef.current || typeof window.ResizeObserver === "undefined") {
      return undefined;
    }

    const resizeObserver = new window.ResizeObserver(([entry]) => {
      setIsNarrowHeader(entry.contentRect.width < 520);
    });

    resizeObserver.observe(headerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Grid ref={headerRef} container sx={{ alignItems: "stretch" }}>
      <Grid container size={12} sx={{ flexDirection: nameRowDirection }}>
        <Grid
          sx={{
            background,
            borderRight: isNarrowHeader ? "none" : borderRight,
            px: { xs: 1.5, md: 2 },
            py: { xs: 0.5, sm: 0 },
            display: "flex",
            alignItems: "center",
            minHeight: "40px",
          }}
          size={nameColumnSize}
        >
          {isInteractive ? (
            <TextField
              value={pc.name}
              onChange={(e) =>
                onUpdate?.((p) => ({ ...p, name: e.target.value }))
              }
              variant="standard"
              size="small"
              fullWidth
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiInputBase-input": {
                  color: "#fff",
                  fontFamily: "Antonio",
                  fontSize: "1.5rem",
                  fontWeight: "medium",
                  textTransform: "uppercase",
                },
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
            <Typography
              sx={{
                color: "white.main",
                fontFamily: "Antonio",
                fontSize: "1.5rem",
                fontWeight: "medium",
                textTransform: "uppercase",
              }}
            >
              {pc.name}
            </Typography>
          )}
        </Grid>
        <Grid
          sx={{
            px: 1,
            py: 0.5,
            borderLeft,
            borderBottom,
            borderImage,
            display: "flex",
            alignItems: "center",
            justifyContent: metaJustify,
            minWidth: 0,
          }}
          size={metaColumnSize}
        >
          {isInteractive ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.2,
                flexWrap: metaWrap,
                justifyContent: metaJustify,
                "& > *": { flexShrink: 0 },
              }}
            >
              {pc.info.pronouns && (
                <Typography
                  sx={{
                    fontFamily: "Antonio",
                    fontSize: "0.88rem",
                    textTransform: "uppercase",
                    mr: 0.25,
                    whiteSpace: "nowrap",
                  }}
                >
                  {pc.info.pronouns} <Diamond />
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => {
                  onUpdate?.((p) => ({ ...p, lvl: Math.max(5, p.lvl - 1) }));
                  updateMaxStats?.();
                }}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: "0.98rem",
                  fontWeight: "medium",
                  textTransform: "uppercase",
                  mx: 0.15,
                  whiteSpace: "nowrap",
                }}
              >
                {t("Lvl")} {pc.lvl}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  onUpdate?.((p) => ({ ...p, lvl: Math.min(50, p.lvl + 1) }));
                  updateMaxStats?.();
                }}
              >
                <Add fontSize="small" />
              </IconButton>
              <Diamond />
              <Tooltip
                title={canLevelUpFromExp ? t("Level Up") : t("Need 10 EXP")}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={onLevelUpRequest}
                    disabled={!canLevelUpFromExp}
                    sx={{
                      animation: canLevelUpFromExp
                        ? "flash 1s infinite"
                        : "none",
                      p: 0.25,
                    }}
                  >
                    {canLevelUpFromExp ? (
                      <ExpIcon style={{ width: "18px", height: "18px" }} />
                    ) : (
                      <ExpDisabledIcon
                        style={{ width: "18px", height: "18px" }}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: "0.86rem",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {t("Exp")}
              </Typography>
              <IconButton
                size="small"
                onClick={() => bumpInfoNumber("exp", -1)}
              >
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
                sx={{ width: "34px", mx: 0.15 }}
                slotProps={{
                  htmlInput: {
                    style: {
                      textAlign: "center",
                      fontFamily: "Antonio",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      lineHeight: 1,
                      padding: 0,
                    },
                  },
                }}
              />
              <IconButton size="small" onClick={() => bumpInfoNumber("exp", 1)}>
                <Add fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: metaJustify,
                gap: 0.35,
                flexWrap: metaWrap,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: "1.25rem",
                  fontWeight: "medium",
                  textTransform: "uppercase",
                }}
              >
                {pc.info.pronouns} <Diamond /> {t("Lvl")} {pc.lvl} <Diamond />
              </Typography>
              <Tooltip
                title={canLevelUpFromExp ? t("Level Up") : t("Need 10 EXP")}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={onLevelUpRequest}
                    disabled={!canLevelUpFromExp}
                    sx={{
                      animation: canLevelUpFromExp
                        ? "flash 1s infinite"
                        : "none",
                      p: 0.25,
                    }}
                  >
                    {canLevelUpFromExp ? (
                      <ExpIcon style={{ width: "16px", height: "16px" }} />
                    ) : (
                      <ExpDisabledIcon
                        style={{ width: "16px", height: "16px" }}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: "1.25rem",
                  fontWeight: "medium",
                  textTransform: "uppercase",
                }}
              >
                {t("Exp")} {pc.info.exp || 0}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <Box
        data-pc-compact-header-body="true"
        sx={{
          display: "flex",
          flexDirection: "column",
          width: 1,
          height: "auto",
          maxHeight: "none",
          minHeight: 0,
        }}
      >
        <Box
          data-pc-compact-header-top="true"
          sx={{
            display: "flex",
            width: 1,
            minHeight: topSectionHeight,
          }}
        >
          {/* Portrait */}
          <Box
              sx={{
                minWidth: imageColumnWidth,
                width: imageColumnWidth,
                height: "100%",
                background:
                  custom.mode === "dark"
                    ? theme.palette.background.paper
                    : "white",
                border: "1px solid #684268",
                borderTop: "none",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => isInteractive ? setPortraitModalOpen(true) : setImageDialogOpen(true)}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    custom.mode === "dark"
                      ? `linear-gradient(165deg, ${custom.primary}33 0%, ${custom.ternary}66 100%)`
                      : `linear-gradient(165deg, ${custom.primary}22 0%, ${custom.secondary}44 100%)`,
                }}
              />
              <img
                src={imgSrc}
                alt="Player Avatar"
                onLoad={(e) => {
                  const { naturalWidth, naturalHeight } = e.currentTarget;
                  setIsPortraitImage(naturalHeight > naturalWidth);
                }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: imageFitMode === "contain" ? 0 : "50%",
                  transform:
                    imageFitMode === "contain"
                      ? "translateX(-50%)"
                      : "translate(-50%, -50%)",
                  width:
                    imageFitMode === "contain"
                      ? isPortraitImage
                        ? "auto"
                        : "100%"
                      : "100%",
                  height:
                    imageFitMode === "contain"
                      ? isPortraitImage
                        ? "100%"
                        : "auto"
                      : "100%",
                  objectFit: imageFitMode === "contain" ? undefined : "cover",
                  objectPosition: "center",
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
                  zIndex: 1,
                }}
              >
                {isInteractive
                  ? <EditIcon sx={{ color: "#fff", fontSize: "1.5rem" }} />
                  : <CropFreeIcon sx={{ color: "#fff", fontSize: "1.5rem" }} />
                }
              </Box>
              <Tooltip
                title={
                  imageFitMode === "contain"
                    ? t("Switch to Cover")
                    : t("Switch to Contain")
                }
              >
                <IconButton
                  size="small"
                  data-html2canvas-ignore="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextMode =
                      imageFitMode === "contain" ? "cover" : "contain";
                    if (onUpdate) {
                      onUpdate((prev) => ({
                        ...prev,
                        info: { ...prev.info, portraitFitMode: nextMode },
                      }));
                    } else {
                      setImageFitFallback(nextMode);
                    }
                  }}
                  sx={{
                    position: "absolute",
                    right: 4,
                    bottom: 4,
                    p: 0.25,
                    zIndex: 2,
                    color: "rgba(255,255,255,0.72)",
                    backgroundColor: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    "@media print": {
                      display: "none",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.4)",
                      color: "#fff",
                    },
                  }}
                >
                  {imageFitMode === "contain" ? (
                    <CropFreeIcon sx={{ fontSize: "0.8rem" }} />
                  ) : (
                    <FitScreenIcon sx={{ fontSize: "0.8rem" }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

          <Box
            data-pc-compact-traits-wrap="true"
            sx={{
              px: 2,
              py: 0.5,
              borderBottom,
              borderImage: borderImage,
              flex: 1,
              minWidth: 0,
              fontSize: "0.80rem",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 0.5,
            }}
          >
            <Box sx={{ flexShrink: 0 }}>
              <RenderTraits
                pc={pc}
                isInteractive={isInteractive}
                onUpdate={onUpdate}
              />
            </Box>
            {(isInteractive || hasDescription) && (
              <Box
                data-pc-compact-description-wrap="true"
                sx={{
                  flex: isInteractive ? 1 : "none",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  "& .MuiFormControl-root": { width: "100%" },
                  "& textarea": { fontSize: "0.86rem", lineHeight: 1.32 },
                }}
              >
                <Divider sx={{ my: 0.5, opacity: 0.4 }} />

                {isInteractive ? (
                  <CustomTextarea
                    label={t("Description")}
                    value={pc.info.description || ""}
                    onChange={(event) =>
                      onUpdate?.((prev) => ({
                        ...prev,
                        info: { ...prev.info, description: event.target.value },
                      }))
                    }
                    minRows={2}
                    maxRows={8}
                    maxLength={2000}
                    placeholder={t("Description")}
                  />
                ) : (
                  <Box sx={{ position: "relative" }}>
                    <Box
                      data-pc-compact-description-text="true"
                      sx={{
                        overflow: "hidden",
                        maxHeight: descExpanded ? "none" : "3.6rem",
                        fontSize: "0.86rem",
                        lineHeight: 1.32,
                        transition: "max-height 0.25s ease",
                        maskImage: descExpanded
                          ? "none"
                          : "linear-gradient(to bottom, black 75%, transparent 100%)",
                        WebkitMaskImage: descExpanded
                          ? "none"
                          : "linear-gradient(to bottom, black 75%, transparent 100%)",
                      }}
                    >
                      <NotesMarkdown compact fontSize="0.86rem">
                        {pc.info.description}
                      </NotesMarkdown>
                    </Box>
                    {/* Expand/collapse toggle */}
                    <Box
                      onClick={() => setDescExpanded((v) => !v)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        mt: 0.25,
                        opacity: 0.6,
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      {descExpanded ? (
                        <ExpandLessIcon sx={{ fontSize: "1rem" }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: "1rem" }} />
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <img
            src={imgSrc}
            alt="Expanded Player Avatar"
            style={{ width: "100%", height: "auto" }}
            onClick={() => setImageDialogOpen(false)}
          />
        </Dialog>
        {isInteractive && onUpdate && (
          <PortraitModal
            open={portraitModalOpen}
            onClose={() => setPortraitModalOpen(false)}
            pc={pc}
            onUpdate={onUpdate}
          />
        )}
      </Box>

      <style>{`@keyframes flash { 0%{opacity:1} 50%{opacity:0.5} 100%{opacity:1} }`}</style>
    </Grid>
  );
}
