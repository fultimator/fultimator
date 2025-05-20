import React, { useCallback } from "react";
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
  Button,
  Snackbar
} from "@mui/material";
import { EditAttributes } from "./EditAttributes";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import { useCustomTheme } from "../../hooks/useCustomTheme";

export default function EditBasics({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background = theme.mode === 'dark'
  ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
  : `linear-gradient(to right, ${theme.ternary}, transparent)`;

  const [imgUrlTemp, setImgUrlTemp] = React.useState(npc.imgurl || "");

  const [isImageError, setIsImageError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const onChange = useCallback(
    (key, value) => {
      setNpc((prevNpc) => ({
        ...prevNpc,
        [key]: value,
      }));
    },
    [setNpc]
  );

  const onChangeSpecies = useCallback(
    (e) => {
      const value = e.target.value;
      setNpc((prevNpc) => {
        let affinities = {};
        let immunities = {}

        if (value === "Construct") {
          affinities = { poison: "im", earth: "rs" };
          immunities = { poisoned: true };
        } else if (value === "Elemental") {
          affinities = { poison: "im" };
          immunities = { poisoned: true };
        } else if (value === "Plant") {
          immunities = { dazed: true, shaken: true, enraged: true, };
        } else if (value === "Undead") {
          affinities = { dark: "im", poison: "im", light: "vu" };
          immunities = { poisoned: true };
        }

        return {
          ...prevNpc,
          species: value,
          affinities: affinities,
          immunities: immunities,
        };
      });
    },
    [setNpc]
  );

  const handleDescriptionChange = useCallback(
    (e) => {
      onChange("description", e.target.value);
    },
    [onChange]
  );

  const checkImageSize = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        setIsImageError(true);
        setErrorMessage(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
      }
      const blob = await response.blob();
      if (blob.size > 5 * 1024 * 1024) {
        // 5MB
        setIsImageError(true);
        setErrorMessage("Error: Image size is too large, max 5MB");
        return false;
      } else {
        setIsImageError(false);
        setErrorMessage("");
        return "Please ensure to credit the artist in the notes section.";
      }
    } catch (error) {
      console.error("Error: ", error);
      setIsImageError(true);
      setErrorMessage(`Error: ${error.message}`);
    }
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <CustomHeader type="top" headerText={t("Basic Information")} showIconButton={false} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label={t("Name:")}
            value={npc.name}
            onChange={(e) => onChange("name", e.target.value)}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={8}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="traits"
            label={t("Traits:")}
            value={npc.traits}
            onChange={(e) => onChange("traits", e.target.value)}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <EditLevel npc={npc} setnpc={setNpc} />
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="species">{t("Species:")}</InputLabel>
          <Select
            labelid="species"
            id="select-species"
            value={npc.species || "beast"}
            label={t("Species:")}
            onChange={onChangeSpecies}
          >
            <MenuItem value={"Beast"}>{t("Beast")}</MenuItem>
            <MenuItem value={"Construct"}>{t("Construct")}</MenuItem>
            <MenuItem value={"Demon"}>{t("Demon")}</MenuItem>
            <MenuItem value={"Elemental"}>{t("Elemental")}</MenuItem>
            <MenuItem value={"Monster"}>{t("Monster")}</MenuItem>
            <MenuItem value={"Plant"}>{t("Plant")}</MenuItem>
            <MenuItem value={"Undead"}>{t("Undead")}</MenuItem>
            <MenuItem value={"Humanoid"}>{t("Humanoid")}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <Stack spacing={1}>
          <FormControl fullWidth>
            <InputLabel id="rank">{t("Rank:")}</InputLabel>
            <Select
              labelid="rank"
              id="select-rank"
              value={npc.rank || "soldier"}
              label={t("Rank:")}
              onChange={(e) => onChange("rank", e.target.value)}
            >
              <MenuItem value={"soldier"}>{t("Soldier")}</MenuItem>
              <MenuItem value={"elite"}>{t("Elite")}</MenuItem>
              <MenuItem value={"champion1"}>{t("Champion(1)")}</MenuItem>
              <MenuItem value={"champion2"}>{t("Champion(2)")}</MenuItem>
              <MenuItem value={"champion3"}>{t("Champion(3)")}</MenuItem>
              <MenuItem value={"champion4"}>{t("Champion(4)")}</MenuItem>
              <MenuItem value={"champion5"}>{t("Champion(5)")}</MenuItem>
              <MenuItem value={"champion6"}>{t("Champion(6)")}</MenuItem>
              <MenuItem value={"companion"}>{t("Companion")}</MenuItem>
              <MenuItem value={"groupvehicle"}>{t("Group Vehicle")}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      {/* Villain & Phase Section*/}
      <Grid item xs={4}>
        <FormControl fullWidth>
          <TextField
            labelid="phases"
            id="textfield-phases"
            value={npc.phases || 0}
            label={t("Phases:")}
            onChange={(e) => onChange("phases", e.target.value)}
            type="number"
          ></TextField>
        </FormControl>
      </Grid>

      {npc.rank !== "companion" && (
        <Grid item xs={8}>
          <FormControl fullWidth>
            <InputLabel id="villain">{t("Villain:")}</InputLabel>
            <Select
              labelid="villain"
              id="select-villain"
              value={npc.villain || ""}
              label={t("Villain:")}
              onChange={(e) => onChange("villain", e.target.value)}
            >
              <MenuItem value={""}>{t("None")}</MenuItem>
              <MenuItem value={"minor"}>{t("minor_villain")}</MenuItem>
              <MenuItem value={"major"}>{t("major_villain")}</MenuItem>
              <MenuItem value={"supreme"}>{t("supreme_villain")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}

      {npc.rank === "companion" && (
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel id="companionlvl">{t("Skill Level:")}</InputLabel>
            <Select
              labelid="companionlvl"
              id="select-companionlvl"
              value={npc.companionlvl || 1}
              label={t("Skill Level:")}
              onChange={(e) => onChange("companionlvl", e.target.value)}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={5}>5</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}

      {npc.rank === "companion" && (
        <Grid item xs={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              labelid="companionpclvl"
              id="textfield-companionpclvl"
              value={npc.companionpclvl || 5}
              label={t("PC Level:")}
              onChange={(e) => onChange("companionpclvl", e.target.value)}
              type="number"
            ></TextField>
          </FormControl>
        </Grid>
      )}

      <Grid item xs={12}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="multipart"
            label={t("Multi-Part:")}
            value={npc.multipart}
            onChange={(e) => onChange("multipart", e.target.value)}
            helperText={
              npc.multipart
                ? t(
                  "If this adversary is multipart, its best to put the share links of the other parts to the notes section when published!"
                )
                : ""
            }
          ></TextField>
        </FormControl>
      </Grid>

      {npc.rank === "groupvehicle" && (
        <Grid item xs={12} container>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel id="sizes">{t("Vehicle Size:")}</InputLabel>
              <Select
                labelid="sizes"
                id="select-sizes"
                value={npc.sizes || ""}
                label={t("Vehicle Size:")}
                onChange={(e) => onChange("sizes", e.target.value)}
              >
                <MenuItem value={""}>{t("None")}</MenuItem>
                <MenuItem value={"small"}>Small</MenuItem>
                <MenuItem value={"medium"}>Medium</MenuItem>
                <MenuItem value={"large"}>Large</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}
      <Grid item xs={12} sm={8}>
        <TextField
          id="imgurl"
          label={t("Image URL") + ":"}
          value={imgUrlTemp}
          onChange={(e) => {
            setImgUrlTemp(e.target.value);
            setIsImageError(false);
            setErrorMessage("");
          }}
          fullWidth
          error={imgUrlTemp.length > 0 && isImageError}
          helperText={
            isImageError && imgUrlTemp.length > 0 ? errorMessage : t("Please ensure to credit the artist in the description or notes section.")
          }
        />
      </Grid>
      <Grid item xs={6} sm={2}>
        <Button
          variant="contained"
          onClick={() => {
            checkImageSize(imgUrlTemp).then((result) => {
              if (result) {
                setNpc((prevState) => {
                  const newState = { ...prevState };
                  newState.imgurl = imgUrlTemp;
                  return newState;
                });
                setOpen(true);
              } else {
                console.log("Error on uploading image");
              }
            });
          }}
          sx={{ height: "56px", width: "100%" }}
        >
          {t("Update Image")}
        </Button>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          message={t("Image uploaded successfully!")}
        />
      </Grid>
      <Grid item xs={6} sm={2}>
        <Button
          variant="outlined"
          onClick={() => {
            setImgUrlTemp("");
            setIsImageError(false);
            setErrorMessage("");
            setNpc((prevState) => {
              const newState = { ...prevState };
              newState.imgurl = "";
              return newState;
            });
          }}
          sx={{ height: "56px", width: "100%" }}
        >
          {t("Remove Image")}
        </Button>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="standard" fullWidth>
          {/* <TextField
            id="Description"
            label={t("Description:")}
            value={npc.description}
            onChange={onChange("description")}
          ></TextField> */}

          <CustomTextarea
            id="Description"
            label={t("Description:")}
            value={npc.description}
            onChange={handleDescriptionChange}
            maxRows={10}
            maxLength={5000}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <EditAttributes npc={npc} setNpc={setNpc} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Grid item>
          <Card
            sx={{
              p: 1.61,
              background,
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
                  "Upon reaching levels **20**, **40**, and **60**, the NPC chooses one of its Attributes and increases it by one die size(to a maximum of d12).",
                  true
                )}
              </ReactMarkdown>
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}

function EditLevel({ npc, setnpc }) {
  const { t } = useTranslate();
  const onRaiseLevel = () => {
    setnpc((prevState) => {
      if (prevState.lvl >= 60) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      const incrementValue = prevState.rank === "groupvehicle" ? 1 : 5;
      newState.lvl = prevState.lvl + incrementValue;
      return newState;
    });
  };
  const onLowerLevel = () => {
    setnpc((prevState) => {
      if (prevState.lvl <= 5) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      const decrementValue = prevState.rank === "groupvehicle" ? 1 : 5;
      newState.lvl = prevState.lvl - decrementValue;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="level"
        label={t("Level:")}
        //type="number"
        min={5}
        max={60}
        value={npc.lvl}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              edge="start"
              onClick={onLowerLevel}
            >
              <Remove />
            </IconButton>
          ),
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              edge="end"
              onClick={onRaiseLevel}
            >
              <Add />
            </IconButton>
          ),
        }}
      />
    </FormControl>
  );
}
