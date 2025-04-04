import { Button, Grid, Typography } from "@mui/material";
import { ArrowBack, Delete } from "@mui/icons-material";
import { diceList } from "../../libs/rolls";
import Diamond from "../Diamond";
import { useTranslate } from "../../translation/translate";

export default function PreparedRollsList({ rolls, handleRoll, handleDelete }) {
  const {t} = useTranslate();
  if (!rolls) {
    return null;
  }
  return (
    <>
      {rolls.map((roll, i) => {
        return (
          <Grid
            key={i}
            container
            spacing={1}
            rowSpacing={1}
            sx={{ my: 1 }}
            alignItems="center"
          >
            <Grid item>
              <Button
                variant="contained"
                startIcon={
                  <ArrowBack sx={{ display: { xs: "none", sm: "inline" } }} />
                }
                onClick={handleRoll(roll)}
              >
                {t("Roll")}
              </Button>
            </Grid>
            <Grid item xs>
              <Typography fontSize="1.1rem">
                <Roll roll={roll} /> { roll.label && <Diamond />} {roll.label}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="red"
                startIcon={
                  <Delete sx={{ display: { xs: "none", sm: "inline" } }} />
                }
                onClick={handleDelete(roll.id)}
              >
                {t("Remove")}
              </Button>
            </Grid>
          </Grid>
        );
      })}
    </>
  );
}

function Roll({ roll }) {
  return (
    <Typography component="span" fontWeight="bold">
      {diceList(roll.dice, roll.modifier)}
    </Typography>
  );
}
