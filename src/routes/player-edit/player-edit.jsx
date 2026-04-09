import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import BattleModeToggle from "../../components/player/playerSheet/BattleModeToggle";
import GenericRolls from "../../components/player/playerSheet/GenericRolls";
import PlayerEquipment from "../../components/player/playerSheet/PlayerEquipment";
import PlayerSpells from "../../components/player/playerSheet/PlayerSpells";
import PlayerArcana from "../../components/player/playerSheet/PlayerArcana";
import PlayerSkills from "../../components/player/playerSheet/PlayerSkills";
import PlayerNotes from "../../components/player/playerSheet/PlayerNotes";
import PlayerCompanion from "../../components/player/playerSheet/PlayerCompanion";
import { useTranslate } from "../../translation/translate";
import { styled } from "@mui/system";
import { BugReport, Save, Info, KeyboardArrowUp, FullscreenTwoTone, FullscreenExitTwoTone, Download, Lock, LockOpen } from "@mui/icons-material";
import { usePrompt } from "../../hooks/usePrompt";
import deepEqual from "deep-equal";
import html2canvas from "html2canvas";
import useDownload from "../../hooks/useDownload";
import PlayerRituals from "../../components/player/playerSheet/PlayerRituals";
import PlayerQuirk from "../../components/player/playerSheet/PlayerQuirk";
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
import PlayerLoadout from '../../components/player/playerSheet/PlayerLoadout';

