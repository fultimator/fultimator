import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDatabase } from "../../hooks/useDatabase";
import { useDatabaseContext } from "../../context/DatabaseContext";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Divider,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid,
  Tooltip,
  Typography,
  Fab,
  Stack,
  Paper,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
} from "@mui/material";
import { Tabs } from "@mui/base/Tabs";
import { TabsList as BaseTabsList } from "@mui/base/TabsList";
import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { Tab as BaseTab, tabClasses } from "@mui/base/Tab";
import Layout from "../../components/Layout";
import PlayerCard from "../../components/player/playerSheet/PlayerCard";
import EditPlayerBasics from "../../components/player/informations/EditPlayerBasics";
import EditPlayerTraits from "../../components/player/informations/EditPlayerTraits";
import EditPlayerNotes from "../../components/player/informations/EditPlayerNotes";
import EditPlayerBonds from "../../components/player/informations/EditPlayerBonds";
import EditPlayerQuirk from "../../components/player/informations/EditPlayerQuirk";
import EditPlayerCampActivities from "../../components/player/informations/EditPlayerCampActivities";
import EditPlayerZeroPower from "../../components/player/informations/EditPlayerZeroPower";
import EditPlayerOther from "../../components/player/informations/EditPlayerOthers";
import EditPlayerAffinities from "../../components/player/stats/EditPlayerAffinities";
import EditPlayerAttributes from "../../components/player/stats/EditPlayerAttributes";
import EditPlayerStats from "../../components/player/stats/EditPlayerStats";
import EditPlayerStatuses from "../../components/player/stats/EditPlayerStatuses";
import EditPlayerImmunities from "../../components/player/stats/EditPlayerImmunities";
import EditManualStats from "../../components/player/stats/EditManualStats";
import EditPlayerClasses from "../../components/player/classes/EditPlayerClasses";
import PlayerControls from "../../components/player/playerSheet/PlayerControls";
import EditPlayerSpells from "../../components/player/spells/EditPlayerSpells";
import EditPlayerEquipment from "../../components/player/equipment/EditPlayerEquipment";
import PlayerTraits from "../../components/player/playerSheet/PlayerTraits";
import PlayerBonds from "../../components/player/playerSheet/PlayerBonds";
import PlayerNumbers from "../../components/player/playerSheet/PlayerNumbers";
import GenericRolls from "../../components/player/playerSheet/GenericRolls";
import PlayerEquipment from "../../components/player/playerSheet/PlayerEquipment";
import PlayerSpells from "../../components/player/playerSheet/PlayerSpells";
import PlayerArcana from "../../components/player/playerSheet/PlayerArcana";
import PlayerSkills from "../../components/player/playerSheet/PlayerSkills";
import PlayerNotes from "../../components/player/playerSheet/PlayerNotes";
import PlayerCompanion from "../../components/player/playerSheet/PlayerCompanion";
import { useTranslate } from "../../translation/translate";
import { styled } from "@mui/system";
import { BugReport, Save, Info, KeyboardArrowUp, FullscreenTwoTone, FullscreenExitTwoTone, Download, Settings, Lock, LockOpen } from "@mui/icons-material";
import { usePrompt } from "../../hooks/usePrompt";
import deepEqual from "deep-equal";
import html2canvas from "html2canvas";
import useDownload from "../../hooks/useDownload";
import PlayerRituals from "../../components/player/playerSheet/PlayerRituals";
import PlayerQuirk from "../../components/player/playerSheet/PlayerQuirk";
import PlayerCampActivities from "../../components/player/playerSheet/PlayerCampActivities";
import PlayerZeroPower from "../../components/player/playerSheet/PlayerZeroPower";
import PlayerOthers from "../../components/player/playerSheet/PlayerOthers";
import HelpFeedbackDialog from "../../components/appbar/HelpFeedbackDialog";
import PlayerGadgets from "../../components/player/playerSheet/PlayerGadgets";
import PlayerMagichant from "../../components/player/playerSheet/PlayerMagichant";
import PlayerGift from "../../components/player/playerSheet/PlayerGift";
import PlayerTherioforms from "../../components/player/playerSheet/PlayerTherioforms";
import PlayerVehicle from "../../components/player/playerSheet/PlayerVehicle";
import PlayerInvoker from "../../components/player/playerSheet/PlayerInvoker";
import PlayerGourmet from "../../components/player/playerSheet/PlayerGourmet";
import PlayerDeck from "../../components/player/playerSheet/PlayerDeck.jsx";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import {
  CharacterSheetIcon,
  StatsIcon,
  ClassesIcon,
  SpellsIcon,
  EquipmentIcon,
  NotesIcon2 as NotesIcon,
} from "../../components/icons";

