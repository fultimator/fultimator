import { CardMedia, Typography, Link, Box, Divider, Stack, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import React, { useState } from "react";
import { useTranslate } from "../translation/translate";
import adversary_compedium from "./adversary_compedium.webp";
import adversary_designer from "./adversary_designer.webp";
import combat_simulator from "./combat_simulator.webp";
import dice_roller from "./dice_roller.webp";
import items_rituals_projects from "./items_rituals_projects.webp";
import character_designer from "./character_designer_alpha_2_00.webp";
import PublicIcon from '@mui/icons-material/Public';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DesktopMacIcon from '@mui/icons-material/DesktopMac';
import DiscordIcon from '../components/svgs/discord.svg'; // Import your SVG
import CopyrightIcon from '@mui/icons-material/Copyright';
import { useCustomTheme } from '../hooks/useCustomTheme'

function Home() {
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const navigate = useNavigate();
  const [hover, setHover] = useState("");
  const { t } = useTranslate();

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
      link: "/combat",
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
              transform: hover === item.hoverKey ? "scale(1.1)" : "none",
              transition: "transform 0.3s",
            }}
            onMouseEnter={() => {
              setHover(item.hoverKey);
            }}
            onMouseLeave={() => {
              setHover("");
            }}
            onClick={() => {
              navigate(item.link);
            }}
          />
        ))}
      </div>

      <Box
        sx={{
          textAlign: "center",
          mt: 5,
          mb: 5,
          padding: "1em",
          backgroundColor: isDarkMode ? `#252525` : "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              <img src={DiscordIcon} alt="Discord" style={{ verticalAlign: 'middle', width: 24, height: 24, marginRight: 8 }} />
              {t("Join the Fultimator Community!")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t("We would love to have you on board!")}{" "}
              <Link
                href="https://discord.gg/9yYc6R93Cd"
                target="_blank"
                rel="noreferrer"
                underline="hover"
                sx={{ color: "#7289da", fontWeight: "bold" }}
              >
                {t("Dive into the Discord Hub!")}
              </Link>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              <DesktopMacIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              {t("Download the Fultimator Desktop App")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t("Fultimator is also available as a desktop app for Windows and Linux. Download it from the following link:")}{" "}
              <Link
                href="https://github.com/fultimator/fultimator-desktop/releases"
                target="_blank"
                rel="noreferrer"
                underline="hover"
                sx={{ color: "#47645b", fontWeight: "bold" }}
              >
                {t("Fultimator Desktop App")}
              </Link>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              <PublicIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              {t("Extra")}
            </Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Typography variant="body1">
                {t("The wonderful Fultimator Icons are made by Runty! Email:")}{" "}
                <Link
                  href="mailto:contactrunty@iCloud.com"
                  underline="hover"
                  sx={{ color: "#47645b", fontWeight: "bold" }}
                >
                  contactrunty@iCloud.com
                </Link>
              </Typography>
              <Typography variant="body1">
                {t("Monster Icons are taken from:")}{" "}
                <Link
                  href="http://www.akashics.moe/"
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                  sx={{ color: "#47645b", fontWeight: "bold" }}
                >
                  akashics.moe
                </Link>
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              <FeedbackIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              {t("Contact Us")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t("If you have any feedback or questions, feel free to reach out to us via email or our feedback form.")}{" "}
              <Link
                href="mailto:fultimator@gmail.com"
                underline="hover"
                sx={{ color: "#47645b", fontWeight: "bold" }}
              >
                fultimator@gmail.com
              </Link>
              {" | "}
              <Link
                href="https://forms.gle/3P7Bq1CtZrnFwQsm8"
                target="_blank"
                rel="noreferrer"
                underline="hover"
                sx={{ color: "#47645b", fontWeight: "bold" }}
              >
                {t("Google Form.")}
              </Link>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              <CopyrightIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              {t("Copyright Notice")}
            </Typography>
            <Typography variant="body1">
              {t("Fultimator is an independent production by")}{" "}
              <Link
                href="https://github.com/fultimator"
                target="_blank"
                rel="noreferrer"
                underline="hover"
                sx={{ color: "#47645b", fontWeight: "bold" }}
              >
                {t("Fultimator Dev Team")}
              </Link>
              {t(" and is not affiliated with Need Games or Rooster Games.")}
              <br />
              {t("It is published under the")}
              <Link
                href="https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf"
                target="_blank"
                rel="noreferrer"
                underline="hover"
                sx={{ color: "#47645b", fontWeight: "bold" }}
              >
                {t(" Fabula Ultima Third Party Tabletop License 1.0")}
              </Link>
              <br />
              {t("Fabula Ultima is a roleplaying game created by Emanuele Galletto and published by Need Games.")}
              <br />
              {t("Fabula Ultima is © Need Games and Rooster Games.")}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export default Home;
