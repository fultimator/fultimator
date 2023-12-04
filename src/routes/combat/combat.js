import {
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControlLabel,
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
import { useEffect } from "react";

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
  const [attributes, setAttributes] = useState(npc.attributes);
  const [statusEffects, setStatusEffects] = useState({
    slow: false,
    dazed: false,
    weak: false,
    shaken: false,
    enraged: false,
    poisoned: false
  })

  const originalAttributes = npc.attributes;

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

  const adjustAttribute = (attribute = 0, amount = 0, min = 6) => {
    return attribute + amount <= min ? min : attribute + amount
  }

  useEffect(() => {
    let {
      slow,
      dazed,
      weak,
      shaken,
      enraged,
      poisoned
    } = statusEffects

    setAttributes({
      dexterity: enraged && slow ? adjustAttribute(originalAttributes.dexterity, -4) : enraged || slow ? adjustAttribute(originalAttributes.dexterity, -2) : originalAttributes.dexterity,
      insight: enraged && dazed ? adjustAttribute(originalAttributes.insight, -4) : enraged || dazed ? adjustAttribute(originalAttributes.insight, -2) : originalAttributes.insight,
      might: poisoned && weak ? adjustAttribute(originalAttributes.might, -4) : poisoned || weak ? adjustAttribute(originalAttributes.might, -2) : originalAttributes.might,
      will: poisoned && shaken ? adjustAttribute(originalAttributes.will, -4) : poisoned || shaken ? adjustAttribute(originalAttributes.will, -2) : originalAttributes.will
    });
  }, [statusEffects]);


  const toggleStatus = (status = '', hasStatus = false) => {
    switch (status) {
      case 'slow':
        setStatusEffects(s => ({
          ...s,
          slow: hasStatus
        }));
        break;
      case 'dazed':
        setStatusEffects(s => ({
          ...s,
          dazed: hasStatus
        }))
        break;
      case 'weak':
        setStatusEffects(s => ({
          ...s,
          weak: hasStatus
        }))
        break;
      case 'shaken':
        setStatusEffects(s => ({
          ...s,
          shaken: hasStatus
        }))
        break;
      case 'enraged':
        setStatusEffects(s => ({
          ...s,
          enraged: hasStatus
        }))
        break;
      case 'poisoned':
        setStatusEffects(s => ({
          ...s,
          poisoned: hasStatus
        }))
        break;
      default:
        break;
    }
  }




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
          <Grid item container xs={12}>
            <Grid item xs>
              <Typography variant="h5">
                DEX: d{attributes.dexterity}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                INS: d{attributes.insight}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                MIG: d{attributes.might}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                WIL: d{attributes.will}
              </Typography>
            </Grid>
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs>
              <FormControlLabel
                value="slow"
                control={<Checkbox
                  onClick={({ target: { value, checked } }) => {
                    toggleStatus(value, checked)
                  }}
                />}
                label="Slow"
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs>
              <FormControlLabel
                value="dazed"
                control={<Checkbox
                  onClick={({ target: { value, checked } }) => {
                    toggleStatus(value, checked)
                  }}
                />}
                label="Dazed"
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs>
              <FormControlLabel
                value="weak"
                control={<Checkbox
                  onClick={({ target: { value, checked } }) => {
                    toggleStatus(value, checked)
                  }}
                />}
                label="Weak"
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs>
              <FormControlLabel
                value="shaken"
                control={<Checkbox
                  onClick={({ target: { value, checked } }) => {
                    toggleStatus(value, checked)
                  }}
                />}
                label="Shaken"
                labelPlacement="top"
              />
            </Grid>
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs display='flex' justifyContent='center'>
              <FormControlLabel
                value="enraged"
                control={<Checkbox
                  onClick={({ target: { value, checked } }) => {
                    toggleStatus(value, checked)
                  }}
                />}
                label="Enraged"
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs display='flex' justifyContent='center'>
              <FormControlLabel
                value="poisoned"
                control={<Checkbox
                  onClick={({ target: { value, checked } }) => {
                    toggleStatus(value, checked)
                  }}
                />}
                label="poisoned"
                labelPlacement="top"
              />
            </Grid>
          </Grid>
          <Grid item flex="1"></Grid>
        </Grid>
      </Grid>
      <Divider flexItem sx={{ p: 1, my: 2, width: "100%" }} />
    </Grid>
  );
}
