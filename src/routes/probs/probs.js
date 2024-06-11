import { Add, Remove } from "@mui/icons-material";
import {
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomHeader from '../../components/common/CustomHeader';

function calcHit(firstResult, secondResult, bonus, dl) {
  // Calculate Critical Failure
  if (firstResult === 1 && secondResult === 1) {
    return false;
  }

  // Calculate Critical Success
  if (firstResult === secondResult && firstResult >= 6) {
    return true;
  }

  return firstResult + secondResult + bonus >= dl;
}

function calcDamage(firstResult, secondResult, bonus, damage, dl) {
  if (!calcHit(firstResult, secondResult, bonus, dl)) {
    return 0;
  }

  if (firstResult > secondResult) {
    return firstResult + damage;
  }

  return secondResult + damage;
}

function calcProbHit(firstDie, secondDie, bonus, dl) {
  let sum = 0;

  for (let i = 1; i <= firstDie; i++) {
    for (let j = 1; j <= secondDie; j++) {
      sum = sum + calcHit(i, j, bonus, dl);
    }
  }

  const prob = firstDie * secondDie;
  return (sum / prob) * 100;
}

function calcExpectedDamage(firstDie, secondDie, bonus, damage, dl) {
  let sum = 0;

  for (let i = 1; i <= firstDie; i++) {
    for (let j = 1; j <= secondDie; j++) {
      sum = sum + calcDamage(i, j, bonus, damage, dl);
    }
  }

  const prob = firstDie * secondDie;

  return sum / prob;
}

function DamageCell({ firstResult, secondResult, bonus, damage, dl }) {
  const damageResult = calcDamage(firstResult, secondResult, bonus, damage, dl);

  return (
    <TableCell
      sx={{
        bgcolor: damageResult === 0 ? "red.main" : "transparent",
        color: damageResult === 0 ? "white.main" : "black",
      }}
    >
      <Typography>{damageResult}</Typography>
    </TableCell>
  );
}

export default function Probs() {
  const { t } = useTranslate();
  const [firstDie, setFirstDie] = useState(6);
  const [secondDie, setSecondDie] = useState(6);
  const [bonus, setBonus] = useState(0);
  const [damage, setDamage] = useState(5);
  const [dl, setDl] = useState(10);
  const [hp, setHp] = useState(60);

  const probHit = calcProbHit(firstDie, secondDie, bonus, dl);

  const expectedDamage = calcExpectedDamage(
    firstDie,
    secondDie,
    bonus,
    damage,
    dl
  );

  const isMobile = window.innerWidth < 900;

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomHeader type="top" headerText={t("Attacks Chance Generator")} showIconButton={false}/>
        </Grid>

        {/* First die */}
        <Grid item xs={6} sm={4} lg={2}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"firstdie"}>{t("Die 1")}</InputLabel>
            <Select
              value={firstDie}
              labelId={"firstdie"}
              id={"firstdie"}
              label={t("Die 1")}
              size="small"
              onChange={(e) => {
                return setFirstDie(e.target.value);
              }}
            >
              <MenuItem value={6}>d6</MenuItem>
              <MenuItem value={8}>d8</MenuItem>
              <MenuItem value={10}>d10</MenuItem>
              <MenuItem value={12}>d12</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Second die */}
        <Grid item xs={6} sm={4} lg={2}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"seconddie"}>{t("Die 2")}</InputLabel>
            <Select
              value={secondDie}
              labelId={"seconddie"}
              id={"seconddie"}
              label={t("Die 2")}
              size="small"
              onChange={(e) => {
                return setSecondDie(e.target.value);
              }}
            >
              <MenuItem value={6}>d6</MenuItem>
              <MenuItem value={8}>d8</MenuItem>
              <MenuItem value={10}>d10</MenuItem>
              <MenuItem value={12}>d12</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Bonus */}
        <Grid item xs={6} sm={4} lg={2}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="bonus"
              label={t("Bonus")}
              type="number"
              min={0}
              max={60}
              value={bonus}
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="start"
                    onClick={(e) => {
                      setBonus(bonus - 1);
                    }}
                  >
                    <Remove />
                  </IconButton>
                ),
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="end"
                    onClick={(e) => {
                      setBonus(bonus + 1);
                    }}
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
          </FormControl>
        </Grid>

        {/* Damage */}
        <Grid item xs={6} sm={4} lg={2}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="damage"
              label={t("Damage")}
              type="number"
              min={0}
              max={60}
              value={damage}
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="start"
                    onClick={(e) => {
                      setDamage(damage - 1);
                    }}
                  >
                    <Remove />
                  </IconButton>
                ),
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="end"
                    onClick={(e) => {
                      setDamage(damage + 1);
                    }}
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
          </FormControl>
        </Grid>
        {/* LD */}
        <Grid item xs={6} sm={4} lg={2}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="dl"
              label={t("DL")}
              type="number"
              min={7}
              max={20}
              value={dl}
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="start"
                    onClick={(e) => {
                      setDl(dl - 1);
                    }}
                  >
                    <Remove />
                  </IconButton>
                ),
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="end"
                    onClick={(e) => {
                      setDl(dl + 1);
                    }}
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
          </FormControl>
        </Grid>
        {/* HP */}
        <Grid item xs={6} sm={4} lg={2}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="hp"
              label={t("HP")}
              type="number"
              min={30}
              max={300}
              value={hp}
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="start"
                    onClick={(e) => {
                      setHp(hp - 5);
                    }}
                  >
                    <Remove />
                  </IconButton>
                ),
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="end"
                    onClick={(e) => {
                      setHp(hp + 5);
                    }}
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
          </FormControl>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <div
        style={{
          width: "100%",
          overflowX: isMobile ? "scroll" : "hidden",
          overflowY: "hidden",
        }}
      >
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell></TableCell>
              {[...Array(firstDie)].map((e, i) => {
                i = parseInt(i);
                i++;
                return (
                  <TableCell key={i} sx={{ fontWeight: "bold" }}>
                    {i}
                  </TableCell>
                );
              })}
            </TableRow>

            {[...Array(secondDie)].map((e, i) => {
              i = parseInt(i);
              i++;
              return (
                <TableRow key={i}>
                  <TableCell key={i} sx={{ fontWeight: "bold" }}>
                    {i}
                  </TableCell>

                  {[...Array(firstDie)].map((e, j) => {
                    j = parseInt(j);
                    j++;
                    return (
                      <DamageCell
                        key={j}
                        firstResult={j}
                        secondResult={i}
                        bonus={bonus}
                        damage={damage}
                        dl={dl}
                      />
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Typography>
        {t("Probability to hit:")} {probHit.toFixed(2)}%
      </Typography>
      <Typography>
        {t("Expected damage:")} {Math.floor(expectedDamage)}
      </Typography>
      <Typography>
        {t("Number of attacks needed:")} {Math.ceil(hp / expectedDamage)}
      </Typography>
    </div>
  );
}
