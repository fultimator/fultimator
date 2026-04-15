import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router";
import { useTranslate } from "../../translation/translate";
import { useDatabase } from "../../hooks/useDatabase";
import { useDatabaseContext } from "../../context/useDatabaseContext";
import {
  Grid,
  Button,
  Typography,
  Stack,
  IconButton,
  Fab,
  Box,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import html2canvas from "html2canvas";
import PlayerCard from "../../components/player/playerSheet/PlayerCard";
import PlayerNumbers from "../../components/player/playerSheet/PlayerNumbers";
import _PlayerTraits from "../../components/player/playerSheet/PlayerTraits";
import PlayerBonds from "../../components/player/playerSheet/PlayerBonds";
import PlayerNotes from "../../components/player/playerSheet/PlayerNotes";
import PlayerQuirk from "../../components/player/playerSheet/PlayerQuirk";
import PlayerCampActivities from "../../components/player/playerSheet/PlayerCampActivities";
import PlayerZeroPower from "../../components/player/playerSheet/PlayerZeroPower";
import PlayerOthers from "../../components/player/playerSheet/PlayerOthers";
import PlayerClasses from "../../components/player/playerSheet/PlayerClasses";
import PlayerEquipment from "../../components/player/playerSheet/PlayerEquipment";
import PlayerLoadout from "../../components/player/playerSheet/PlayerLoadout";
import PlayerVehicle from "../../components/player/playerSheet/PlayerVehicle";
import PlayerSpellsFull from "../../components/player/playerSheet/PlayerSpellsFull";
import PlayerRituals from "../../components/player/playerSheet/PlayerRituals";
import PlayerCompanion from "../../components/player/playerSheet/PlayerCompanion";
import powered_by_fu from "../powered_by_fu.png";
import Layout from "../../components/Layout";
import {
  Download,
  Lock,
  LockOpen,
  Save,
  KeyboardArrowUp,
} from "@mui/icons-material";
import PlayerCardSheet from "../../components/player/playerSheet/compact/PlayerSheetCompact";
// import { getPc } from "../../utility/db";
import { useTheme } from "@mui/material/styles";
import { FullscreenTwoTone, FullscreenExitTwoTone } from "@mui/icons-material";
import useDownload from "../../hooks/useDownload";
import { fixVerticalLabels } from "../../utility/screenshotFix";
import deepEqual from "deep-equal";
import { usePrompt } from "../../hooks/usePrompt";
import {
  applyPreSaveTransforms,
  applyPostLoadTransforms,
} from "../../components/player/playerTransforms";

export default function CharacterSheet() {
  const { t } = useTranslate();
  const theme = useTheme();
  const [download] = useDownload();
  const location = useLocation();
  const { cloudUser: user, dbMode } = useDatabaseContext();
  let params = useParams();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isLocalPlayer =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      params.playerId,
    );
  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");
  const localRef = localDb.doc("player-personal", params.playerId);
  const cloudRef = cloudDb.doc("player-personal", params.playerId);

  const [localPlayerData] = localDb.useDocumentData(localRef);
  const [cloudPlayerData] = cloudDb.useDocumentData(cloudRef);

  const requestedMode =
    location?.state?.dbMode === "local" || location?.state?.dbMode === "cloud"
      ? location.state.dbMode
      : null;

  const hasLocalPlayer = Boolean(localPlayerData);
  const hasCloudPlayer = Boolean(cloudPlayerData);

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
  const playerData = isUsingLocalDb ? localPlayerData : cloudPlayerData;
  const [player, setPlayer] = useState(null);
  const [isSheetEditMode, setIsSheetEditMode] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 250);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (playerData) {
      setPlayer(
        applyPostLoadTransforms(JSON.parse(JSON.stringify(playerData))),
      );
      setIsUpdated(false);
    }
  }, [playerData]);

  // Normalize the DB snapshot so that migration-only changes (equippedSlots,
  // slot indexes, default fields) don't register as unsaved user edits.
  const playerDataBaseline = useMemo(() => {
    if (!playerData) return null;
    return applyPreSaveTransforms(
      applyPostLoadTransforms(JSON.parse(JSON.stringify(playerData))),
    );
  }, [playerData]);

  useEffect(() => {
    if (player && playerDataBaseline) {
      if (!deepEqual(applyPreSaveTransforms(player), playerDataBaseline)) {
        setIsUpdated(true);
      } else {
        setIsUpdated(false);
      }
    }
  }, [player, playerDataBaseline]);

  usePrompt(
    "You have unsaved changes. Are you sure you want to leave?",
    isUpdated,
  );

  const isOwner =
    isUsingLocalDb || Boolean(user && player && user.uid === player.uid);
  const isEditMode = isOwner && isSheetEditMode;

  const handleSetPlayer = useCallback((newPlayerOrFn) => {
    setPlayer((prev) => {
      return typeof newPlayerOrFn === "function"
        ? newPlayerOrFn(prev)
        : newPlayerOrFn;
    });
  }, []);

  const handleSave = () => {
    if (isOwner && player) {
      db.setDoc(ref, applyPreSaveTransforms(player));
      setIsUpdated(false);
    }
  };

  const updateMaxStats = useCallback(() => {
    if (player) {
      setPlayer((prevPlayer) => {
        const lvl = Number(prevPlayer.lvl) || 0;
        const might = Number(prevPlayer.attributes?.might) || 0;
        const willpower = Number(prevPlayer.attributes?.will) || 0;

        const baseMaxHP = lvl + might * 5;
        const baseMaxMP = lvl + willpower * 5;

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

        const fortressBonus = prevPlayer.classes
          .flatMap((cls) => cls.skills || [])
          .filter((skill) => skill.specialSkill === "Fortress")
          .reduce((acc, skill) => acc + Number(skill.currentLvl) * 3, 0);
        hpBonus += fortressBonus;

        const focusedBonus = prevPlayer.classes
          .flatMap((cls) => cls.skills || [])
          .filter((skill) => skill.specialSkill === "Focused")
          .reduce((acc, skill) => acc + Number(skill.currentLvl) * 3, 0);
        mpBonus += focusedBonus;

        const maxHP = baseMaxHP + hpBonus;
        const maxMP = baseMaxMP + mpBonus;
        const maxIP = 6 + ipBonus;

        return {
          ...prevPlayer,
          stats: {
            ...prevPlayer.stats,
            hp: { ...prevPlayer.stats.hp, max: maxHP },
            mp: { ...prevPlayer.stats.mp, max: maxMP },
            ip: { ...prevPlayer.stats.ip, max: maxIP },
          },
        };
      });
    }
  }, [player]);

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [fullCharacterSheet, setFullCharacterSheet] = useState(true);

  const [ritualClockSections, setRitualClockSections] = useState(4);
  const [ritualClockState, setRitualClockState] = useState(
    new Array(4).fill(false),
  );

  useEffect(() => {
    // Ensure all images are loaded before setting imagesLoaded to true
    const images = document.querySelectorAll("img");
    const promises = [];

    images.forEach((image) => {
      if (!image.complete) {
        promises.push(
          new Promise((resolve) => {
            image.onload = resolve;
          }),
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
  }, [player]);

  const takeScreenshot = async () => {
    if (!imagesLoaded) {
      // Images are not loaded yet, prevent taking screenshot
      return;
    }

    const element = document.getElementById(
      fullCharacterSheet ? "character-sheet" : "character-sheet-short",
    );

    if (!element) return;

    // Save original styles
    const originalWidth = element.style.width;
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;

    // 1400px for full sheet (2 columns), 600px for short sheet (1 column)
    const captureWidth = fullCharacterSheet ? "1400px" : "600px";

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
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : "#ffffff",
        windowWidth: fullCharacterSheet ? 1400 : 600,
        onclone: (clonedDoc) => {
          fixVerticalLabels(element, clonedDoc);
        },
      });
      const imgData = canvas.toDataURL("image/png");

      // Restore original styles
      element.style.width = originalWidth;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;

      await download(imgData, player.name + "_sheet.png");
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      // Restore original styles even if there's an error
      element.style.width = originalWidth;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
    }
  };

  if (!player) {
    return null;
  }

  const settings = player?.settings ?? {};
  const optionalRules = {
    quirks: settings.optionalRules?.quirks ?? false,
    campActivities: settings.optionalRules?.campActivities ?? false,
    zeroPower: settings.optionalRules?.zeroPower ?? false,
    technospheres: settings.optionalRules?.technospheres ?? false,
  };

  return (
    <Layout fullWidth={true} unsavedChanges={isUpdated}>
      <Grid container spacing={1} sx={{ paddingX: 1 }}>
        <Grid size={isMobile ? 8 : 10}>
          <Button
            variant="contained"
            color="primary"
            onClick={takeScreenshot}
            style={{ marginBottom: "16px", width: "100%" }} // Add margin to separate from grid
            startIcon={<Download />}
          >
            {t("Download Character Sheet")}
          </Button>
        </Grid>
        <Grid size={isMobile ? 4 : 2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setFullCharacterSheet(!fullCharacterSheet)}
              style={{ marginBottom: "16px", width: "100%" }} // Add margin to separate from grid
              sx={{ display: isMobile ? "none" : "flex" }}
            >
              {fullCharacterSheet
                ? t("Short Character Sheet")
                : t("Full Character Sheet")}
            </Button>

            {/* Render icons for mobile */}
            {isMobile && (
              <IconButton
                onClick={() => setFullCharacterSheet(!fullCharacterSheet)}
                style={{ marginBottom: "16px" }}
              >
                {fullCharacterSheet ? (
                  <FullscreenExitTwoTone />
                ) : (
                  <FullscreenTwoTone />
                )}
              </IconButton>
            )}

            {isOwner && (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                {isUpdated && (
                  <Tooltip title={t("Save Changes")}>
                    <IconButton
                      onClick={handleSave}
                      style={{ marginBottom: "16px" }}
                      color="secondary"
                    >
                      <Save />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            )}
          </Stack>
        </Grid>
      </Grid>
      {fullCharacterSheet ? (
        <Grid container spacing={2} sx={{ padding: 1 }} id="character-sheet">
          <Grid
            container
            spacing={2}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Grid size={12}>
              <Stack direction="column" spacing={2}>
                <PlayerCard
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isOwner={isOwner}
                  isCharacterSheet={true}
                  characterImage={player.info.imgurl}
                  updateMaxStats={updateMaxStats}
                />
                <PlayerNumbers
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isOwner={isOwner}
                  isCharacterSheet={true}
                />
                {/* <PlayerTraits player={player} isCharacterSheet={true} /> */}
                <PlayerBonds
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isCharacterSheet={true}
                />
                <PlayerRituals
                  player={player}
                  isEditMode={isEditMode}
                  isCharacterSheet={true}
                  clockSections={ritualClockSections}
                  setClockSections={setRitualClockSections}
                  clockState={ritualClockState}
                  setClockState={setRitualClockState}
                />
                {optionalRules.zeroPower && (
                  <PlayerZeroPower
                    player={player}
                    setPlayer={handleSetPlayer}
                    isEditMode={isEditMode}
                  />
                )}
                {optionalRules.campActivities && (
                  <PlayerCampActivities
                    player={player}
                    setPlayer={handleSetPlayer}
                    isEditMode={isEditMode}
                  />
                )}
                <PlayerOthers
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                />
                <PlayerLoadout
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isCharacterSheet={true}
                  isOwner={isOwner}
                />
                <PlayerEquipment
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isOwner={isOwner}
                  isCharacterSheet={true}
                />
                <PlayerVehicle
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isCharacterSheet={true}
                />
                <PlayerNotes
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isCharacterSheet={true}
                />

                <PlayerSpellsFull
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isCharacterSheet={true}
                />
              </Stack>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Grid size={12}>
              <Stack direction="column" spacing={2}>
                <PlayerClasses
                  player={player}
                  setPlayer={handleSetPlayer}
                  isEditMode={isEditMode}
                  isCharacterSheet={true}
                  updateMaxStats={updateMaxStats}
                />
                {optionalRules.quirks && (
                  <PlayerQuirk
                    player={player}
                    isEditMode={isEditMode}
                    isCharacterSheet={true}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>

          <Grid size={12}>
            <PlayerCompanion
              player={player}
              setPlayer={handleSetPlayer}
              isEditMode={isEditMode}
              isCharacterSheet={true}
            />
          </Grid>
          <Grid container size={12}>
            <Grid size={4}>
              <img
                src={powered_by_fu}
                alt="Powered by Fu"
                style={{ width: "100%", maxWidth: "15rem" }}
                onLoad={() => setImagesLoaded(true)}
              />
            </Grid>
            <Grid size={4}>
              <Typography variant="h4" align="center">
                <span
                  style={{
                    fontWeight: "bolder",
                    fontSize: "1.6em",
                    textTransform: "uppercase",
                    verticalAlign: "middle",
                  }}
                >
                  {t("Made with Fultimator")}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid
          container
          sx={{
            justifyContent: "center",
            padding: 1,
          }}
        >
          <Grid container size={12}>
            <PlayerCardSheet
              player={player}
              setPlayer={handleSetPlayer}
              isEditMode={isEditMode}
              isOwner={isOwner}
              isCharacterSheet={true}
              optionalRules={optionalRules}
              characterImage={player.info.imgurl}
              id="character-sheet-short"
            />
          </Grid>
        </Grid>
      )}
      {isOwner && (
        <Box
          sx={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {showScrollTop && (
            <Tooltip title={t("Scroll to top")} placement="left">
              <Fab
                color="primary"
                size="medium"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <KeyboardArrowUp fontSize="medium" />
              </Fab>
            </Tooltip>
          )}
          <Tooltip
            title={
              isSheetEditMode
                ? t("Switch to Preview Mode")
                : t("Switch to Edit Mode")
            }
            placement="left"
          >
            <Fab
              color="primary"
              size="medium"
              onClick={() => setIsSheetEditMode(!isSheetEditMode)}
            >
              {isSheetEditMode ? (
                <LockOpen fontSize="medium" />
              ) : (
                <Lock fontSize="medium" />
              )}
            </Fab>
          </Tooltip>
        </Box>
      )}
    </Layout>
  );
}
