import {
  Typography,
  Link,
  Box,
  Divider,
  Grid,
  Button,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router";
import Layout from "../components/Layout";
import React, { Suspense, lazy, useState } from "react";
import { useTranslate } from "../translation/translate";
import FeedbackIcon from "@mui/icons-material/Feedback";
import DesktopMacIcon from "@mui/icons-material/DesktopMac";
import { DiscordIcon } from "../components/icons";
import CopyrightIcon from "@mui/icons-material/Copyright";
import { alpha } from "@mui/material/styles";
import { useCustomTheme } from "../hooks/useCustomTheme";
import DownloadIcon from "@mui/icons-material/Download";
import { FaLinux } from "react-icons/fa";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";
import PaletteIcon from "@mui/icons-material/Palette";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoCard from "../components/home/InfoCard";

const IconCreditsModal = lazy(() => import("../components/IconCreditsModal"));
import powered_by_fu from "/images/routes/powered_by_fu.png";
import LanguageIcon from "@mui/icons-material/Language";

const NAV_IMAGES = "/images/routes/navigation";

function Home() {
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const navigate = useNavigate();
  const [creditsOpen, setCreditsOpen] = useState(false);
  const { t } = useTranslate();
  const greenAccent = isDarkMode ? "#81c784" : "#388e3c";
  const orangeAccent = isDarkMode ? "#ffb74d" : "#f57c00";
  const primaryAccent = isDarkMode ? theme.secondary : theme.primary;
  const linkSx = { color: primaryAccent };
  const platforms = [
    {
      label: "Windows",
      icon: <MicrosoftIcon fontSize="inherit" />,
      color: ["#0078d4", "#3ba0f0"],
    },
    {
      label: "macOS",
      icon: <AppleIcon fontSize="inherit" />,
      color: ["#111111", "#e0e0e0"],
    },
    { label: "Linux", icon: <FaLinux />, color: ["#111111", "#e0e0e0"] },
    {
      label: "Android",
      icon: <AndroidIcon fontSize="inherit" />,
      color: ["#1f9d57", "#3ddc84"],
    },
  ];
  // Fills are chosen so button labels meet WCAG AA (4.5:1) in both modes.
  const filledAccentSx = (bg: string, hover: string, text = "#ffffff") => ({
    backgroundColor: bg,
    color: text,
    "&:hover": { backgroundColor: hover },
  });
  const darkText = "#1b1b1b";
  const greenFilledSx = isDarkMode
    ? filledAccentSx("#81c784", "#a5d6a7", darkText)
    : filledAccentSx("#2e7d32", "#1b5e20");
  const orangeFilledSx = isDarkMode
    ? filledAccentSx("#ffb74d", "#ffca28", darkText)
    : filledAccentSx("#b55c00", "#964d00");
  const discordFilledSx = filledAccentSx("#4752c4", "#3c45a5");

  const navItems = [
    {
      name: "character_designer",
      link: "/pc-gallery",
      label: "Character Designer",
    },
    {
      name: "adversary_designer",
      link: "/npc-gallery",
      label: "Adversary Designer",
    },
    {
      name: "adversary_compedium",
      link: "/npc-compedium",
      label: "Adversary Compendium",
    },
    {
      name: "combat_simulator",
      link: "/combat-sim",
      label: "Combat Simulator",
    },
    {
      name: "items_rituals_projects",
      link: "/generate",
      label: "Rituals, Projects and Items",
    },
    { name: "compendia_viewer", link: "/compendium", label: "Compendium" },
    { name: "dice_roller", link: "/roller", label: "Dice Roller" },
  ];

  return (
    <Layout>
      <Box
        component="nav"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: { xs: 1, sm: 2 },
          m: { xs: 1, sm: 2 },
        }}
      >
        {navItems.map((item) => (
          <Box
            key={item.link}
            component={RouterLink}
            to={item.link}
            state={{ from: "/" }}
            aria-label={t(item.label)}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: {
                xs: "calc((100% - 8px) / 2)",
                sm: "calc((100% - 32px) / 3)",
                lg: "calc((100% - 48px) / 4)",
              },
              maxWidth: 340,
              aspectRatio: { sm: "600 / 360" },
              py: { xs: 0.5, sm: 0 },
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover, &:focus-visible": { transform: "scale(1.05)" },
            }}
          >
            <Box
              component="img"
              src={`${NAV_IMAGES}/labels/${item.name}.webp?v=4`}
              alt=""
              sx={{
                position: { sm: "absolute" },
                left: { sm: "51.8%" },
                top: { sm: "35%" },
                width: { xs: "80%", sm: "47.8%" },
                aspectRatio: { xs: "247 / 106", sm: "auto" },
                objectFit: "cover",
                objectPosition: "right",
                mt: { xs: "-4%", sm: 0 },
                order: { xs: 1, sm: 0 },
              }}
            />
            <Box
              component="img"
              src={`${NAV_IMAGES}/icons/${item.name}.webp?v=4`}
              alt=""
              sx={{
                position: { xs: "relative", sm: "absolute" },
                zIndex: 1,
                left: 0,
                top: 0,
                width: { xs: "70%", sm: "59.3%" },
              }}
            />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          my: { xs: 3, sm: 5 },
          p: { xs: 1.5, sm: 4 },
          backgroundColor: alpha(theme.text.primary, isDarkMode ? 0.06 : 0.04),
          border: `1px solid ${alpha(theme.quaternary || theme.text.primary, 0.35)}`,
          borderRadius: `${theme.panelRadius}px`,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <InfoCard
            icon={<WarningAmberIcon sx={{ color: orangeAccent }} />}
            title={t("important_announcement")}
          >
            <Typography variant="body1">
              {t("important_announcement_desc")}:{" "}
              <Link
                href="https://fultimator.com"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ ...linkSx, fontWeight: "bold" }}
              >
                https://fultimator.com
              </Link>
            </Typography>
          </InfoCard>
        </Box>
        <Grid container spacing={{ xs: 2, sm: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={<DiscordIcon size={24} color="#7289da" />}
              title={t("join_fultimator_community")}
              actions={
                <Button
                  variant="contained"
                  href="https://discord.gg/aNEgvHm3Re"
                  target="_blank"
                  rel="noreferrer"
                  sx={discordFilledSx}
                >
                  {t("join_discord")}
                </Button>
              }
            >
              <Typography variant="body1">
                {t("join_fultimator_community_desc")}
              </Typography>
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={<DesktopMacIcon sx={{ color: primaryAccent }} />}
              title={t("download_desktop_app_header")}
              actions={
                <>
                  <Button
                    variant="contained"
                    href="https://github.com/fultimator/fultimator/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<DownloadIcon />}
                    color="primary"
                  >
                    {t("download_now") || "Download Now"}
                  </Button>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      fontSize: 28,
                    }}
                  >
                    {platforms.map(({ label, icon, color }) => (
                      <Tooltip key={label} title={label}>
                        <Box
                          component="span"
                          aria-label={label}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            color: color[isDarkMode ? 1 : 0],
                          }}
                        >
                          {icon}
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </>
              }
            >
              <Typography variant="body1">
                {t("download_desktop_app_desc")}
              </Typography>
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={<PaletteIcon sx={{ color: greenAccent }} />}
              title={t("credits_header")}
              actions={
                <Button
                  variant="contained"
                  onClick={() => setCreditsOpen(true)}
                  sx={greenFilledSx}
                >
                  {t("icon_credits")}
                </Button>
              }
            >
              <Typography variant="body1">{t("credits_desc")}</Typography>
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={<FeedbackIcon sx={{ color: orangeAccent }} />}
              title={t("contact_us_header")}
              actions={
                <>
                  <Button
                    variant="contained"
                    href="mailto:fultimator@gmail.com"
                    sx={orangeFilledSx}
                  >
                    fultimator@gmail.com
                  </Button>
                  <Button
                    variant="contained"
                    href="https://forms.gle/3P7Bq1CtZrnFwQsm8"
                    target="_blank"
                    rel="noreferrer"
                    sx={orangeFilledSx}
                  >
                    {t("google_form")}
                  </Button>
                </>
              }
            >
              <Typography variant="body1">
                {t("feedback_description")}
              </Typography>
            </InfoCard>
          </Grid>

          <Grid size={12}>
            <InfoCard
              icon={<LanguageIcon sx={{ color: orangeAccent }} />}
              title={t("fabula_ultima_resources_header")}
              actions={
                <Button
                  variant="contained"
                  onClick={() => navigate("/resources")}
                  sx={orangeFilledSx}
                >
                  {t("fabula_ultima_resources_btn")}
                </Button>
              }
            >
              <Typography variant="body1">
                {t("fabula_ultima_resources_desc")}
              </Typography>
            </InfoCard>
          </Grid>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={12}>
            <InfoCard
              icon={
                <CopyrightIcon
                  sx={{ color: isDarkMode ? "#bbdefb" : "#1976d2" }}
                />
              }
              title={t("copyright_notice_header")}
              aside={
                <Box
                  component="img"
                  src={powered_by_fu}
                  alt="Powered by Fabula Ultima"
                  onClick={() =>
                    window.open("https://need.games/fabula-ultima/", "_blank")
                  }
                  sx={{
                    width: 160,
                    maxWidth: "100%",
                    height: "auto",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                />
              }
            >
              <Box sx={{ display: "grid", gap: 1.5 }}>
                <Typography variant="body1">
                  {t("copyright_notice_desc_1")}{" "}
                  <Link
                    href="https://github.com/fultimator"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{ ...linkSx, fontWeight: "bold" }}
                  >
                    Fultimator Dev Team
                  </Link>
                  {t("copyright_notice_desc_2")}
                </Typography>
                <Typography variant="body1">
                  {t("copyright_notice_desc_3")}{" "}
                  <Link
                    href="https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{ ...linkSx, fontWeight: "bold" }}
                  >
                    Fabula Ultima Third Party Tabletop License 1.0
                  </Link>
                </Typography>
                <Typography variant="body1">
                  {t("copyright_notice_desc_4")}
                  <br />
                  {t("copyright_notice_desc_5")}
                </Typography>
              </Box>
            </InfoCard>
          </Grid>
        </Grid>
      </Box>
      {creditsOpen && (
        <Suspense fallback={null}>
          <IconCreditsModal
            open={creditsOpen}
            onClose={() => setCreditsOpen(false)}
          />
        </Suspense>
      )}
    </Layout>
  );
}

export default Home;
