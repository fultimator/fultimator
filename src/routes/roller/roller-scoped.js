import { useParams } from "react-router-dom";
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
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Card, Grid, Stack, Typography, TextField } from "@mui/material";

import { auth, firestore } from "../../firebase";
import PreparedRollsList from "../../components/roller/PreparedRollsList";
import PrepareRoll from "../../components/roller/PrepareRoll";
import { SignIn } from "../../components/auth";
import Layout from "../../components/Layout";
import Roll from "../../components/roller/Roll";
import ShareLink from "../../components/roller/ShareLink";
import { t } from "../../translation/translate";

function RollerScoped() {
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
        <Typography sx={{ my: 1 }}>
          You have to be logged in to access this feature
        </Typography>
        <SignIn />
      </Layout>
    );
  }

  return <RollerScopedAuthenticated user={user} />;
}

function RollerScopedAuthenticated({ user }) {
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
        <Grid item xs={12} sm={5} sx={{ order: 1 }}>
          <ShareLink scope={scope} />
        </Grid>
        <Grid item xs={12} sm={3} sx={{ order: 1 }}>
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
        <Grid item sx={{ order: 2 }}>
          <Card sx={{ p: 2 }}>
            <Typography>
              {t("Left-click on a die to add it to your pool")}
              <br />
              {t("Right-click a die to remove it from your hand")}
              <br />
              {t("Press enter to roll")}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sx={{ order: 3 }}>
          <PrepareRoll
            savePreparedRoll={savePreparedRoll}
            createRoll={createRoll}
          />
        </Grid>
        <Grid item xs={12} sm={5} sx={{ order: { xs: 6, sm: 5 } }}>
          <RollList scope={scope} saveRoll={saveRoll} user={user} />
        </Grid>
        <Grid item xs={0} sm={1} sx={{ order: { xs: 6, sm: 5 } }} />
        <Grid item xs={12} sm={5} sx={{ my: 1, order: { xs: 5, sm: 6 } }}>
          <PreparedRolls user={user} scope={scope} createRoll={createRoll} />
        </Grid>
      </Grid>
    </Layout>
  );
}

function PreparedRolls({ user, scope, createRoll }) {
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
