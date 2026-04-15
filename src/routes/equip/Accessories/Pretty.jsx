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
import { Download } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import EditableImage from "../../../components/EditableImage";
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
        <PrettySingle accessory={custom} showActions />
      </div>
    </ThemeProvider>
  );
}

function PrettySingle({ accessory, showActions }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [showImage, setShowImage] = useState(false);

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)` // Dark mode gradient with black end
      : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`; // Light mode gradient

  const imageBackground = theme.mode === "dark" ? "#181a1b" : "white";

  const cardBackground =
    theme.mode === "dark"
      ? `backgroundColor: "#181a1b", background: "#181a1b"`
      : `backgroundColor: "white", background: "white"`;

  const ref = useRef();
  const [downloadImage] = useDownloadImage(accessory.name, ref);

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      <Card>
        <div ref={ref} style={{ cardBackground }}>
          <Stack>
            <Grid
              container
              sx={{
                alignItems: "center",
                py: 1,
                background: `${theme.primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: "1.2rem",
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid sx={{ flex: "0 0 70px" }} />
              <Grid sx={{ flex: 1, pl: 1 }} container>
                <Grid size={6}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("Accessory")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("Cost")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* All Rows Container */}
            <Grid
              container
              sx={{
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              {/* Image Column - spans all rows */}
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
              {/* Content Column - contains all rows */}
              <Grid container direction="column" sx={{ flex: 1, minWidth: 0 }}>
                {/* First Data Row */}
                <Grid
                  container
                  sx={{
                    background,
                    borderBottom: `1px solid ${theme.secondary}`,
                    alignItems: "center",
                    minHeight: "40px",
                    pl: 1,
                  }}
                >
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: "2px" }}
                    size={6}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", lineHeight: 1, margin: 0 }}
                    >
                      {accessory.name || t("No Name")}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: "2px" }}
                    size={4}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        fontWeight: "bold",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >{`${accessory.cost}z`}</Typography>
                  </Grid>
                </Grid>

                {/* Quality Row */}
                <Grid
                  container
                  sx={{
                    pl: 1,
                    minHeight: "40px",
                    alignItems: "center",
                  }}
                >
                  <Grid sx={{ p: "5px", textAlign: "left" }} size={12}>
                    <Typography sx={{ lineHeight: 1, margin: 0 }}>
                      {!accessory.quality ? (
                        t("No Description")
                      ) : (
                        <StyledMarkdown
                          allowedElements={["strong", "em"]}
                          unwrapDisallowed={true}
                        >
                          {accessory.quality}
                        </StyledMarkdown>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
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
            <Export
              name={`${accessory.name}`}
              dataType="accessory"
              data={accessory}
            />
            <AddToCompendiumButton itemType="accessory" data={accessory} />
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={showImage}
                onChange={(e) => setShowImage(e.target.checked)}
              />
            }
            label={t("Add Image")}
          />
        </div>
      )}
    </>
  );
}

export default Pretty;
