import React, { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Divider,
  Paper,
  Button,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
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
import EditPlayerClasses from "../../components/player/classes/EditPlayerClasses";
import PlayerControls from "../../components/player/playerSheet/PlayerControls";
import { useTranslate } from "../../translation/translate";
import { styled } from "@mui/system";

export default function PlayerEdit() {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const isSmallScreen = useMediaQuery("(max-width: 899px)");

  const player = {
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
  };

  const [playerTemp, setPlayerTemp] = useState(player);
  const [openTab, setOpenTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleTabChange = (event, newTab) => {
    setOpenTab(newTab);
    setDrawerOpen(false);
  };

  const updateMaxStats = () => {
    setPlayerTemp((prevPlayer) => {
      const baseMaxHP = prevPlayer.lvl + prevPlayer.attributes.might * 5;
      const baseMaxMP = prevPlayer.lvl + prevPlayer.attributes.insight * 5;

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
  };

  useEffect(() => {
    updateMaxStats();
  }, [
    playerTemp.lvl,
    playerTemp.attributes.might,
    playerTemp.attributes.insight,
    playerTemp.classes,
  ]);

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
                  <ListItemText primary={t("Skills")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 5)}>
                  <ListItemText primary={t("Spells")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 6)}>
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
            <Tab value={4}>{t("Skills")}</Tab>
            <Tab value={5}>{t("Spells")}</Tab>
            <Tab value={6}>{t("Equipment")}</Tab>
          </TabsList>
        )}
        <TabPanel value={0}>
          <PlayerCard
            player={playerTemp}
            setPlayer={setPlayerTemp}
            isEditMode={true}
          />
          <Divider sx={{ my: 1 }} />
          <PlayerControls player={playerTemp} setPlayer={setPlayerTemp} />
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
        <TabPanel value={1}>
          <EditPlayerBasics player={playerTemp} setPlayer={setPlayerTemp} />
          <Divider sx={{ my: 1 }} />
          <EditPlayerTraits player={playerTemp} setPlayer={setPlayerTemp} />
          <Divider sx={{ my: 1 }} />
          <EditPlayerBonds player={playerTemp} setPlayer={setPlayerTemp} />
          <Divider sx={{ my: 1 }} />
          <EditPlayerNotes player={playerTemp} setPlayer={setPlayerTemp} />
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
        <TabPanel value={2}>
          <EditPlayerAttributes player={playerTemp} setPlayer={setPlayerTemp} />
          <Divider sx={{ my: 1 }} />
          <EditPlayerStats player={playerTemp} setPlayer={setPlayerTemp} />
          <Divider sx={{ my: 1 }} />
          <EditPlayerStatuses player={playerTemp} setPlayer={setPlayerTemp} />
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
        <TabPanel value={3}>
          <EditPlayerClasses
            player={playerTemp}
            setPlayer={setPlayerTemp}
            updateMaxStats={updateMaxStats}
          />
          <Box sx={{ height: "5vh" }} />
        </TabPanel>
        <TabPanel value={4}>Skills</TabPanel>
        <TabPanel value={5}>Spells</TabPanel>
        <TabPanel value={6}>Equipment</TabPanel>
      </Tabs>
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