import PlayerSymbol from "../../components/player/playerSheet/PlayerSymbol";
import PlayerMagiseed from "../../components/player/playerSheet/PlayerMagiseed";
import PlayerDance from "../../components/player/playerSheet/PlayerDance";
import PlayerCardSheet from "../../components/player/playerSheet/compact/PlayerSheetCompact";
import { fixVerticalLabels } from "../../utility/screenshotFix";
import { isItemEquipped } from '../../components/player/equipment/slots/equipmentSlots';
import { applyPreSaveTransforms, applyPostLoadTransforms } from '../../components/player/playerTransforms';
import classList from "../../libs/classes";
import PlayerLoadout from '../../components/player/playerSheet/PlayerLoadout';
import CustomHeader from "../../components/common/CustomHeader";
import SettingRow from "../../components/common/SettingRow";

export default function PlayerEdit() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const isSmallScreen = useMediaQuery("(max-width: 899px)");
  const location = useLocation();

  const [isSpecialSkillsModalOpen, setIsSpecialSkillsModalOpen] = useState(false);
  const [isOptionalRulesModalOpen, setIsOptionalRulesModalOpen] = useState(false);

  let params = useParams(); // URL parameters hook

  // UUIDs (crypto.randomUUID) come from IDB on both web and desktop.
  // Firestore auto-IDs are 20-char alphanumeric: never match the UUID pattern.
  const isLocalPlayer = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.playerId);

  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");
  const { cloudUser: user, dbMode } = useDatabaseContext();

  const localRef = localDb.doc("player-personal", params.playerId);
  const cloudRef = cloudDb.doc("player-personal", params.playerId);

  // Both hooks are always called, then we choose the source.
  const [localPlayer, localLoading, localError] = localDb.useDocumentData(localRef);
  const [cloudPlayer, cloudLoading, cloudError] = cloudDb.useDocumentData(cloudRef);

  const requestedMode =
    location?.state?.dbMode === "local" || location?.state?.dbMode === "cloud"
      ? location.state.dbMode
      : null;

  const hasLocalPlayer = Boolean(localPlayer);
  const hasCloudPlayer = Boolean(cloudPlayer);

  let resolvedMode;
  if (requestedMode) {
    resolvedMode = requestedMode;
  } else if (hasLocalPlayer && !hasCloudPlayer) {
    resolvedMode = "local";
  } else if (hasCloudPlayer && !hasLocalPlayer) {
    resolvedMode = "cloud";
  } else if (isLocalPlayer) {
    resolvedMode = "local";
  } else {
    resolvedMode = dbMode === "local" ? "local" : "cloud";
  }

  const isUsingLocalDb = resolvedMode === "local";
  const db = isUsingLocalDb ? localDb : cloudDb;
  const ref = isUsingLocalDb ? localRef : cloudRef;
  const activeSetDoc = (r, data) => db.setDoc(r, data);
  const player = isUsingLocalDb ? localPlayer : cloudPlayer;
  const playerLoading = isUsingLocalDb ? localLoading : cloudLoading;
  const playerError = isUsingLocalDb ? localError : cloudError;

  const [isUpdated, setIsUpdated] = useState(false); // State for unsaved changes
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [playerTemp, setPlayerTemp] = useState(player);
  const [openTab, setOpenTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const [ritualClockSections, setRitualClockSections] = useState(4);
  const [ritualClockState, setRitualClockState] = useState(
    new Array(4).fill(false)
  );

  const [isSheetEditMode, setIsSheetEditMode] = useState(true);
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);

  // Local players are always owned by whoever is running the app.
  // Cloud players require a matching Firebase UID.
  const isOwner = isUsingLocalDb || Boolean(user && player && user.uid === player.uid);
  const isEditMode = isOwner && isSheetEditMode;

  const handleCtrlS = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (!isOwner) return;
        const playerToSave = {
          ...playerTemp,
          settings: {
            ...playerTemp?.settings,
            defaultView: compactView ? "compact" : "normal"
          }
        };
        activeSetDoc(ref, applyPreSaveTransforms(playerToSave));
      }
    },
    [ref, playerTemp, compactView, isOwner]
  );

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("keydown", handleCtrlS);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleCtrlS);
    };
  }, [handleCtrlS]);

  useEffect(() => {
    if (player) {
      const updatedPlayerTemp = applyPostLoadTransforms(JSON.parse(JSON.stringify(player)));
      setPlayerTemp(updatedPlayerTemp);
      setIsUpdated(false);
      setCompactView(updatedPlayerTemp?.settings?.defaultView === "compact");
    }
  }, [player]);

  const playerBaseline = useMemo(() => {
    if (!player) return null;
    return applyPreSaveTransforms(
      applyPostLoadTransforms(JSON.parse(JSON.stringify(player)))
    );
  }, [player]);

  useEffect(() => {
    const current = playerTemp ? applyPreSaveTransforms(playerTemp) : playerTemp;
    setIsUpdated(!deepEqual(current, playerBaseline));
  }, [playerTemp, playerBaseline]);

  usePrompt(t("unsaved_changes"), isUpdated);

  const [download] = useDownload();

  const takeScreenshot = async () => {
    const element = document.getElementById(compactView ? "character-sheet-short" : "character-sheet");
    const cleanup = fixVerticalLabels(element);
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2,
      backgroundColor: theme.palette.background.default,
    });
    cleanup();
    const data = canvas.toDataURL("image/png");
    download(data, `${playerTemp.name}.png`);
  };

  const handleTabChange = (event, newValue) => {
    setOpenTab(newValue);
    setDrawerOpen(false);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const updateMaxStats = () => {
    if (playerTemp) {
      setPlayerTemp((prevPlayer) => {
        const dex = prevPlayer.attributes.dexterity;
        const ins = prevPlayer.attributes.insight;
        const mig = prevPlayer.attributes.might;
        const wil = prevPlayer.attributes.will;

        const baseMaxHP = mig * 5 + prevPlayer.lvl;
        const baseMaxMP = wil * 5 + prevPlayer.lvl;

        let hpBonus = 0;
        let mpBonus = 0;
        let ipBonus = 0;

        prevPlayer.classes.forEach((cls) => {
          if (cls.benefits) {
            hpBonus += cls.benefits.hpplus || 0;
            mpBonus += cls.benefits.mpplus || 0;
            ipBonus += cls.benefits.ipplus || 0;
          }
        });

        if (prevPlayer.modifiers) {
          hpBonus += prevPlayer.modifiers.hp || 0;
          mpBonus += prevPlayer.modifiers.mp || 0;
          ipBonus += prevPlayer.modifiers.ip || 0;
        }

        // Guardian: Fortress Skill Bonus
        const fortressBonus = prevPlayer.classes
          .map((cls) => cls.skills)
          .flat()
          .filter((skill) => skill.specialSkill === "Fortress")
          .map((skill) => skill.currentLvl * 3)
          .reduce((a, b) => a + b, 0);
        hpBonus += fortressBonus;

        // Loremaster: Focused Skill Bonus
        const focusedBonus = prevPlayer.classes
          .map((cls) => cls.skills)
          .flat()
          .filter((skill) => skill.specialSkill === "Focused")
          .map((skill) => skill.currentLvl * 3)
          .reduce((a, b) => a + b, 0);
        mpBonus += focusedBonus;

        const maxHP = baseMaxHP + hpBonus;
        const maxMP = baseMaxMP + mpBonus;
        const maxIP = 6 + ipBonus;

        return {
          ...prevPlayer,
          stats: {
            hp: {
              ...prevPlayer.stats.hp,
              max: maxHP,
              current: Math.min(prevPlayer.stats.hp.current, maxHP),
            },
            mp: {
              ...prevPlayer.stats.mp,
              max: maxMP,
              current: Math.min(prevPlayer.stats.mp.current, maxMP),
            },
            ip: {
              ...prevPlayer.stats.ip,
              max: maxIP,
              current: Math.min(prevPlayer.stats.ip.current, maxIP),
            },
          },
        };
      });
    }
  };

  const checkEquipment = () => {
    if (playerTemp) {
      const hasDualShieldBearer = playerTemp.classes.some((playerClass) =>
        playerClass.skills.some(
          (skill) =>
            skill.specialSkill === "Dual Shieldbearer" && skill.currentLvl === 1
        )
      );
      
      const inv = playerTemp.equipment?.[0];
      const equippedShields =
        inv?.shields?.filter((shield) => isItemEquipped(playerTemp, shield)) || [];

      if (!hasDualShieldBearer && equippedShields.length > 1) {
        // Unequip all shields but the first one
        setPlayerTemp((prevPlayer) => {
          const inv = prevPlayer.equipment?.[0];
          if (!inv) return prevPlayer;
          const newShields = inv.shields.map((shield, index) => ({
            ...shield,
            isEquipped:
              index === inv.shields.findIndex((s) => isItemEquipped(prevPlayer, s)),
          }));

          const updatedInv = { ...inv, shields: newShields };
          return {
            ...prevPlayer,
            equipment: [updatedInv, ...(prevPlayer.equipment?.slice(1) ?? [])],
          };
        });
      }
    }
  };

  const handleBugDialogClose = () => {
    setIsBugDialogOpen(false);
  };

  const settings = playerTemp?.settings ?? {};
  const defaultView = settings.defaultView === "compact" ? "compact" : "normal";
  const optionalRules = {
    quirks: settings.optionalRules?.quirks ?? false,
    campActivities: settings.optionalRules?.campActivities ?? false,
    zeroPower: settings.optionalRules?.zeroPower ?? false,
    technospheres: settings.optionalRules?.technospheres ?? false,
  };
  const specialSkillOverrides = settings.specialSkillOverrides ?? {};

  const updatePlayerSettings = useCallback((updater) => {
    setPlayerTemp((prev) => {
      if (!prev) return prev;
      const currentSettings = prev.settings ?? {};
      const nextSettings =
        typeof updater === "function" ? updater(currentSettings) : updater;
      return { ...prev, settings: nextSettings };
    });
  }, []);

  const allSpecialSkills = useMemo(() => {
    const specialSkills = classList
      .flatMap((cls) => cls.skills ?? [])
      .map((skill) => skill.specialSkill)
      .filter(Boolean);
    return Array.from(new Set(specialSkills)).sort((a, b) => a.localeCompare(b));
  }, []);

  const activeSpecialSkillMap = useMemo(() => {
    const grouped = new Map();
    (playerTemp?.classes ?? []).forEach((cls) => {
      (cls.skills ?? []).forEach((skill) => {
        if (!skill?.specialSkill || !skill.currentLvl) return;
        const key = skill.specialSkill;
        const existing = grouped.get(key);
        if (existing) {
          existing.levels.push(skill.currentLvl);
          existing.classes.push(cls.name || t("Class"));
        } else {
          grouped.set(key, {
            name: key,
            levels: [skill.currentLvl],
            classes: [cls.name || t("Class")],
          });
        }
      });
    });

    const normalized = new Map();
    Array.from(grouped.values()).forEach((entry) => {
      normalized.set(entry.name, {
        ...entry,
        level: Math.max(...entry.levels),
        classList: Array.from(new Set(entry.classes)),
      });
    });

    return normalized;
  }, [playerTemp?.classes, t]);

  const handleDefaultViewChange = (value) => {
    updatePlayerSettings((prevSettings) => ({
      ...prevSettings,
      defaultView: value,
    }));
    setCompactView(value === "compact");
  };

  const handleOptionalRuleChange = (rule, checked) => {
    updatePlayerSettings((prevSettings) => ({
      ...prevSettings,
      optionalRules: {
        ...(prevSettings.optionalRules ?? {}),
        [rule]: checked,
      },
    }));
  };

  const handleSpecialSkillOverrideChange = (skillName, checked) => {
    updatePlayerSettings((prevSettings) => ({
      ...prevSettings,
      specialSkillOverrides: {
        ...Object.fromEntries(
          Object.entries(prevSettings.specialSkillOverrides ?? {}).filter(
            ([name, value]) => name !== skillName && value === true
          )
        ),
        ...(checked ? { [skillName]: true } : {}),
      },
    }));
  };

  if (playerLoading) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">{t("Loading player...")}</Typography>
        </Box>
      </Layout>
    );
  }

  if (playerError) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">{t("Could not load this player.")}</Typography>
        </Box>
      </Layout>
    );
  }

  if (!playerTemp) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">{t("Player not found.")}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout unsavedChanges={isUpdated}>
      <Tabs value={openTab} onChange={handleTabChange}>
        {isSmallScreen ? (
          <>
            <Drawer
              anchor="bottom"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              sx={{ zIndex: 1300 }}
            >
              <List>
                <ListItem onClick={(e) => handleTabChange(e, 0)}>
                  <CharacterSheetIcon color="black" size="1.5em" />
                  <ListItemText primary={t("Player Sheet")} sx={{ ml: 1 }} />
                </ListItem>
                <Divider />
                <ListItem onClick={(e) => handleTabChange(e, 1)}>
                  <Info />
                  <ListItemText primary={t("Informations")} sx={{ ml: 1 }} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 2)}>
                  <StatsIcon color="black" size="1.5em" />
                  <ListItemText primary={t("Stats")} sx={{ ml: 1 }} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 3)}>
                  <ClassesIcon color="black" size="1.5em" />
                  <ListItemText primary={t("Classes")} sx={{ ml: 1 }} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 4)}>
                  <SpellsIcon color="black" size="1.5em" />
                  <ListItemText primary={t("Spells")} sx={{ ml: 1 }} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 5)}>
                  <EquipmentIcon color="black" size="1.5em" />
                  <ListItemText primary={t("Equipment")} sx={{ ml: 1 }} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 6)}>
                  <NotesIcon color="black" size="1.5em" />
                  <ListItemText primary={t("Notes")} sx={{ ml: 1 }} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 7)}>
                  <Settings />
                  <ListItemText primary={t("Settings")} sx={{ ml: 1 }} />
                </ListItem>
              </List>
            </Drawer>
          </>
        ) : (
          <TabsList primary={ternary} secondary={secondary} ternary={ternary}>
            {/* spacer mirrors the toggle button to keep tabs visually centered */}
            <Box sx={{ width: 32, flexShrink: 0 }} />
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Tab value={0}>{t("Player Sheet")}</Tab>
              <Divider orientation="vertical" flexItem />
              <Tab value={1}>{t("Informations")}</Tab>
              <Tab value={2}>{t("Stats")}</Tab>
              <Tab value={3}>{t("Classes")}</Tab>
              <Tab value={4}>{t("Spells")}</Tab>
              <Tab value={5}>{t("Equipment")}</Tab>
              <Tab value={6}>{t("Notes")}</Tab>
              <Tab value={7}><Settings /></Tab>
            </Box>
            {isOwner ? (
              <Tooltip title={isSheetEditMode ? t("Switch to Preview Mode") : t("Switch to Edit Mode")}>
                <IconButton size="small" onClick={() => setIsSheetEditMode((v) => !v)} sx={{ color: "inherit", flexShrink: 0 }}>
                  {isSheetEditMode ? <LockOpen /> : <Lock />}
                </IconButton>
              </Tooltip>
            ) : (
              <Box sx={{ width: 32, flexShrink: 0 }} />
            )}
          </TabsList>
        )}

        {/* Compact View Toggle: only show when on Player Sheet tab */}
        {openTab === 0 && (
          <Grid container spacing={1} sx={{ mb: 2, paddingX: 1 }}>
            <Grid item xs={isSmallScreen ? 10 : 6}>
              <Button
                variant="contained"
                color="primary"
                onClick={takeScreenshot}
                style={{ width: "100%" }}
                startIcon={<Download />}
              >
                {t("Download Character Sheet")}
              </Button>
            </Grid>
            <Grid item xs={isSmallScreen ? 2 : 6}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setCompactView(!compactView)}
                style={{ width: "100%" }}
                sx={{ display: isSmallScreen ? "none" : "flex" }}
              >
                {compactView
                  ? t("Normal View")
                  : t("Compact View")}
              </Button>
              
              {/* Mobile icon version */}
              {isSmallScreen && (
                <IconButton
                  onClick={() => setCompactView(!compactView)}
                  color="primary"
                  sx={{ display: "flex", mx: "auto" }}
                >
                  {compactView ? (
                    <FullscreenTwoTone />
                  ) : (
                    <FullscreenExitTwoTone />
                  )}
                </IconButton>
              )}
            </Grid>
          </Grid>
        )}
        
        <TabPanel value={0}>
          {compactView ? (
            <Grid
              container
              sx={{ padding: 1 }}
              justifyContent={"center"}
            >
              <Grid container item xs={12}>
                <PlayerCardSheet
                  player={playerTemp}
                  setPlayer={setPlayerTemp}
                  isEditMode={isEditMode}
                  isCharacterSheet={true}
                  optionalRules={optionalRules}
                  characterImage={playerTemp.info.imgurl}
                  id="character-sheet-short"
                  updateMaxStats={updateMaxStats}
                  onToggleEditMode={isOwner ? () => setIsSheetEditMode((v) => !v) : undefined}
                  onAddClass={isEditMode ? () => setOpenTab(3) : undefined}
                  onAddFeature={isEditMode ? () => setOpenTab(4) : undefined}
                />
              </Grid>
            </Grid>
          ) : (
            <div id="character-sheet">
              <PlayerCard
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
                isCharacterSheet={false}
                updateMaxStats={updateMaxStats}
              />
              <Divider sx={{ my: 1 }} />
              <PlayerNumbers player={playerTemp} isEditMode={isEditMode} />
              <Divider sx={{ my: 1 }} />
              <GenericRolls player={playerTemp} isEditMode={isEditMode} />
              <Divider sx={{ my: 1 }} />
              <PlayerBonds player={playerTemp} setPlayer={setPlayerTemp} isEditMode={isEditMode} />
              <PlayerNotes
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              {isOwner && (
                <PlayerControls player={playerTemp} setPlayer={setPlayerTemp} />
              )}
              <Divider sx={{ my: 1 }} />
              <PlayerLoadout
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerEquipment
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerVehicle
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerSkills
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerSpells
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerArcana
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerRituals
                player={playerTemp}
                isEditMode={isEditMode}
                clockSections={ritualClockSections}
                setClockSections={setRitualClockSections}
                clockState={ritualClockState}
                setClockState={setRitualClockState}
              />
              {optionalRules.quirks && (
                <PlayerQuirk player={playerTemp} isEditMode={isEditMode} />
              )}
              {optionalRules.campActivities && (
                <PlayerCampActivities
                  player={playerTemp}
                  setPlayer={setPlayerTemp}
                  isEditMode={isEditMode}
                />
              )}
              {optionalRules.zeroPower && (
                <PlayerZeroPower
                  player={playerTemp}
                  setPlayer={setPlayerTemp}
                  isEditMode={isEditMode}
                />
              )}
              <PlayerGadgets
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerMagichant
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerMagiseed
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerSymbol
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerDance
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerGift
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerTherioforms
                player={playerTemp}
              />
              <PlayerGourmet
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerInvoker
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerDeck
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerOthers
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <PlayerCompanion player={playerTemp} isEditMode={isEditMode} />
            </div>
          )}
        </TabPanel>
        <TabPanel value={1}>
          <EditPlayerBasics
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerTraits
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerBonds
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
          {optionalRules.quirks && (
            <>
              <EditPlayerQuirk
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <Divider sx={{ my: 1 }} />
            </>
          )}
          {optionalRules.campActivities && (
            <>
              <EditPlayerCampActivities
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <Divider sx={{ my: 1 }} />
            </>
          )}
          {optionalRules.zeroPower && (
            <>
              <EditPlayerZeroPower
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isEditMode}
              />
              <Divider sx={{ my: 1 }} />
            </>
          )}
          <EditPlayerOther
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
        </TabPanel>
        <TabPanel value={2}>
          <EditPlayerAttributes
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
            updateMaxStats={updateMaxStats}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerStats
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerAffinities
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerStatuses
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerImmunities
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
          <EditManualStats
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isEditMode}
          />
        </TabPanel>
        <TabPanel value={3}>
          <EditPlayerClasses
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isEditMode}
          />
        </TabPanel>
        <TabPanel value={4}>
          <EditPlayerSpells
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
        </TabPanel>
        <TabPanel value={5}>
          <EditPlayerEquipment
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
        </TabPanel>
        <TabPanel value={6}>
          <EditPlayerNotes
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
        </TabPanel>
        <TabPanel value={7}>
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomHeader
                  type="top"
                  headerText={t("Settings")}
                  icon={Settings}
                  showIconButton={false}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ px: 2, pb: 2 }}>
                  <SettingRow
                    label={t("Default View")}
                    hint={t("Choose which view opens first in Player Edit.")}
                  >
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
                      <Select
                        value={defaultView}
                        onChange={(e) => handleDefaultViewChange(e.target.value)}
                      >
                        <MenuItem value="normal">{t("Normal View")}</MenuItem>
                        <MenuItem value="compact">{t("Compact View")}</MenuItem>
                      </Select>
                    </FormControl>
                  </SettingRow>

                  <SettingRow
                    label={t("Special Skills Overrides")}
                    hint={t("Open a modal with active special skills and override toggles.")}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setIsSpecialSkillsModalOpen(true)}
                    >
                      {t("Open")}
                    </Button>
                  </SettingRow>

                  <SettingRow
                    label={t("Optional Rules")}
                    hint={t("Open optional features such as Quirks, Zero Power, and Technospheres.")}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setIsOptionalRulesModalOpen(true)}
                    >
                      {t("Open")}
                    </Button>
                  </SettingRow>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
        <Button
          variant="outlined"
          startIcon={<BugReport />}
          sx={{ marginTop: "5rem" }}
          onClick={() => setIsBugDialogOpen(true)}
        >
          {t("Report a Bug")}
        </Button>
        <Box sx={{ height: "15vh" }} />
      </Tabs>

      {/* Floating Action Buttons */}
      {isSmallScreen && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 1200,
            textAlign: "center",
          }}
        >
          <Fab onClick={toggleDrawer(true)} color="primary" size="medium">
            <Stack direction="column" alignItems="center" spacing={0.5}>
              <MenuBookIcon fontSize="medium" />
              <Typography variant="caption" sx={{ fontSize: "10px" }}>
                {t("Menu")}
              </Typography>
            </Stack>
          </Fab>
        </Box>
      )}

      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1200,
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* Save Button, shown if there are unsaved changes */}
        {isUpdated && isOwner && (
          <Tooltip title={t("Save")} placement="left">
            <Fab
              color="primary"
              aria-label="save"
              onClick={() => {
                setIsUpdated(false);
                const playerToSave = {
                  ...playerTemp,
                  settings: {
                    ...playerTemp?.settings,
                    defaultView: compactView ? "compact" : "normal"
                  }
                };
                activeSetDoc(ref, applyPreSaveTransforms(playerToSave));
              }}
              size="medium"
            >
              <Save fontSize="medium" />
            </Fab>
          </Tooltip>
        )}

        {showScrollTop && (
          <Tooltip title={t("Scroll to top")} placement="left">
            <Fab
              size="medium"
              color="primary"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <KeyboardArrowUp fontSize="medium" />
            </Fab>
          </Tooltip>
        )}

        {isSmallScreen && isOwner && openTab === 0 && (
          <Tooltip title={isSheetEditMode ? t("Switch to Preview Mode") : t("Switch to Edit Mode")}>
            <Fab
              size="medium"
              onClick={() => setIsSheetEditMode((v) => !v)}
              color="primary"
            >
              {isSheetEditMode ? <LockOpen fontSize="medium" /> : <Lock fontSize="medium" />}
            </Fab>
          </Tooltip>
        )}
      </Box>

      <Dialog
        open={isSpecialSkillsModalOpen}
        onClose={() => setIsSpecialSkillsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("Special Skills Overrides")}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            {allSpecialSkills.length > 0 ? (
              allSpecialSkills.map((skillName) => {
                const activeSkill = activeSpecialSkillMap.get(skillName);
                const isActive = Boolean(activeSkill);
                return (
                  <SettingRow
                    key={skillName}
                    label={skillName}
                    hint={
                      isActive
                        ? `${t("Active in")}: ${activeSkill.classList.join(", ")} • ${t("Highest Level")}: ${activeSkill.level}`
                        : t("Not currently active. Enable to force this special skill behavior.")
                    }
                  >
                    <Checkbox
                      checked={isActive || Boolean(specialSkillOverrides[skillName])}
                      disabled={isActive}
                      onChange={(e) =>
                        handleSpecialSkillOverrideChange(skillName, e.target.checked)
                      }
                    />
                  </SettingRow>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("No special skills found in class definitions.")}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSpecialSkillsModalOpen(false)}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isOptionalRulesModalOpen}
        onClose={() => setIsOptionalRulesModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("Optional Rules")}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <SettingRow
              label={t("Quirks")}
              hint={t("Enable or disable Quirk sections in Player Sheet and edit tabs.")}
            >
              <Checkbox
                checked={optionalRules.quirks}
                onChange={(e) => handleOptionalRuleChange("quirks", e.target.checked)}
              />
            </SettingRow>

            <SettingRow
              label={t("Camp Activities")}
              hint={t("Enable or disable Camp Activities sections in Player Sheet and edit tabs.")}
            >
              <Checkbox
                checked={optionalRules.campActivities}
                onChange={(e) => handleOptionalRuleChange("campActivities", e.target.checked)}
              />
            </SettingRow>

            <SettingRow
              label={t("Zero Power")}
              hint={t("Enable or disable Zero Power sections in Player Sheet and edit tabs.")}
            >
              <Checkbox
                checked={optionalRules.zeroPower}
                onChange={(e) => handleOptionalRuleChange("zeroPower", e.target.checked)}
              />
            </SettingRow>

            <SettingRow
              label={t("Technospheres")}
              hint={t("Placeholder toggle stored in settings for future Technospheres behavior.")}
            >
              <Checkbox
                checked={optionalRules.technospheres}
                onChange={(e) => handleOptionalRuleChange("technospheres", e.target.checked)}
              />
            </SettingRow>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOptionalRulesModalOpen(false)}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>

      <HelpFeedbackDialog
        open={isBugDialogOpen}
        onClose={handleBugDialogClose}
        userEmail={user?.email ?? ""}
        userUUID={user?.uid ?? "local-user"}
        title={"Report a Bug"}
        placeholder="Please describe the bug. Please leave a message in english!"
        onSuccess={null}
        webhookUrl={import.meta.env.VITE_DISCORD_REPORT_BUG_WEBHOOK_URL}
      />
    </Layout>
  );
}

const Tab = styled(BaseTab)(({ theme }) => ({
  fontFamily: "IBM Plex Sans, sans-serif",
  color: theme.palette.text.primary,
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: "bold",
  backgroundColor: "transparent",
  width: "100%",
  lineHeight: 1.5,
  padding: "8px 12px",
  margin: "6px",
  border: "none",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:focus": {
    color: theme.palette.text.primary,
    outline: `3px solid ${theme.palette.primary.light}`,
  },
  [`&.${tabClasses.selected}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  [`&.${tabClasses.disabled}`]: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
}));

const TabPanel = styled(BaseTabPanel)(({ theme }) => ({
  width: "100%",
  fontFamily: "IBM Plex Sans, sans-serif",
  fontSize: "0.875rem",
}));

const TabsList = styled(BaseTabsList)(
  ({ primary, secondary, ternary }) => `
    min-width: 400px;
    background-color: ${primary};
    border-radius: 12px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    padding: 0 4px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  `
);
