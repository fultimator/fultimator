import { Link as RouterLink } from "react-router-dom";

import {
  query,
  collection,
  where,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useState } from "react";
import { firestore } from "../../firebase";
import { auth } from "../../firebase";

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
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslate } from "../../translation/translate";
import PlayerCard from "../../components/player/playerSheet/PlayerCard";
import { testUsers, moderators } from "../../libs/userGroups";
import SearchIcon from "@mui/icons-material/Search";

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
  const [open, setOpen] = useState(false);

  const canAccessTest =
    testUsers.includes(user.uid) || moderators.includes(user.uid);

  const personalRef = collection(firestore, "player-personal");
  const personalQuery = query(personalRef, where("uid", "==", user.uid));
  const [personalList, err] = useCollectionData(personalQuery, {
    idField: "id",
  });

  if (!canAccessTest) {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        {t("You are not authorized to access this page.")}
      </Paper>
    );
  }

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
    ? personalList.filter((item) => {
        // Filter based on name
        if (
          name !== "" &&
          !item.name.toLowerCase().includes(name.toLowerCase())
        )
          return false;

        return true;
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

  const copyPlayer = function (player) {
    return async function () {
      const data = Object.assign({}, player);
      data.uid = user.uid;
      delete data.id;
      data.published = false;

      const ref = collection(firestore, "player-personal");

      addDoc(ref, data)
        .then(function (docRef) {
          window.location.href = `/player-gallery/${docRef.id}`;
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
        });
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

  const sharePlayer = async (id) => {
    const baseUrl = window.location.href.replace(/\/[^/]+$/, "");
    const fullUrl = `${baseUrl}/player-gallery/${id}`;
    await navigator.clipboard.writeText(fullUrl);
    setOpen(true);
  };

  return (
    <>
      <Alert
        variant="filled"
        severity="warning"
        sx={{ marginBottom: 3 }}
      >
        {t(
          "Character Creator is a test feature and it is currently in alpha. Please be aware that it is not finished yet and will be updated frequently. Characters created could be deleted at any time for testing purposes."
        )}
      </Alert>
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
          </Grid>
        </Paper>
      </div>
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
            <PlayerCard
              player={player}
              setPlayer={null}
              isEditMode={false}
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
                  component={RouterLink}
                  to={`/player-gallery/${player.id}`}
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
            </div>
          </Grid>
        ))}
      </Grid>
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
