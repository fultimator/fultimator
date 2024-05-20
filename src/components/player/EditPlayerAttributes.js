import React from "react";
import { Add, Remove } from "@mui/icons-material";
import {
  Card,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  Paper,
  Slider,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";

export default function EditPlayerAttributes({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const onChange = (key) => {
    return (e, value) => {
      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.attributes[key] = value;
        return newState;
      });
    };
  };

  const attributeList = [
    {
      key: "dexterity",
      label: t("DEX"),
      min: 6,
      max: 12,
      step: 2,
      marks: true,
    },
    {
      key: "insight",
      label: t("INS"),
      min: 6,
      max: 12,
      step: 2,
      marks: true,
    },
    { key: "might", label: t("MIG"), min: 6, max: 12, step: 2, marks: true },
    {
      key: "willpower",
      label: t("WLP"),
      min: 6,
      max: 12,
      step: 2,
      marks: [
        { value: 6, label: "d6" },
        { value: 8, label: "d8" },
        { value: 10, label: "d10" },
        { value: 12, label: "d12" },
      ],
    },
  ];

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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomHeader
            type="top"
            headerText={t("Attributes")}
            addItem={() => console.log(player)}
          />
        </Grid>
        {/* Attributes control */}
        <Grid item xs={12} sm={6}>
          <Grid container sx={{ pr: 2, py: 2 }} rowSpacing={2}>
            {attributeList.map((attribute, i) => (
              <Grid
                container
                item
                xs={12}
                spacing={2}
                key={i}
                alignItems="center"
              >
                <Grid item xs={2}>
                  <InputLabel
                    id={attribute.key}
                    sx={{ fontSize: "20px", fontWeight: 400 }}
                  >
                    {attribute.label}
                  </InputLabel>
                </Grid>
                <Grid item xs={10}>
                  <FormControl variant="standard" fullWidth>
                    <Slider
                      marks={attribute.marks}
                      min={attribute.min}
                      max={attribute.max}
                      step={attribute.step}
                      size="medium"
                      value={player.attributes[attribute.key]}
                      onChange={onChange(attribute.key)}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
        {/* Attributes Explanation Card */}
        <Grid item xs={12} sm={6}>
          <Grid item>
            <Card
              sx={{
                p: 1.61,
                background: `linear-gradient(to right, ${ternary}, transparent)`,
              }}
            >
              <Typography>
                <strong>{t("Jack of All Trades")}</strong>: d8, d8, d8, d8
              </Typography>
              <Typography>
                <strong>{t("Standard")}</strong>: d10, d8, d8, d6
              </Typography>
              <Typography>
                <strong>{t("Specialized")}</strong>: d10, d10, d6, d6
              </Typography>
              <Typography>
                <strong>{t("Super Specialized")}</strong>: d12, d8, d6, d6
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                <ReactMarkdown
                  allowedElements={["strong"]}
                  unwrapDisallowed={true}
                >
                  {t(
                    "Upon reaching levels **20**, **40**, and **60**, the Player chooses one of its Attributes and increases it by one die size (to a maximum of d12).",
                    true
                  )}
                </ReactMarkdown>
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
