import {
  Card,
  Grid,
  Stack,
  Typography,
  darken,
  IconButton,
  Tooltip,
  Icon,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { useTranslate } from "../../../translation/translate";
import Edit from "@mui/icons-material/Edit";
import { VisibilityOff } from "@mui/icons-material";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function SpellArcanist({ arcana, rework, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const backgroundColor = isDarkMode ? '#1f1f1f' : '#fff';
  const iconColor = isDarkMode ? '#ffffff' : '#000000';
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';
  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  const showInPlayerSheet =
    arcana.showInPlayerSheet || arcana.showInPlayerSheet === undefined;

  return (
    <>
      <Card sx={{ marginBottom: 2 }}>
        <div style={{ background: `${backgroundColor}` }}>
          <Stack>
            <Grid container>
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
                    <Typography
                      variant="h1"
                      textAlign="left"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {arcana.name}
                    </Typography>
                  </Grid>
                </Grid>

                {/* First Row */}
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                    px: "10px",
                    py: "5px",
                    flexGrow: 1,
                  }}
                >
                  <Grid item xs>
                    <Typography fontStyle="italic">
                      {!arcana.description ? (
                        t("No Description")
                      ) : (
                        <div style={{ display: "inline" }}>
                          <ReactMarkdown
                            allowedElements={["strong", "em"]}
                            unwrapDisallowed={true}
                            style={{ display: "inline" }}
                          >
                            {arcana.description}
                          </ReactMarkdown>
                        </div>
                      )}
                    </Typography>
                  </Grid>
                  {isEditMode && (
                    <Grid
                      item
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {!showInPlayerSheet && (
                        <Tooltip title={t("Arcana not shown in player sheet")}>
                          <Icon>
                            <VisibilityOff style={{ color: "black" }} />
                          </Icon>
                        </Tooltip>
                      )}
                      <IconButton size="small" onClick={onEdit}>
                        <Edit style={{ color:  iconColor }} />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
                {/* Second Row */}
                <Grid
                  container
                  justifyContent="flex-start"
                  sx={{
                    background: "transparent",
                    px: "10px",
                    py: "8px",
                  }}
                >
                  <Typography>
                    {!arcana.domain ? (
                      t("No Domain")
                    ) : (
                      <div style={{ display: "inline" }}>
                        <Typography
                          variant="inherit"
                          style={{ fontWeight: "bold", display: "inline" }}
                        >
                          {t("Domains: ")}
                        </Typography>
                        <ReactMarkdown
                          allowedElements={["strong", "em"]}
                          unwrapDisallowed={true}
                          style={{ display: "inline" }}
                        >
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
                <Grid
                  item
                  xs={2}
                  sx={{
                    textAlign: "center",
                    backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(
                      theme.secondary,
                      0.3
                    )})`,
                    padding: "1px",
                    color: `${theme.white}`,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ margin: "auto" }}
                  >
                    {t("MERGE")}
                  </Typography>
                </Grid>

                {/* Arcana Merge Name */}
                <Grid
                  item
                  xs={10}
                  sx={{
                    backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                    px: 3,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      margin: "auto 0",
                    }}
                  >
                    {arcana.merge}
                  </Typography>
                </Grid>

                {/* Merge Benefit */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    mx: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {!arcana.mergeDesc ? (
                      t("No Merge Benefit")
                    ) : (
                      <div style={{ display: "inline" }}>
                        <StyledMarkdown
                          allowedElements={["strong", "em"]}
                          unwrapDisallowed={true}
                          style={{ display: "inline" }}
                        >
                          {arcana.mergeDesc}
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
                    <Grid
                      item
                      xs={2}
                      sx={{
                        textAlign: "center",
                        backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(
                          theme.secondary,
                          0.3
                        )})`,
                        padding: "1px",
                        color: `${theme.white}`,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ margin: "auto" }}
                      >
                        {t("PULSE")}
                      </Typography>
                    </Grid>

                    {/* Arcana Pulse Name */}
                    <Grid
                      item
                      xs={10}
                      sx={{
                        backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                        px: 3,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          margin: "auto 0",
                        }}
                      >
                        {arcana.pulse}
                      </Typography>
                    </Grid>

                    {/* Pulse Benefit */}
                    <Grid
                      item
                      xs={12}
                      sx={{
                        mx: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography>
                        {!arcana.pulseDesc ? (
                          t("No Pulse Benefit")
                        ) : (
                          <div style={{ display: "inline" }}>
                            <StyledMarkdown
                              allowedElements={["strong", "em"]}
                              unwrapDisallowed={true}
                              style={{ display: "inline" }}
                            >
                              {arcana.pulseDesc}
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
                <Grid
                  item
                  xs={2}
                  sx={{
                    textAlign: "center",
                    backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(
                      theme.secondary,
                      0.3
                    )})`,
                    padding: "1px",
                    color: `${theme.white}`,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ margin: "auto" }}
                  >
                    {t("DISMISS")}
                  </Typography>
                </Grid>

                {/* Dismiss Name */}
                <Grid
                  item
                  xs={10}
                  sx={{
                    backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                    px: 3,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      margin: "auto 0",
                    }}
                  >
                    {arcana.dismiss}
                  </Typography>
                </Grid>

                {/* Dismiss Benefit */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    mx: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {!arcana.dismissDesc ? (
                      t("No Dismiss Benefit")
                    ) : (
                      <div style={{ display: "inline" }}>
                        <StyledMarkdown
                          allowedElements={["strong", "em"]}
                          unwrapDisallowed={true}
                          style={{ display: "inline" }}
                        >
                          {arcana.dismissDesc}
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
    </>
  );
}
