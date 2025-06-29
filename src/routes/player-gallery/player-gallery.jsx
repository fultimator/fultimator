import {
  query,
  collection,
  where,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useState, useRef } from "react";
import { firestore } from "../../firebase";
import { auth } from "../../firebase";
import HelpFeedbackDialog from "../../components/appbar/HelpFeedbackDialog";
import { useNavigate } from "react-router-dom";

import {
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  Grid,
  Snackbar,
  Paper,
  TextField,
  Button,
  InputAdornment,
  Alert,
  AlertTitle,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
// import NpcUgly from "../../components/npc/Ugly";
import {
  ContentCopy,
  Delete,
  Share,
  Edit,
  HistoryEdu,
  Badge,
  Star,
  BugReport,
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslate } from "../../translation/translate";
import PlayerCardGallery from "../../components/player/playerSheet/PlayerCardGallery";
// import { testUsers, moderators } from "../../libs/userGroups";
import Export from "../../components/Export";
import SearchIcon from "@mui/icons-material/Search";
import { validateCharacter } from "../../utility/validateJson";

export default function PlayerGallery() {
  const { t } = useTranslate();
  const [user, loading] = useAuthState(auth);

  return (
    <Layout>
      {loading && <Skeleton />}

      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            {t("You have to be logged in to access this feature")}
          </Typography>
          <SignIn />
        </>
      )}

      {user && <Personal user={user} />}
    </Layout>
  );
}

