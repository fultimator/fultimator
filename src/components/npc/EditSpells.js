import { RemoveCircleOutline } from "@mui/icons-material";
import {
  Grid,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { OffensiveSpellIcon } from "../icons";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from '../common/CustomTextarea';
import CustomHeader from '../common/CustomHeader';
import { Add } from "@mui/icons-material";

export default function EditSpells({ npc, setNpc }) {
  const { t } = useTranslate();
  const onChangeSpells = (i) => {
    return (key, value) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.spells[i][key] = value;
        return newState;
      });
    };
  };

  const addSpell = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.spells) {
        newState.spells = [];
      }
      newState.spells.push({
        name: "",
        range: "melee",
        attr1: "dexterity",
        attr2: "dexterity",
        type: "physical",
        special: [],
      });
      return newState;
    });
  };

  const removeSpell = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.spells.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <CustomHeader type="top" addItem={addSpell} headerText={t("Spells")} icon={Add} />
      {npc.spells?.map((spell, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item xs={12}>
              <EditSpell
                spell={spell}
                setSpell={onChangeSpells(i)}
                removeSpell={removeSpell(i)}
              />
            </Grid>
            {i !== npc.spells.length - 1 && (
              <Grid item xs={12} sx={{ py: 1}}>
                <Divider />
              </Grid>
            )}
          </Grid>
        );
      })}
    </>
  );
}

function EditSpell({ spell, setSpell, removeSpell, i }) {
  const { t } = useTranslate();
  return (
    <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
      <Grid item sx={{ p: 0, m: 0 }}>
        <IconButton onClick={removeSpell}>
          <RemoveCircleOutline />
        </IconButton>
      </Grid>
      <Grid item xs={8} sm={9} md={10}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label={t("Name:")}
            value={spell.name}
            onChange={(e) => {
              return setSpell("name", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={2} md={1}>
        <FormControl variant="standard" fullWidth>
          <ToggleButtonGroup
            size="medium"
            value={spell.type}
            exclusive
            onChange={(e, value) => {
              return setSpell("type", value);
            }}
            aria-label="text alignment"
          >
            <ToggleButton value="offensive" aria-label="left aligned">
              <OffensiveSpellIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Grid>
      {spell.type === "offensive" && (
        <Grid item xs={6} sm={4} md={2}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"spell-" + i + "-attr1label"}>
              {t("Attr 1:")}
            </InputLabel>
            <Select
              value={spell.attr1}
              labelId={"spell-" + i + "-attr1label"}
              id={"spell-" + i + "-attr1"}
              label={t("Attr 1")}
              size="small"
              onChange={(e) => {
                return setSpell("attr1", e.target.value);
              }}
            >
              <MenuItem value={"dexterity"}>{t("Dex")}</MenuItem>
              <MenuItem value={"insight"}>{t("Ins")}</MenuItem>
              <MenuItem value={"might"}>{t("Mig")}</MenuItem>
              <MenuItem value={"will"}>{t("Wil")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      {spell.type === "offensive" && (
        <Grid item xs={6} sm={4} md={2}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"spell-" + i + "-attr2label"}>
              {t("Attr 2:")}
            </InputLabel>
            <Select
              value={spell.attr2}
              labelId={"spell-" + i + "-attr2label"}
              id={"spell-" + i + "-attr2"}
              label={t("Attr 2:")}
              size="small"
              onChange={(e, value) => {
                return setSpell("attr2", e.target.value);
              }}
            >
              <MenuItem value={"dexterity"}>{t("Dex")}</MenuItem>
              <MenuItem value={"insight"}>{t("Ins")}</MenuItem>
              <MenuItem value={"might"}>{t("Mig")}</MenuItem>
              <MenuItem value={"will"}>{t("Wil")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      <Grid item xs={3} md={2}>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="mp"
            label={t("MP:")}
            value={spell.mp}
            onChange={(e) => {
              return setSpell("mp", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={5} md={3} lg={2}>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="target"
            label={t("Target:")}
            value={spell.target}
            onChange={(e) => {
              return setSpell("target", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4} md>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="duration"
            label={t("Duration:")}
            value={spell.duration}
            onChange={(e) => {
              return setSpell("duration", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="outlined" fullWidth>
          {/* <TextField id="effect" label={t("Effect:")} value={spell.effect}
            onChange={(e) => {
              return setSpell("effect", e.target.value);
            }}
            size="small"
          ></TextField> */}
          
          <CustomTextarea
            id="special"
            label={t("Special:")}
            value={spell.effect}
            onChange={(e) => {
              return setSpell("effect", e.target.value);
            }}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
