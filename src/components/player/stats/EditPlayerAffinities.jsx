import React from "react";
import { Fragment } from "react";
import {
  Grid,
  useTheme,
  Paper,
  FormControl,
  Slider,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import { TypeIcon, TypeName } from "../../types";
import { typeList } from "../../typeConstants";

export default function EditPlayerAffinities({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

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
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container>
        <Grid size={12}>
          <CustomHeader
            type="top"
            headerText={t("Affinity")}
            showIconButton={false}
          />
        </Grid>
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
                  <Grid size={3}>
                    <Typography
                      variant="h2"
                      sx={{
                        minWidth: "50px",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <TypeIcon type={typeKey} /> <TypeName type={typeKey} />
                    </Typography>
                  </Grid>
                  <Grid size={9}>
                    <FormControl variant="standard" fullWidth>
                      <Slider
                        marks={marks}
                        min={0}
                        max={4}
                        step={1}
                        size="medium"
                        value={value}
                        onChange={onChangeAffinity(typeKey)}
                      />
                    </FormControl>
                  </Grid>
                </Fragment>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
