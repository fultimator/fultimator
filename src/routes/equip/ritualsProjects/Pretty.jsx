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
import Diamond from "../../../components/Diamond";
import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function titleCaseFirst(value) {
  if (typeof value !== "string" || value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isLabelValue(item) {
  return item && typeof item === "object" && "label" in item && "value" in item;
}

function hasDisplayValue(item) {
  if (isLabelValue(item)) {
    return String(item.value ?? "").trim() !== "";
  }
  return String(item ?? "").trim() !== "";
}

function LabelValueText({ item, align = "center", bold = false }) {
  if (!isLabelValue(item)) {
    return (
      <Typography
        sx={{
          textAlign: align,
          width: "100%",
          lineHeight: 1,
          margin: 0,
          fontWeight: bold ? "bold" : "normal",
        }}
      >
        {item || ""}
      </Typography>
    );
  }

  return (
    <Typography
      sx={{
        textAlign: align,
        width: "100%",
        lineHeight: 1,
        margin: 0,
        fontWeight: bold ? "bold" : "normal",
      }}
    >
      <Typography component="span" sx={{ fontWeight: "bold" }}>
        {item.label}:
      </Typography>{" "}
      {item.value}
    </Typography>
  );
}

function PreviewShell({
  headerLabels,
  row1Values,
  row2Values,
  row3Values,
  row4Values,
  footerLeftItems,
  footer,
  exportDataType,
  exportData,
  name,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [showImage, setShowImage] = useState(false);

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`;

  const imageBackground = theme.mode === "dark" ? "#181a1b" : "white";

  const ref = useRef();
  const [downloadImage] = useDownloadImage(name || headerLabels?.[0], ref);

  return (
    <ThemeProvider theme={theme}>
      <Card sx={{ width: "100%" }}>
        <div ref={ref}>
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
                sx={{ flex: "0 0 70px", minWidth: "70px", minHeight: "40px" }}
              />
              <Grid container sx={{ flex: 1, pl: 1 }}>
                <Grid size={3}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {headerLabels?.[0]}
                  </Typography>
                </Grid>
                <Grid size={1}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {headerLabels?.[1]}
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
                    {headerLabels?.[2]}
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
                    {headerLabels?.[3]}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid
              container
              sx={{ borderBottom: `1px solid ${theme.secondary}` }}
            >
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
              <Grid container direction="column" sx={{ flex: 1, minWidth: 0 }}>
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
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        marginRight: "4px",
                        lineHeight: 1,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                    >
                      {row1Values?.[0] || t("No Name")}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={1}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        fontWeight: "bold",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      {row1Values?.[1]}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
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
                    >
                      {row1Values?.[2]}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
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
                    >
                      {row1Values?.[3]}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid
                  container
                  sx={{
                    background: "transparent",
                    pl: 1,
                    minHeight: "40px",
                    alignItems: "center",
                  }}
                >
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <LabelValueText item={row2Values?.[0]} align="left" bold />
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    size={1}
                  >
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={4}
                  >
                    <LabelValueText item={row2Values?.[1]} />
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    size={1}
                  >
                    {hasDisplayValue(row2Values?.[2]) && (
                      <Diamond color={theme.primary} />
                    )}
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <LabelValueText item={row2Values?.[2]} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {Array.isArray(row3Values) && row3Values.length > 0 && (
              <Grid
                container
                sx={{
                  background: "transparent",
                  borderBottom: `1px solid ${theme.secondary}`,
                  minHeight: "40px",
                  alignItems: "center",
                }}
              >
                <Grid sx={{ flex: "0 0 70px", width: "70px" }} />
                <Grid container sx={{ flex: 1, pl: 1 }}>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <LabelValueText
                      item={row3Values[0] || ""}
                      align="left"
                      bold
                    />
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    size={1}
                  >
                    {!!row3Values[0] && !!row3Values[1] && (
                      <Diamond color={theme.primary} />
                    )}
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={4}
                  >
                    <LabelValueText item={row3Values[1] || ""} />
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    size={1}
                  >
                    {!!row3Values[2] && <Diamond color={theme.primary} />}
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <LabelValueText item={row3Values[2] || ""} />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {Array.isArray(row4Values) && row4Values.length > 0 && (
              <Grid
                container
                sx={{
                  background: "transparent",
                  borderBottom: `1px solid ${theme.secondary}`,
                }}
              >
                <Grid sx={{ flex: "0 0 70px", width: "70px" }} />
                <Grid container sx={{ flex: 1, pl: 1 }}>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <LabelValueText
                      item={row4Values[0] || ""}
                      align="left"
                      bold
                    />
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    size={1}
                  >
                    {!!row4Values[0] && !!row4Values[1] && (
                      <Diamond color={theme.primary} />
                    )}
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={4}
                  >
                    <LabelValueText item={row4Values[1] || ""} />
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    size={1}
                  >
                    {!!row4Values[2] && <Diamond color={theme.primary} />}
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <LabelValueText item={row4Values[2] || ""} />
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid
              container
              sx={{
                px: 1,
                py: 0.9,
                alignContent: "flex-start",
              }}
            >
              {Array.isArray(footerLeftItems) && footerLeftItems.length > 0 && (
                <Grid
                  size={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    mb: 0.5,
                  }}
                >
                  {footerLeftItems.map((item, idx) => (
                    <Grid
                      key={`${item}-${idx}`}
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <Typography
                        sx={{ fontWeight: "bold", lineHeight: 1, margin: 0 }}
                      >
                        {item}
                      </Typography>
                      {idx < footerLeftItems.length - 1 && (
                        <Diamond color={theme.primary} />
                      )}
                    </Grid>
                  ))}
                </Grid>
              )}
              <Grid size={12}>
                <Typography sx={{ fontSize: "0.92rem", lineHeight: 1.35 }}>
                  {footer || t("No Description")}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginTop: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Tooltip title={t("Download as Image")}>
            <IconButton onClick={downloadImage}>
              <Download />
            </IconButton>
          </Tooltip>
          <Export
            name={`${name}`}
            dataType={exportDataType}
            data={exportData}
          />
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
    </ThemeProvider>
  );
}

export function RitualPretty({ ritual }) {
  const { t } = useTranslate();
  const potency = titleCaseFirst(t(ritual.power));
  const area = titleCaseFirst(t(ritual.area));
  const ritualFlags = [
    ritual.ingredient ? t("Using special ingredient") : "",
    ritual.fastRitual ? t("Fast Ritual") : "",
  ].filter(Boolean);

  const reductionIndicator = ritual.itemHeld ? `(-${ritual.dlReduction})` : "-";

  return (
    <PreviewShell
      name={ritual.name}
      headerLabels={[t("Ritual"), t("MP"), t("DL"), t("Clock")]}
      row1Values={[
        ritual.name || t("No Name"),
        `${ritual.pm}`,
        `${ritual.dl}`,
        `${ritual.clock}`,
      ]}
      row2Values={[
        { label: t("Potency"), value: potency },
        { label: t("Area"), value: area },
        ritual.itemHeld ? { label: t("DL"), value: reductionIndicator } : "",
      ]}
      footerLeftItems={ritualFlags}
      footer={ritual.description}
      exportDataType="ritual"
      exportData={ritual}
    />
  );
}

export function ProjectPretty({ project }) {
  const { t } = useTranslate();
  const potency = titleCaseFirst(t(project.power));
  const area = titleCaseFirst(t(project.area));
  const uses = titleCaseFirst(t(project.uses));
  const flaw = project.defect ? t("Yes") : t("No");
  return (
    <PreviewShell
      name={project.name}
      headerLabels={[t("Project"), t("Potency"), t("Area"), t("Uses")]}
      row1Values={[project.name || t("No Name"), potency, area, uses]}
      row2Values={[
        { label: t("Total Project Cost"), value: `${project.cost} zenit` },
        { label: t("Progress Required"), value: `${project.progress}` },
        { label: t("Flaw"), value: flaw },
      ]}
      row3Values={[
        { label: t("# Tinkerers"), value: `${project.tinkerers}` },
        { label: t("Progress/day"), value: `${project.progressPerDay}` },
        {
          label: t("Savings"),
          value: project.visionary > 0 ? `${project.visionary * 100}z` : "-",
        },
      ]}
      footer={project.description}
      exportDataType="project"
      exportData={project}
    />
  );
}