function Personal({ user }) {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [direction, setDirection] = useState("ascending");
  const [open, setOpen] = useState(false);
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const personalRef = collection(firestore, "player-personal");
  const personalQuery = query(personalRef, where("uid", "==", user.uid));
  const [personalList, loading, err] = useCollectionData(personalQuery, {
    idField: "id",
  });
  if (err?.code === "resource-exhausted") {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        {t(
          "Apologies, fultimator has reached its read quota at the moment, please try again tomorrow. (Around 12-24 hours)"
        )}
      </Paper>
    );
  }

  const filteredList = personalList
    ? personalList
        .filter((item) => {
          // Filter based on name
          if (
            name !== "" &&
            !item.name.toLowerCase().includes(name.toLowerCase())
          )
            return false;

          return true;
        })
        .sort((item1, item2) => {
          // Sort based on selected sort and direction
          if (direction === "ascending") {
            return item1.name.localeCompare(item2.name);
          } else {
            return item2.name.localeCompare(item1.name);
          }
        })
    : [];

  const addPlayer = async function () {
    const data = {
      uid: user.uid,
      name: "-",
      lvl: 5,
      info: {
        pronouns: "",
        identity: "",
        theme: "",
        origin: "",
        bonds: [],
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
      weapons: [],
      armor: [],
      notes: [],
      modifiers: {
        hp: 0,
        mp: 0,
        ip: 0,
        def: 0,
        mdef: 0,
        init: 0,
        meleePrec: 0,
        rangedPrec: 0,
        magicPrec: 0,
      },
    };
    const ref = collection(firestore, "player-personal");

    try {
      const res = await addDoc(ref, data);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }
  };

  const handleFileUpload = async (jsonData) => {
    try {
      if (!validateCharacter(jsonData)) {
        console.error("Invalid character data.");
        const alertMessage = t("Invalid character JSON data.");
        alert(alertMessage);
        return;
      }

      delete jsonData.id; // Remove the id field if present
      jsonData.uid = user.uid; // Assign the current user UID
      jsonData.published = false; // Set the published field to false

      // Reference to the Firestore collection
      const ref = collection(firestore, "player-personal");

      // Add document to Firestore
      const res = await addDoc(ref, jsonData);
      console.debug("Document added with ID: ", res.id);
    } catch (error) {
      console.error("Error uploading PC from JSON:", error);
    }
  };

  const copyPlayer = function (player) {
    return async function () {
      const data = Object.assign({}, player);
      data.uid = user.uid;
      delete data.id;
      data.published = false;

      const ref = collection(firestore, "player-personal");
      if (window.confirm("Are you sure you want to copy?")) {
        addDoc(ref, data)
          .then(function (docRef) {
            window.location.href = `/pc-gallery/${docRef.id}`;
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
          });
      }
    };
  };

  const deletePlayer = function (player) {
    return function () {
      if (window.confirm("Are you sure you want to delete?")) {
        deleteDoc(doc(firestore, "player-personal", player.id));
      }
    };
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBugDialogClose = () => {
    setIsBugDialogOpen(false);
  };

  const sharePlayer = async (id) => {
    const baseUrl = window.location.href.replace(/\/[^/]+$/, "");
    const fullUrl = `${baseUrl}/pc-gallery/${id}`;
    await navigator.clipboard.writeText(fullUrl);
    setOpen(true);
  };

  const handleNavigation = (path) => {
    navigate(path, {
      state: {
        from: "/pc-gallery",
      },
    });
  };

  return (
    <>
      <Alert
        icon={<Star />}
        severity="success"
        variant="filled"
        sx={{
          mb: 3,
          backgroundColor: "rgb(22, 163, 74)", // emerald-600 equivalent
          "& .MuiAlert-icon": {
            color: "#fff",
          },
        }}
      >
        <Box>
          <AlertTitle
            sx={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              mb: 1,
              color: "#fff",
            }}
          >
            {t("Help us improve the Character Designer!")}
          </AlertTitle>
          <Typography variant="body2" color="#fff" sx={{ mb: 2 }}>
            {t(
              "We value your input on this new feature. Please take a moment to complete our quick survey and share your thoughts. Your feedback will directly influence future updates and enhancements."
            )}
          </Typography>
          <Button
            href="https://forms.gle/4kfWcrZYRcoAErew5"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            sx={{
              backgroundColor: "rgb(220, 252, 231)",
              color: "rgb(22, 163, 74)",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            {t("TAKE QUICK SURVEY")}
          </Button>
        </Box>
      </Alert>
      {/*<Alert variant="filled" severity="warning" sx={{ marginBottom: 3 }}>
        {t(
          "Character Designer is a test feature and it is currently in alpha. Please be aware that it is not finished yet and will be updated frequently. Characters created could be deleted at any time for testing purposes."
        )}
      </Alert>*/}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <Paper sx={{ width: "100%", px: 2, py: 1 }}>
          <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
            <Grid
              item
              xs={12}
              md={3}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <TextField
                id="outlined-basic"
                label={t("Search by Player Name")}
                variant="outlined"
                size="small"
                fullWidth
                value={name}
                onChange={(evt) => {
                  setName(evt.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid
              item
              xs={4}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="direction">{t("Direction:")}</InputLabel>
                <Select
                  labelId="direction"
                  id="select-direction"
                  value={direction}
                  label="direction:"
                  onChange={(evt, val2) => {
                    setDirection(evt.target.value);
                  }}
                >
                  <MenuItem value={"ascending"}>{t("Ascending")}</MenuItem>
                  <MenuItem value={"descending"}>{t("Descending")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{}}
              alignItems="center"
              justifyContent="center"
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<HistoryEdu />}
                onClick={addPlayer}
              >
                {t("Create Player")}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => fileInputRef.current.click()}
              >
                {t("Add PC from JSON")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const result = JSON.parse(reader.result);
                        handleFileUpload(result);
                      } catch (err) {
                        console.error("Error parsing JSON:", err);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                style={{ display: "none" }}
              />
            </Grid>
          </Grid>
        </Paper>
      </div>
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 50,
          }}
        >
          <CircularProgress />
        </div>
      )}
      <Grid container spacing={1} sx={{ py: 1 }}>
        {filteredList.map((player, index) => (
          <Grid
            item
            xs={12}
            md={6}
            alignItems="center"
            justifyContent="center"
            key={index}
            sx={{ marginBottom: "20px" }}
          >
            <PlayerCardGallery
              player={player}
              setPlayer={null}
              sx={{ marginBottom: 1 }}
            />
            <div style={{ marginTop: "3px" }}>
              <Tooltip title={t("Copy")}>
                <IconButton onClick={copyPlayer(player)}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Edit")}>
                <IconButton
                  onClick={() =>
                    handleNavigation(`/pc-gallery/${player.id}`)
                  }
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Delete")}>
                <IconButton onClick={deletePlayer(player)}>
                  <Delete />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Share URL")}>
                <IconButton onClick={() => sharePlayer(player.id)}>
                  <Share />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Player Sheet")}>
                <IconButton
                  onClick={() => handleNavigation(`/character-sheet/${player.id}`)}
                >
                  <Badge />
                </IconButton>
              </Tooltip>
              <Export name={`${player.name}`} dataType="pc" data={player} />
            </div>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<BugReport />}
            sx={{ marginTop: "5rem" }}
            onClick={() => setIsBugDialogOpen(true)}
          >
            {t("Report a Bug")}
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ height: "10vh" }} />
      <HelpFeedbackDialog
        open={isBugDialogOpen}
        onClose={handleBugDialogClose}
        userEmail={user.email}
        userUUID={user.uid}
        title={"Report a Bug"}
        placeholder="Please describe the bug. Please leave a message in english!"
        onSuccess={null}
        webhookUrl={import.meta.env.VITE_DISCORD_REPORT_BUG_WEBHOOK_URL}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message={t("Copied to Clipboard!")}
      />
    </>
  );
}
