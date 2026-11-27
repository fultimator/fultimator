import React from "react";
import { Fragment } from "react";
import { Box, Grid, FormControl, Slider, Typography } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import { TypeIcon, TypeName } from "/src/components/types";
import { typeList } from "/src/components/typeConstants";

export default function EditPlayerAffinities({
  player,
  setPlayer,
  isEditMode = true,
}) {
  const { t } = useTranslate();

  const onChangeAffinity = (type) => {
    return (e) => {
      const value = num2str(e.target.value);

      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.affinities = newState.affinities || {}; // Ensure affinities exists
        if (value === "") {
          delete newState.affinities[type];
        } else {
          newState.affinities[type] = value;
        }
        return newState;
      });
    };
  };

  const str2num = (value) => {
    switch (value) {
      case "vu":
        return 0;
      case "rs":
        return 2;
      case "im":
        return 3;
      case "ab":
        return 4;
      default:
        return 1;
    }
  };

  const num2str = (value) => {
    switch (value) {
      case 0:
        return "vu";
      case 2:
        return "rs";
      case 3:
        return "im";
      case 4:
        return "ab";
      default:
        return "";
    }
  };

  return (
    <SectionCard title={t("Affinity")}>
      <Box sx={{ p: "15px" }}>
        <Grid container>
          {/* Affinities control */}
          <Grid
            size={{
              xs: 12,
              sm: 10,
            }}
          >
            <Grid container sx={{ pr: 2, py: 2 }} rowSpacing={2}>
              {Object.keys(typeList).map((type, i, arr) => {
                const marks =
                  i === arr.length - 1
                    ? [
                        {
                          value: 0,
                          label: (
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: "12px", sm: "18px" } }}
                            >
                              {t("Vulnerability")}
                            </Typography>
                          ),
                        },
                        {
                          value: 1,
                          label: " ",
                        },
                        {
                          value: 2,
                          label: (
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: "12px", sm: "18px" } }}
                            >
                              {t("Resistance")}
                            </Typography>
                          ),
                        },
                        {
                          value: 3,
                          label: (
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: "12px", sm: "18px" } }}
                            >
                              {t("Immunity")}
                            </Typography>
                          ),
                        },
                        {
                          value: 4,
                          label: (
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: "12px", sm: "18px" } }}
                            >
                              {t("Absorption")}
                            </Typography>
                          ),
                        },
                      ]
                    : true;

                const typeKey = typeList[type];
                const value = str2num(player?.affinities?.[typeKey] || "");

                return (
                  <Fragment key={i}>
                    <Grid
                      size={3}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography
                        variant="h2"
                        component="div"
                        sx={{
                          minWidth: "50px",
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          alignItems: "center",
                          gap: { xs: 0.25, sm: 0.5 },
                          lineHeight: 1,
                          "& > :last-child": {
                            fontSize: { xs: "0.8rem", sm: "inherit" },
                          },
                        }}
                      >
                        <TypeIcon type={typeKey} />
                        <span>
                          <TypeName type={typeKey} />
                        </span>
                      </Typography>
                    </Grid>
                    <Grid
                      size={9}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <FormControl variant="standard" fullWidth>
                        <Slider
                          marks={marks}
                          min={0}
                          max={4}
                          step={1}
                          size="medium"
                          value={value}
                          onChange={onChangeAffinity(typeKey)}
                          disabled={!isEditMode}
                        />
                      </FormControl>
                    </Grid>
                  </Fragment>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </SectionCard>
  );
}
