import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
  Button,
  TextField,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Download,
  Publish,
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
import ExplainSkillsSimplified from "../../components/npc/ExplainSkillsSimplified";
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
import Probs from "../../routes/probs/probs";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { useTranslate } from "../../translation/translate";

export default function NpcEdit() {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const quaternary = theme.palette.quaternary.main;
  let params = useParams();
  const ref = doc(firestore, "npc-personal", params.npcId);

  const [user] = useAuthState(auth);
  const [showScrollTop, setShowScrollTop] = useState(true);

  const handleMoveToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [npc] = useDocumentData(ref, {
    idField: "id",
  });

  const [isUpdated, setIsUpdated] = useState(false);

  const [npcTemp, setNpcTemp] = useState(npc);

  const updateNPC = (data) => {
    setIsUpdated(true);
    setNpcTemp(data);
  };

  useEffect(() => {
    setNpcTemp(npc);
  }, [npc]);

  const handleCtrlS = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        setDoc(ref, npcTemp);
      }
    },
    [ref, npcTemp]
  );

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

  // Download
  const prettyRef = useRef();
  const [downloadImage] = useDownloadImage(npc?.name, prettyRef);

  if (!npcTemp) {
    return null;
  }

  const canPublish = () => {
    if (!npcTemp.name || npcTemp.name === "") {
      return {
        disabled: true,
        message: t("It must have a name in order to be published.", true),
      };
    }

    if (!npcTemp.description || npcTemp.description === "") {
      return {
        disabled: true,
        message: t(
          "It must have a description in order to be published.",
          true
        ),
      };
    }

    if (!npcTemp.traits || npcTemp.traits === "") {
      return {
        disabled: true,
        message: t("It must have a traits in order to be published.", true),
      };
    }

    if (!npcTemp.createdBy || npcTemp.createdBy === "") {
      return {
        disabled: true,
        message: t(
          "'Credit By' needs to be filled in order to be published",
          true
        ),
      };
    }

    if (
      (npcTemp.weaponattacks && npcTemp.weaponattacks.length) ||
      (npcTemp.attacks && npcTemp.attacks.length)
    ) {
      return { disabled: false };
    }

    return {
      disabled: true,
      message: t(
        "It must have at least one attack, in order to be published.",
        true
      ),
    };
  };

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
  };

  const unPublish = () => {
    setIsUpdated(false);
    setDoc(ref, {
      ...npcTemp,
      published: false,
    });
  };

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

  const shareNpc = async (id) => {
    await navigator.clipboard.writeText(window.location.href + "/");
  };

  function DownloadImage() {
    setTimeout(downloadImage, 100);
  }

  return (
    <Layout>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <NpcPretty npc={npcTemp} ref={prettyRef} collapse={true} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ExplainSkills npc={npcTemp} />
          <Divider sx={{ my: 1 }} />
          <Tooltip title={t("Download as Image")}>
            <IconButton
              onClick={() => {
                DownloadImage();
              }}
            >
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("Share URL")}>
            <IconButton onClick={() => shareNpc(npc.id)}>
              <Share />
            </IconButton>
          </Tooltip>
          <Export name={`${npc.name}`} data={npc} />
          {user && user.uid !== npc.uid && (
            <Tooltip title={t("Copy and Edit Sheet")} placement="bottom">
              <IconButton
                aria-label="duplicate"
                onClick={() => {
                  copyNpc(npcTemp);
                }}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
          )}
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              mt: "4px",
              p: "10px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            {user && user.uid === npc.uid && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <TextField
                  id="outlined-basic"
                  label={t("Created By:")}
                  sx={{ marginTop: 2 }}
                  size="small"
                  helperText={
                    npcTemp.published
                      ? t("This NPC is part of the Adversary Compedium.")
                      : t(
                          "Help the Adversary Compedium grow by publishing your finished work!"
                        )
                  }
                  fullWidth
                  value={npcTemp.createdBy}
                  onChange={(evt) => {
                    updateNPC({ ...npcTemp, createdBy: evt.target.value });
                  }}
                />
                {!npcTemp.published && (
                  <Button
                    variant="contained"
                    sx={{ marginTop: 1 }}
                    startIcon={<Publish />}
                    disabled={canPublish().disabled}
                    onClick={publish}
                  >
                    {t("Publish to Adversary Compendium")}
                  </Button>
                )}
                {npcTemp.published && (
                  <Button
                    variant="outlined"
                    sx={{ marginTop: 1 }}
                    onClick={unPublish}
                  >
                    {t("Unpublish")}
                  </Button>
                )}
                {canPublish().disabled && (
                  <div
                    style={{
                      fontSize: 12,
                      textAlign: "center",
                      marginTop: 4,
                      color: "red",
                    }}
                  >
                    {canPublish().message}
                  </div>
                )}
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Divider sx={{ my: 1 }} />

      {user && user.uid === npc.uid && (
        <>
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Typography
              variant="h5"
              component="legend"
              sx={{ color: primary, textTransform: "uppercase" }}
            >
              {t("Basic Information")}
            </Typography>
            <Divider
              orientation="horizontal"
              sx={{
                color: primary,
                borderBottom: "2px solid",
                borderColor: "secondary",
                mb: "10px",
              }}
            />
            <EditBasics npc={npcTemp} setNpc={updateNPC} />
          </Paper>

          <Divider sx={{ my: 1 }} />

          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Typography
              variant="h5"
              component="legend"
              sx={{ color: primary, textTransform: "uppercase" }}
            >
              {t("Affinity")}
            </Typography>
            <Divider
              orientation="horizontal"
              sx={{
                color: primary,
                borderBottom: "2px solid",
                borderColor: "secondary",
                mb: "10px",
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ExplainAffinities npc={npcTemp} />
                <EditAffinities npc={npcTemp} setNpc={updateNPC} />
              </Grid>
              <Grid item xs={12} md={6}>
                <EditExtra npc={npcTemp} setNpc={updateNPC} />
              </Grid>
            </Grid>
          </Paper>

          <Divider sx={{ my: 1 }} />

          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Typography
              variant="h5"
              component="legend"
              sx={{ color: primary, textTransform: "uppercase" }}
            >
              {t("Attacks")}
            </Typography>
            <Divider
              orientation="horizontal"
              sx={{
                color: primary,
                borderBottom: "2px solid",
                borderColor: "secondary",
                mb: "10px",
              }}
            />
            <Grid container>
              <Grid item xs={12}>
                <EditAttacks npc={npcTemp} setNpc={updateNPC} />
              </Grid>
              <Grid item xs={12}>
                <EditWeaponAttacks npc={npcTemp} setNpc={updateNPC} />
              </Grid>
            </Grid>
          </Paper>

          <Divider sx={{ my: 1 }} />

          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Typography
              variant="h5"
              component="legend"
              sx={{ color: primary, textTransform: "uppercase" }}
            >
              {t("Spells")}
            </Typography>
            <Divider
              orientation="horizontal"
              sx={{
                color: primary,
                borderBottom: "2px solid",
                borderColor: "secondary",
                mb: "10px",
              }}
            />
            <EditSpells npc={npcTemp} setNpc={updateNPC} />
          </Paper>

          <Divider sx={{ my: 1 }} />

          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Typography
              variant="h5"
              component="legend"
              sx={{ color: primary, textTransform: "uppercase" }}
            >
              {t("Features")}
            </Typography>
            <Divider
              orientation="horizontal"
              sx={{
                color: primary,
                borderBottom: "2px solid",
                borderColor: "secondary",
                mb: "10px",
              }}
            />
            <Grid container>
              <Grid item xs={12} md={6}>
                <EditActions npc={npcTemp} setNpc={updateNPC} />
              </Grid>
              <Grid item xs={12} md={6}>
                <EditSpecial npc={npcTemp} setNpc={updateNPC} />
              </Grid>
              <Grid item xs={12} md={6}>
                <EditRareGear npc={npcTemp} setNpc={updateNPC} />
              </Grid>
              <Grid item xs={12} md={6}>
                <EditNotes npc={npcTemp} setNpc={updateNPC} />
              </Grid>
            </Grid>
          </Paper>

          <Divider sx={{ my: 1 }} />

          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Typography
              variant="h5"
              component="legend"
              sx={{ color: primary, textTransform: "uppercase" }}
            >
              {t("Attacks Chance Generator")}
            </Typography>
            <Divider
              orientation="horizontal"
              sx={{
                color: primary,
                borderBottom: "2px solid",
                borderColor: "secondary",
                mb: "10px",
              }}
            />
            <Probs />
          </Paper>

          <Divider sx={{ my: 2, mb: 20 }} />
        </>
      )}

      {/* <NpcUgly npc={npcTemp} /> */}
      
      {/* SP Tracker Field */}
      <Grid
        sx={{
          position: "fixed",
          top: 120,
          right: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          zIndex: 10,
        }}
      >
        {/* SP Tracker Field */}
        <ExplainSkillsSimplified npc={npcTemp} />
      </Grid>

      {isUpdated && (
        <Grid style={{ position: "fixed", bottom: 65, right: 10, zIndex: 100 }}>
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

      <Grid style={{ position: "fixed", bottom: 15, right: 10, zIndex: 100 }}>
        {/* Move to Top Button */}
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
  );
}
