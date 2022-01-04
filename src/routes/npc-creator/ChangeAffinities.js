import {
  FormControl,
  Grid,
  InputLabel,
  Slider,
  Typography,
} from "@mui/material";
import { TypeIcon } from "../../components/types";

export default function ChangeAffinities({ npc, setnpc }) {
  const onChangeAffinity = (type) => {
    return (e) => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.affinities[type] = e.target.value;
        return newState;
      });
    };
  };

  return (
    <>
      <Typography variant="h6">Affinità</Typography>
      <Grid container sx={{ mt: 2, pr: 2 }} rowSpacing={1}>
        {Object.keys(npc.affinities).map((type, i, arr) => {
          const marks =
            i === arr.length - 1
              ? [
                  {
                    value: 0,
                    label: "VU",
                  },
                  {
                    value: 1,
                    label: " ",
                  },
                  {
                    value: 2,
                    label: "RS",
                  },
                  {
                    value: 3,
                    label: "IM",
                  },
                  {
                    value: 4,
                    label: "AS",
                  },
                ]
              : [];

          return (
            <>
              <Grid key={i} item xs={2}>
                <InputLabel id={type}>
                  <TypeIcon type={type} />
                </InputLabel>
              </Grid>
              <Grid item xs={10}>
                <FormControl variant="standard" fullWidth>
                  <Slider
                    marks={marks}
                    min={0}
                    max={4}
                    step={1}
                    size="small"
                    value={npc.affinities[type]}
                    onChange={onChangeAffinity(type)}
                  />
                </FormControl>
              </Grid>
            </>
          );
        })}
        {/* 
        <Grid item xs={10}>
          <FormControl variant="standard" fullWidth>
            <Slider
              marks
              min={6}
              max={12}
              step={2}
              size="small"
              value={npc.des}
              onChange={onChangeDes}
            />
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <InputLabel id="int">Int</InputLabel>
        </Grid>
        <Grid item xs={10}>
          <FormControl variant="standard" fullWidth>
            <Slider
              marks
              min={6}
              max={12}
              step={2}
              size="small"
              value={npc.int}
              onChange={onChangeInt}
            />
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <InputLabel id="vig">Vig</InputLabel>
        </Grid>
        <Grid item xs={10}>
          <FormControl variant="standard" fullWidth>
            <Slider
              marks
              min={6}
              max={12}
              step={2}
              size="small"
              value={npc.vig}
              onChange={onChangeVig}
            />
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <InputLabel id="vol">Vol</InputLabel>
        </Grid>
        <Grid item xs={10}>
          <FormControl variant="standard" fullWidth>
            <Slider
              marks={[
                {
                  value: 6,
                  label: "d6",
                },
                {
                  value: 8,
                  label: "d8",
                },
                {
                  value: 10,
                  label: "d10",
                },
                {
                  value: 12,
                  label: "d12",
                },
              ]}
              min={6}
              max={12}
              step={2}
              size="small"
              value={npc.vol}
              onChange={onChangeVol}
            />
          </FormControl>
        </Grid> */}
      </Grid>
    </>
  );
}
