import { useParams } from "react-router";
import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
  where,
  useAuthState,
  useCollectionData,
} from "@platform/db";
import { Card, Grid, Paper, Stack, Typography, TextField } from "@mui/material";
import { Cloud as CloudIcon } from "@mui/icons-material";

import { auth, firestore } from "@platform/db";
import PreparedRollsList from "../../components/roller/PreparedRollsList";
import PrepareRoll from "../../components/roller/PrepareRoll";
import { SignIn } from "../../components/auth";
import Layout from "../../components/Layout";
import Roll from "../../components/roller/Roll";
import ShareLink from "../../components/roller/ShareLink";
import { useTranslate } from "../../translation/translate";

function RollerScoped() {
  const { t } = useTranslate();
  const [user, loading, error] = useAuthState(auth);
  if (error) {
    console.error(error);
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Layout>
        <Paper
          elevation={3}
          sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "wrap" }}
        >
          <CloudIcon color="primary" />
          <Typography variant="body2" color="text.primary" sx={{ flex: 1, minWidth: 200 }}>
            {t("You have to be logged in to access this feature")}
          </Typography>
          <SignIn />
        </Paper>
      </Layout>
    );
  }

  return <RollerScopedAuthenticated user={user} />;
}

function RollerScopedAuthenticated({ user }) {
  const { t } = useTranslate();
  const { scope } = useParams();
  const [name, setName] = useState("");

  const savePreparedRoll = async (dice, modifier, label) => {
    const data = {
      uid: user.uid,
      scope: scope,
      dice: dice,
      modifier: modifier,
      label: label,
      timestamp: new Date(),
    };

    try {
      const rollsPreparedRef = collection(firestore, "rolls-prepared");
      const res = await addDoc(rollsPreparedRef, data);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }
  };

  const saveRoll = async (roll) => {
    const ref = doc(firestore, "rolls", roll.id);
    try {
      const res = await setDoc(ref, roll);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }
  };

  const createRoll = async (dice, modifier, label) => {
    const timestamp = new Date();
    const data = {
      uid: user.uid,
      username: name,
      scope: scope,
      dice: dice,
      modifier: modifier,
      label: label,
      attempts: [
        {
          timestamp: timestamp,
          attempt: [],
        },
      ],
      timestamp: timestamp,
    };

    for (let i = 0; i < dice.length; i++) {
      const randomValues = window.crypto.getRandomValues(new Uint32Array(1));
      const size = parseInt(dice[i].slice(1));

      data.attempts[0].attempt.push((randomValues[0] % size) + 1);
    }

    try {
      const rollsRef = collection(firestore, "rolls");
      const res = await addDoc(rollsRef, data);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }
  };

  return (
    <Layout>
      <Grid container justifyContent="center" spacing={1}>
        <Grid
          sx={{ order: 1 }}
          size={{
            xs: 12,
            sm: 6
          }}>
          <ShareLink scope={scope} />
        </Grid>
        <Grid
          sx={{ order: 1 }}
          size={{
            xs: 12,
            sm: 6
          }}>
          <Card sx={{ p: 2 }}>
            <Typography sx={{ marginBottom: "8px" }}>
              {t("Set name to display here:")}
            </Typography>
            <TextField
              id="name"
              label={t("Name:")}
              value={name}
              onChange={(e) => {
                return setName(e.target.value);
              }}
              size="small"
              fullWidth
            ></TextField>
          </Card>
        </Grid>        

        <Grid  sx={{ order: 3 }} size={12}>
          <PrepareRoll
            savePreparedRoll={savePreparedRoll}
            createRoll={createRoll}
          />
        </Grid>
        <Grid
          sx={{ order: { xs: 6, sm: 5 } }}
          size={{
            xs: 12,
            sm: 5.5
          }}>
          <RollList scope={scope} saveRoll={saveRoll} user={user} />
        </Grid>
        <Grid
          sx={{ order: { xs: 6, sm: 5 } }}
          size={{
            xs: 0,
            sm: 1
          }} />
        <Grid
          sx={{ my: 1, order: { xs: 5, sm: 6 } }}
          size={{
            xs: 12,
            sm: 5.5
          }}>
          <PreparedRolls user={user} scope={scope} createRoll={createRoll} />
        </Grid>
      </Grid>
    </Layout>
  );
}

function PreparedRolls({ user, scope, createRoll }) {
  const { t } = useTranslate();
  const preparedRollsRef = collection(firestore, "rolls-prepared");
  const preparedRollsQuery = query(
    preparedRollsRef,
    where("uid", "==", user.uid),
    where("scope", "==", scope),
    orderBy("timestamp", "desc")
  );

  const deletePreparedRoll = (id) => {
    return async () => {
      try {
        const res = await deleteDoc(doc(firestore, "rolls-prepared", id));
        console.debug(res);
      } catch (e) {
        console.debug(e);
      }
    };
  };

  const [rolls, success, err] = useCollectionData(preparedRollsQuery, {
    idField: "id",
  });

  console.debug(success, err);

  const handleRoll = (roll) => {
    return () => {
      createRoll(roll.dice, roll.modifier, roll.label);
    };
  };

  return (
    <Card sx={{ p: 1 }}>
      <Typography variant="h4">{t("Prepared Rolls")}</Typography>
      <PreparedRollsList
        rolls={rolls}
        handleRoll={handleRoll}
        handleDelete={deletePreparedRoll}
      />
    </Card>
  );
}

function RollList({ scope, saveRoll, user }) {
  const rollsRef = collection(firestore, "rolls");
  const rollsQuery = query(
    rollsRef,
    where("scope", "==", scope),
    orderBy("timestamp", "desc")
  );

  const [rolls, success, err] = useCollectionData(rollsQuery, {
    idField: "id",
  });

  console.debug(success, err);

  return (
    <Stack spacing={2} sx={{ marginBottom: 10 }}>
      {rolls?.map((roll, i) => {
        return (
          <Roll
            key={i}
            roll={roll}
            saveRoll={saveRoll}
            currentUser={user.uid}
          />
        );
      })}
    </Stack>
  );
}

export default RollerScoped;
