import { Link as RouterLink } from "react-router-dom";

import {
  query,
  orderBy,
  limit,
  startAfter,
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
  Paper,
  TextField,
  Slider,
  Autocomplete,
} from "@mui/material";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
import NpcPretty from "../../components/npc/Pretty";
// import NpcUgly from "../../components/npc/Ugly";
import {
  ArrowRight,
  ContentCopy,
  Share,
  Download,
  Code,
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { createFileName, useScreenshot } from "use-react-screenshot";
import { createRef, useEffect, useState } from "react";

import allToken from "../icons/All-token.png";
import constructToken from "../icons/Construct-token.png";
import demonToken from "../icons/Demon-token.png";
import elementalToken from "../icons/Elemental-token.png";
import humanToken from "../icons/Human-token.png";
import monsterToken from "../icons/Monster-token.png";
import plantToken from "../icons/Plant-token.png";
import undeadToken from "../icons/Undead-token.png";

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
  const [lastItem, setLastItem] = useState(undefined);
  const personalRef = collection(firestore, "npc-personal");
  const personalQuery = query(
    personalRef,
    where("name", "!=", ""),
    orderBy("name", "asc"),
    orderBy("lvl", "asc"),
    startAfter(lastItem ? lastItem.id : 0),
    limit(10)
  );
  const [personalList, success, err] = useCollectionData(personalQuery);

  console.debug("useCollectionData length", personalList?.length);

  console.debug("useCollectionData success, error: ", success, err);

  const nextPage = () => {
    setLastItem(personalList[personalList.length - 1]);
  };

  const copyNpc = function (npc) {
    return async function () {
      const data = Object.assign({}, npc);
      data.uid = user.uid;
      delete data.id;
      console.debug(data);

      const ref = collection(firestore, "npc-personal");

      await addDoc(ref, data);
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

  const enemyType = (token) => {
    return (
      <Grid
        item
        xs={4}
        md={1.5}
        alignItems="center"
        justifyContent="center"
        sx={{ display: "flex" }}
      >
        <img src={token} alt="all" />
      </Grid>
    );
  };

  return (
    <>
      <Paper elevation={3} sx={{ margin: 5 }}>
        <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
          {enemyType(allToken)}
          {enemyType(constructToken)}
          {enemyType(demonToken)}
          {enemyType(elementalToken)}
          {enemyType(humanToken)}
          {enemyType(monsterToken)}
          {enemyType(plantToken)}
          {enemyType(undeadToken)}
        </Grid>

        <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
          <Grid
            item
            xs={4}
            md={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{ display: "flex" }}
          >
            <TextField
              id="outlined-basic"
              label="Adversary Name"
              variant="outlined"
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
            <Typography>Level</Typography>
          </Grid>
          <Grid
            item
            xs={4}
            md={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{ display: "flex" }}
          >
            <Slider
              getAriaLabel={() => "Level"}
              value={[0, 20]}
              onChange={() => {}}
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
            xs={4}
            md={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{ display: "flex" }}
          >
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={[
                "soldier",
                "elite",
                "champion2",
                "champion3",
                "champion4",
                "champion5",
              ]}
              renderInput={(params) => <TextField {...params} label="Rank" />}
            />
          </Grid>
          <IconButton aria-label="" onClick={nextPage}>
            <ArrowRight />
          </IconButton>
        </Grid>
      </Paper>
      <div style={{ display: "flex", rowGap: 30 }}>
        <div style={{ marginRight: 10, width: "50%" }}>
          {personalList?.map((npc, i) => {
            if (i % 2 === 0) return "";
            return (
              <Npc
                key={i}
                npc={npc}
                copyNpc={copyNpc}
                deleteNpc={deleteNpc}
                shareNpc={shareNpc}
              />
            );
          })}
        </div>
        <div style={{ marginLeft: 10, width: "50%" }}>
          {personalList?.map((npc, i) => {
            if (i % 2 !== 0) return "";
            return (
              <Npc
                key={i}
                npc={npc}
                copyNpc={copyNpc}
                deleteNpc={deleteNpc}
                shareNpc={shareNpc}
              />
            );
          })}
        </div>
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

function Npc({ npc, copyNpc, deleteNpc, shareNpc }) {
  const ref = createRef(null);

  const [image, takeScreenShot] = useScreenshot();

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
  const getJSON = () => {
    const jsonData = JSON.stringify(npc);
    const fileName = `${npc.name.replace(/\s/g, "_").toLowerCase()}.json`;
    downloadFile(jsonData, fileName, "text/plain");
  };

  const download = (image, { name = "img", extension = "png" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
  };

  const getImage = () => takeScreenShot(ref.current);

  useEffect(() => {
    if (image) {
      download(image, { name: npc.name, extension: "png" });
    }
  }, [image, npc.name]);
  return (
    <Grid item xs={12} md={12} sx={{ marginBottom: 3 }}>
      <NpcPretty npc={npc} ref={ref} />
      <Tooltip title="Copy">
        <IconButton onClick={copyNpc(npc)}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title="Share URL">
        <IconButton onClick={() => shareNpc(npc.id)}>
          <Share />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download">
        <IconButton onClick={getImage}>
          <Download />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export JSON">
        <IconButton onClick={getJSON}>
          <Code />
        </IconButton>
      </Tooltip>
    </Grid>
  );
}
