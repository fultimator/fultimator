import { useRef } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Martial } from "../../../components/icons";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { Download } from "@mui/icons-material";
import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function Pretty({ base, custom }) {
  const theme = useCustomTheme();
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
  const [downloadImage] = useDownloadImage(armor.name, ref);

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
              <Grid item xs={1}></Grid>
              <Grid item xs={3}>
                <Typography variant="h4" textAlign="left">
                  {armor.category}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant="h4" textAlign="center">
                  {t("Cost")}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="h4" textAlign="center">
                  {t("Defense")}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="h4" textAlign="center">
                  {t("M. Defense")}
                </Typography>
              </Grid>
              {!armor.rework && (
                <Grid item xs={2}>
                  <Typography variant="h4" textAlign="center">
                    {t("Initiative")}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid container>
              <Grid
                item
                sx={{
                  flex: "0 0 70px",
                  minWidth: "70px",
                  minHeight: "70px",
                  background2,
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
                    background,
                    borderBottom: `1px solid ${theme.secondary}`,
                    padding: "5px",
                  }}
                >
                  <Grid item xs={3} sx={{ display: "flex", alignItems: "center" }}>
                    <Typography fontWeight="bold" sx={{ marginRight: "4px" }}>
                      {armor.name}
                    </Typography>
                    {armor.martial && <Martial />}
                  </Grid>
                  <Grid item xs={1}>
                    <Typography textAlign="center">{`${armor.cost}z`}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography fontWeight="bold" textAlign="center">
                      {armor.category === t("Shield") ? "+" + armor.def : ""}
                      {armor.category === t("Armor") && armor.martial
                        ? armor.def
                        : ""}
                      {armor.category === t("Armor") && !armor.martial
                        ? armor.def === 0
                          ? t("DEX die")
                          : t("DEX die") + "+" + armor.def
                        : ""}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography fontWeight="bold" textAlign="center">
                      {armor.category === t("Shield") ? "+" + armor.mdef : ""}

                      {armor.category === t("Armor")
                        ? armor.mdef === 0
                          ? t("INS die")
                          : t("INS die") + "+" + armor.mdef
                        : ""}
                    </Typography>
                  </Grid>
                  {!armor.rework && (
                    <Grid item xs={2}>
                      <Typography fontWeight="bold" textAlign="center">
                        {armor.category === t("Armor") || armor.category === t("Shield")
                          ? armor.init === 0
                            ? "-"
                            : armor.init
                          : ""}
                      </Typography>
                    </Grid>
                  )}
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
                    {!armor.quality && t("No Qualities")}{" "}
                    <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true}>
                      {armor.quality}
                    </StyledMarkdown>
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
          <Export name={`${armor.name}`} dataType="armor" data={armor} />
        </div>
      )}
    </>
  );
}

export default Pretty;
