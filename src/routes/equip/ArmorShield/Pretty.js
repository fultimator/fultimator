import { useRef } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  useTheme,
  ThemeProvider,
  Tooltip,
  IconButton,
} from "@mui/material";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import { Download } from "@mui/icons-material";
import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";

function Pretty({ base, custom }) {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrettySingle armor={base} />
        <Typography textAlign="center">
          <ArrowDownward />
        </Typography>
        <PrettySingle armor={custom} showActions />
      </div>
    </ThemeProvider>
  );
}

function PrettySingle({ armor, showActions }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const ref = useRef();
  const [downloadImage] = useDownloadImage(armor.name, ref);

  return (
    <>
      <Card>
        <div
          ref={ref}
          style={{ backgroundColor: "white", background: "white" }}
        >
          <Stack>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                background: `${primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: "1.2rem",
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid item xs={1}></Grid>
              <Grid item xs={3}>
                <Typography variant="h4" textAlign="left">
                  {armor.category}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant="h4" textAlign="center">
                  Cost
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h4" textAlign="center">
                  Defense
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4" textAlign="center">
                  M. Defense
                </Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid
                item
                sx={{
                  flex: "0 0 70px",
                  minWidth: "70px",
                  minHeight: "70px",
                  background: `white`,
                }}
              >
                <EditableImage size={70} />
              </Grid>

              <Grid container direction="column" item xs>
                {/* First Row */}
                <Grid
                  container
                  justifyContent="space-between"
                  item
                  sx={{
                    background: `linear-gradient(to right, ${ternary}, transparent)`,
                    borderBottom: `1px solid ${secondary}`,
                    padding: "5px",
                  }}
                >
                  <Grid item xs={3}>
                    <Typography fontWeight="bold">{armor.name}</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography textAlign="center">{`${armor.cost}z`}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      {armor.category === "Shield" ? "+" + armor.def : ""}
                      {armor.category === "Armor" && armor.martial
                        ? armor.def
                        : ""}
                      {armor.category === "Armor" && !armor.martial
                        ? armor.def === 0
                          ? "DEX die"
                          : "DEX die +" + armor.def
                        : ""}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      {armor.category === "Shield" ? "+" + armor.mdef : ""}
                      {armor.category === "Armor" && armor.martial
                        ? armor.def
                        : ""}
                      {armor.category === "Armor"
                        ? armor.mdef === 0
                          ? "INS die"
                          : "INS die +" + armor.mdef
                        : ""}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Second Row */}
                <Grid
                  container
                  justifyContent="flex-start"
                  sx={{
                    background: "transparent",
                    padding: "5px",
                  }}
                >
                  <Typography>
                    {!armor.quality && "No Qualities"} {armor.quality}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
      {showActions && (
        <div style={{ display: "flex" }}>
          <Tooltip title="Download as Image">
            <IconButton onClick={downloadImage}>
              <Download />
            </IconButton>
          </Tooltip>
          <Export name={`${armor.name}`} data={armor} />
        </div>
      )}
    </>
  );
}

export default Pretty;
