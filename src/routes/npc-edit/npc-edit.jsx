import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router";
import { useDatabase } from "../../hooks/useDatabase";
import { useDatabaseContext } from "../../context/useDatabaseContext";
import {
  useDrawerScrollTop,
  useDrawerSave,
} from "../../hooks/useDrawerActions";
import { useThemeStore } from "../../store/themeStore";
import {
  TAB_RAIL_WIDTH,
  APP_DRAWER_WIDTH,
} from "../../components/app-drawer/constants";
import {
  BottomNavigation,
  BottomNavigationAction,
  Grid,
  Divider,
  Fab,
  Tooltip,
  IconButton,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  AutoFixHigh,
  FlashOn,
  Home,
  Psychology,
  Shield,
  Download,
  Save,
  Share,
  ContentCopy,
  QueryStats,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import NpcActorCard from "../../components/shared/actors/npc/NpcActorCard";
// import NpcUgly from "../../components/npc/Ugly";
import EditBasics from "../../components/npc/EditBasics";
import ExplainSkills from "../../components/npc/ExplainSkills";
import EditAttacks from "../../components/npc/EditAttacks";
import EditWeaponAttacks from "../../components/npc/EditWeaponAttacks";
import EditAffinities from "../../components/npc/EditAffinities";
import EditSpecial from "../../components/npc/EditSpecial";
import ExplainAffinities from "../../components/npc/ExplainAffinities";
import EditExtra from "../../components/npc/EditExtra";
import EditSpells from "../../components/npc/EditSpells";
import EditActions from "../../components/npc/EditActions";
import EditNotes from "../../components/npc/EditNotes";
import EditRareGear from "../../components/npc/EditRareGear";
import EditPublish from "../../components/npc/EditPublish";
import Probs from "../probs/probs";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { useTranslate } from "../../translation/translate";
import CustomHeader from "../../components/common/CustomHeader";
import TagList from "../../components/TagList";
import { moderators } from "../../libs/userGroups";
import blacklist from "../../translation/blacklist.json";
import deepEqual from "deep-equal";
import {
  applyNpcPostLoadTransforms,
  applyNpcPreSaveTransforms,
} from "../../libs/actor";
import { NpcProvider } from "../../components/npc/NpcContext";

// Combine all blacklisted names into a single array
const mergedBlacklistNames = blacklist.flatMap((item) => Object.values(item));

// Function to check if the NPC name is blacklisted
const isBlacklisted = (npcName) => {
  const lowerCaseNpcName = npcName.toLowerCase();
  return mergedBlacklistNames.some(
    (blacklistedName) => blacklistedName.toLowerCase() === lowerCaseNpcName,
  );
};

export default function NpcEdit() {
  const { t } = useTranslate(); // Translation hook
  const theme = useTheme(); // Theme hook for MUI
  const secondary = theme.palette.secondary.main; // Secondary color from theme
  const isSmallScreen = useMediaQuery("(max-width: 899px)"); // Media query hook for screen size

  let params = useParams(); // URL parameters hook
  const location = useLocation(); // Location hook for getting URL

  // UUIDs (crypto.randomUUID) come from IDB on both web and desktop.
  // Firestore auto-IDs are 20-char alphanumeric - never match the UUID pattern.
  const isLocalNpc =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      params.npcId,
    );

  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");
  const db = isLocalNpc ? localDb : cloudDb;

  const ref = db.doc("npc-personal", params.npcId);
  const activeSetDoc = useCallback((r, data) => db.setDoc(r, data), [db]);
  const activeAddDoc = (r, data) => db.addDoc(r, data);
  const _activeCollection = (_, path) => db.collection(path);

  const { cloudUser: user } = useDatabaseContext();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileTab, setMobileTab] = useState(0);

  const [checkedRules, setCheckedRules] = useState(false);
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [openShareSnackbar, setOpenShareSnackbar] = useState(false);

  const handleCheckboxChange = (event) => {
    setCheckedRules(event.target.checked);
  };

  const handleDialogOpen = (event) => {
    event.preventDefault();
    setRulesDialogOpen(true);
  };

  const handleDialogClose = () => {
    setRulesDialogOpen(false);
  };

  let isModerator = false;

  if (user && moderators.includes(user.uid)) {
    isModerator = true;
  }

  // Single hook call - both adapters are always instantiated so this is unconditionally stable.
  const [npc] = db.useDocumentData(ref);

  // Local NPCs are always owned by whoever is running the app.
  // Cloud NPCs require a matching Firebase UID.
  const isOwner = isLocalNpc || Boolean(user && npc && user.uid === npc.uid);

  const [isUpdated, setIsUpdated] = useState(false); // State for unsaved changes
  const [npcTemp, setNpcTemp] = useState(() =>
    npc ? applyNpcPostLoadTransforms(JSON.parse(JSON.stringify(npc))) : npc,
  ); // Temporary NPC state

  // Effect to update temporary NPC state when NPC data changes.
  // Apply post-load transforms so migrations are reflected in the editor.
  useEffect(() => {
    if (npc) {
      setNpcTemp(applyNpcPostLoadTransforms(JSON.parse(JSON.stringify(npc))));
      setIsUpdated(false);
    }
  }, [npc]);

  useEffect(() => {
    const baseline = npc
      ? applyNpcPreSaveTransforms(JSON.parse(JSON.stringify(npc)))
      : npc;
    const current = npcTemp ? applyNpcPreSaveTransforms(npcTemp) : npcTemp;
    setIsUpdated(!deepEqual(current, baseline));
  }, [npcTemp, npc]);

  const appDrawerOpen = useThemeStore((s) => s.drawerOpen);
  const [savedSnackbarOpen, setSavedSnackbarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 769px)");

  const handleSave = useCallback(() => {
    setIsUpdated(false);
    activeSetDoc(ref, applyNpcPreSaveTransforms(npcTemp));
    setSavedSnackbarOpen(true);
  }, [ref, npcTemp, activeSetDoc]);

  useDrawerSave({ canSave: isOwner && isUpdated, onSave: handleSave });
  useDrawerScrollTop(showScrollTop);

  // Handler for Ctrl+S to save NPC
  const handleCtrlS = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (!isOwner) return;
        handleSave();
      }
    },
    [isOwner, handleSave],
  );

  // Effect for scroll and keyboard shortcuts
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
    // Change page title with npc name
    const originalTitle = document.title;
    document.title = npc?.name ? `${npc.name} | Fultimator` : "Fultimator";
    return () => {
      document.title = originalTitle;
    };
  }, [npc?.name]);

  // Download image hook and reference
  const prettyRef = useRef();
  const [downloadImage] = useDownloadImage(npc?.name, prettyRef);

  // Check if the 'json' query parameter is true and return the JSON response
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get("json") === "true" && npc) {
    return <pre>{JSON.stringify(npc, null, 2)}</pre>;
  }

  if (!npcTemp) {
    return null;
  }

  async function sendDiscordWebhook(title, description, color = 16248815) {
    const webhookUrl = import.meta.env.VITE_DISCORD_REPORT_CONTENT_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("Webhook URL is missing in environment variables!");
      return;
    }

    const payload = {
      content: null,
      embeds: [
        {
          title: title,
          description: description,
          color: color,
        },
      ],
      username: "Fultimator-Support 🤖",
      attachments: [],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log("Webhook sent successfully!");
    } catch (error) {
      console.error("Error sending webhook:", error.message || error);
    }
  }

  // Function to publish NPC
  const publish = () => {
    setIsUpdated(false);
    activeSetDoc(
      ref,
      applyNpcPreSaveTransforms({
        ...npcTemp,
        published: true,
        searchString: npcTemp.name
          .replace(/[\W_]+/g, " ")
          .toLowerCase()
          .split(" "),
        publishedAt: Date.now(),
      }),
    );
    if (isBlacklisted(npcTemp.name)) {
      sendDiscordWebhook(
        "⚠️ BLACKLISTED NPC NAME PUBLISHED! ⚠️",
        `🚨 **Alert!** An NPC with a **blacklisted name** has been published.
        \n🆔 **NPC:** \`${npcTemp.name} - ${npcTemp.id}\`
        \n🆔 **Author UUID:** ${npcTemp.uid}
        \n👮 **Moderator Review Needed!**
        \n🔗 [View NPC](https://fabula-ultima-helper.web.app/npc-gallery/${npcTemp.id})`,
        0xe74c3c, // Red color
      );
    }
  };

  // Function to update publish language as moderator
  const updatePublishLanguage = async (newLang) => {
    setIsUpdated(false);
    activeSetDoc(
      ref,
      applyNpcPreSaveTransforms({ ...npcTemp, language: newLang }),
    );

    // Send message to webhook when updating publish language as moderator
    if (user && isModerator && user.uid !== npc.uid) {
      sendDiscordWebhook(
        "🏴 NPC LANGUAGE UPDATED BY MODERATOR! 🏴",
        `👮 **Moderator:** ${user.uid}
        \n🆔 **Author UUID:** ${npc.uid}
        \n📌 **Updated Content:** \`${npc.name} - ${npc.id}\` (NPC)
        \n🔗 [View NPC](https://fabula-ultima-helper.web.app/npc-gallery/${npc.id})`,
        0xf7a633, // Orange color
      );
    }
  };

  // Function to unpublish NPC
  const unPublish = async () => {
    setIsUpdated(false);
    activeSetDoc(
      ref,
      applyNpcPreSaveTransforms({ ...npcTemp, published: false }),
    );

    // Send message to webhook when unpublishing as moderator
    if (user && isModerator && user.uid !== npc.uid) {
      sendDiscordWebhook(
        "✅ NPC UNPUBLISHED BY MODERATOR ✅",
        `👮 **Moderator:** ${user.uid}
        \n🆔 **Unpublished NPC:** \`${npc.name} - ${npc.id}\`
        \n🚫 This NPC is no longer visible to the public.
        \n🔗 [View NPC](https://fabula-ultima-helper.web.app/npc-gallery/${npc.id})`,
        0x2ecc71, // Green color
      );
    }
  };

  // Function to copy NPC
  const copyNpc = async (npc) => {
    const data = Object.assign({}, npc);
    data.uid = user.uid;
    delete data.id;
    data.published = false;

    const ref = db.collection("npc-personal");

    activeAddDoc(ref, data)
      .then(function (docRef) {
        window.location.href = `/npc-gallery/${docRef.id}`;
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
  };

  // Function to share NPC link
  const shareNpc = async () => {
    const url = new URL(window.location.href);
    url.search = ""; // Strip query params
    await navigator.clipboard.writeText(url.toString());
    setOpenShareSnackbar(true); // Show snackbar
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenShareSnackbar(false);
  };

  // Function to download NPC as image
  function DownloadImage() {
    setTimeout(downloadImage, 100);
  }

  return (
    <NpcProvider npcData={npcTemp}>
      <Layout unsavedChanges={isUpdated}>
        {/* Main Grid Container */}
        {user && isModerator && !isOwner && (
          <Alert
            severity="warning"
            variant="filled"
            sx={{ marginBottom: "10px" }}
          >
            Moderator view
          </Alert>
        )}
        {isSmallScreen && <Divider sx={{ my: 1 }} />}

        {(!isSmallScreen || mobileTab === 0) && (
          <>
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  md: 8,
                }}
              >
                <NpcActorCard
                  npc={npcTemp}
                  cardRef={prettyRef}
                  npcImage={npcTemp.imgurl}
                  collapse={true}
                  variant="interactive"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <ExplainSkills npc={npcTemp} />
                <Divider sx={{ my: 1 }} />

                <Tooltip title={t("Download as Image")}>
                  <IconButton onClick={DownloadImage}>
                    <Download />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t("Share URL")}>
                  <span>
                    <IconButton
                      onClick={() => shareNpc(npc.id)}
                      disabled={isLocalNpc}
                    >
                      <Share />
                    </IconButton>
                  </span>
                </Tooltip>

                <Export name={`${npc.name}`} dataType="npc" data={npc} />

                {!isOwner && (
                  <Tooltip title={t("Copy and Edit Sheet")} placement="bottom">
                    <IconButton
                      aria-label="duplicate"
                      onClick={() => copyNpc(npcTemp)}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                )}

                <Divider sx={{ my: 1 }} />

                {!isLocalNpc && (
                  <EditPublish
                    npc={npcTemp}
                    setNpc={setNpcTemp}
                    user={user}
                    isModerator={isModerator}
                    checkedRules={checkedRules}
                    rulesDialogOpen={rulesDialogOpen}
                    handleDialogOpen={handleDialogOpen}
                    handleDialogClose={handleDialogClose}
                    handleCheckboxChange={handleCheckboxChange}
                    publish={publish}
                    unPublish={unPublish}
                    updatePublishLanguage={updatePublishLanguage}
                    isUpdated={isUpdated}
                  />
                )}
                {isOwner && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <TagList npc={npcTemp} setNpc={setNpcTemp} />
                  </>
                )}
              </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* NPC Edit Options for Creator */}
        {isOwner && (
          <>
            {(!isSmallScreen || mobileTab === 1) && (
              <>
                <Paper
                  id="edit-section-basics"
                  elevation={3}
                  sx={{
                    p: "15px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                  }}
                >
                  <EditBasics npc={npcTemp} setNpc={setNpcTemp} />
                </Paper>
                <Divider sx={{ my: 1 }} />
              </>
            )}

            {(!isSmallScreen || mobileTab === 2) && (
              <>
                <Paper
                  id="edit-section-affinities"
                  elevation={3}
                  sx={{
                    p: "15px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <CustomHeader
                        type="top"
                        headerText={t("Affinity")}
                        showIconButton={false}
                      />
                      <ExplainAffinities npc={npcTemp} />
                      <EditAffinities npc={npcTemp} setNpc={setNpcTemp} />
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <CustomHeader
                        type={isSmallScreen ? "middle" : "top"}
                        headerText={t("Bonuses")}
                        showIconButton={false}
                      />
                      <EditExtra npc={npcTemp} setNpc={setNpcTemp} />
                    </Grid>
                  </Grid>
                </Paper>
                <Divider sx={{ my: 1 }} />
              </>
            )}

            {(!isSmallScreen || mobileTab === 3) && (
              <>
                <Paper
                  id="edit-section-attacks"
                  elevation={3}
                  sx={{
                    p: "15px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                  }}
                >
                  <Grid container>
                    <Grid size={12}>
                      <EditAttacks npc={npcTemp} setNpc={setNpcTemp} />
                    </Grid>
                    <Grid size={12}>
                      <EditWeaponAttacks npc={npcTemp} setNpc={setNpcTemp} />
                    </Grid>
                  </Grid>
                </Paper>
                <Divider sx={{ my: 1 }} />
              </>
            )}

            {(!isSmallScreen || mobileTab === 4) && (
              <>
                <Paper
                  id="edit-section-spells"
                  elevation={3}
                  sx={{
                    p: "15px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                  }}
                >
                  <EditSpells npc={npcTemp} setNpc={setNpcTemp} />
                </Paper>
                <Divider sx={{ my: 1 }} />
              </>
            )}

            {(!isSmallScreen || mobileTab === 5) && (
              <>
                <Paper
                  id="edit-section-extras"
                  elevation={3}
                  sx={{
                    p: "15px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <div id="edit-section-actions">
                        <EditActions npc={npcTemp} setNpc={setNpcTemp} />
                      </div>
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <div id="edit-section-special">
                        <EditSpecial npc={npcTemp} setNpc={setNpcTemp} />
                      </div>
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <div id="edit-section-raregear">
                        <EditRareGear npc={npcTemp} setNpc={setNpcTemp} />
                      </div>
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <div id="edit-section-notes">
                        <EditNotes npc={npcTemp} setNpc={setNpcTemp} />
                      </div>
                    </Grid>
                  </Grid>
                </Paper>
                <Divider sx={{ my: 1 }} />
              </>
            )}

            {(!isSmallScreen || mobileTab === 5) && (
              <>
                <Paper
                  id="edit-section-attackchance"
                  elevation={3}
                  sx={{
                    p: "15px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                  }}
                >
                  <Probs />
                </Paper>
                <Divider sx={{ my: 1 }} />
              </>
            )}
            <Divider sx={{ my: 2, mb: isSmallScreen ? 24 : 20 }} />
          </>
        )}
        {/* <NpcUgly npc={npcTemp} /> */}
        {/* FAB container */}
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: appDrawerOpen
              ? APP_DRAWER_WIDTH + 16
              : isDesktop
                ? TAB_RAIL_WIDTH + 16
                : 16,
            transition: "right 0.3s ease",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column-reverse",
            alignItems: "center",
            gap: 1,
          }}
        >
          {!isSmallScreen && isUpdated && isOwner && (
            <Tooltip title={t("Save")} placement="left">
              <Fab
                color="primary"
                aria-label="save"
                size="medium"
                onClick={handleSave}
              >
                <Save />
              </Fab>
            </Tooltip>
          )}
        </Box>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={openShareSnackbar}
          autoHideDuration={2000}
          onClose={handleClose}
          message={t("Copied to Clipboard!")}
        />
        <Snackbar
          open={savedSnackbarOpen}
          autoHideDuration={2500}
          onClose={() => setSavedSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSavedSnackbarOpen(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {t("Saved")}
          </Alert>
        </Snackbar>
        {isSmallScreen && (
          <Paper
            elevation={6}
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1300,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <Box
              sx={{
                flex: 1,
                overflowX: "auto",
                overflowY: "hidden",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <BottomNavigation
                showLabels
                value={mobileTab}
                onChange={(_, newValue) => setMobileTab(newValue)}
                sx={{
                  width: "max-content",
                  minWidth: "100%",
                  "& .MuiBottomNavigationAction-root": {
                    flex: "0 0 auto",
                    minWidth: 96,
                  },
                }}
              >
                <BottomNavigationAction label={t("Overview")} icon={<Home />} />
                {isOwner && (
                  <BottomNavigationAction
                    label={t("Basics")}
                    icon={<Psychology />}
                  />
                )}
                {isOwner && (
                  <BottomNavigationAction
                    label={t("Stats")}
                    icon={<Shield />}
                  />
                )}
                {isOwner && (
                  <BottomNavigationAction
                    label={t("Attacks")}
                    icon={<FlashOn />}
                  />
                )}
                {isOwner && (
                  <BottomNavigationAction
                    label={t("Spells")}
                    icon={<AutoFixHigh />}
                  />
                )}
                {isOwner && (
                  <BottomNavigationAction
                    label={t("Extras")}
                    icon={<QueryStats />}
                  />
                )}
              </BottomNavigation>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                borderLeft: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                px: 1,
              }}
            >
              <Tooltip title={t("Save")} placement="top">
                <span>
                  <IconButton
                    color={isUpdated && isOwner ? "primary" : "default"}
                    onClick={handleSave}
                    disabled={!isOwner || !isUpdated}
                    aria-label="save"
                  >
                    <Save />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Paper>
        )}
      </Layout>
    </NpcProvider>
  );
}
