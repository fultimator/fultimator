import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { firestore, auth } from "../../firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, setDoc, collection, addDoc } from "@firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  Grid,
  Divider,
  Fab,
  Fade,
  Tooltip,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import {
  Download,
  Save,
  Share,
  ArrowUpward,
  ContentCopy,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
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
import blacklist from "../../translation/blacklist";
import deepEqual from "deep-equal";
import { NpcProvider } from "../../components/npc/NpcContext";

// Combine all blacklisted names into a single array
const mergedBlacklistNames = blacklist.flatMap((item) => Object.values(item));

// Function to check if the NPC name is blacklisted
const isBlacklisted = (npcName) => {
  const lowerCaseNpcName = npcName.toLowerCase();
  return mergedBlacklistNames.some(
    (blacklistedName) => blacklistedName.toLowerCase() === lowerCaseNpcName
  );
};

export default function NpcEdit() {
  const { t } = useTranslate(); // Translation hook
  const theme = useTheme(); // Theme hook for MUI
  const secondary = theme.palette.secondary.main; // Secondary color from theme
  const isSmallScreen = useMediaQuery("(max-width: 899px)"); // Media query hook for screen size

  let params = useParams(); // URL parameters hook
  const location = useLocation(); // Location hook for getting URL
  const ref = doc(firestore, "npc-personal", params.npcId); // Firestore document reference

  const [user] = useAuthState(auth); // Authentication state hook
  const [showScrollTop, setShowScrollTop] = useState(true); // State for scroll-to-top button visibility

  const [checkedRules, setCheckedRules] = useState(false);
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);

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

  // Scroll-to-top handler
  const handleMoveToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [npc] = useDocumentData(ref, { idField: "id" }); // Firestore document data hook

  const [isUpdated, setIsUpdated] = useState(false); // State for unsaved changes
  const [npcTemp, setNpcTemp] = useState(npc); // Temporary NPC state

  // Effect to update temporary NPC state when NPC data changes
  useEffect(() => {
    if (npc) {
      // Perform a deep copy of the npc object
      const updatedPlayerTemp = JSON.parse(JSON.stringify(npc));
      setNpcTemp(updatedPlayerTemp);
      setIsUpdated(false);
    }
  }, [npc]);

  useEffect(() => {
    if (!deepEqual(npcTemp, npc)) {
      setIsUpdated(true);
    } else {
      setIsUpdated(false);
    }
  }, [npcTemp, npc]);

  // Handler for Ctrl+S to save NPC
  const handleCtrlS = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        setDoc(ref, npcTemp);
      }
    },
    [ref, npcTemp]
  );

  // Effect for scroll, focus, and blur events, and keyboard shortcuts
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    const handleFocus = () => {
      setShowScrollTop(false);
    };

    const handleBlur = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    document.body.addEventListener("focus", handleFocus, true);
    document.body.addEventListener("blur", handleBlur, true);
    document.addEventListener("keydown", handleCtrlS);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("focus", handleFocus, true);
      document.body.removeEventListener("blur", handleBlur, true);
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
    setDoc(ref, {
      ...npcTemp,
      published: true,
      searchString: npcTemp.name
        .replace(/[\W_]+/g, " ")
        .toLowerCase()
        .split(" "),
      publishedAt: Date.now(),
    });
    if (isBlacklisted(npcTemp.name)) {
      sendDiscordWebhook(
        "⚠️ BLACKLISTED NPC NAME PUBLISHED! ⚠️",
        `🚨 **Alert!** An NPC with a **blacklisted name** has been published.
        \n🆔 **NPC:** \`${npcTemp.name} - ${npcTemp.id}\`
        \n🆔 **Author UUID:** ${npcTemp.uid}
        \n👮 **Moderator Review Needed!**
        \n🔗 [View NPC](https://fabula-ultima-helper.web.app/npc-gallery/${npcTemp.id})`,
        0xE74C3C // Red color
      );
      
    }
  };

  // Function to update publish language as moderator
  const updatePublishLanguage = async (newLang) => {
    setIsUpdated(false);
    setDoc(ref, { ...npcTemp, language: newLang });

    // Send message to webhook when updating publish language as moderator
    if (user && isModerator && user.uid !== npc.uid) {
      sendDiscordWebhook(
        "🏴 NPC LANGUAGE UPDATED BY MODERATOR! 🏴",
        `👮 **Moderator:** ${user.uid}
        \n🆔 **Author UUID:** ${npc.uid}
        \n📌 **Updated Content:** \`${npc.name} - ${npc.id}\` (NPC)
        \n🔗 [View NPC](https://fabula-ultima-helper.web.app/npc-gallery/${npc.id})`,
        0xf7a633 // Orange color
      );
    }
  };

  // Function to unpublish NPC
  const unPublish = async () => {
    setIsUpdated(false);
    setDoc(ref, {
      ...npcTemp,
      published: false,
    });

    // Send message to webhook when unpublishing as moderator
    if (user && isModerator && user.uid !== npc.uid) {
      sendDiscordWebhook(
        "✅ NPC UNPUBLISHED BY MODERATOR ✅",
        `👮 **Moderator:** ${user.uid}
        \n🆔 **Unpublished NPC:** \`${npc.name} - ${npc.id}\`
        \n🚫 This NPC is no longer visible to the public.
        \n🔗 [View NPC](https://fabula-ultima-helper.web.app/npc-gallery/${npc.id})`,
        0x2ECC71 // Green color
      );      
    }
  };

  // Function to copy NPC
  const copyNpc = async (npc) => {
    const data = Object.assign({}, npc);
    data.uid = user.uid;
    delete data.id;
    data.published = false;

    const ref = collection(firestore, "npc-personal");

    addDoc(ref, data)
      .then(function (docRef) {
        window.location.href = `/npc-gallery/${docRef.id}`;
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
  };

  // Function to share NPC link
  const shareNpc = async (id) => {
    await navigator.clipboard.writeText(window.location.href + "/");
  };

  // Function to download NPC as image
  function DownloadImage() {
    setTimeout(downloadImage, 100);
  }

  return (
    <NpcProvider npcData={npcTemp}>
      <Layout>
        {/* Main Grid Container */}
        {user && isModerator && user.uid !== npc.uid && (
          <Alert
            severity="warning"
            variant="filled"
            sx={{ marginBottom: "10px" }}
          >
            Moderator view
          </Alert>
        )}
        <Grid container spacing={2}>
          {/* NPC Pretty Display (Left-side Grid Item) */}
          <Grid item xs={12} md={8}>
            <NpcPretty
              npc={npcTemp}
              ref={prettyRef}
              npcImage={npcTemp.imgurl}
              collapse={true}
            />
          </Grid>

          {/* Skills, Controls and Publish (Right-side Grid Item) */}
          <Grid item xs={12} md={4}>
            {/* Skill Points */}
            <ExplainSkills npc={npcTemp} />
            <Divider sx={{ my: 1 }} />

            {/* Download NPC Sheet Button */}
            <Tooltip title={t("Download as Image")}>
              <IconButton onClick={DownloadImage}>
                <Download />
              </IconButton>
            </Tooltip>

            {/* Share URL Button */}
            <Tooltip title={t("Share URL")}>
              <IconButton onClick={() => shareNpc(npc.id)}>
                <Share />
              </IconButton>
            </Tooltip>

            {/* Export NPC Data */}
            <Export name={`${npc.name}`} dataType="npc" data={npc} />

            {/* Copy and Edit Button, shown only if user is not the creator */}
            {user && user.uid !== npc.uid && (
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

            {/* NPC sharing options */}
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
            {/* Tags Section */}
            {user && user.uid === npc.uid && (
              <>
                <Divider sx={{ my: 1 }} />
                <TagList npc={npcTemp} setNpc={setNpcTemp} />
                {/*TEST BUTTON <Button onClick={() => console.log(npcTemp)} variant="contained">Log Temp NPC Object</Button>*/}
              </>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />

        {/* NPC Edit Options for Creator */}
        {user && user.uid === npc.uid && (
          <>
            {/* Edit Basic Information */}
            <Paper
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

            {/* Edit Affinities and Bonuses */}
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
                <Grid item xs={12} md={6}>
                  <CustomHeader
                    type="top"
                    headerText={t("Affinity")}
                    showIconButton={false}
                  />
                  <ExplainAffinities npc={npcTemp} />
                  <EditAffinities npc={npcTemp} setNpc={setNpcTemp} />
                </Grid>
                <Grid item xs={12} md={6}>
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

            {/* Edit Base Attacks and Weapon Attacks */}
            <Paper
              elevation={3}
              sx={{
                p: "15px",
                borderRadius: "8px",
                border: "2px solid",
                borderColor: secondary,
              }}
            >
              <Grid container>
                <Grid item xs={12}>
                  <EditAttacks npc={npcTemp} setNpc={setNpcTemp} />
                </Grid>
                <Grid item xs={12}>
                  <EditWeaponAttacks npc={npcTemp} setNpc={setNpcTemp} />
                </Grid>
              </Grid>
            </Paper>
            <Divider sx={{ my: 1 }} />

            {/* Edit Spells */}
            <Paper
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

            {/* Edit Extra Features */}
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
                {/* Edit Other Actions */}
                <Grid item xs={12} md={6}>
                  <EditActions npc={npcTemp} setNpc={setNpcTemp} />
                </Grid>
                {/* Edit Special Rules */}
                <Grid item xs={12} md={6}>
                  <EditSpecial npc={npcTemp} setNpc={setNpcTemp} />
                </Grid>
                {/* Edit Rare Gear */}
                <Grid item xs={12} md={6}>
                  <EditRareGear npc={npcTemp} setNpc={setNpcTemp} />
                </Grid>
                {/* Edit Notes */}
                <Grid item xs={12} md={6}>
                  <EditNotes npc={npcTemp} setNpc={setNpcTemp} />
                </Grid>
              </Grid>
            </Paper>
            <Divider sx={{ my: 1 }} />

            {/* Attack Chance Generator Section */}
            <Paper
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
            <Divider sx={{ my: 2, mb: 20 }} />
          </>
        )}
        {/* <NpcUgly npc={npcTemp} /> */}
        {/* Save Button, shown if there are unsaved changes */}
        {isUpdated && (
          <Grid
            style={{ position: "fixed", bottom: 65, right: 10, zIndex: 100 }}
          >
            <Fade in={showScrollTop} timeout={300}>
              <Tooltip title="Save" placement="bottom">
                <Fab
                  color="primary"
                  aria-label="save"
                  onClick={() => {
                    setIsUpdated(false);
                    setDoc(ref, npcTemp);
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

        {/* Move to Top Button */}
        <Grid style={{ position: "fixed", bottom: 15, right: 10, zIndex: 100 }}>
          <Fade in={showScrollTop} timeout={300}>
            <Fab
              color="primary"
              aria-label="move-to-top"
              onClick={handleMoveToTop}
              size="medium"
            >
              <ArrowUpward />
            </Fab>
          </Fade>
        </Grid>
      </Layout>
    </NpcProvider>
  );
}
