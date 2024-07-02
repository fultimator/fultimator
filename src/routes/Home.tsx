import { CardMedia, Typography, Link, Box } from "@mui/material";
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

function Home() {
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
      hoverKey: "adversary_compedium",
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
        }}
      >
        <Typography variant="body1" sx={{ mt: 2 }}>
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
        <Typography variant="body1" sx={{ mt: 1 }}>
          {t("If you have any feedback, give us your thoughts here")}{" "}
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
        <Typography variant="body1" sx={{ mt: 1 }}>
          {t("The wonderful Fultimator Icons are made by Runty! Email:")}{" "}
          <Link
            href="mailto:contactrunty@iCloud.com"
            underline="hover"
            sx={{ color: "#47645b", fontWeight: "bold" }}
          >
            contactrunty@iCloud.com
          </Link>
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
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
        <Typography variant="body1" sx={{ mt: 1.5 }}>
          <strong>{t("Join the Fultimator Developer Team!")}</strong>{" "}
        </Typography>
        <Typography variant="body1" sx={{ mt: 0 }}>
          {t("We would love to have you on board!")}{" "}
          <Link
            href="https://discord.gg/9yYc6R93Cd"
            target="_blank"
            rel="noreferrer"
            underline="hover"
            sx={{ color: "#7289da", fontWeight: "bold" }}
          >
            {t("Simply reach out to us on Discord!")}
          </Link>
        </Typography>
      </Box>
    </Layout>
  );
}

export default Home;
