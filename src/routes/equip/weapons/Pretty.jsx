import { useRef, useState } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip,
  IconButton,
  FormControlLabel,
  Checkbox,
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
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function Pretty({ base, custom }) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrettySingle weapon={base} />
        <Typography sx={{ textAlign: "center" }}>
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
  const [showImage, setShowImage] = useState(false);

  const background = theme.mode === 'dark'
    ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)` // Dark mode gradient with black end
    : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`; // Light mode gradient

  const imageBackground = theme.mode === "dark" ? "#181a1b" : "white";

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
        >
          <Stack>
            <Grid
              container
              sx={{
                alignItems: "center",
                background: `${theme.primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: "1.2rem",
                  textTransform: "uppercase",
                },
                py: 1,
              }}
            >
              <Grid
                sx={{
                  flex: "0 0 70px",
                  minWidth: "70px",
                  minHeight: "40px",
                }}
              />
              <Grid container sx={{ flex: 1, pl: 1 }}>
                <Grid size={3}>
                  <Typography variant="h4" sx={{ textAlign: "left", fontSize: "1rem", fontWeight: 600 }}>
                    {t("Weapon")}
                  </Typography>
                </Grid>
                <Grid size={1}>
                  <Typography variant="h4" sx={{ textAlign: "center", fontSize: "1rem", fontWeight: 600 }}>
                    {t("Cost")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="h4" sx={{ textAlign: "center", fontSize: "1rem", fontWeight: 600 }}>
                    {t("Accuracy")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="h4" sx={{ textAlign: "center", fontSize: "1rem", fontWeight: 600 }}>
                    {t("Damage")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {/* Data Rows Container */}
            <Grid
              container
              sx={{
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              {/* Image Column - spans both rows */}
              <Grid
                sx={{
                  flex: "0 0 70px",
                  width: "70px",
                  background: imageBackground,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {showImage && <EditableImage size={70} />}
              </Grid>
              {/* Content Column - contains both rows */}
              <Grid container direction="column" sx={{ flex: 1, minWidth: 0 }}>
                {/* First Row */}
                <Grid container
                  sx={{
                    background,
                    borderBottom: `1px solid ${theme.secondary}`,
                    alignItems: "center",
                    minHeight: "40px",
                    pl: 1,
                  }}
                >
                  <Grid sx={{ display: "flex", alignItems: "center", p: 0 }} size={3}>
                    <Typography sx={{ fontWeight: "bold", marginRight: "4px", lineHeight: 1, margin: 0 }}>
                      {weapon.name ? t(weapon.name) : t("No Name")}
                    </Typography>
                    {weapon.martial && <Martial />}
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "center", p: 0 }} size={1}>
                    <Typography sx={{ textAlign: "center", width: "100%", lineHeight: 1, margin: 0 }}>{`${weapon.cost}z`}</Typography>
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "center", p: 0 }} size={4}>
                    <Typography sx={{ textAlign: "center", width: "100%", fontWeight: "bold", lineHeight: 1, margin: 0 }}>
                      <OpenBracket />
                      {`${attributes[weapon.att1].shortcaps} + ${attributes[weapon.att2].shortcaps}`}
                      <CloseBracket />
                      {weapon.prec !== 0 ? `+${weapon.prec}` : ""}
                    </Typography>
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "center", p: 0 }} size={4}>
                    <Typography sx={{ textAlign: "center", width: "100%", fontWeight: "bold", lineHeight: 1, margin: 0 }}>
                      <OpenBracket />
                      {t("HR +")} {weapon.damage}
                      <CloseBracket />
                      {types[weapon.type].long}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Second Row */}
                <Grid container
                  sx={{
                    background: "transparent",
                    pl: 1,
                    minHeight: "40px",
                    alignItems: "center",
                  }}
                >
                  <Grid sx={{ display: "flex", alignItems: "center", p: 0 }} size={3}>
                    <Typography sx={{ fontWeight: "bold", lineHeight: 1, margin: 0 }}>{t(weapon.category)}</Typography>
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 0 }} size={1}>
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "center", p: 0 }} size={4}>
                    <Typography sx={{ textAlign: "center", width: "100%", lineHeight: 1, margin: 0 }}>
                      {weapon.hands === 1 && t("One-handed")}
                      {weapon.hands === 2 && t("Two-handed")}
                    </Typography>
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 0 }} size={1}>
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "center", p: 0 }} size={3}>
                    <Typography sx={{ textAlign: "center", width: "100%", lineHeight: 1, margin: 0 }}>
                      {weapon.melee && t("Melee")}
                      {weapon.ranged && t("Ranged")}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Quality Row */}
            <Grid
              container
              sx={{
                background: "transparent",
                borderBottom: `1px solid ${theme.secondary}`,
                minHeight: "40px",
                alignItems: "center",
              }}
            >
              <Grid
                sx={{
                  flex: "0 0 70px",
                  width: "70px",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              />
              <Grid sx={{ p: "5px", textAlign: "left" }} size={12}>
                <Typography sx={{ lineHeight: 1, margin: 0 }}>
                  {!weapon.quality ? t("No Description") : (
                    <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true}>
                      {weapon.quality}
                    </StyledMarkdown>
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
      {showActions && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Tooltip title={t("Download as Image")}>
              <IconButton onClick={downloadImage}>
                <Download />
              </IconButton>
            </Tooltip>
            <Export name={`${weapon.name}`} dataType="weapon" data={weapon} />
            <AddToCompendiumButton itemType="weapon" data={weapon} />
          </div>
          <FormControlLabel
            control={<Checkbox checked={showImage} onChange={(e) => setShowImage(e.target.checked)} />}
            label={t("Add Image")}
          />
        </div>
      )}
    </>
  );
}

export default Pretty;
