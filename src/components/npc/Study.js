import React from "react";
import { Grid, Typography } from "@mui/material";
import { calcHP, calcMP, Rank, Stats, Attacks, Spells } from "./Pretty";
import Diamond from "../Diamond";
import { useTranslate } from "../../translation/translate";
const Study = ({ npc, study }) => {
  const { t } = useTranslate();
  return (
    <>
      {study >= 0 && (
        <Grid container alignItems="stretch">
          <Grid
            item
            xs
            sx={{
              background: "linear-gradient(90deg, #674168 0%, #b9a9be 100%);",
              borderRight: "4px solid white",
              px: 2,
            }}
          >
            <Typography
              color="white.main"
              fontFamily="Antonio"
              fontSize="1.5rem"
              fontWeight="medium"
              sx={{ textTransform: "uppercase" }}
            >
              {npc.name}
            </Typography>
          </Grid>

          <Grid
            item
            sx={{
              px: 2,
              py: 0.5,
              borderLeft: "2px solid #b9a9be",
              borderBottom: "2px solid #b9a9be",
              borderImage: "linear-gradient(45deg, #b9a9be, #ffffff) 1;",
            }}
          >
            <Typography
              fontFamily="Antonio"
              fontSize="1.25rem"
              fontWeight="medium"
              sx={{ textTransform: "uppercase" }}
            >
              {t("Lvl")} {npc.lvl} <Rank npc={npc} /> <Diamond /> {t(npc.species)}
            </Typography>
          </Grid>
        </Grid>
      )}
      <Love npc={npc} study={study} />
      {study >= 2 && (
        <>
          <Grid
            item
            xs={12}
            sx={{
              px: 2,
              py: 0.5,
            }}
          >
            <Typography>
              <strong>{t("Typical Traits:")} </strong>
              {npc.traits}
            </Typography>
          </Grid>
        </>
      )}
      {study === 3 && (
        <>
          <Attacks npc={npc} />
          <Spells npc={npc} />
        </>
      )}
    </>
  );
};

function Love({ npc, study }) {
  const { t } = useTranslate();
  return (
    <Typography
      component="div"
      fontFamily="Antonio"
      fontWeight="bold"
      textAlign="center"
      fontSize="0.9rem"
    >
      <Grid container>
        {study >= 2 ? (
          <Stats npc={npc} study={study} />
        ) : (
          <Grid
            item
            xs={6}
            sx={{
              borderBottom: "1px solid #281127",
              borderTop: "1px solid #281127",
              borderLeft: "1px solid #281127",
              borderImage: "linear-gradient(90deg, #6d5072, #ffffff) 1;",
              ml: "2px",
              my: "2px",
              flexBasis: "calc(50% - 2px)",
              px: 0.2,
              py: 0.2,
            }}
          >
            <Grid container alignItems="stretch">
              <Grid item sx={{ px: 1.5, py: 0.4 }}>
                {t("HP")}
              </Grid>
              <Grid
                item
                sx={{
                  py: 0.4,
                  px: 1.5,
                  color: "white.main",
                  bgcolor: "red.main",
                }}
              >
                {calcHP(npc)} <Diamond color="white.main" />{" "}
                {Math.floor(calcHP(npc) / 2)}
              </Grid>
              <Grid item sx={{ px: 1.5, py: 0.4 }}>
                {t("MP")}
              </Grid>
              <Grid
                item
                sx={{
                  py: 0.4,
                  px: 1.5,
                  color: "white.main",
                  bgcolor: "cyan.main",
                }}
              >
                {calcMP(npc)}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Typography>
  );
}

export default Study;
