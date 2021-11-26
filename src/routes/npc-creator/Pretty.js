import { Card, Divider, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";

import ReactMarkdown from "react-markdown";

import {
  elementDamage,
  ElementIcon,
  elementList,
  calcAffinity,
} from "./elements/Elements";

function Pretty({ npc }) {
  const calcInit = (npc) => {
    return (npc.des + npc.int) / 2;
  };

  const calcPv = (npc) => {
    return npc.lvl * 2 + npc.vig * 5;
  };

  const calcPm = (npc) => {
    return npc.lvl + npc.vol * 5;
  };

  const calcDif = (npc) => {
    let dif =
      parseInt(npc.defs["2def1dmag"] * 2) + parseInt(npc.defs["1def2dmag"]);

    return "+" + dif;
  };

  const calcDifMag = (npc) => {
    let dif =
      parseInt(npc.defs["2def1dmag"]) + parseInt(npc.defs["1def2dmag"] * 2);

    return "+" + dif;
  };

  return (
    <Card sx={{ width: 600, mb: 2 }}>
      {/* Header */}
      <Grid
        container
        sx={{
          background:
            "linear-gradient(90deg, #674168 0%, #674168 18%, #ffffff 100%)",
          pb: "2px",
        }}
      >
        {/* Image */}
        <Grid item sx={{ bgcolor: "white.main" }}>
          {/* <Avatar
            variant="square"
            src={npc.image}
            alt=""
            sx={{ width: 110, height: 110, border: "2px solid #674168" }}
          /> */}
        </Grid>
        <Grid item xs sx={{ flexGrow: 1 }}>
          <Grid
            container
            sx={{
              background: "linear-gradient(90deg, #674168 0%, #ffffff 100%);",
              pb: "2px",
            }}
          >
            {/* Name */}
            <Grid
              item
              sx={{
                flexGrow: 1,
                px: 2,
                background: "linear-gradient(90deg, #674168 0%, #b9a9be 100%);",
                borderRight: "4px solid white",
              }}
            >
              <Typography
                variant="h5"
                color="white.main"
                fontWeight="medium"
                sx={{ textTransform: "uppercase" }}
              >
                {npc.name}
              </Typography>
            </Grid>
            {/* Lvl and Type */}
            <Grid
              item
              alignContent="center"
              sx={{
                display: "flex",
                bgcolor: "white.main",
                px: 2,
                borderLeft: "2px solid #b9a9be",
              }}
            >
              <Grid container alignItems="center">
                <Grid item>
                  <Typography variant="h6">Liv {npc.lvl}</Typography>
                </Grid>
                <Grid item>
                  <Typography color="purple.main">◆</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" sx={{ textTransform: "uppercase" }}>
                    {npc.type}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box
            sx={{
              background: "linear-gradient(90deg, #674168 0%, #ffffff 100%)",
              pb: "1px",
            }}
          >
            <Typography sx={{ bgcolor: "white.main", px: 2, py: 0.5 }}>
              {npc.desc}
            </Typography>
          </Box>
          <Divider></Divider>
          <Typography sx={{ bgcolor: "white.main", px: 2, py: 0.5 }}>
            <strong>Tratti: </strong>
            {npc.traits}
          </Typography>
        </Grid>
      </Grid>
      {/* Stats */}
      <Grid
        container
        justifyContent="space-between"
        sx={{ borderBottom: "1px solid #674168" }}
      >
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">DES d{npc.des}</Typography>
        </Grid>
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">INT d{npc.int}</Typography>
        </Grid>
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">VIG d{npc.vig}</Typography>
        </Grid>
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">VOL d{npc.vol}</Typography>
        </Grid>
        <Divider orientation="vertical" flexItem />
        <Grid item sx={{ pl: 2 }}>
          <Typography fontWeight="bold">PV</Typography>
        </Grid>
        <Grid item sx={{ pr: 2 }}>
          <Typography
            fontWeight="bold"
            sx={{ px: 1, bgcolor: "red.main", color: "white.main" }}
          >
            {calcPv(npc)} ◆ {calcPv(npc) / 2}
          </Typography>
        </Grid>
        <Grid item sx={{ pl: 2 }}>
          <Typography fontWeight="bold">PM</Typography>
        </Grid>
        <Grid item sx={{ pr: 2 }}>
          <Typography
            fontWeight="bold"
            sx={{ px: 1, bgcolor: "cyan.main", color: "white.main" }}
          >
            {calcPm(npc)}
          </Typography>
        </Grid>
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">Iniz. {calcInit(npc)}</Typography>
        </Grid>
      </Grid>
      {/*  Defenses */}
      <Grid
        container
        justifyContent="space-between"
        sx={{ borderBottom: "1px solid #674168" }}
      >
        <Grid item sx={{ px: 1.4 }}>
          <Typography fontWeight="bold">DIF {calcDif(npc)}</Typography>
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Typography fontWeight="bold">D. MAG {calcDifMag(npc)}</Typography>
        </Grid>
        <Divider orientation="vertical" flexItem />
        {elementList.map((el) => {
          return (
            <Grid item sx={{ px: 1.4 }} key={el}>
              <Element
                status={calcAffinity(npc, el)}
                icon={<ElementIcon element={el} />}
              />
            </Grid>
          );
        })}
      </Grid>
      {/* Attacks */}
      <Grid container sx={{ mt: 1 }}>
        <Grid
          item
          sx={{
            flexGrow: 1,
            px: 2,
            background: "linear-gradient(90deg, #674168 0%, #ffffff 100%);",
          }}
          xs={12}
        >
          <Typography
            variant="h6"
            color="white.main"
            fontWeight="medium"
            sx={{ textTransform: "uppercase" }}
          >
            Attacchi Base
          </Typography>
        </Grid>
        {npc.attacks.map((attack, i) => {
          return (
            <Grid item key={i} xs={12}>
              <Attack npc={npc} attack={attack} />
            </Grid>
          );
        })}
      </Grid>
      <Grid container sx={{ mt: 1 }}>
        <Grid
          item
          sx={{
            flexGrow: 1,
            px: 2,
            background: "linear-gradient(90deg, #674168 0%, #ffffff 100%);",
          }}
          xs={12}
        >
          <Typography
            variant="h6"
            color="white.main"
            fontWeight="medium"
            sx={{ textTransform: "uppercase" }}
          >
            Regole Speciali
          </Typography>
        </Grid>
        {npc.special.map((special, i) => {
          return (
            <Grid item key={i} xs={12}>
              <Special npc={npc} special={special} />
            </Grid>
          );
        })}
      </Grid>
      {/* Rules */}
    </Card>
  );
}

function Attack({ npc, attack }) {
  const calcBonus = () => {
    const bonus = parseInt(npc.lvl / 10);

    if (bonus > 0) {
      return `+${bonus}`;
    }

    return "";
  };

  const calcDamage = () => {
    return 5;
  };

  return (
    <Grid container spacing={0.5} rowSpacing={2} sx={{ px: 2 }}>
      <Grid item sx={{ width: 30 }}>
        {attack.type}
      </Grid>
      <Grid item xs>
        <Typography component="span" fontWeight="bold">
          {attack.name}
        </Typography>
        <Typography component="span" color="purple.main">
          {" "}
          ◆{" "}
        </Typography>
        <Typography
          component="span"
          fontWeight="bold"
          sx={{ textTransform: "uppercase" }}
        >
          [{attack.ab1}+{attack.ab2}
          {calcBonus()}]
        </Typography>
        <Typography component="span" color="purple.main">
          {" "}
          ◆{" "}
        </Typography>
        <Typography fontWeight="bold" component="span">
          [TM + {calcDamage()}]
        </Typography>{" "}
        {elementDamage(attack.element)}
        {". "}
        {attack.effects.map((effect, i) => {
          return (
            <Typography component="span" key={i}>
              <ReactMarkdown
                allowedElements={["strong"]}
                unwrapDisallowed={true}
              >
                {effect}
              </ReactMarkdown>{" "}
            </Typography>
          );
        })}
      </Grid>
    </Grid>
  );
}
function Special({ npc, special }) {
  return (
    <Grid container spacing={0.5} rowSpacing={2} sx={{ px: 2 }}>
      <Grid item xs>
        <Typography component="span" fontWeight="bold">
          {special.name}
        </Typography>
        <Typography component="span" color="purple.main">
          {" "}
          ◆{" "}
        </Typography>
        <Typography component="span">
          <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
            {special.effect}
          </ReactMarkdown>{" "}
        </Typography>
      </Grid>
    </Grid>
  );
}

function Element({ icon, status }) {
  if (status === "normal") {
    return (
      <Typography component="div" sx={{ opacity: 0.2 }}>
        <Grid container>
          <Grid item xs={6}>
            {icon}
          </Grid>
          <Grid item xs={6}></Grid>
        </Grid>
      </Typography>
    );
  }

  if (status === "resistant") {
    return (
      <Typography component="div" color="warning.main">
        <Grid container spacing={0.5}>
          <Grid item xs={6}>
            {icon}
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold">RS</Typography>
          </Grid>
        </Grid>
      </Typography>
    );
  }

  if (status === "vulnerable") {
    return (
      <Typography component="div" color="success.main">
        <Grid container spacing={0.5}>
          <Grid item xs={6}>
            {icon}
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold">VU</Typography>
          </Grid>
        </Grid>
      </Typography>
    );
  }

  if (status === "immune") {
    return (
      <Typography component="div" color="error.main">
        <Grid container spacing={0.5}>
          <Grid item xs={6}>
            {icon}
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold">IM</Typography>
          </Grid>
        </Grid>
      </Typography>
    );
  }
  if (status === "absorb") {
    return (
      <Typography component="div">
        <Grid container spacing={0.5}>
          <Grid item xs={6}>
            {icon}
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold">AB</Typography>
          </Grid>
        </Grid>
      </Typography>
    );
  }

  return null;
}

export default Pretty;
