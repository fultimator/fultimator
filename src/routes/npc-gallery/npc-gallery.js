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

import { IconButton, Skeleton, Tooltip, Typography, Grid } from "@mui/material";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
import NpcPretty from "../../components/npc/Pretty";
// import NpcUgly from "../../components/npc/Ugly";
import {
  AddCircle,
  ContentCopy,
  Delete,
  Download,
  Edit,
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { createFileName, useScreenshot } from "use-react-screenshot";
import { createRef, useEffect } from "react";

export default function NpcGallery() {
  const [user, loading, error] = useAuthState(auth);
  console.debug("user, loading, error", user, loading, error);

  return (
    <Layout>
      {loading && <Skeleton />}

      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            Devi essere loggato per usare questa feature
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
  const [personalList, success, err] = useCollectionData(personalQuery, {
    idField: "id",
  });

  console.debug("useCollectionData length", personalList?.length);

  console.debug("useCollectionData success, error: ", success, err);

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

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        NPCs
        <IconButton onClick={addNpc}>
          <AddCircle />
        </IconButton>
      </Typography>
      <Grid container spacing={2}>
        {personalList?.map((npc, i) => {
          return (
            <Npc key={i} npc={npc} copyNpc={copyNpc} deleteNpc={deleteNpc} />
          );
        })}
      </Grid>
    </>
  );
}

function Npc({ npc, copyNpc, deleteNpc }) {
  const ref = createRef(null);

  const [image, takeScreenShot] = useScreenshot();

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
    <Grid item xs={6}>
      <NpcPretty npc={npc} ref={ref} />
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
      <Tooltip title="Download">
        <IconButton onClick={getImage}>
          <Download />
        </IconButton>
      </Tooltip>
    </Grid>
  );
}
