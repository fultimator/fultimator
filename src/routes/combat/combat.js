import {
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

import { SignIn } from "../../components/auth";
import { auth, firestore } from "../../firebase";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
import { calcHP, calcMP } from "../../libs/npcs";

export default function Combat() {
  const [user, loading, error] = useAuthState(auth);
  console.debug("user, loading, error", user, loading, error);

  return (
    <Layout>
      <Typography variant="h4">Combat</Typography>
      {loading && <Skeleton />}

      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            You must be logged in to use this feature
          </Typography>
          <SignIn />
        </>
      )}

      {user && <AuthCombat user={user} />}
    </Layout>
  );
}

function AuthCombat({ user }) {
  const personalRef = collection(firestore, "npc-personal");
  const personalQuery = query(
    personalRef,
    where("uid", "==", user.uid),
    orderBy("lvl", "asc"),
    orderBy("name", "asc")
  );
  const [personalList, loading] = useCollectionData(personalQuery, {
    idField: "id",
  });

  const [npcs, setNpcs] = useState([]);

  const addNpc = (e, newValue) => {
    setNpcs((prevState) => [...prevState, newValue]);
  };

  // const removeAttack = (i) => {
  //   return () => {
  //     setNpc((prevState) => {
  //       const newState = Object.assign({}, prevState);
  //       newState.attacks.splice(i, 1);
  //       return newState;
  //     });
  //   };
  // };

  if (loading) {
    return null;
  }

  // Add label
  personalList?.forEach((npc) => {
    npc.label = npc.name;
  });

  console.debug(npcs);
  console.log(
    npcs
  )

  return (
    <Grid container sx={{ mt: 2 }}>
      {npcs?.map((npc) => {
        if (!npc) {
          return null;
        }
        return (
          <Grid item xs={12} key={npc.id}>
            <Npc npc={npc}></Npc>
          </Grid>
        );
      })}
      <Grid item xs={12}>
        <Autocomplete
          size="small"
          disablePortal
          id="combo-box-demo"
          options={personalList}
          sx={{ width: 300 }}
          onChange={addNpc}
          renderInput={(params) => <TextField {...params} label="Png" />}
        />
      </Grid>
    </Grid>
  );
}

function Npc({ npc }) {
  const [hp, setHp] = useState(calcHP(npc));
  const [mp, setMp] = useState(calcMP(npc));

  const changeHp = (value) => {
    return () => {
      setHp(hp + value);
    };
  };
  const changeMp = (value) => {
    return () => {
      setMp(mp + value);
    };
  };

  const crisis = hp < calcHP(npc) / 2;

  return (
    <Grid container spacing={1} sx={{ my: 1 }}>
      <Grid item xs={6}>
        <NpcPretty npc={npc} />
      </Grid>
      <Grid xs={6} item>
        <Grid container spacing={1} rowSpacing={2} sx={{ px: 2 }}>
          <Grid item xs={2}>
            <Typography variant="h5" color="red">
              HP: {hp}
            </Typography>
            {crisis && "Crisis!"}
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="outlined" size="small" color="red">
              <Button onClick={changeHp(-1)}>-1</Button>
              <Button onClick={changeHp(-2)}>-2</Button>
              <Button onClick={changeHp(-5)}>-5</Button>
              <Button onClick={changeHp(-10)}>-10</Button>
              <Button onClick={changeHp(-20)}>-20</Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="outlined" size="small" color="red">
              <Button onClick={changeHp(+1)}>+1</Button>
              <Button onClick={changeHp(+2)}>+2</Button>
              <Button onClick={changeHp(+5)}>+5</Button>
              <Button onClick={changeHp(+10)}>+10</Button>
              <Button onClick={changeHp(+20)}>+20</Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h5" color="cyan">
              MP: {mp}
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="outlined" size="small" color="cyan">
              <Button onClick={changeMp(-1)}>-1</Button>
              <Button onClick={changeMp(-2)}>-2</Button>
              <Button onClick={changeMp(-5)}>-5</Button>
              <Button onClick={changeMp(-10)}>-10</Button>
              <Button onClick={changeMp(-20)}>-20</Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="outlined" size="small" color="cyan">
              <Button onClick={changeMp(+1)}>+1</Button>
              <Button onClick={changeMp(+2)}>+2</Button>
              <Button onClick={changeMp(+5)}>+5</Button>
              <Button onClick={changeMp(+10)}>+10</Button>
              <Button onClick={changeMp(+20)}>+20</Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={12}>
            <FormGroup aria-label="position" row>
              <FormControlLabel
                value="slow"
                control={<Checkbox />}
                label="Slow"
                labelPlacement="top"
              />
              <FormControlLabel
                value="dazed"
                control={<Checkbox />}
                label="Dazed"
                labelPlacement="top"
              />
              <FormControlLabel
                value="weak"
                control={<Checkbox />}
                label="Weak"
                labelPlacement="top"
              />
              <FormControlLabel
                value="shaken"
                control={<Checkbox />}
                label="Shaken"
                labelPlacement="top"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <FormGroup aria-label="position" row>
              <FormControlLabel
                value="enraged"
                control={<Checkbox />}
                label="Enraged"
                labelPlacement="top"
              />
              <FormControlLabel
                value="poisoned"
                control={<Checkbox />}
                label="Poisoned"
                labelPlacement="top"
              />
            </FormGroup>
          </Grid>
          <Grid item flex="1"></Grid>
        </Grid>
      </Grid>
      <Divider flexItem sx={{ p: 1, my: 2, width: "100%" }} />
    </Grid>
  );
}
