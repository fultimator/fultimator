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
import { Download } from "@mui/icons-material";

import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";

function Pretty({ custom }) {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrettySingle accessory={custom} showActions />
      </div>
    </ThemeProvider>
  );
}

function PrettySingle({ accessory, showActions }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const ref = useRef();
  const [downloadImage] = useDownloadImage(accessory.name, ref);

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
              <Grid item xs={6}>
                <Typography variant="h4" textAlign="left">
                  Accessory
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="h4" textAlign="center">
                  Cost
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
                  <Grid item xs={6}>
                    <Typography fontWeight="bold">{accessory.name}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography textAlign="center">{`${accessory.cost}z`}</Typography>
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
                    {!accessory.quality && "No Qualities"} {accessory.quality}
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
          <Export name={`${accessory.name}`} data={accessory} />
        </div>
      )}
    </>
  );
}

export default Pretty;
