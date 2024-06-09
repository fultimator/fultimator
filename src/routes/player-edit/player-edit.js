import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { firestore, auth } from "../../firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "@firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Divider,
  Paper,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid,
  Fade,
  Tooltip,
  Fab,
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
import EditPlayerAttributes from "../../components/player/stats/EditPlayerAttributes";
import EditPlayerStats from "../../components/player/stats/EditPlayerStats";
import EditPlayerStatuses from "../../components/player/stats/EditPlayerStatuses";
import EditManualStats from "../../components/player/stats/EditManualStats";
import EditPlayerClasses from "../../components/player/classes/EditPlayerClasses";
import PlayerControls from "../../components/player/playerSheet/PlayerControls";
import EditPlayerSpells from "../../components/player/spells/EditPlayerSpells";
import EditPlayerEquipment from "../../components/player/equipment/EditPlayerEquipment";
import PlayerInfo from "../../components/player/playerSheet/PlayerInfo";
import BattleModeToggle from "../../components/player/playerSheet/BattleModeToggle";
import { useTranslate } from "../../translation/translate";
import { styled } from "@mui/system";
import { Save } from "@mui/icons-material";
import { testUsers, moderators } from "../../libs/userGroups";

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

  // Effect to update temporary Player state when Player data changes
  useEffect(() => {
    setPlayerTemp(player);
  }, [player]);

  useEffect(() => {
    if (playerTemp !== player) {
      setIsUpdated(true);
    } else {
      setIsUpdated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerTemp]);

  const isOwner = user?.uid === player?.uid;

  /*const player = {
    id: "",
    uid: "",
    name: "",
    lvl: 5,
    info: {
      pronouns: "",
      identity: "",
      theme: "",
      origin: "",
      bonds: [
        {
          name: "",
          admiration: false,
          loyalty: false,
          affection: false,
          inferiority: false,
          mistrust: false,
          hatred: false,
        },
      ],
      description: "",
      fabulapoints: 3,
      exp: 0,
      zenit: 0,
      imgurl: "",
    },
    attributes: {
      dexterity: 8,
      insight: 8,
      might: 8,
      willpower: 8,
    },
    stats: {
      hp: {
        max: 45,
        current: 45,
      },
      mp: {
        max: 45,
        current: 45,
      },
      ip: {
        max: 6,
        current: 6,
      },
    },
    statuses: {
      slow: false,
      dazed: false,
      enraged: false,
      weak: false,
      shaken: false,
      poisoned: false,
      dexUp: false,
      insUp: false,
      migUp: false,
      wlpUp: false,
    },
    classes: [],
    notes: [
      {
        name: "",
        description: "",
      },
    ],
  };*/

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleTabChange = (event, newTab) => {
    setOpenTab(newTab);
    setDrawerOpen(false);
  };

  const updateMaxStats = () => {
    if (playerTemp) {
      setPlayerTemp((prevPlayer) => {
        const baseMaxHP =
          prevPlayer.lvl + (prevPlayer.attributes?.might || 0) * 5;
        const baseMaxMP =
          prevPlayer.lvl + (prevPlayer.attributes?.insight || 0) * 5;

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

  if (!playerTemp) {
    return null;
  }

  if (!canAccessTest) {
    return (
      <Layout>
        <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
          {t("You are not authorized to access this page.")}
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout>
      <Tabs value={openTab} onChange={handleTabChange}>
        {isSmallScreen ? (
          <>
            <Button
              variant="contained"
              onClick={toggleDrawer(true)}
              sx={{ width: "100%", marginBottom: 1 }}
            >
              {t("Menu")}
            </Button>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              <List>
                <ListItem onClick={(e) => handleTabChange(e, 0)}>
                  <ListItemText primary={t("Player Sheet")} />
                </ListItem>
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
              </List>
            </Drawer>
          </>
        ) : (
          <TabsList primary={ternary} secondary={secondary} ternary={ternary}>
            <Tab value={0}>{t("Player Sheet")}</Tab>
            <Tab value={1}>{t("Informations")}</Tab>
            <Tab value={2}>{t("Stats")}</Tab>
            <Tab value={3}>{t("Classes")}</Tab>
            <Tab value={4}>{t("Spells")}</Tab>
            <Tab value={5}>{t("Equipment")}</Tab>
          </TabsList>
        )}
        <TabPanel value={0}>
          <PlayerCard
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
          <Divider sx={{ my: 1 }} />
          <BattleModeToggle
            battleMode={battleMode}
            setBattleMode={setBattleMode}
          />
          <Divider sx={{ my: 1 }} />
          {!battleMode && (
            <PlayerInfo player={playerTemp} isEditMode={isOwner} />
          )}
          {isOwner && battleMode ? (
            <PlayerControls player={playerTemp} setPlayer={setPlayerTemp} />
          ) : null}
          <Box sx={{ height: "5vh" }} />
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
          {isOwner ? (
            <>
              <Divider sx={{ my: 1 }} />
              <EditPlayerNotes player={playerTemp} setPlayer={setPlayerTemp} />
            </>
          ) : null}
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
        <TabPanel value={2}>
          <EditPlayerAttributes
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
          <Divider sx={{ my: 1 }} />
          <EditPlayerStats
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
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
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
        <TabPanel value={3}>
          <EditPlayerClasses
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
            isEditMode={isOwner}
          />
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
        <TabPanel value={4}>
          <EditPlayerSpells
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
        <TabPanel value={5}>
          <EditPlayerEquipment
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={isOwner}
          />
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
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
                style={{ marginLeft: "5px" }}
              >
                <Save />
              </Fab>
            </Tooltip>
          </Fade>
        </Grid>
      )}
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
