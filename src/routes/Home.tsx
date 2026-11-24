import {
  CardMedia,
  Typography,
  Link,
  Box,
  Divider,
  Grid,
  Button,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";
import React, { Suspense, lazy, useState } from "react";
import { useTranslate } from "../translation/translate";
import adversary_compedium from "/images/routes/navigation/adversary_compedium.webp";
import adversary_designer from "/images/routes/navigation/adversary_designer.webp";
import combat_simulator from "/images/routes/navigation/combat_simulator.webp";
import dice_roller from "/images/routes/navigation/dice_roller.webp";
import items_rituals_projects from "/images/routes/items_rituals_projects.webp";
import compendium_viewer from "/images/routes/navigation/compendia_viewer.webp"; // placeholder, replace with dedicated asset
import character_designer from "/images/routes/navigation/character_designer.webp";
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

function Home() {
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const navigate = useNavigate();
  const [hover, setHover] = useState("");
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
    { label: "Linux", icon: <FaLinux />, color: ["#111111", "#fcc624"] },
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

  const mediaItems = [
    {
      image: character_designer,
      link: "/pc-gallery",
      hoverKey: "character_designer",
    },
    {
      image: adversary_designer,
      link: "/npc-gallery",
      hoverKey: "adversary_designer",
    },
    {
      image: adversary_compedium,
      link: "/npc-compedium",
      hoverKey: "adversary_compendium",
    },
    {
      image: combat_simulator,
      link: "/combat-sim",
      hoverKey: "combat_simulator",
    },
    {
      image: items_rituals_projects,
      link: "/generate",
      hoverKey: "items_rituals_projects",
    },
    {
      image: compendium_viewer,
      link: "/compendium",
      hoverKey: "compendium_viewer",
    },
    {
      image: dice_roller,
      link: "/roller",
      hoverKey: "dice_roller",
    },
  ];

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "1em",
          margin: "1em",
        }}
      >
        {mediaItems.map((item, index) => (
          <CardMedia
            key={index}
            component="img"
            image={item.image}
            alt=""
            sx={{
              objectFit: "contain",
              width: 360,
              cursor: "pointer",
              transform: hover === item.hoverKey ? "scale(1.05)" : "none",
              transition: "transform 0.3s",
            }}
            onMouseEnter={() => {
              setHover(item.hoverKey);
            }}
            onMouseLeave={() => {
              setHover("");
            }}
            onClick={() => {
              navigate(item.link, {
                state: {
                  from: "/",
                },
              });
            }}
          />
        ))}
      </div>
      <Box
        sx={{
          mt: 5,
          mb: 5,
          padding: "2em",
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
                sx={{ fontWeight: "bold" }}
              >
                https://fultimator.com
              </Link>
            </Typography>
          </InfoCard>
        </Box>
        <Grid container spacing={4}>
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
