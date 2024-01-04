import { useParams } from "react-router-dom";
import { firestore } from "../../firebase";

import {
  Grid,
  Divider,
  Fab,
  Fade,
  Tooltip,
  Snackbar,
  Button,
  TextField,
} from "@mui/material";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, setDoc, collection, addDoc } from "@firebase/firestore";
import EditBasics from "../../components/npc/EditBasics";
import {
  Download,
  Publish,
  Save,
  Code,
  Share,
  ArrowUpward,
  Menu,
  ContentCopy,
  Close,
} from "@mui/icons-material";
import { createRef, useCallback, useEffect, useState } from "react";
// import NpcUgly from "../../components/npc/Ugly";
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
import { createFileName, useScreenshot } from "use-react-screenshot";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";

export default function NpcEdit() {
  let params = useParams();
  const ref = doc(firestore, "npc-personal", params.npcId);

  const [user] = useAuthState(auth);
  const [showScrollTop, setShowScrollTop] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);

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
  const prettyRef = createRef(null);

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  const downloadJSON = () => {
    const jsonData = JSON.stringify(npcTemp);
    downloadFile(jsonData, `${npc.name.replace(" ", "_")}.json`, "text/plain");
  };

  const [image, takeScreenShot] = useScreenshot();

  const download = (image, { name = "img", extension = "png" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
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

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const getImage = () => takeScreenShot(prettyRef.current);

  useEffect(() => {
    if (image) {
      download(image, { name: npc.name, extension: "png" });
    }
  }, [image, npc?.name]);

  if (!npcTemp) {
    return null;
  }

  const canPublish = () => {
    if (!npcTemp.name || npcTemp.name === "") {
      return {
        disabled: true,
        message: "It must have a name in order to be published.",
      };
    }

    if (!npcTemp.description || npcTemp.description === "") {
      return {
        disabled: true,
        message: "It must have a description in order to be published.",
      };
    }

    if (!npcTemp.traits || npcTemp.traits === "") {
      return {
        disabled: true,
        message: "It must have a traits in order to be published.",
      };
    }

    if (!npcTemp.createdBy || npcTemp.createdBy === "") {
      return {
        disabled: true,
        message: "'Credit By' needs to be filled in order to be published",
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
      message: "It must have at least one attack, in order to be published.",
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

  return (
    <Layout>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <NpcPretty npc={npcTemp} ref={prettyRef} collapse={true} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ExplainSkills npc={npcTemp} />
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
                label="Created By:"
                sx={{ marginTop: 2 }}
                size="small"
                helperText={
                  npcTemp.published
                    ? "This NPC is part of the Adversary Compedium."
                    : "Help the Adversary Compedium grow by publishing your finished work!"
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
                  Publish to Adversary Compedium
                </Button>
              )}
              {npcTemp.published && (
                <Button
                  variant="outlined"
                  sx={{ marginTop: 1 }}
                  onClick={unPublish}
                >
                  Unpublish
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
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />

      {user && user.uid === npc.uid && (
        <>
          <EditBasics npc={npcTemp} setNpc={updateNPC} />

          <Divider sx={{ my: 2 }} />

          <Grid container>
            <Grid item xs={12} md={6}>
              <EditAffinities npc={npcTemp} setNpc={updateNPC} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ExplainAffinities npc={npcTemp} />
              <EditExtra npc={npcTemp} setNpc={updateNPC} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <EditAttacks npc={npcTemp} setNpc={updateNPC} />
          <EditWeaponAttacks npc={npcTemp} setNpc={updateNPC} />

          <Divider sx={{ my: 2 }} />

          <EditSpells npc={npcTemp} setNpc={updateNPC} />

          <Divider sx={{ my: 2 }} />

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
          <Divider sx={{ my: 2, marginBottom: 20 }} />
        </>
      )}

      {/* <NpcUgly npc={npcTemp} /> */}

      <Grid
        sx={{
          position: "fixed",
          top: 10,
          right: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          zIndex: 10,
        }}
      >
        {/* SP Tracker Field */}
        <ExplainSkillsSimplified npc={npcTemp} />
        {/* Collapse for the Buttons */}
        {!isCollapsed && (
          <div
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              zIndex: 1000,
            }}
          >
            {/* Export Button */}
            <Tooltip
              title="Export JSON File"
              placement="bottom"
              sx={{ marginLeft: "5px" }}
            >
              <Fab
                color="primary"
                aria-label="export"
                onClick={downloadJSON}
                size="medium"
              >
                <Code />
              </Fab>
            </Tooltip>
            {/* Share Button */}
            <Tooltip title="Share URL" placement="bottom">
              <Fab
                color="primary"
                aria-label="Share"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  handleClick();
                }}
                size="medium"
                style={{ marginLeft: "5px" }}
              >
                <Share />
              </Fab>
            </Tooltip>
            {/* Download Button */}
            <Tooltip title="Download Sheet" placement="bottom">
              <Fab
                color="primary"
                aria-label="download"
                onClick={getImage}
                size="medium"
                style={{ marginLeft: "5px", zIndex: 1000 }}
              >
                <Download />
              </Fab>
            </Tooltip>

            {user && user.uid !== npc.uid && (
              <Tooltip title="Copy and Edit Sheet" placement="bottom">
                <Fab
                  color="primary"
                  aria-label="duplicate"
                  onClick={() => {
                    copyNpc(npcTemp);
                  }}
                  size="medium"
                  style={{ marginLeft: "5px", zIndex: 1000 }}
                >
                  <ContentCopy />
                </Fab>
              </Tooltip>
            )}
          </div>
        )}
        {/* Collapse Toggle Button */}
        <Fab
          color="primary"
          aria-label="toggle-collapse"
          onClick={() => setIsCollapsed(!isCollapsed)}
          size="medium"
          style={{ marginLeft: "5px" }}
        >
          {isCollapsed ? <Menu /> : <Close />}
        </Fab>
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message="Copied to Clipboard!"
      />

      {isUpdated && (
        <Grid style={{ position: "fixed", top: 65, right: 10, zIndex: 100 }}>
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

      <Grid style={{ position: "fixed", bottom: 10, right: 10 }}>
        {/* Move to Top Button */}
        <Fade in={showScrollTop} timeout={300}>
          <div style={{ marginBottom: "5px", zIndex: 100 }}>
            <Fab
              color="primary"
              aria-label="move-to-top"
              onClick={handleMoveToTop}
              size="medium"
            >
              <ArrowUpward />
            </Fab>
          </div>
        </Fade>
      </Grid>
    </Layout>
  );
}
