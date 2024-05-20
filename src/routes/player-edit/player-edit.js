import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { firestore, auth } from "../../firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, setDoc, collection, addDoc } from "@firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Grid,
  Divider,
  Fab,
  Fade,
  Tooltip,
  Button,
  TextField,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormHelperText,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Download,
  Publish,
  Save,
  Share,
  ArrowUpward,
  ContentCopy,
  Image,
  HideImage,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
// import NpcUgly from "../../components/npc/Ugly";
import EditPlayerBasics from "../../components/player/EditPlayerBasics";
import EditPlayerTraits from "../../components/player/EditPlayerTraits";
import EditPlayerNotes from "../../components/player/EditPlayerNotes";
import EditPlayerBonds from "../../components/player/EditPlayerBonds";
import Probs from "../probs/probs";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { useTranslate, languageOptions } from "../../translation/translate";
import CustomHeader from "../../components/common/CustomHeader";
import TagList from "../../components/TagList";
import attributes from "../../libs/attributes";
import { styled } from "@mui/system";
import { Tabs } from "@mui/base/Tabs";
import { TabsList as BaseTabsList } from "@mui/base/TabsList";
import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { buttonClasses } from "@mui/base/Button";
import { Tab as BaseTab, tabClasses } from "@mui/base/Tab";

export default function PlayerEdit() {
  const { t } = useTranslate(); // Translation hook
  const theme = useTheme(); // Theme hook for MUI
  const primary = theme.palette.primary.main; // Primary color from theme
  const secondary = theme.palette.secondary.main; // Secondary color from theme
  const ternary = theme.palette.ternary.main;
  const isSmallScreen = useMediaQuery("(max-width: 899px)"); // Media query hook for screen size

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
          loyality: false,
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
    notes: [
      {
        name: "",
        description: "",
      },
    ],
  };

  const [playerTemp, setPlayerTemp] = useState(player); // Temporary PLAYER state
  const [openTab, setOpenTab] = useState(0); // State to track active tab index
  const [drawerOpen, setDrawerOpen] = useState(false); // Drawer state for mobile menu

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleTabChange = (event, newTab) => {
    setOpenTab(newTab);
    setDrawerOpen(false); // Close the drawer after selecting a tab
  };

  return (
    <Layout>
      <Tabs value={openTab} onChange={handleTabChange}>
        {isSmallScreen ? (
          <>
            <Button onClick={toggleDrawer(true)}>{t("Menu")}</Button>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              <List>
                <ListItem onClick={(e) => handleTabChange(e, 0)}>
                  <ListItemText primary={t("Informations")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 1)}>
                  <ListItemText primary={t("Stats")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 2)}>
                  <ListItemText primary={t("Skills")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 3)}>
                  <ListItemText primary={t("Spells")} />
                </ListItem>
                <ListItem onClick={(e) => handleTabChange(e, 4)}>
                  <ListItemText primary={t("Equipment")} />
                </ListItem>
              </List>
            </Drawer>
          </>
        ) : (
          <TabsList primary={ternary} secondary={secondary} ternary={ternary}>
            <Tab value={0}>{t("Informations")}</Tab>
            <Tab value={1}>{t("Stats")}</Tab>
            <Tab value={2}>{t("Skills")}</Tab>
            <Tab value={3}>{t("Spells")}</Tab>
            <Tab value={4}>{t("Equipment")}</Tab>
          </TabsList>
        )}
        <TabPanel value={0}>
          {/* Edit Basic Information */}
          <EditPlayerBasics player={playerTemp} setPlayer={setPlayerTemp} />
          <Divider sx={{ my: 1 }} />
          {/* Edit Traits */}
          <EditPlayerTraits player={playerTemp} setPlayer={setPlayerTemp} />
          <Divider sx={{ my: 1 }} />
          {/* Edit Bonds */}
          <EditPlayerBonds player={playerTemp} setPlayer={setPlayerTemp} />
          <Divider sx={{ my: 1 }} />
          {/* Edit Notes */}
          <EditPlayerNotes player={playerTemp} setPlayer={setPlayerTemp} />
        </TabPanel>
        <TabPanel value={1}>Stats</TabPanel>
        <TabPanel value={2}>Skills</TabPanel>
        <TabPanel value={3}>Spells</TabPanel>
        <TabPanel value={4}>Equipment</TabPanel>
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
