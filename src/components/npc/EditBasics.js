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
} from "@mui/material";
import { EditAttributes } from "./EditAttributes";
import ReactMarkdown from "react-markdown";
import { t } from "../../translation/translate";

export default function EditBasics({ npc, setNpc }) {
  const theme = useTheme();
  const ternary = theme.palette.ternary.main;
  const onChange = (key) => {
    return (e) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState[key] = e.target.value;
        return newState;
      });
    };
  };

  const onChangeSpecies = function (e) {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.species = e.target.value;

      if (
        e.target.value === "Beast" ||
        e.target.value === "Demon" ||
        e.target.value === "Monster" ||
        e.target.value === "Plant" ||
        e.target.value === "Humanoid"
      ) {
        newState.affinities = {};
      }
      if (e.target.value === "Construct") {
        newState.affinities = {
          poison: "im",
          earth: "rs",
        };
      }
      if (e.target.value === "Elemental") {
        newState.affinities = {
          poison: "im",
        };
      }
      if (e.target.value === "Undead") {
        newState.affinities = {
          dark: "im",
          poison: "im",
          light: "vu",
        };
      }

      return newState;
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label={t("Name:")}
            value={npc.name}
            onChange={onChange("name")}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={8}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="traits"
            label={t("Traits:")}
            value={npc.traits}
            onChange={onChange("traits")}
            multiline
            minRows={1}
            maxRows={3}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4} sm={3}>
        <EditLevel npc={npc} setnpc={setNpc} />
      </Grid>
      <Grid item xs={4} sm={3}>
        <FormControl fullWidth>
          <InputLabel id="species">{t("Species:")}</InputLabel>
          <Select
            labelId="species"
            id="select-species"
            value={npc.species}
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
      <Grid item xs={4} sm={3}>
        <Stack spacing={1}>
          <FormControl fullWidth>
            <InputLabel id="rank">{t("Rank:")}</InputLabel>
            <Select
              labelId="rank"
              id="select-rank"
              value={npc.rank}
              label={t("Rank:")}
              onChange={onChange("rank")}
            >
              <MenuItem value={"soldier"}>{t("Soldier")}</MenuItem>
              <MenuItem value={"elite"}>{t("Elite")}</MenuItem>
              <MenuItem value={"champion2"}>{t("Champion(2)")}</MenuItem>
              <MenuItem value={"champion3"}>{t("Champion(3)")}</MenuItem>
              <MenuItem value={"champion4"}>{t("Champion(4)")}</MenuItem>
              <MenuItem value={"champion5"}>{t("Champion(5)")}</MenuItem>
              <MenuItem value={"companion"}>{t("Companion")}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      {/* Villain & Phase Section*/}
      <Grid item xs={4} sm={3}>
        <FormControl fullWidth>
          <InputLabel id="villain">{t("Villain:")}</InputLabel>
          <Select
            labelId="villain"
            id="select-villain"
            value={npc.villain}
            label={t("Villain:")}
            onChange={onChange("villain")}
          >
            <MenuItem value={""}>{t("None")}</MenuItem>
            <MenuItem value={"minor"}>{t("Minor")}</MenuItem>
            <MenuItem value={"major"}>{t("Major")}</MenuItem>
            <MenuItem value={"supreme"}>{t("Supreme")}</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={3} sm={3}>
        <FormControl fullWidth>
          <TextField
            labelId="phases"
            id="textfield-phases"
            value={npc.phases || 0}
            label={t("Phases:")}
            onChange={onChange("phases")}
            type="number"
          ></TextField>
        </FormControl>
      </Grid>

      {npc.rank === "companion" && (
        <Grid item xs={2} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="companionlvl">SL</InputLabel>
            <Select
              labelId="companionlvl"
              id="select-companionlvl"
              value={npc.companionlvl || 1}
              label={t("Skill Level:")}
              onChange={onChange("companionlvl")}
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
        <Grid item xs={3} sm={2}>
          <FormControl fullWidth>
            <TextField
              labelId="companionpclvl"
              id="textfield-companionpclvl"
              value={npc.companionpclvl || 5}
              label={t("PC Level:")}
              onChange={onChange("companionpclvl")}
              type="number"
            ></TextField>
          </FormControl>
        </Grid>
      )}

      <Grid item xs={12} sm={5} md>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="multipart"
            label={t("Multi-Part:")}
            value={npc.multipart}
            onChange={onChange("multipart")}
            multiline
            minRows={1}
            maxRows={3}
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

      <Grid item xs={12}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="Description"
            label={t("Description:")}
            value={npc.description}
            onChange={onChange("description")}
            multiline
            minRows={1}
            maxRows={3}
          ></TextField>
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
  const onRaiseLevel = (e) => {
    setnpc((prevState) => {
      if (prevState.lvl >= 60) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      newState.lvl = prevState.lvl + 5;
      return newState;
    });
  };
  const onLowerLevel = (e) => {
    setnpc((prevState) => {
      if (prevState.lvl <= 5) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      newState.lvl = prevState.lvl - 5;
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
