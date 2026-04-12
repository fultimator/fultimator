import { useRef } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function Pretty({ custom }) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrettySingle quality={custom} showActions />
      </div>
    </ThemeProvider>
  );
}

export function PrettySingle({ quality, showActions }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background = theme.mode === 'dark'
    ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)`
    : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`;

  const background2 = theme.mode === 'dark' ? `black` : `white`;

  const cardBackground = theme.mode === 'dark'
    ? { backgroundColor: "#181a1b", background: "#181a1b" }
    : { backgroundColor: "white", background: "white" };

  const ref = useRef();
  const [downloadImage] = useDownloadImage(quality.name, ref);

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      <Card>
        <div ref={ref} style={cardBackground}>
          <Stack>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                background: `${theme.primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: "1.2rem",
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid  size={1}></Grid>
              <Grid  size={7}>
                <Typography variant="h4" textAlign="left">
                  {t("Quality")}
                </Typography>
              </Grid>
              <Grid  size={3}>
                <Typography variant="h4" textAlign="center">
                  {t("Cost")}
                </Typography>
              </Grid>
            </Grid>
            <Grid container direction="column">
              {/* Name and Cost Row */}
              <Grid
                container
                justifyContent="space-between"
                sx={{
                  background,
                  borderBottom: `1px solid ${theme.secondary}`,
                  padding: "5px",
                }}>
                <Grid  size={8}>
                  <Typography fontWeight="bold">{quality.name}</Typography>
                </Grid>
                <Grid  size={4}>
                  <Typography textAlign="center">{`${quality.cost}z`}</Typography>
                </Grid>
              </Grid>

              {/* Category and Filter Row */}
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  background2,
                  padding: "5px",
                  borderBottom: `1px solid ${theme.secondary}`,
                }}
              >
                <Grid >
                   <Typography variant="body2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                    {t(quality.category)}
                  </Typography>
                </Grid>
                <Grid >
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {quality.filter?.map((f) => (
                      <Chip key={f} label={t(f)} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              {/* Quality Description Row */}
              <Grid
                container
                justifyContent="flex-start"
                sx={{
                  background2,
                  padding: "5px",
                }}
              >
                <Typography variant="body2">
                  {!quality.quality && t("No Description")}{" "}
                  <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true}>
                    {quality.quality}
                  </StyledMarkdown>
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
      {showActions && (
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={t("Download as Image")}>
            <IconButton onClick={downloadImage}>
              <Download />
            </IconButton>
          </Tooltip>
          <Export name={`${quality.name}`} dataType="quality" data={quality} />
          <AddToCompendiumButton itemType="quality" data={quality} />
        </div>
      )}
    </>
  );
}

export default Pretty;
