import { Badge, Button, Card, Divider, Grid, Typography } from "@mui/material";

export default function Roll() {
  return (
    <Badge badgeContent={"triex"} color="primary">
      <Card sx={{ width: 300 }}>
        <Grid container sx={{ my: 1 }}>
          <Grid item xs={6}>
            <Typography textAlign={"center"} fontSize="2rem">
              12
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography textAlign={"center"} fontSize="2rem">
              6
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography textAlign={"center"} fontSize="1rem">
              Risultato
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography textAlign={"center"} fontSize="1rem">
              Tiro Maggiore
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography textAlign={"center"} fontSize="1.5rem">
              Successo Critico!
            </Typography>
          </Grid>
        </Grid>

        <Divider></Divider>

        <Grid container sx={{ my: 1 }}>
          <Grid item xs={6}>
            <Typography textAlign={"center"} fontSize="1.5rem">
              6
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography textAlign={"center"} fontSize="1.5rem">
              6
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ px: 1 }}>
            <Button fullWidth variant="outlined">
              Reroll d6
            </Button>
          </Grid>
          <Grid item xs={6} sx={{ px: 1 }}>
            <Button fullWidth variant="outlined">
              Reroll d12
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ px: 1, py: 1 }}>
            <Button fullWidth variant="outlined">
              Reroll both
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Badge>
  );
}
