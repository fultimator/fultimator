import { Link as RouterLink } from "react-router-dom";

import {
  query,
  orderBy,
  collection,
  where,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import { firestore } from "../../firebase";
import { auth } from "../../firebase";

import {
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  Grid,
  Snackbar,
  CircularProgress,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
import NpcPretty from "../../components/npc/Pretty";
// import NpcUgly from "../../components/npc/Ugly";
import {
  AddCircle,
  ContentCopy,
  Delete,
  Share,
  Download,
  Edit,
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { t } from "../../translation/translate";

export default function NpcGallery() {
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
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [species, setSpecies] = useState("");
  const [collapse, setCollapse] = useState(false);

  const personalRef = collection(firestore, "npc-personal");
  const personalQuery = query(
    personalRef,
    where("uid", "==", user.uid),
    orderBy("lvl", "asc"),
    orderBy("name", "asc")
  );
  const [personalList, loading, err] = useCollectionData(personalQuery, {
    idField: "id",
  });

  const addNpc = async function () {
    const data = {
      name: "-",
      species: "Beast",
      lvl: 5,
      uid: user.uid,
      attributes: {
        dexterity: 8,
        might: 8,
        will: 8,
        insight: 8,
      },
      attacks: [],
      affinities: {},
    };
    const ref = collection(firestore, "npc-personal");

    try {
      const res = await addDoc(ref, data);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }
  };

  const copyNpc = function (npc) {
    return async function () {
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
  };

  const deleteNpc = function (npc) {
    return function () {
      if (window.confirm("Are you sure you want to delete?")) {
        deleteDoc(doc(firestore, "npc-personal", npc.id));
      }
    };
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const shareNpc = async (id) => {
    const baseUrl = window.location.href.replace(/\/[^/]+$/, "");
    const fullUrl = `${baseUrl}/npc-gallery/${id}`;
    await navigator.clipboard.writeText(fullUrl);
    setOpen(true);
  };

  const isMobile = window.innerWidth < 900;

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
        if (
          name !== "" &&
          !item.name.toLowerCase().includes(name.toLocaleLowerCase())
        )
          return false;

        if (species && item.species !== species) return false;

        if (rank && item.rank !== rank) return false;
        return true;
      })
    : [];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <Paper sx={{ width: "100%", px: 2, py: 1 }}>
          <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
            <Grid
              item
              xs={12}
              md={2}
              alignItems="center"
              sx={{ display: "flex" }}
            >
              <Typography variant="h4">
                {t("NPCs")}
                <Tooltip title={t("Create NPC")}>
                  <IconButton onClick={addNpc}>
                    <AddCircle />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Grid>

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
                label={t("Adversary Name")}
                variant="outlined"
                size="small"
                fullWidth
                value={name}
                onChange={(evt) => {
                  setName(evt.target.value);
                }}
              />
            </Grid>

            <Grid
              item
              xs={4}
              md={3}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="rank">{t("Rank:")}</InputLabel>
                <Select
                  labelId="rank"
                  id="select-rank"
                  value={rank}
                  label={t("Rank:")}
                  onChange={(evt, val2) => {
                    setRank(evt.target.value);
                  }}
                >
                  <MenuItem value={""}>{t("All")}</MenuItem>
                  <MenuItem value={"soldier"}>{t("Soldier")}</MenuItem>
                  <MenuItem value={"elite"}>{t("Elite")}</MenuItem>
                  <MenuItem value={"champion2"}>{t("Champion(2)")}</MenuItem>
                  <MenuItem value={"champion3"}>{t("Champion(3)")}</MenuItem>
                  <MenuItem value={"champion4"}>{t("Champion(4)")}</MenuItem>
                  <MenuItem value={"champion5"}>{t("Champion(5)")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={4}
              md={3}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="rank">{t("Species:")}</InputLabel>
                <Select
                  labelId="species"
                  id="select-species"
                  value={species}
                  label={t("Species:")}
                  onChange={(evt, val2) => {
                    setSpecies(evt.target.value);
                  }}
                >
                  <MenuItem value={""}>{t("All")}</MenuItem>
                  <MenuItem value={"Beast"}>{t("Beast")}</MenuItem>
                  <MenuItem value={"Construct"}>{t("Construct")}</MenuItem>
                  <MenuItem value={"Demon"}>{t("Demon")}</MenuItem>
                  <MenuItem value={"Elemental"}>{t("Elemental")}</MenuItem>
                  <MenuItem value={"Humanoid"}>{t("Humanoid")}</MenuItem>
                  <MenuItem value={"Monster"}>{t("Monster")}</MenuItem>
                  <MenuItem value={"Plant"}>{t("Plant")}</MenuItem>
                  <MenuItem value={"Undead"}>{t("Undead")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={4}
              md={1}
              alignItems="center"
              sx={{ display: "flex" }}
            >
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setCollapse(!collapse);
                }}
              >
                {collapse ? t("Collapse") : t("Expand")}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>

      {isMobile ? (
        <div>
          {filteredList?.map((npc, i) => {
            return (
              <Npc
                key={i}
                npc={npc}
                copyNpc={copyNpc}
                deleteNpc={deleteNpc}
                shareNpc={shareNpc}
                collapseGet={collapse}
              />
            );
          })}
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "row-reverse", rowGap: 30 }}
        >
          <div style={{ marginLeft: 10, width: "50%" }}>
            {filteredList?.map((npc, i) => {
              if (i % 2 === 0) return "";
              return (
                <Npc
                  key={i}
                  npc={npc}
                  copyNpc={copyNpc}
                  deleteNpc={deleteNpc}
                  shareNpc={shareNpc}
                  collapseGet={collapse}
                />
              );
            })}
          </div>
          <div style={{ marginRight: 10, width: "50%" }}>
            {filteredList?.map((npc, i) => {
              if (i % 2 !== 0) return "";
              return (
                <Npc
                  key={i}
                  npc={npc}
                  copyNpc={copyNpc}
                  deleteNpc={deleteNpc}
                  shareNpc={shareNpc}
                  collapseGet={collapse}
                />
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 50,
        }}
      >
        {loading && <CircularProgress />}
      </div>

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

function Npc({ npc, copyNpc, deleteNpc, shareNpc, collapseGet }) {
  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);

  const [collapse, setCollapse] = useState(false);

  useEffect(() => {
    setCollapse(collapseGet);
  }, [collapseGet]);

  function expandAndDownloadImage() {
    setCollapse(true);
    setTimeout(downloadImage, 100);
  }

  return (
    <Grid item xs={12} md={12} sx={{ marginBottom: 3 }}>
      <NpcPretty
        npc={npc}
        ref={ref}
        collapse={collapse}
        onClick={() => {
          setCollapse(!collapse);
        }}
      />
      {/* <NpcUgly npc={npc} /> */}
      <Tooltip title={t("Copy")}>
        <IconButton onClick={copyNpc(npc)}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Edit")}>
        <IconButton component={RouterLink} to={`/npc-gallery/${npc.id}`}>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Delete")}>
        <IconButton onClick={deleteNpc(npc)}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Share URL")}>
        <IconButton onClick={() => shareNpc(npc.id)}>
          <Share />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Download as Image")}>
        <IconButton
          onClick={() => {
            expandAndDownloadImage();
          }}
        >
          <Download />
        </IconButton>
      </Tooltip>
      <Export name={`${npc.name}`} data={npc} />
    </Grid>
  );
}
