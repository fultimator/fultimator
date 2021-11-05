import { FormControl, Grid, InputLabel, Slider } from "@mui/material";

function ChangeAbilities({ monster, setMonster }) {
  const onChangeDes = (e) => {
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.des = e.target.value;
      return newState;
    });
  };

  const onChangeInt = (e) => {
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.int = e.target.value;
      return newState;
    });
  };

  const onChangeVig = (e) => {
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.vig = e.target.value;
      return newState;
    });
  };

  const onChangeVol = (e) => {
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.vol = e.target.value;
      return newState;
    });
  };
  return (
    <Grid container sx={{ px: 1 }} rowSpacing={1}>
      <Grid item xs={2}>
        <InputLabel id="des">Des</InputLabel>
      </Grid>
      <Grid item xs={10}>
        <FormControl variant="standard" fullWidth>
          <Slider
            marks
            min={6}
            max={12}
            step={2}
            size="small"
            value={monster.des}
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
            value={monster.int}
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
            value={monster.vig}
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
            value={monster.vol}
            onChange={onChangeVol}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default ChangeAbilities;
