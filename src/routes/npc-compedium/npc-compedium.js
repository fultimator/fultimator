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

export default function NpcCompedium() {
  const [user, loading] = useAuthState(auth);

  return (
    <Layout>
      {loading && <Skeleton />}

      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            You have to be logged in to access this feature
          </Typography>
          <SignIn />
        </>
      )}

      {user && <Personal user={user} />}
    </Layout>
  );
}

function Personal({ user }) {
  const [collapse, setCollapse] = useState(true);
  const [lastItem, setLastItem] = useState(undefined);
  const [prevLastItem, setPrevLastItem] = useState([]);
  const personalRef = collection(firestore, "npc-personal");
  const [selectedType, setSelectedType] = useState("All");
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [levels, setLevels] = useState([5, 60]);

  const [searchParams, setSearchParams] = useState({
    type: "All",
    name: "",
    level: [5, 60],
    rank: "",
  });

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
    await navigator.clipboard.writeText(window.location.href + "/" + id);
    setOpen(true);
  };

  const enemyType = (token, name) => {
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
          {name}
        </div>
      </Grid>
    );
  };

  const marks = [
    {
      value: 10,
      label: "Lvl 10",
    },
    {
      value: 20,
      label: "Lvl 20",
    },
    {
      value: 30,
      label: "Lvl 30",
    },
    {
      value: 40,
      label: "Lvl 40",
    },
    {
      value: 50,
      label: "Lvl 50",
    },
    {
      value: 60,
      label: "Lvl 60",
    },
  ];

  const isMobile = window.innerWidth < 900;

  if (err?.code === "resource-exhausted") {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        Apologies, fultimator has reached its read quota at the moment, please
        try again tomorrow. (Around 12-24 hours)
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
          {enemyType(allToken, "All")}
          {enemyType(beastToken, "Beast")}
          {enemyType(constructToken, "Construct")}
          {enemyType(demonToken, "Demon")}
          {enemyType(elementalToken, "Elemental")}
          {enemyType(humanToken, "Humanoid")}
          {enemyType(monsterToken, "Monster")}
          {enemyType(plantToken, "Plant")}
          {enemyType(undeadToken, "Undead")}
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
            <Typography fontWeight={700}>Search:</Typography>
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
              label="Adversary Name"
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
              aria-label="Always visible"
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
                return `Lvl:${value}`;
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
              <InputLabel id="rank">Rank:</InputLabel>
              <Select
                labelId="rank"
                id="select-rank"
                value={rank}
                label="Rank:"
                onChange={(evt, val2) => {
                  setRank(evt.target.value);
                }}
              >
                <MenuItem value={""}>All</MenuItem>
                <MenuItem value={"soldier"}>Soldier</MenuItem>
                <MenuItem value={"elite"}>Elite</MenuItem>
                <MenuItem value={"champion2"}>Champion(2)</MenuItem>
                <MenuItem value={"champion3"}>Champion(3)</MenuItem>
                <MenuItem value={"champion4"}>Champion(4)</MenuItem>
                <MenuItem value={"champion5"}>Champion(5)</MenuItem>
              </Select>
            </FormControl>
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
                });
              }}
            >
              Search
            </Button>
          </Grid>
          <Grid item xs={4} md={1} alignItems="center" sx={{ display: "flex" }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setCollapse(!collapse);
              }}
            >
              {collapse ? "Collapse" : "Expand"}
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
                    Prev Items
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
                  Next Items
                </Button>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <Typography fontWeight={700} marginBottom={4}>
                  No more adversaries found.
                </Typography>
                {prevLastItem.length ? (
                  <Button
                    variant="contained"
                    sx={{}}
                    startIcon={<ArrowLeft />}
                    onClick={prevPage}
                    size="large"
                  >
                    Prev Items
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
        message="Copied to Clipboard!"
      />
    </>
  );
}

function Npc({ npc, copyNpc, deleteNpc, shareNpc, collapseGet }) {
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
      <Tooltip title="Copy to adversary designer">
        <IconButton onClick={copyNpc(npc)}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title="Share URL">
        <IconButton onClick={() => shareNpc(npc.id)}>
          <Share />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download as Image">
        <IconButton onClick={downloadImage}>
          <Download />
        </IconButton>
      </Tooltip>
      <Export name={`${npc.name}`} data={npc} />
      <span style={{ fontSize: 14 }}>Created By: {npc.createdBy}</span>
    </Grid>
  );
}
