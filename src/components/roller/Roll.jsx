import React from "react";

import { format } from "date-fns";

import { Button, Card, Divider, Grid, Stack, Typography } from "@mui/material";
import { diceList, random } from "../../libs/rolls";
import Diamond from "../Diamond";
import { useTranslate } from "../../translation/translate";

export default function Roll({ roll, saveRoll, currentUser }) {
  if (roll.dice.length === 2) {
    return (
      <FabulaRoll roll={roll} saveRoll={saveRoll} currentUser={currentUser} />
    );
  }

  return <RegularRoll roll={roll} />;
}

function RegularRoll({ roll }) {
  return (
    <Card>
      <Stack>
        <Grid container>
          {roll.attempts[roll.attempts.length - 1].attempt.map((die, i) => {
            return (
              <Grid
                item
                key={i}
                xs
                sx={{
                  minWidth: 50,
                }}
              >
                <Typography textAlign={"center"} fontSize="2rem">
                  {die}
                </Typography>
                <Typography textAlign={"center"} fontSize="1rem">
                  {roll.dice[i]}
                </Typography>
              </Grid>
            );
          })}
        </Grid>
        <Divider />
        <Stack>
          <Typography textAlign="center" fontSize="1.5rem">
            {roll.label}
          </Typography>
          <Typography textAlign="center">
            {roll.username} -{" "}
            {format(roll.timestamp.toDate(), "dd/MM/yyyy hh:mm:ss")}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

function FabulaRoll({ roll, saveRoll, currentUser }) {
  const { t } = useTranslate();
  const lastRoll = roll.attempts[roll.attempts.length - 1].attempt;

  const sum = () => {
    let sum = 0;
    lastRoll.forEach((el) => {
      sum = sum + el;
    });
    return sum;
  };

  const hr = () => {
    let highest = 0;

    lastRoll.forEach((el) => {
      if (el > highest) {
        highest = el;
      }
    });

    return highest;
  };

  const crit = () => {
    let previous = 0;

    for (let i = 0; i < lastRoll.length; i++) {
      if (lastRoll[i] < 6) {
        return false;
      }
      if (previous === 0) {
        previous = lastRoll[i];
      }
      if (lastRoll[i] !== previous) {
        return false;
      }
    }

    return true;
  };

  const fumble = () => {
    for (let i = 0; i < lastRoll.length; i++) {
      if (lastRoll[i] !== 1) {
        return false;
      }
    }

    return true;
  };

  const reRoll = (dice) => {
    return () => {
      const newRoll = [lastRoll[0], lastRoll[1]];

      if (dice === "first" || dice === "both") {
        newRoll[0] = random(roll.dice[0]);
      }

      if (dice === "second" || dice === "both") {
        newRoll[1] = random(roll.dice[1]);
      }

      roll.attempts.push({
        timestamp: new Date(),
        attempt: newRoll,
      });

      saveRoll(roll);
    };
  };

  return (
    <Card sx={{ width: "100%", p: 1 }}>
      <Stack>
        <Grid container sx={{ my: 1 }}>
          <Grid item xs={5} sm={6}>
            <Typography textAlign={"center"} fontSize="2rem">
              {sum() + roll.modifier}
            </Typography>
            <Typography fontWeight="bold" textAlign={"center"} fontSize="1rem">
              {t("Result")}
            </Typography>
          </Grid>
          <Grid item xs={7} sm={6}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs={6}>
                <Typography textAlign="right">
                  {t("roller_calculation")}:{" "}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {roll.modifier < 0 && (
                  <Typography textAlign="center" fontSize="1.2rem">
                    【{lastRoll[0]} + {lastRoll[1]} - {Math.abs(roll.modifier)}】
                  </Typography>
                )}
                {roll.modifier === 0 && (
                  <Typography textAlign="center" fontSize="1.2rem">
                    【{lastRoll[0]} + {lastRoll[1]}】
                  </Typography>
                )}
                {roll.modifier > 0 && (
                  <Typography textAlign="center" fontSize="1.2rem">
                    【{lastRoll[0]} + {lastRoll[1]} + {Math.abs(roll.modifier)}】
                  </Typography>
                )}
              </Grid>
              <Grid item xs={6}>
                <Typography textAlign="right">{t("HR")}: </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  textAlign="center"
                  fontWeight="bold"
                  fontSize="1.5rem"
                >
                  {hr()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            {crit() && (
              <Typography textAlign={"center"} fontSize="1.5rem">
                🎉 {t("Critical Success")}! 🎉
              </Typography>
            )}
            {fumble() && (
              <Typography textAlign={"center"} fontSize="1.5rem">
                😭 {t("Critical Failure")}! 😭
              </Typography>
            )}
          </Grid>
        </Grid>

        <Divider />

        {currentUser === roll.uid && (
          <>
            <Grid container sx={{ my: 1 }}>
              <Grid item xs={6}>
                <Typography textAlign={"center"} fontSize="1.5rem">
                  {lastRoll[0]}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography textAlign={"center"} fontSize="1.5rem">
                  {lastRoll[1]}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ px: 1 }}>
                <Button fullWidth variant="outlined" onClick={reRoll("first")}>
                  {t("roller_reroll")} {roll.dice[0]}
                </Button>
              </Grid>
              <Grid item xs={6} sx={{ px: 1 }}>
                <Button fullWidth variant="outlined" onClick={reRoll("second")}>
                  {t("roller_reroll")} {roll.dice[1]}
                </Button>
              </Grid>
              <Grid item xs={12} sx={{ px: 1, py: 1 }}>
                <Button fullWidth variant="outlined" onClick={reRoll("both")}>
                  {t("roller_reroll_both")}
                </Button>
              </Grid>
            </Grid>
            <Divider />
          </>
        )}
        <Stack>
          <Typography textAlign="center" fontSize="1.5rem">
            {roll.label} {diceList(roll.dice, roll.modifier)}
          </Typography>

          {roll.attempts.map((attempt, i) => {
            return (
              <Typography textAlign="center" key={i} fontSize="0.9rem">
                {roll.username} <Diamond /> {attempt.attempt[0]} ({roll.dice[0]}
                ) <Diamond /> {attempt.attempt[1]} ({roll.dice[1]}) <Diamond />{" "}
                {format(attempt.timestamp.toDate(), "dd/MM/yyyy hh:mm:ss")}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
