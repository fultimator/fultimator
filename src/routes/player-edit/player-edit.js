import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { firestore, auth } from "../../firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "@firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Divider,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid,
  Fade,
  Tooltip,
  Typography,
  Fab,
  Stack
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
import EditPlayerAffinities from "../../components/player/stats/EditPlayerAffinities";
import EditPlayerAttributes from "../../components/player/stats/EditPlayerAttributes";
import EditPlayerStats from "../../components/player/stats/EditPlayerStats";
import EditPlayerStatuses from "../../components/player/stats/EditPlayerStatuses";
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
import { BugReport, Save } from "@mui/icons-material";
import { testUsers, moderators } from "../../libs/userGroups";
import { usePrompt } from "../../hooks/usePrompt";
import deepEqual from "deep-equal";
import { useNavigate } from "react-router-dom";
import PlayerRituals from "../../components/player/playerSheet/PlayerRituals";
import PlayerQuirk from "../../components/player/playerSheet/PlayerQuirk";
import HelpFeedbackDialog from "../../components/appbar/HelpFeedbackDialog";
import PlayerGadgets from "../../components/player/playerSheet/PlayerGadgets";
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function PlayerEdit() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const isSmallScreen = useMediaQuery("(max-width: 899px)");

  let params = useParams(); // URL parameters hook
  const ref = doc(firestore, "player-personal", params.playerId); // Firestore document reference

  const [user] = useAuthState(auth); // Authentication state hook

  let canAccessTest = false;

  if (user && (testUsers.includes(user.uid) || moderators.includes(user.uid))) {
    canAccessTest = true;
  }

  const [player] = useDocumentData(ref, { idField: "id" }); // Firestore document data hook

  const [isUpdated, setIsUpdated] = useState(false); // State for unsaved changes
  const [showScrollTop] = useState(true);
  const [playerTemp, setPlayerTemp] = useState(player);
  const [openTab, setOpenTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [battleMode, setBattleMode] = useState(false);

  const [ritualClockSections, setRitualClockSections] = useState(4);
  const [ritualClockState, setRitualClockState] = useState(
    new Array(4).fill(false)
  );

  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);

  const navigate = useNavigate();

  // Effect to update temporary Player state and check for unsaved changes
  useEffect(() => {
    if (player) {
      // Perform a deep copy of the player object
      const updatedPlayerTemp = JSON.parse(JSON.stringify(player));
      setPlayerTemp(updatedPlayerTemp);
      setIsUpdated(false);
    }
  }, [player]);

  useEffect(() => {
    if (!deepEqual(playerTemp, player)) {
      setIsUpdated(true);
    } else {
      setIsUpdated(false);
    }
  }, [playerTemp, player]);

  // Warn user when leaving the page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isUpdated) {
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

  const isOwner = user?.uid === player?.uid;

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleTabChange = (event, newTab) => {
    setOpenTab(newTab);
    updateMaxStats();
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

  const handleBugDialogClose = () => {
    setIsBugDialogOpen(false);
  };

  if (!playerTemp) {
    return null;
  }

  if (!canAccessTest) {
    navigate("/pc-gallery");
    return null;
  }

  return (
    <Layout>
      <Tabs value={openTab} onChange={handleTabChange}>
        {isSmallScreen ? (
          <>
             <Box
              sx={{
                position: "fixed",
                bottom: 16,
                left: 16,
                zIndex: 1200,
                textAlign: "center"
              }}
            >
              <Fab
                onClick={toggleDrawer(true)}
                color="primary"
              >
                <Stack direction="column" alignItems="center" spacing={0.5}>
                  <MenuBookIcon />
                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                    {t("Menu")}
                  </Typography>
                </Stack>
              </Fab>
            </Box>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              sx={{ zIndex: 1300 }}
            >
              <List>
                <ListItem onClick={(e) => handleTabChange(e, 0)}>
                  <ListItemText primary={t("Player Sheet")} />
                </ListItem>
                <Divider />
                <ListItem onClick={(e) => handleTabChange(e, 1)}>
                  <ListItemText primary={t("Informations")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 2)}>
                  <ListItemText primary={t("Stats")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 3)}>
                  <ListItemText primary={t("Classes")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 4)}>
                  <ListItemText primary={t("Spells")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 5)}>
                  <ListItemText primary={t("Equipment")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 6)}>
                  <ListItemText primary={t("Notes")} />
                </ListItem>
              </List>
            </Drawer>
          </>
        ) : (
          <TabsList primary={ternary} secondary={secondary} ternary={ternary}>
            <Tab value={0}>{t("Player Sheet")}</Tab>
            <Divider orientation="vertical" flexItem />
            <Tab value={1}>{t("Informations")}</Tab>
            <Tab value={2}>{t("Stats")}</Tab>
            <Tab value={3}>{t("Classes")}</Tab>
            <Tab value={4}>{t("Spells")}</Tab>
            <Tab value={5}>{t("Equipment")}</Tab>
            <Tab value={6}>{t("Notes")}</Tab>
          </TabsList>
        )}
        <TabPanel value={0}>
          <PlayerCard
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
            isCharacterSheet={false}
          />
          <Divider sx={{ my: 1 }} />
          <PlayerNumbers player={playerTemp} isEditMode={isOwner} />
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={1} sx={{ py: 1 }}>
            <Grid item xs={9} sm={10} md={11}>
              <BattleModeToggle
                battleMode={battleMode}
                setBattleMode={setBattleMode}
              />
            </Grid>
            <Grid item xs={3} sm={2} md={1}>
              <GenericRolls player={playerTemp} isEditMode={isOwner} />
            </Grid>
          </Grid>
          {!battleMode && (
            <>
              <PlayerTraits player={playerTemp} isEditMode={isOwner} />
              <PlayerBonds player={playerTemp} isEditMode={isOwner} />
              <PlayerQuirk player={playerTemp} isEditMode={isOwner} />
              <PlayerRituals
                player={playerTemp}
                isEditMode={isOwner}
                clockSections={ritualClockSections}
                setClockSections={setRitualClockSections}
                clockState={ritualClockState}
                setClockState={setRitualClockState}
              />
              <PlayerCompanion player={playerTemp} isEditMode={isOwner} />
              <PlayerNotes player={playerTemp} isEditMode={isOwner} />
            </>
          )}
          {isOwner && battleMode ? (
            <PlayerControls player={playerTemp} setPlayer={setPlayerTemp} />
          ) : null}
          {battleMode && (
            <>
              <PlayerEquipment
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isOwner}
              />
              <PlayerSkills
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isOwner}
              />
              <PlayerSpells
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isOwner}
              />
              <PlayerArcana
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isOwner}
              />
              <PlayerGadgets
                player={playerTemp}
                setPlayer={setPlayerTemp}
                isEditMode={isOwner}
              />
            </>
          )}
        </TabPanel>
        <TabPanel value={1}>
          <EditPlayerBasics
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isOwner}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerTraits
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerBonds
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerQuirk
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
        </TabPanel>
        <TabPanel value={2}>
          <EditPlayerAttributes
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
            updateMaxStats={updateMaxStats}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerStats
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isOwner}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerAffinities
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerStatuses
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
          <Divider sx={{ my: 1 }} />
          <EditManualStats
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isOwner}
          />
        </TabPanel>
        <TabPanel value={3}>
          <EditPlayerClasses
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isOwner}
          />
        </TabPanel>
        <TabPanel value={4}>
          <EditPlayerSpells
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
        </TabPanel>
        <TabPanel value={5}>
          <EditPlayerEquipment
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
        </TabPanel>
        <TabPanel value={6}>
          <EditPlayerNotes
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
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
      {/* Save Button, shown if there are unsaved changes */}
      {isUpdated && isOwner && (
        <Grid style={{ position: "fixed", bottom: 65, right: 10, zIndex: 100 }}>
          <Fade in={showScrollTop} timeout={300}>
            <Tooltip title="Save" placement="bottom">
              <Fab
                color="primary"
                aria-label="save"
                onClick={() => {
                  setIsUpdated(false);
                  setDoc(ref, playerTemp);
                }}
                disabled={!isUpdated}
                size="medium"
                style={{
                  marginLeft: "5px",
                }}
              >
                <Save />
              </Fab>
            </Tooltip>
          </Fade>
        </Grid>
      )}
      <HelpFeedbackDialog
        open={isBugDialogOpen}
        onClose={handleBugDialogClose}
        userEmail={user.email}
        userUUID={user.uid}
        title={"Report a Bug"}
        placeholder="Please describe the bug. Please leave a message in english!"
        onSuccess={null}
        webhookUrl={process.env.REACT_APP_DISCORD_REPORT_BUG_WEBHOOK_URL}
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
    justify-content: center;
    align-content: space-between;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  `
);
