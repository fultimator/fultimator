import {
  faBolt,
  faFire,
  faGun,
  faMountain,
  faSkull,
  faSkullCrossbones,
  faSnowflake,
  faStar,
  faWind,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Divider, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";

import ReactMarkdown from "react-markdown";

import { element } from "../../lib/monster";
import { elementDamage } from "./elements/Elements";

function Pretty({ monster }) {
  const calcInit = (monster) => {
    return (monster.des + monster.int) / 2;
  };

  const calcPv = (monster) => {
    return monster.lvl * 2 + monster.vig * 5;
  };

  const calcPm = (monster) => {
    return monster.lvl + monster.vol * 5;
  };

  const calcDif = (monster) => {
    return monster.des;
  };

  const calcDifMag = (monster) => {
    return monster.int;
  };

  return (
    <Card sx={{ width: 600 }}>
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
            src={monster.image}
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
                {monster.name}
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
                  <Typography variant="h6">Liv {monster.lvl}</Typography>
                </Grid>
                <Grid item>
                  <Typography color="purple.main">◆</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" sx={{ textTransform: "uppercase" }}>
                    {monster.type}
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
              {monster.desc}
            </Typography>
          </Box>
          <Divider></Divider>
          <Typography sx={{ bgcolor: "white.main", px: 2, py: 0.5 }}>
            <strong>Tratti: </strong>
            {monster.traits}
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
          <Typography fontWeight="bold">DES d{monster.des}</Typography>
        </Grid>
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">INT d{monster.int}</Typography>
        </Grid>
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">VIG d{monster.vig}</Typography>
        </Grid>
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">VOL d{monster.vol}</Typography>
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
            {calcPv(monster)} ◆ {calcPv(monster) / 2}
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
            {calcPm(monster)}
          </Typography>
        </Grid>
        <Grid item sx={{ px: 2 }}>
          <Typography fontWeight="bold">Iniz. {calcInit(monster)}</Typography>
        </Grid>
      </Grid>
      {/*  Defenses */}
      <Grid
        container
        justifyContent="space-between"
        sx={{ borderBottom: "1px solid #674168" }}
      >
        <Grid item sx={{ px: 1.4 }}>
          <Typography fontWeight="bold">DIF {calcDif(monster)}</Typography>
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Typography fontWeight="bold">
            D. MAG {calcDifMag(monster)}
          </Typography>
        </Grid>
        <Divider orientation="vertical" flexItem />
        <Grid item sx={{ px: 1.4 }}>
          <Element status={element(monster, "physical")} icon={faGun} />
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Element status={element(monster, "air")} icon={faWind} />
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Element status={element(monster, "lightning")} icon={faBolt} />
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Element status={element(monster, "dark")} icon={faSkull} />
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Element status={element(monster, "earth")} icon={faMountain} />
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Element status={element(monster, "fire")} icon={faFire} />
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Element status={element(monster, "ice")} icon={faSnowflake} />
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Element status={element(monster, "light")} icon={faStar} />
        </Grid>
        <Grid item sx={{ px: 1.4 }}>
          <Element
            status={element(monster, "poison")}
            icon={faSkullCrossbones}
          />
        </Grid>
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
        {monster.attacks.map((attack, i) => {
          return (
            <Grid item key={i} xs={12}>
              <Attack monster={monster} attack={attack} />
            </Grid>
          );
        })}
      </Grid>
      {/* Rules */}
    </Card>
  );
}

function Attack({ monster, attack }) {
  const calcBonus = () => {
    const bonus = parseInt(monster.lvl / 10);

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

function Element({ icon, status }) {
  if (status === "normal") {
    return (
      <Typography component="div" sx={{ opacity: 0.2 }}>
        <Grid container>
          <Grid item xs={6}>
            <FontAwesomeIcon icon={icon} />
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
            <FontAwesomeIcon icon={icon} />
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
            <FontAwesomeIcon icon={icon} />
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
            <FontAwesomeIcon icon={icon} />
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
            <FontAwesomeIcon icon={icon} />
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
