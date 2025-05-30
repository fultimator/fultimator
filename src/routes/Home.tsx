import {
  CardMedia,
  Typography,
  Link,
  Box,
  Divider,
  Stack,
  Grid,
  Button,
  Paper,
  useMediaQuery,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import React, { useState } from "react";
import { useTranslate } from "../translation/translate";
import adversary_compedium from "./adversary_compedium.webp";
import adversary_designer from "./adversary_designer.webp";
import combat_simulator from "./combat_simulator.webp";
import dice_roller from "./dice_roller.webp";
import items_rituals_projects from "./items_rituals_projects.webp";
import character_designer from "./character_designer.webp";
import PublicIcon from "@mui/icons-material/Public";
import FeedbackIcon from "@mui/icons-material/Feedback";
import DesktopMacIcon from "@mui/icons-material/DesktopMac";
import { DiscordIcon } from "../components/icons";
import CopyrightIcon from "@mui/icons-material/Copyright";
import { useCustomTheme } from "../hooks/useCustomTheme";
import { useTheme } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import { FaWindows, FaApple, FaLinux } from "react-icons/fa";
import EmailIcon from "@mui/icons-material/Email";
import powered_by_fu from "./powered_by_fu.png";
import NewsIcon from "@mui/icons-material/Newspaper";
import LaunchIcon from "@mui/icons-material/Launch";
import LanguageIcon from "@mui/icons-material/Language";

function Home() {
  const theme = useCustomTheme();
  const muiTheme = useTheme();
  const isDarkMode = theme.mode === "dark";
  const navigate = useNavigate();
  const [hover, setHover] = useState("");
  const { t } = useTranslate();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));

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
      image: dice_roller,
      link: "/roller",
      hoverKey: "dice_roller",
    },
  ];

  const [news, setNews] = useState([
    {
      id: 1,
      title: "Welcome to Fultimator 2.0!",
      date: "2024-01-15",
      content:
        "We're excited to announce the latest version of Fultimator with improved character creation tools and enhanced combat simulation features.",
      isNew: true,
    },
    {
      id: 2,
      title: "New Adversary Templates Added",
      date: "2024-01-10",
      content:
        "Discover new adversary templates in our compendium, including elemental creatures and mechanical constructs.",
      isNew: false,
    },
    {
      id: 3,
      title: "Desktop App Now Available",
      date: "2024-01-05",
      content:
        "Download our new desktop application for Windows, macOS, and Linux for an enhanced offline experience.",
      isNew: false,
    },
  ]);

  // Official Fabula Ultima links by language
  const officialLinks = {
    en: [
      {
        name: "Core Rulebook (PDF)",
        url: "https://www.drivethrurpg.com/en/publisher/17072/need-games/category/43538/fabula-ultima-ttjrpg",
        type: "pdf",
      },
      {
        name: "Core Rulebook (Physical)",
        url: "https://studio2publishing.com/collections/fabula-ultima",
        type: "physical",
      },
      {
        name: "Press Start Tutorial",
        url: "https://www.drivethrurpg.com/en/product/411240/fabula-ultima-ttjrpg-press-start",
        type: "free",
      },
      {
        name: "Official Website",
        url: "https://www.needgames.it/fabula-ultima-en",
        type: "website",
      },
    ],
    it: [
      {
        name: "Manuale Base (PDF & Fisico)",
        url: "https://www.needgames.it/categoria-prodotto/fabula-ultima/",
        type: "both",
      },
      {
        name: "Premi Start Tutorial",
        url: "https://www.needgames.it/prodotto/premi-start-fabula-ultima-quickstart-pdf/",
        type: "free",
      },
      {
        name: "Sito Ufficiale",
        url: "https://www.needgames.it/giochi/fabula-ultima/",
        type: "website",
      },
    ],
    fr: [
      {
        name: "Livre de Règles (PDF)",
        url: "https://www.drivethrurpg.com/en/publisher/26836/don-t-panic-games/category/48615/fabula-ultima",
        type: "pdf",
      },
      {
        name: "Livre de Règles (Physique)",
        url: "https://www.dontpanicgames.com/fr/nos-jeux/?_sfm_licence=fabulaultima",
        type: "physical",
      },
      {
        name: "Appuyez sur Start Tutorial",
        url: "https://www.drivethrurpg.com/en/product/473233/fabula-ultima-appuyez-sur-start",
        type: "free",
      },
    ],
    de: [
      {
        name: "Grundregelwerk (PDF)",
        url: "https://www.drivethrurpg.com/en/publisher/3444/ulisses-spiele/category/50444/fabula-ultima",
        type: "pdf",
      },
      {
        name: "Grundregelwerk (Physisch)",
        url: "https://www.f-shop.de/fabula-ultima/",
        type: "physical",
      },
    ],
    pl: [
      {
        name: "Podstawowa Książka Zasad (PDF)",
        url: "https://www.drivethrurpg.com/en/publisher/14087/black-monk-games/category/47458/fabula-ultima",
        type: "pdf",
      },
      {
        name: "Podstawowa Książka Zasad (Fizyczna)",
        url: "https://blackmonk.pl/92-fabula-ultima",
        type: "physical",
      },
      {
        name: "Starter Tutorial (PDF)",
        url: "https://blackmonk.pl/black-monk-games/1907-pdf-fabula-ultima-starter.html",
        type: "free",
      },
    ],
    "pt-BR": [
      {
        name: "Livro Básico (Em Breve)",
        url: "https://site.jamboeditora.com.br/fabula-ultima/",
        type: "coming_soon",
      },
    ],
  };

  const getCurrentLanguage = () => {
    // Assuming you have access to current language from your translation context
    // Adjust this based on your actual translation setup
    const currentLang = localStorage.getItem("selectedLanguage") || "en";
    return officialLinks[currentLang] ? currentLang : "en";
  };

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
          backgroundColor: isDarkMode ? `#252525` : "#f5f5f5",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    display: "inline-flex",
                  }}
                >
                  <DiscordIcon
                    size={24}
                    color={isDarkMode ? "#7289da" : "#7289da"}
                  />
                </Box>
                {t("Join the Fultimator Community!")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("We would love to have you on board!")}
              </Typography>
              <Button
                variant="contained"
                href="https://discord.gg/9yYc6R93Cd"
                target="_blank"
                rel="noreferrer"
                sx={{
                  backgroundColor: "#7289da",
                  "&:hover": { backgroundColor: "#5f73bc" },
                  fontWeight: "bold",
                }}
              >
                {t("Dive into the Discord Hub!")}
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <DesktopMacIcon
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    color: isDarkMode ? theme.secondary : theme.primary,
                  }}
                />
                {t("Download the Fultimator Desktop App")}
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("desktop_app_description") ||
                  "Get the full experience with our desktop app, available for Windows, macOS, and Linux."}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  href="https://github.com/fultimator/fultimator-desktop/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<DownloadIcon />}
                  color="primary"
                >
                  {t("download_now") || "Download Now"}
                </Button>

                {/* OS Icons */}
                <Box sx={{ display: "flex", gap: 1, fontSize: 24 }}>
                  <FaWindows color={isDarkMode ? "#e0e0e0" : "#111111"} />
                  <FaApple color={isDarkMode ? "#e0e0e0" : "#111111"} />
                  <FaLinux color={isDarkMode ? "#e0e0e0" : "#111111"} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <PublicIcon
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    color: isDarkMode ? "#81c784" : "#388e3c",
                  }}
                />
                {t("extra_resources")}
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body1">
                  {t("contact_runty")}
                  <Tooltip title="Email contactrunty@iCloud.com" arrow>
                    <IconButton
                      component="a"
                      href="mailto:contactrunty@iCloud.com"
                      sx={{
                        color: isDarkMode ? "#81c784" : "#388e3c",
                        ml: 1,
                      }}
                      size="small"
                    >
                      <EmailIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Typography variant="body1">
                  {t("Monster Icons are taken from:")}
                  <Button
                    variant="text"
                    href="http://www.akashics.moe/"
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      color: isDarkMode ? "#81c784" : "#388e3c",
                      fontWeight: "bold",
                      ml: 1,
                      p: 0,
                      minWidth: "auto",
                    }}
                  >
                    akashics.moe
                  </Button>
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <FeedbackIcon
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    color: isDarkMode ? "#ffb74d" : "#f57c00",
                  }}
                />
                {t("Contact Us")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("feedback_description")}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  href="mailto:fultimator@gmail.com"
                  sx={{
                    borderColor: isDarkMode ? "#ffb74d" : "#f57c00",
                    color: isDarkMode ? "#ffb74d" : "#f57c00",
                    "&:hover": {
                      borderColor: isDarkMode ? "#ffca28" : "#ffa726",
                      backgroundColor: "rgba(255, 199, 40, 0.1)",
                    },
                    fontWeight: "bold",
                  }}
                >
                  fultimator@gmail.com
                </Button>
                <Button
                  variant="outlined"
                  href="https://forms.gle/3P7Bq1CtZrnFwQsm8"
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                    borderColor: isDarkMode ? "#ffb74d" : "#f57c00",
                    color: isDarkMode ? "#ffb74d" : "#f57c00",
                    "&:hover": {
                      borderColor: isDarkMode ? "#ffca28" : "#ffa726",
                      backgroundColor: "rgba(255, 199, 40, 0.1)",
                    },
                    fontWeight: "bold",
                  }}
                >
                  {t("google_form")}
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <NewsIcon
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    color: isDarkMode ? "#90caf9" : "#1976d2",
                  }}
                />
                {t("Latest News")}
              </Typography>

              <Stack spacing={2}>
                {news.slice(0, 3).map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 2,
                      borderRadius: "4px",
                      backgroundColor: isDarkMode ? "#424242" : "#f8f9fa",
                      border: item.isNew
                        ? `2px solid ${isDarkMode ? "#90caf9" : "#1976d2"}`
                        : "1px solid transparent",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: isDarkMode ? "#e0e0e0" : "#333333",
                          flex: 1,
                        }}
                      >
                        {item.title}
                        {item.isNew && (
                          <Box
                            component="span"
                            sx={{
                              ml: 1,
                              px: 1,
                              py: 0.5,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "#fff",
                              backgroundColor: isDarkMode
                                ? "#90caf9"
                                : "#1976d2",
                              borderRadius: "12px",
                            }}
                          >
                            NEW
                          </Box>
                        )}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDarkMode ? "#b0b0b0" : "#666666",
                        }}
                      >
                        {new Date(item.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode ? "#e0e0e0" : "#555555",
                      }}
                    >
                      {item.content}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <LanguageIcon
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    color: isDarkMode ? "#ffb74d" : "#f57c00",
                  }}
                />
                {t("Official Fabula Ultima Resources")}
              </Typography>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {t(
                  "Quick access to official content in your language. Find rulebooks, tutorials, and more."
                )}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {officialLinks[getCurrentLanguage()]
                  ?.slice(0, 4)
                  .map((link, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Button
                        variant="outlined"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<LaunchIcon />}
                        fullWidth
                        disabled={link.type === "coming_soon"}
                        sx={{
                          borderColor:
                            link.type === "coming_soon"
                              ? isDarkMode
                                ? "#666"
                                : "#ccc"
                              : isDarkMode
                              ? "#ffb74d"
                              : "#f57c00",
                          color:
                            link.type === "coming_soon"
                              ? isDarkMode
                                ? "#666"
                                : "#ccc"
                              : isDarkMode
                              ? "#ffb74d"
                              : "#f57c00",
                          "&:hover":
                            link.type !== "coming_soon"
                              ? {
                                  borderColor: isDarkMode
                                    ? "#ffca28"
                                    : "#ffa726",
                                  backgroundColor: "rgba(255, 183, 77, 0.1)",
                                }
                              : {},
                          fontWeight: "bold",
                          textAlign: "left",
                          justifyContent: "flex-start",
                          minHeight: "48px",
                        }}
                      >
                        {link.name}
                      </Button>
                    </Grid>
                  ))}
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/resources")}
                  sx={{
                    backgroundColor: isDarkMode ? "#ffb74d" : "#f57c00",
                    "&:hover": {
                      backgroundColor: isDarkMode ? "#ffca28" : "#ffa726",
                    },
                    fontWeight: "bold",
                    px: 4,
                    py: 1.5,
                  }}
                >
                  {t("View All Resources & Languages")}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ marginBottom: 3 }} />
            <Box
              sx={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  mr: isSmallScreen ? 0 : 3,
                  mb: isSmallScreen ? 3 : 0,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: isDarkMode ? "#e0e0e0" : "#333333",
                  }}
                >
                  <CopyrightIcon
                    sx={{
                      verticalAlign: "middle",
                      mr: 1,
                      color: isDarkMode ? "#bbdefb" : "#1976d2",
                    }}
                  />
                  {t("Copyright Notice")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: isDarkMode ? "#e0e0e0" : "#555555" }}
                >
                  {"Fultimator is an independent production by"}{" "}
                  <Link
                    href="https://github.com/fultimator"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{
                      color: isDarkMode ? theme.secondary : theme.primary,
                      fontWeight: "bold",
                    }}
                  >
                    {t("Fultimator Dev Team")}
                  </Link>
                  {" and is not affiliated with Need Games or Rooster Games."}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: isDarkMode ? "#e0e0e0" : "#555555" }}
                >
                  {"It is published under the"}{" "}
                  <Link
                    href="https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{
                      color: isDarkMode ? theme.secondary : theme.primary,
                      fontWeight: "bold",
                    }}
                  >
                    {"Fabula Ultima Third Party Tabletop License 1.0"}
                  </Link>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "#e0e0e0" : "#555555" }}
                >
                  {
                    "Fabula Ultima is a roleplaying game created by Emanuele Galletto and published by Need Games."
                  }
                  <br />
                  {"Fabula Ultima is © Need Games and Rooster Games."}
                </Typography>
              </Box>

              {/* Powered by FU image */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: isSmallScreen ? "center" : "flex-end",
                  alignItems: "center",
                  mt: isSmallScreen ? 2 : 0,
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    cursor: "pointer",
                  },
                }}
              >
                <img
                  src={powered_by_fu}
                  alt="Powered by Fabula Ultima"
                  onClick={() =>
                    window.open("https://need.games/fabula-ultima/", "_blank")
                  }
                  style={{
                    maxWidth: "200px",
                    height: "auto",
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export default Home;
