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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  CircularProgress,
  Paper,
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
  Code,
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { createFileName, useScreenshot } from "use-react-screenshot";
import { createRef, useEffect, useState } from "react";

export default function NpcGallery() {
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
      deleteDoc(doc(firestore, "npc-personal", npc.id));
    };
  };

  const [selectedNpc, setSelectedNpc] = useState("");

  const handleNpcChange = (event) => {
    setSelectedNpc(event.target.value);
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const shareNpc = async (id) => {
    await navigator.clipboard.writeText(window.location.href + "/" + id);
    setOpen(true);
  };

  const isMobile = window.innerWidth < 900;

  if (err?.code === "resource-exhausted") {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        Apologies, fultimator has reached its read quota at the moment, please
        try again later. (Usually 12-24hrs)
      </Paper>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h4">
          NPCs
          <Tooltip title="Create NPC">
            <IconButton onClick={addNpc}>
              <AddCircle />
            </IconButton>
          </Tooltip>
        </Typography>

        <Typography
          sx={{ marginLeft: "none", fontStyle: "italic", color: "#777" }}
        >
          Note for Mobile Users: For better quality, export in landscape mode.
        </Typography>
      </div>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="npc-select-label">Select NPC</InputLabel>
        <Select
          labelId="npc-select-label"
          id="npc-select"
          value={selectedNpc}
          onChange={handleNpcChange}
          label="Select NPC"
        >
          <MenuItem value="" disabled>
            Select an NPC
          </MenuItem>
          {personalList?.map((npc) => (
            <MenuItem
              key={npc.id}
              value={npc.id}
              component={RouterLink}
              to={`/npc-gallery/${npc.id}`}
            >
              {npc.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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

  const [takingScreenshot, setTakingScreenshot] = useState(false);

  const getImage = () => {
    if (collapse) {
      takeScreenShot(ref.current);
    } else {
      setCollapse(true);
      setTakingScreenshot(true);
    }
  };

  useEffect(() => {
    if (takingScreenshot) {
      takeScreenShot(ref.current);
      setTakingScreenshot(false);
    }
  }, [ref, takeScreenShot, takingScreenshot]);

  useEffect(() => {
    if (image) {
      download(image, { name: npc.name, extension: "png" });
    }
  }, [image, npc.name]);

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
      {/* <NpcUgly npc={npc} /> */}
      <Tooltip title="Copy">
        <IconButton onClick={copyNpc(npc)}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton component={RouterLink} to={`/npc-gallery/${npc.id}`}>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton onClick={deleteNpc(npc)}>
          <Delete />
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
