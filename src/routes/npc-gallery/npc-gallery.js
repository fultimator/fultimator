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

import { IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import Layout from "../../components/Layout";
import NpcList from "../../components/npc/List";
import { SignIn } from "../../components/auth";
import NpcPretty from "../../components/npc/Pretty";
import { ContentCopy, Delete, Edit } from "@mui/icons-material";

export default function NpcGallery() {
  const officialRef = collection(firestore, "npc-official");
  const officialQuery = query(
    officialRef,
    orderBy("lvl", "asc"),
    orderBy("name", "asc")
  );

  const [user, loading, error] = useAuthState(auth);
  console.debug(user, loading, error);

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

  return (
    <Layout>
      <Typography variant="h4">Npc Ufficiali</Typography>
      <NpcList
        listQuery={officialQuery}
        component={(npc) => {
          return (
            <>
              <NpcPretty npc={npc} />
              {user && (
                <Tooltip title="Copia">
                  <IconButton onClick={copyNpc(npc)}>
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              )}
            </>
          );
        }}
      />

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

  const openEdit = function (npc) {
    return function () {
      console.debug(npc);
    };
  };

  const deleteNpc = function (npc) {
    return function () {
      deleteDoc(doc(firestore, "npc-personal", npc.id));
    };
  };

  return (
    <>
      <Typography variant="h4">Npc Personali</Typography>
      <NpcList
        listQuery={personalQuery}
        component={(npc) => {
          return (
            <>
              <NpcPretty npc={npc} />
              <Tooltip title="Modifica">
                <IconButton onClick={openEdit(npc)}>
                  <Edit />
                </IconButton>
              </Tooltip>{" "}
              <Tooltip title="Cancella">
                <IconButton onClick={deleteNpc(npc)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </>
          );
        }}
      />
    </>
  );
}
