import { useRef } from "react";
import { Card, Grid, Stack, Typography, useTheme } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";

function PrettyAccessory({ accessory, showActions }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const white = theme.palette.white.main;

  const ref = useRef();

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

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
                    fontSize: { xs: "0.6rem", sm: "1.2rem" },
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid item xs={1}></Grid>
              <Grid item xs={6}>
                <Typography variant="h4" textAlign="left">
                  {t("Accessory")}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="h4" textAlign="center">
                  {t("Cost")}
                </Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid container direction="column" item xs>
                {/* First Row */}
                <Grid
                  container
                  justifyContent="space-between"
                  item
                  sx={{
                    background: `linear-gradient(to right, ${ternary}, ${white})`,
                    borderBottom: `1px solid ${secondary}`,
                    padding: "5px",
                    "& .MuiTypography-root": {
                      fontSize: { xs: "0.7rem", sm: "1.0rem" },
                    },
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
                  <Typography fontSize={{ xs: "0.7rem", sm: "1.0rem" }}>
                    {!accessory.quality && t("No Qualities")}{" "}
                    <StyledMarkdown
                      allowedElements={["strong", "em"]}
                      sx={{ fontSize: { xs: "0.9rem", sm: "1.0rem" } }}
                      unwrapDisallowed={true}
                    >
                      {accessory.quality}
                    </StyledMarkdown>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
    </>
  );
}

export default PrettyAccessory;
