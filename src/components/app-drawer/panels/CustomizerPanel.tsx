import React from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  BugReport as BugReportIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Palette as PaletteIcon,
  Restore as RestoreIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useThemeStore } from "../../../store/themeStore";
import { globalConfirm } from "../../../utility/globalConfirm";
import {
  THEMES_REGISTRY,
  STYLE_PROFILE_MAP,
} from "../../../themes/themeRegistry";
import { ColorPickerRow } from "../pickers/ColorPicker";
import { BordersAccordion } from "../accordions/BordersAccordion";
import { GradientsAccordion } from "../accordions/GradientsAccordion";
import { FrameEffectsAccordion } from "../accordions/FrameEffectsAccordion";
import { TextEffectsAccordion } from "../accordions/TextEffectsAccordion";
import { SurfaceEffectsAccordion } from "../accordions/SurfaceEffectsAccordion";
import { ResetConfirmDialog } from "../dialogs/ResetConfirmDialog";
import { SaveThemeDialog } from "../dialogs/SaveThemeDialog";
import { useCustomizerState } from "../hooks/useCustomizerState";

export const CustomizerPanel: React.FC = () => {
  const navigate = useNavigate();
  const { unsavedChanges, setCustomization } = useThemeStore();

  const handleGoToDebugMenu = async () => {
    if (unsavedChanges) {
      const ok = await globalConfirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
      if (!ok) return;
    }
    navigate("/debug-menu");
  };

  const {
    customization,
    selectedTheme,
    selectedStyleProfile,
    isDarkMode,
    toggleDarkMode,
    resolvedColors,
    hasCustomization,
    tempSliderValues,
    createSliderHandler,
    handleColorChange,
    handleColorReset,
    handleThemeChange,
    handleStyleProfileChange,
    handleResetAll,
    confirmReset,
    cancelReset,
    handleExportJSON,
    handleImportJSON,
    getProfileHighlightSx,
    getAccordionSummarySx,
    isAccordionActive,
    resetConfirmOpen,
    snackbar,
    setSnackbar,
    packs,
    saveThemeOpen,
    handleSaveTheme,
    cancelSaveTheme,
    confirmSaveTheme,
  } = useCustomizerState();

  return (
    <>
      {/* Theme & style profile */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            Theme
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}
          >
            <Tooltip
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              <Switch
                size="small"
                checked={isDarkMode}
                onChange={toggleDarkMode}
                sx={{ m: 0 }}
              />
            </Tooltip>
          </Box>
        </Box>

        <Stack spacing={1.5}>
          <FormControl fullWidth size="small">
            <InputLabel id="theme-select-label">Color Scheme</InputLabel>
            <Select
              labelId="theme-select-label"
              value={selectedTheme}
              label="Color Scheme"
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {Object.keys(THEMES_REGISTRY).map((theme) => (
                <MenuItem key={theme} value={theme}>
                  {theme}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="style-select-label">Style Profile</InputLabel>
            <Select
              labelId="style-select-label"
              value={selectedStyleProfile}
              label="Style Profile"
              onChange={(e) => handleStyleProfileChange(e.target.value)}
            >
              {Object.keys(STYLE_PROFILE_MAP).map((profile) => (
                <MenuItem key={profile} value={profile}>
                  {profile}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Divider />

      {/* Color overrides */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}
        >
          Colors
        </Typography>

        <Stack spacing={1.5}>
          {[
            { key: "primaryColor" as const, label: "Primary" },
            { key: "secondaryColor" as const, label: "Secondary" },
            { key: "ternaryColor" as const, label: "Ternary" },
            { key: "quaternaryColor" as const, label: "Quaternary" },
          ].map(({ key, label }) => (
            <ColorPickerRow
              key={key}
              label={label}
              value={
                resolvedColors[
                  key.replace("Color", "") as keyof typeof resolvedColors
                ]
              }
              isOverridden={customization[key] !== null}
              onChange={(val) => handleColorChange(key, val)}
              onReset={() => handleColorReset(key)}
            />
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Style effects */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <PaletteIcon fontSize="small" />
          Style Effects
        </Typography>

        <Stack spacing={0.5}>
          <BordersAccordion
            getProfileHighlightSx={getProfileHighlightSx}
            getAccordionSummarySx={getAccordionSummarySx}
            isAccordionActive={isAccordionActive}
            tempSliderValues={tempSliderValues}
            createSliderHandler={createSliderHandler}
          />
          <GradientsAccordion
            getProfileHighlightSx={getProfileHighlightSx}
            getAccordionSummarySx={getAccordionSummarySx}
            isAccordionActive={isAccordionActive}
            tempSliderValues={tempSliderValues}
            createSliderHandler={createSliderHandler}
          />
          <FrameEffectsAccordion
            getProfileHighlightSx={getProfileHighlightSx}
            getAccordionSummarySx={getAccordionSummarySx}
            isAccordionActive={isAccordionActive}
            tempSliderValues={tempSliderValues}
            createSliderHandler={createSliderHandler}
          />
          <TextEffectsAccordion
            getProfileHighlightSx={getProfileHighlightSx}
            getAccordionSummarySx={getAccordionSummarySx}
            isAccordionActive={isAccordionActive}
            tempSliderValues={tempSliderValues}
            createSliderHandler={createSliderHandler}
          />
          <SurfaceEffectsAccordion
            getProfileHighlightSx={getProfileHighlightSx}
            getAccordionSummarySx={getAccordionSummarySx}
            isAccordionActive={isAccordionActive}
            tempSliderValues={tempSliderValues}
            createSliderHandler={createSliderHandler}
          />
        </Stack>

        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Tooltip title="Strip box-shadow, text-shadow, and bevel borders from NPC and player sheet cards">
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Effects on actor sheets
            </Typography>
          </Tooltip>
          <Switch
            size="small"
            checked={customization.actorSheetEffectsEnabled !== false}
            onChange={(e) =>
              setCustomization({
                actorSheetEffectsEnabled: e.target.checked ? null : false,
              })
            }
          />
        </Box>
      </Box>

      <Divider />

      {/* Actions */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<BookmarkIcon />}
            onClick={handleSaveTheme}
            size="small"
          >
            Save Theme
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleResetAll}
            size="small"
            disabled={!hasCustomization}
          >
            Reset to Theme
          </Button>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportJSON}
              size="small"
              disabled={!hasCustomization}
              sx={{ flex: 1 }}
            >
              Export JSON
            </Button>
            <Button
              component="label"
              variant="outlined"
              startIcon={<FileUploadIcon />}
              size="small"
              sx={{ flex: 1 }}
            >
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                style={{ display: "none" }}
              />
            </Button>
          </Box>

          <Divider />

          <Button
            fullWidth
            variant="text"
            startIcon={<BugReportIcon />}
            onClick={handleGoToDebugMenu}
            size="small"
            color="inherit"
            sx={{ opacity: 0.5 }}
          >
            Debug Menu
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={snackbar !== null}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <ResetConfirmDialog
        open={resetConfirmOpen}
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />

      <SaveThemeDialog
        open={saveThemeOpen}
        packs={packs}
        onConfirm={confirmSaveTheme}
        onCancel={cancelSaveTheme}
      />
    </>
  );
};
