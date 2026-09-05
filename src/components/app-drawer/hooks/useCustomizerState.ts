import { useMemo, useState, useCallback } from "react";
import type { SyntheticEvent, ChangeEvent } from "react";
import type { Theme } from "@mui/material";
import { useThemeStore } from "../../../store/themeStore";
import type { ThemeCustomization } from "../../../themes/themeCustomization";
import { sanitizeImportedCustomization } from "../../../themes/themeCustomization";
import {
  THEMES_REGISTRY,
  STYLE_PROFILE_MAP,
} from "../../../themes/themeRegistry";
import { useCompendiumPacks } from "../../../hooks/useCompendiumPacks";

export function useCustomizerState() {
  const {
    customization,
    setCustomization,
    resetCustomization,
    selectedTheme,
    isDarkMode,
    setTheme,
    setStyleProfile,
    selectedStyleProfile,
    toggleDarkMode,
  } = useThemeStore();

  const { packs, addTheme } = useCompendiumPacks();

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [saveThemeOpen, setSaveThemeOpen] = useState(false);
  const [tempSliderValues, setTempSliderValues] = useState<
    Record<string, number>
  >({});

  const createSliderHandler = (key: keyof ThemeCustomization) => ({
    onChange: (_: Event, value: number | number[]) => {
      const finalValue = Array.isArray(value) ? value[0] : value;
      setTempSliderValues((prev) => ({ ...prev, [key]: finalValue }));
    },
    onChangeCommitted: (
      _: SyntheticEvent | Event,
      value: number | number[],
    ) => {
      const finalValue = Array.isArray(value) ? value[0] : value;
      setCustomization({ [key]: finalValue });
      setTempSliderValues((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
  });

  const baseTheme = useMemo(
    () =>
      THEMES_REGISTRY[selectedTheme]?.[isDarkMode ? "dark" : "light"] ||
      THEMES_REGISTRY.Fabula.light,
    [selectedTheme, isDarkMode],
  );

  const resolvedColors = useMemo(
    () => ({
      primary: customization.primaryColor ?? baseTheme.palette.primary.main,
      secondary:
        customization.secondaryColor ?? baseTheme.palette.secondary.main,
      ternary: customization.ternaryColor ?? baseTheme.palette.ternary.main,
      quaternary:
        customization.quaternaryColor ?? baseTheme.palette.quaternary.main,
    }),
    [customization, baseTheme.palette],
  );

  const hasCustomization = useMemo(
    () => Object.values(customization).some((value) => value !== null),
    [customization],
  );

  const isNoirStyle = selectedStyleProfile === "Noir";

  const handleColorChange = (
    field: keyof typeof customization,
    value: string,
  ) => {
    setCustomization({ [field]: value });
  };

  const handleColorReset = (field: keyof typeof customization) => {
    setCustomization({ [field]: null });
  };

  const handleThemeChange = (themeName: string) => {
    if (Object.keys(THEMES_REGISTRY).includes(themeName)) {
      setTheme(themeName as Parameters<typeof setTheme>[0]);
    }
  };

  const handleStyleProfileChange = (profileName: string) => {
    if (Object.keys(STYLE_PROFILE_MAP).includes(profileName)) {
      setStyleProfile(profileName as Parameters<typeof setStyleProfile>[0]);
    }
  };

  const handleResetAll = () => setResetConfirmOpen(true);
  const confirmReset = () => {
    resetCustomization();
    setResetConfirmOpen(false);
  };
  const cancelReset = () => setResetConfirmOpen(false);

  const handleSaveTheme = () => setSaveThemeOpen(true);
  const cancelSaveTheme = () => setSaveThemeOpen(false);
  const confirmSaveTheme = useCallback(
    async (name: string, description: string | null, packId: string) => {
      try {
        await addTheme(packId, {
          name,
          description,
          baseTheme: selectedTheme,
          styleProfile: selectedStyleProfile,
          isDarkMode,
          customization,
        });
        setSaveThemeOpen(false);
        setSnackbar(`Theme "${name}" saved`);
      } catch (e) {
        setSnackbar(e instanceof Error ? e.message : "Failed to save theme");
      }
    },
    [addTheme, selectedTheme, selectedStyleProfile, isDarkMode, customization],
  );

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(customization, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fultimator-customization-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const sanitized = sanitizeImportedCustomization(raw);
        if (Object.keys(sanitized).length > 0) {
          setCustomization(sanitized);
        } else {
          setSnackbar("Invalid customization file: no recognized fields found");
        }
      } catch {
        setSnackbar("Could not parse the selected file as JSON");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const isAccordionActive = useMemo(() => {
    return (accordionName: string): boolean => {
      switch (accordionName) {
        case "borders":
          return ["Dystopian", "Regalia"].includes(selectedStyleProfile);
        case "gradients":
          return !isNoirStyle;
        case "frameEffects":
          return ["Dystopian"].includes(selectedStyleProfile);
        case "textEffects":
          return ["Dystopian"].includes(selectedStyleProfile);
        case "surface":
          return ["Noir", "Dystopian"].includes(selectedStyleProfile);
        default:
          return false;
      }
    };
  }, [selectedStyleProfile, isNoirStyle]);

  const getProfileHighlightSx = useMemo(
    () => (profiles: string[]) => {
      const isSelected = profiles.includes(selectedStyleProfile);
      return {
        color: isSelected ? "text.primary" : "text.secondary",
        fontWeight: isSelected ? 600 : 400,
        transition: "all 0.2s ease",
      };
    },
    [selectedStyleProfile],
  );

  const getAccordionSummarySx = useMemo(
    () => (accordionName: string) => (theme: Theme) => {
      const isActive = isAccordionActive(accordionName);
      const activeBorderColor =
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.72)"
          : "rgba(0, 0, 0, 0.68)";
      return {
        borderLeft: isActive ? "3px solid" : "3px solid transparent",
        borderLeftColor: isActive ? activeBorderColor : "transparent",
        backgroundColor: isActive ? "action.selected" : "transparent",
        transition: "all 0.2s ease",
      };
    },
    [isAccordionActive],
  );

  return {
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
    isAccordionActive,
    getProfileHighlightSx,
    getAccordionSummarySx,
    resetConfirmOpen,
    snackbar,
    setSnackbar,
    packs,
    saveThemeOpen,
    handleSaveTheme,
    cancelSaveTheme,
    confirmSaveTheme,
  };
}