export default function PlayerEdit() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const isSmallScreen = useMediaQuery("(max-width: 899px)");

  let params = useParams(); // URL parameters hook

  // UUIDs (crypto.randomUUID) come from IDB on both web and desktop.
  // Firestore auto-IDs are 20-char alphanumeric - never match the UUID pattern.
  const isLocalPlayer = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.playerId);

  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");
  const db = isLocalPlayer ? localDb : cloudDb;

  const ref = db.doc("player-personal", params.playerId);
  const activeSetDoc = (r, data) => db.setDoc(r, data);

  const { cloudUser: user } = useDatabaseContext();

  // Single hook call - both adapters are always instantiated so this is unconditionally stable.
  const [player] = db.useDocumentData(ref);

  const [isUpdated, setIsUpdated] = useState(false); // State for unsaved changes
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [playerTemp, setPlayerTemp] = useState(player);
  const [openTab, setOpenTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [battleMode, setBattleMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const [ritualClockSections, setRitualClockSections] = useState(4);
  const [ritualClockState, setRitualClockState] = useState(
    new Array(4).fill(false)
  );

  const [isSheetEditMode, setIsSheetEditMode] = useState(true);
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);
  const [download, snackbar] = useDownload();
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (playerTemp) {
      const images = document.querySelectorAll("img");
      const promises = [];

      images.forEach((image) => {
        if (!image.complete) {
          promises.push(
            new Promise((resolve) => {
              image.onload = resolve;
            })
          );
        }
      });

      Promise.all(promises).then(() => {
        setImagesLoaded(true);
      });

      // Clean up
      return () => {
        images.forEach((image) => {
          image.onload = null;
        });
      };
    }
  }, [playerTemp]);

  const takeScreenshot = async () => {
    if (!imagesLoaded) return;

    const element = document.getElementById(
      compactView ? "character-sheet-short" : "character-sheet"
    );

    if (!element) return;

    // Save original styles
    const originalWidth = element.style.width;
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;

    // 1400px for full sheet (2 columns), 600px for short sheet (1 column)
    const captureWidth = compactView ? "600px" : "1400px";

    try {
      // Temporarily apply capture styles
      element.style.width = captureWidth;
      element.style.maxHeight = "none";
      element.style.overflow = "visible";

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2,
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.default : "#ffffff",
        windowWidth: compactView ? 600 : 1400,
        onclone: (clonedDoc) => {
          fixVerticalLabels(element, clonedDoc);
        }
      });

      const imgData = canvas.toDataURL("image/png");

      // Restore original styles
      element.style.width = originalWidth;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;

      await download(imgData, playerTemp.name + "_sheet.png");
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      // Restore original styles even if there's an error
      element.style.width = originalWidth;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
    }
  };

  // Effect to update temporary Player state and check for unsaved changes
  useEffect(() => {
    if (player) {
      // Perform a deep copy of the player object
      const updatedPlayerTemp = JSON.parse(JSON.stringify(player));
      setPlayerTemp(applyPostLoadTransforms(updatedPlayerTemp));
      setIsUpdated(false);
    }
  }, [player]);

  useEffect(() => {
    if (!deepEqual(playerTemp ? applyPreSaveTransforms(playerTemp) : playerTemp, player)) {
      setIsUpdated(true);
    } else {
      setIsUpdated(false);
    }
  }, [playerTemp, player]);

  // After loading player into playerTemp, run post-load transforms (migration + rehydration).
  useEffect(() => {
    if (!playerTemp) return;
    const transformed = applyPostLoadTransforms(playerTemp);
    if (!deepEqual(transformed, playerTemp)) {
      setPlayerTemp(transformed);
    }
  }, [playerTemp?.id]); // run only when a new player is loaded, not on every change

  // Warn user when leaving the page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isUpdated) {
        console.log(3);
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isUpdated]);

  usePrompt(
    "You have unsaved changes. Are you sure you want to leave?",
    isUpdated
  );

  // Local players are always owned by whoever is running the app.
  // Cloud players require a matching Firebase UID.
  const isOwner = isLocalPlayer || Boolean(user && player && user.uid === player.uid);
  const isEditMode = isOwner && isSheetEditMode;

  const handleCtrlS = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (isOwner) {
          setIsUpdated(false);
          activeSetDoc(ref, applyPreSaveTransforms(playerTemp));
        }
      }
    },
    [ref, playerTemp, isOwner]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleCtrlS);
    return () => document.removeEventListener("keydown", handleCtrlS);
  }, [handleCtrlS]);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleTabChange = (event, newTab) => {
    setOpenTab(newTab);
    updateMaxStats();
    checkEquipment();
    setDrawerOpen(false);
  };

  const updateMaxStats = () => {
    if (playerTemp) {
      setPlayerTemp((prevPlayer) => {
        const baseMaxHP =
          prevPlayer.lvl + (prevPlayer.attributes?.might || 0) * 5;
        const baseMaxMP =
          prevPlayer.lvl + (prevPlayer.attributes?.willpower || 0) * 5;

        let hpBonus = 0;
        let mpBonus = 0;
        let ipBonus = 0;

        playerTemp.classes.forEach((cls) => {
          // Ensure playerTemp.classes exists and is an array
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

        // Guardian - Fortress Skill Bonus
        const fortressBonus = prevPlayer.classes
          .map((cls) => cls.skills)
          .flat()
          .filter((skill) => skill.specialSkill === "Fortress")
          .map((skill) => skill.currentLvl * 3)
          .reduce((a, b) => a + b, 0);
        hpBonus += fortressBonus;

        // Loremaster - Focused Skill Bonus
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

  if (!playerTemp) {
    return null;
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

        {/* Compact View Toggle - only show when on Player Sheet tab */}
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
              <Grid container spacing={1} sx={{ py: 1 }}>
                <Grid item xs={9} sm={10} md={11}>
                  <BattleModeToggle
                    battleMode={battleMode}
                    setBattleMode={setBattleMode}
                  />
                </Grid>
                <Grid item xs={3} sm={2} md={1}>
                  <GenericRolls player={playerTemp} isEditMode={isEditMode} />
                </Grid>
              </Grid>
              {!battleMode && (
                <>
                  <PlayerTraits player={playerTemp} isEditMode={isEditMode} />
                  <PlayerBonds player={playerTemp} isEditMode={isEditMode} />
                  <PlayerQuirk player={playerTemp} isEditMode={isEditMode} />
                  <PlayerRituals
                    player={playerTemp}
                    isEditMode={isEditMode}
                    clockSections={ritualClockSections}
                    setClockSections={setRitualClockSections}
                    clockState={ritualClockState}
                    setClockState={setRitualClockState}
                  />
                  <PlayerZeroPower
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
                  <PlayerNotes
                    player={playerTemp}
                    setPlayer={setPlayerTemp}
                    isEditMode={isEditMode}
                  />
                </>
              )}
              {isOwner && battleMode ? (
                <PlayerControls player={playerTemp} setPlayer={setPlayerTemp} />
              ) : null}
              {battleMode && (
                <>
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
                </>
              )}
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
          <EditPlayerQuirk
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerZeroPower
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 1 }} />
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
          <Tooltip title="Save" placement="left">
            <Fab
              color="primary"
              aria-label="save"
              onClick={() => {
                setIsUpdated(false);
                activeSetDoc(ref, applyPreSaveTransforms(playerTemp));
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
      {snackbar}
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
