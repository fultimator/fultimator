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
import attributes from "../../../libs/attributes";
import types from "../../../libs/types";
import { OpenBracket, CloseBracket } from "../../../components/Bracket";
import Diamond from "../../../components/Diamond";

import { Download } from "@mui/icons-material";
import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function Pretty({ base, custom }) {
  const theme = useCustomTheme();
  console.debug("base", base);
  console.debug("custom", custom);
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrettySingle weapon={base} />
        <Typography textAlign="center">
          <ArrowDownward />
        </Typography>
        <PrettySingle weapon={custom} showActions />
      </div>
    </ThemeProvider>
  );
}

function PrettySingle({ weapon, showActions }) {
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
  const [downloadImage] = useDownloadImage(weapon.name, ref);

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
                  {t("Weapon")}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant="h4" textAlign="center">
                  {t("Cost")}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h4" textAlign="center">
                  {t("Accuracy")}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4" textAlign="center">
                  {t("Damage")}
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
                      {t(weapon.name)}
                    </Typography>
                    {weapon.martial && <Martial />}
                  </Grid>
                  <Grid item xs={1}>
                    <Typography textAlign="center">{`${weapon.cost}z`}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      <OpenBracket />
                      {`${attributes[weapon.att1].shortcaps} + ${attributes[weapon.att2].shortcaps
                        }`}
                      <CloseBracket />
                      {weapon.prec !== 0 ? `+${weapon.prec}` : ""}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      <OpenBracket />
                      {t("HR +")} {weapon.damage}
                      <CloseBracket />
                      {types[weapon.type].long}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Second Row */}
                <Grid
                  container
                  justifyContent="flex-end"
                  sx={{
                    background: "transparent",
                    borderBottom: `1px solid ${theme.secondary}`,
                    padding: "5px",
                  }}
                >
                  <Grid item xs={3}>
                    <Typography fontWeight="bold">{t(weapon.category)}</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography textAlign="center">
                      {weapon.hands === 1 && t("One-handed")}
                      {weapon.hands === 2 && t("Two-handed")}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color="{primary}" />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography textAlign="center">
                      {weapon.melee && t("Melee")}
                      {weapon.ranged && t("Ranged")}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Typography
              sx={{
                background: "transparent",
                borderBottom: `1px solid ${theme.secondary}`,
                px: 1,
                py: 1,
              }}
            >
              {!weapon.quality && t("No Qualities")}{" "}
              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true}>
                {weapon.quality}
              </StyledMarkdown>
            </Typography>
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
          <Export name={`${weapon.name}`} dataType="weapon" data={weapon} />
        </div>
      )}
    </>
  );
}

export default Pretty;
