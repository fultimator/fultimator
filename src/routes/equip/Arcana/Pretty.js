import { useRef } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip,
  IconButton,
  darken
} from "@mui/material";
import { Download } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function Pretty({ custom, rework }) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrettySingle arcana={custom} showActions rework={rework} />
      </div>
    </ThemeProvider>
  );
}

function PrettySingle({ arcana, showActions, rework }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background = theme.mode === 'dark'
  ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)` // Dark mode gradient with black end
  : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`; // Light mode gradient

  const background2 = theme.mode === 'dark'
  ? `black`
  : `white`;

  const cardBackground = theme.mode === 'dark'
  ? `backgroundColor: "#181a1b", background: "#181a1b"`
  : `backgroundColor: "white", background: "white"`

  const ref = useRef();
  const [downloadImage] = useDownloadImage(arcana.name, ref);

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      <Card>
        <div
          ref={ref}
          style={{ cardBackground }}
        >
          <Stack>
            <Grid container>
              <Grid
                item
                sx={{
                  flex: "0 0 128px",
                  minWidth: "128px",
                  minHeight: "128px",
                  background2,
                }}
              >
                <EditableImage size={128} />
              </Grid>

              <Grid container direction="column" item xs>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    px: 2,
                    py: 1,
                    background: `${theme.primary}`,
                    color: "#ffffff",
                    "& .MuiTypography-root": {
                      textTransform: "uppercase",
                    },
                  }}
                >
                  <Grid item xs>
                    <Typography variant="h1" textAlign="left" sx={{ lineHeight: 1.2 }}>
                      {arcana.name}
                    </Typography>
                  </Grid>
                </Grid>

                {/* First Row */}
                <Grid
                  container
                  justifyContent="space-between"
                  item
                  sx={{
                    background,
                    px: "10px",
                    py: "5px"
                  }}
                >
                  <Grid item xs={12}>
                    <Typography fontStyle="italic">
                      {!arcana.description ? t("No Description") : (
                        <div style={{ display: 'inline' }}>
                          <ReactMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                            {arcana.description}
                          </ReactMarkdown>
                        </div>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
                {/* Second Row */}
                <Grid
                  container
                  justifyContent="flex-start"
                  sx={{
                    background: "transparent",
                    px: "10px",
                    py: "8px"
                  }}
                >
                  <Typography>
                    {!arcana.domain ? t("No Domain") : (
                      <div style={{ display: 'inline' }}>
                        <Typography variant="inherit" style={{ fontWeight: 'bold', display: 'inline' }}>
                          {t("Domains: ")}
                        </Typography>
                        <ReactMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                          {arcana.domain}
                        </ReactMarkdown>
                      </div>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid container>
              {/* Merge Benefit */}
              <Grid
                container
                justifyContent="space-between"
                item
                sx={{
                  borderTop: `1px solid ${theme.primary}`,
                }}
              >
                {/* Merge Label */}
                <Grid item xs={2} sx={{
                  textAlign: 'center',
                  backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(theme.secondary, 0.3)})`,
                  padding: "1px",
                  color: `${theme.white}`,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ margin: "auto" }}>
                    {t("MERGE")}
                  </Typography>
                </Grid>

                {/* Arcana Merge Name */}
                <Grid item xs={10} sx={{
                  background,
                  px: 3,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", margin: "auto 0" }}>
                    {arcana.mergeName}
                  </Typography>
                </Grid>

                {/* Merge Benefit */}
                <Grid item xs={12} sx={{
                  mx: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography>
                    {!arcana.mergeBenefit ? t("No Merge Benefit") : (
                      <div style={{ display: 'inline' }}>
                        <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                          {arcana.mergeBenefit}
                        </StyledMarkdown>
                      </div>
                    )}
                  </Typography>
                </Grid>
              </Grid>

              {rework && (
                <>
                  {/* Pulse Benefit */}
                  <Grid
                    container
                    justifyContent="space-between"
                    item
                    sx={{
                      borderTop: `1px solid ${theme.primary}`,
                    }}
                  >
                    {/* Pulse Grid Item */}
                    <Grid item xs={2} sx={{
                      textAlign: 'center',
                      backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(theme.secondary, 0.3)})`,
                      padding: "1px",
                      color: `${theme.white}`,
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <Typography variant="h5" fontWeight="bold" sx={{ margin: "auto" }}>
                        {t("PULSE")}
                      </Typography>
                    </Grid>

                    {/* Arcana Pulse Name */}
                    <Grid item xs={10} sx={{
                      background,
                      px: 3,
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", margin: "auto 0" }}>
                        {arcana.pulseName}
                      </Typography>
                    </Grid>

                    {/* Pulse Benefit */}
                    <Grid item xs={12} sx={{
                      mx: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <Typography>
                        {!arcana.pulseBenefit ? t("No Pulse Benefit") : (
                          <div style={{ display: 'inline' }}>
                            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                              {arcana.pulseBenefit}
                            </StyledMarkdown>
                          </div>
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Dismiss Benefit */}
              <Grid
                container
                justifyContent="space-between"
                item
                sx={{
                  borderTop: `1px solid ${theme.primary}`,
                }}
              >
                {/* Dismiss Label */}
                <Grid item xs={2} sx={{
                  textAlign: 'center',
                  backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(theme.secondary, 0.3)})`,
                  padding: "1px",
                  color: `${theme.white}`,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ margin: "auto" }}>
                    {t("DISMISS")}
                  </Typography>
                </Grid>

                {/* Dismiss Name */}
                <Grid item xs={10} sx={{
                  background,
                  px: 3,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", margin: "auto 0" }}>
                    {arcana.dismissName}
                  </Typography>
                </Grid>

                {/* Dismiss Benefit */}
                <Grid item xs={12} sx={{
                  mx: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography>
                    {!arcana.dismissBenefit ? t("No Dismiss Benefit") : (
                      <div style={{ display: 'inline' }}>
                        <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                          {arcana.dismissBenefit}
                        </StyledMarkdown>
                      </div>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
      {showActions && (
        <div style={{ display: "flex" }}>
          <Tooltip title={t("Download as Image")}>
            <IconButton onClick={downloadImage}>
              <Download />
            </IconButton>
          </Tooltip>
          <Export name={`${arcana.name}`} dataType="arcana" data={arcana} />
        </div>
      )}
    </>
  );
}

export default Pretty;
