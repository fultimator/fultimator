import { FormControl, Grid, InputLabel, Slider } from "@mui/material";

export function EditAttributes({ npc, setNpc }) {
  const onChange = (key) => {
    return (e) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.attributes[key] = e.target.value;
        return newState;
      });
    };
  };

  return (
    <Grid container sx={{ px: 1 }} rowSpacing={1}>
      <Grid item xs={2}>
        <InputLabel id="dex">Dex</InputLabel>
      </Grid>
      <Grid item xs={10}>
        <FormControl variant="standard" fullWidth>
          <Slider
            marks
            min={6}
            max={12}
            step={2}
            size="small"
            value={npc.attributes.dexterity}
            onChange={onChange("dexterity")}
          />
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <InputLabel id="ins">Ins</InputLabel>
      </Grid>
      <Grid item xs={10}>
        <FormControl variant="standard" fullWidth>
          <Slider
            marks
            min={6}
            max={12}
            step={2}
            size="small"
            value={npc.attributes.insight}
            onChange={onChange("insight")}
          />
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <InputLabel id="mig">Mig</InputLabel>
      </Grid>
      <Grid item xs={10}>
        <FormControl variant="standard" fullWidth>
          <Slider
            marks
            min={6}
            max={12}
            step={2}
            size="small"
            value={npc.attributes.might}
            onChange={onChange("might")}
          />
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <InputLabel id="wil">Wil</InputLabel>
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
            value={npc.attributes.will}
            onChange={onChange("will")}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
