import { firestore } from "../../firebase";

import { query, orderBy, collection } from "firebase/firestore";

import { Typography } from "@mui/material";
import Layout from "../../components/Layout";
import NpcList from "../../components/npc/List";

export default function NpcGallery() {
  const officialRef = collection(firestore, "npc-official");
  const officialQuery = query(
    officialRef,
    orderBy("lvl", "asc"),
    orderBy("name", "asc")
  );

  return (
    <Layout>
      <Typography variant="h4">Npc Ufficiali</Typography>
      <NpcList listQuery={officialQuery} />
    </Layout>
  );
}
