import {
  query,
  orderBy,
  limit,
  collection,
  where,
  doc,
  addDoc,
  deleteDoc,
  startAfter,
  setDoc,
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
  Paper,
  TextField,
  Slider,
  Avatar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
import NpcPretty from "../../components/npc/Pretty";
// import NpcUgly from "../../components/npc/Ugly";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  ContentCopy,
  Share,
  Download,
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";

import allToken from "../icons/All-token.webp";
import beastToken from "../icons/Beast-token.webp";
import constructToken from "../icons/Construct-token.webp";
import demonToken from "../icons/Demon-token.webp";
import elementalToken from "../icons/Elemental-token.webp";
import humanToken from "../icons/Human-token.webp";
import monsterToken from "../icons/Monster-token.webp";
import plantToken from "../icons/Plant-token.webp";
import undeadToken from "../icons/Undead-token.webp";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { useTranslate, languageOptions } from "../../translation/translate";

export default function NpcCompedium() {
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
  const [collapse, setCollapse] = useState(true);
  const [lastItem, setLastItem] = useState(undefined);
  const [prevLastItem, setPrevLastItem] = useState([]);
  const personalRef = collection(firestore, "npc-personal");
  const [selectedType, setSelectedType] = useState("All");
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [language, setLanguage] = useState("en");
  const [levels, setLevels] = useState([5, 60]);

  useEffect(() => {
    console.log("User ID: ", user.uid);
  }, []);

  const [searchParams, setSearchParams] = useState({
    type: "All",
    name: "",
    level: [5, 60],
    rank: "",
    language: "en",
  });

  console.log(searchParams);

  const constraints = [where("published", "==", true)];

  if (searchParams.level[0] !== 5 || searchParams.level[1] !== 60) {
    constraints.push(where("lvl", ">=", searchParams.level[0]));
    constraints.push(where("lvl", "<=", searchParams.level[1]));
    constraints.push(orderBy("lvl", "asc"));
  }

  if (searchParams.name !== "") {
    constraints.push(
      where("searchString", "array-contains-any", [
        ...searchParams.name
          .replace(/[\W_]+/g, " ")
          .toLowerCase()
          .split(" "),
      ])
    );
  }

  if (searchParams.rank !== "") {
    constraints.push(where("rank", "==", searchParams.rank));
  }

  if (searchParams.type !== "All") {
    constraints.push(where("species", "==", searchParams.type));
  }

  constraints.push(where("language", "==", searchParams.language));

  constraints.push(orderBy("publishedAt", "desc"));

  if (lastItem) {
    if (searchParams.level[0] !== 5 || searchParams.level[1] !== 60) {
      constraints.push(startAfter(lastItem.lvl, lastItem.publishedAt));
    } else {
      constraints.push(startAfter(lastItem.publishedAt));
    }
  }

  constraints.push(limit(6));

  const personalQuery = query(personalRef, ...constraints);
  const [personalList, loading, err] = useCollectionData(personalQuery);

  if (err) {
    console.log(err);
  }

  const nextPage = () => {
    setPrevLastItem([...prevLastItem, lastItem]);
    for (let i = 1; i < personalList.length; i++) {
      if (personalList[personalList.length - i]?.id) {
        setLastItem(personalList[personalList.length - 1]);
        return;
      }
    }
  };

  const prevPage = () => {
    setLastItem(prevLastItem[prevLastItem.length - 1]);
    const newPrevLastItem = [...prevLastItem];
    newPrevLastItem.pop();
    setPrevLastItem(newPrevLastItem);
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
      deleteDoc(doc(firestore, "npc-personal", npc.id));
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

  const enemyType = (token, name, label) => {
    const isMobile = window.innerWidth < 900;
    return (
      <Grid
        item
        xs={4}
        md={1.3}
        alignItems="center"
        justifyContent="center"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          alt="icon"
          src={token}
          sx={{
            width:
              selectedType === name
                ? isMobile
                  ? 80
                  : 130
                : isMobile
                ? 60
                : 100,
            height:
              selectedType === name
                ? isMobile
                  ? 80
                  : 130
                : isMobile
                ? 60
                : 100,
            border: selectedType === name ? "6px solid purple" : "none",
            cursor: "pointer",
          }}
          onClick={() => {
            setSelectedType(name);
          }}
        />
        <div
          style={{
            color: selectedType === name ? "purple" : "#999999",
            fontWeight: selectedType === name ? 700 : 400,
          }}
        >
          {label}
        </div>
      </Grid>
    );
  };

  const marks = [
    {
      value: 10,
      label: t("Lvl 10"),
    },
    {
      value: 20,
      label: t("Lvl 20"),
    },
    {
      value: 30,
      label: t("Lvl 30"),
    },
    {
      value: 40,
      label: t("Lvl 40"),
    },
    {
      value: 50,
      label: t("Lvl 50"),
    },
    {
      value: 60,
      label: t("Lvl 60"),
    },
  ];

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

  return (
    <>
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
          {enemyType(allToken, "All", t("All"))}
          {enemyType(beastToken, "Beast", t("Beast"))}
          {enemyType(constructToken, "Construct", t("Construct"))}
          {enemyType(demonToken, "Demon", t("Demon"))}
          {enemyType(elementalToken, "Elemental", t("Elemental"))}
          {enemyType(humanToken, "Humanoid", t("Humanoid"))}
          {enemyType(monsterToken, "Monster", t("Monster"))}
          {enemyType(plantToken, "Plant", t("Plant"))}
          {enemyType(undeadToken, "Undead", t("Undead"))}
        </Grid>

        <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
          <Grid
            item
            xs={12}
            md={1}
            alignItems="center"
            justifyContent="center"
            sx={{ display: "flex" }}
          >
            <Typography fontWeight={700}>{t("Search:")}</Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={2}
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
            xs={12}
            md={3}
            alignItems="center"
            justifyContent="center"
            sx={{ display: "flex", marginLeft: 5, marginRight: 5 }}
          >
            <Slider
              getAriaLabel={() => "Level"}
              value={levels}
              step={5}
              min={5}
              marks={marks}
              onChange={(val, val2) => {
                setLevels(val2);
              }}
              sx={{ width: 300 }}
              max={60}
              valueLabelDisplay="auto"
              getAriaValueText={(value) => {
                return `${t("Lvl:")}${value}`;
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={2}
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
                <MenuItem value={"champion1"}>{t("Champion(1)")}</MenuItem>
                <MenuItem value={"champion2"}>{t("Champion(2)")}</MenuItem>
                <MenuItem value={"champion3"}>{t("Champion(3)")}</MenuItem>
                <MenuItem value={"champion4"}>{t("Champion(4)")}</MenuItem>
                <MenuItem value={"champion5"}>{t("Champion(5)")}</MenuItem>
                <MenuItem value={"champion6"}>{t("Champion(6)")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} md={2} alignItems="center" sx={{ display: "flex" }}>
            <FormControl fullWidth size="small">
              <InputLabel id="Language">{t("Language:")}</InputLabel>
              <Select
                labelId="language"
                id="select-language"
                value={language}
                label={t("Language:")}
                onChange={(evt) => {
                  setLanguage(evt.target.value);
                }}
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} md={2} alignItems="center" sx={{ display: "flex" }}>
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
          <Grid
            item
            xs={12}
            md={2}
            sx={{ display: "flex" }}
            alignItems="center"
            justifyContent="center"
          >
            <Button
              variant="contained"
              sx={{}}
              startIcon={<Search />}
              onClick={() => {
                setPrevLastItem([]);
                setLastItem(undefined);
                setSearchParams({
                  type: selectedType,
                  name: name.toLowerCase(),
                  level: levels,
                  rank: rank ? rank : "",
                  language: language,
                });
              }}
            >
              {t("Search")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isMobile ? (
        <div>
          {personalList?.map((npc, i) => {
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
            {personalList?.map((npc, i) => {
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
            {personalList?.map((npc, i) => {
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
        {!loading ? (
          <>
            {personalList && personalList.length > 5 ? (
              <>
                {prevLastItem.length ? (
                  <Button
                    variant="contained"
                    sx={{ marginRight: 4 }}
                    startIcon={<ArrowLeft />}
                    onClick={prevPage}
                    size="large"
                  >
                    {t("Prev Items")}
                  </Button>
                ) : (
                  ""
                )}
                <Button
                  variant="contained"
                  sx={{}}
                  endIcon={<ArrowRight />}
                  onClick={nextPage}
                  size="large"
                >
                  {t("Next Items")}
                </Button>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <Typography fontWeight={700} marginBottom={4}>
                  {t(" No more adversaries found.")}
                </Typography>
                {prevLastItem.length ? (
                  <Button
                    variant="contained"
                    sx={{}}
                    startIcon={<ArrowLeft />}
                    onClick={prevPage}
                    size="large"
                  >
                    {t("Prev Items")}
                  </Button>
                ) : (
                  ""
                )}
              </div>
            )}
          </>
        ) : (
          <CircularProgress />
        )}
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

function Npc({ npc, copyNpc, shareNpc, collapseGet }) {
  const { t } = useTranslate();
  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);

  useEffect(() => {
    setCollapse(collapseGet);
  }, [collapseGet]);

  // const [collapse, setCollapse] = useState(window.innerWidth >= 900);
  const [collapse, setCollapse] = useState(false);

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
      <Tooltip title={t("Copy to adversary designer")}>
        <IconButton onClick={copyNpc(npc)}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Share URL")}>
        <IconButton onClick={() => shareNpc(npc.id)}>
          <Share />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Download as Image")}>
        <IconButton onClick={downloadImage}>
          <Download />
        </IconButton>
      </Tooltip>
      <Export name={`${npc.name}`} data={npc} />
      <span style={{ fontSize: 14 }}>
        {t("Created By:")} {npc.createdBy}
      </span>
    </Grid>
  );
}
