import { CardMedia, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import adversary_compedium from "./adversary_compedium.webp";
import adversary_designer from "./adversary_designer.webp";
import combat_simulator from "./combat_simulator.webp";
import player_designer from "./custom_class_no_title.webp";
import dice_roller from "./dice_roller.webp";
import items_rituals_projects from "./items_rituals_projects.webp";
import React, { useState } from "react";

import { useTranslate } from "../translation/translate";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { testUsers, moderators } from "../libs/userGroups";

function Home() {
  const navigate = useNavigate();
  const [hover, setHover] = useState("");
  const { t } = useTranslate();
  const [user, loading] = useAuthState(auth);

  let canAccessTest = false;
  if (user?.uid) {
    canAccessTest =
      testUsers.includes(user.uid) || moderators.includes(user.uid);
  }

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
        {canAccessTest && (
          <CardMedia
            component="img"
            image={player_designer}
            alt=""
            sx={{
              objectFit: "contain",
              width: 360,
              cursor: "pointer",
              transform: hover === "player_designer" ? " scale(1.1)" : "none",
            }}
            onMouseEnter={() => {
              setHover("player_designer");
            }}
            onMouseLeave={() => {
              setHover("");
            }}
            onClick={() => {
              navigate("/player-gallery");
            }}
          />
        )}
        <CardMedia
          component="img"
          image={adversary_designer}
          alt=""
          sx={{
            objectFit: "contain",
            width: 360,
            cursor: "pointer",
            transform: hover === "adversary_designer" ? " scale(1.1)" : "none",
          }}
          onMouseEnter={() => {
            setHover("adversary_designer");
          }}
          onMouseLeave={() => {
            setHover("");
          }}
          onClick={() => {
            navigate("/npc-gallery");
          }}
        />

        <CardMedia
          component="img"
          image={adversary_compedium}
          alt=""
          sx={{
            objectFit: "contain",
            width: 360,
            cursor: "pointer",
            transform: hover === "adversary_compedium" ? " scale(1.1)" : "none",
          }}
          onMouseEnter={() => {
            setHover("adversary_compedium");
          }}
          onMouseLeave={() => {
            setHover("");
          }}
          onClick={() => {
            navigate("/npc-compedium");
          }}
        />

        <CardMedia
          component="img"
          image={combat_simulator}
          alt=""
          sx={{
            objectFit: "contain",
            width: 360,
            cursor: "pointer",
            transform: hover === "combat_simulator" ? " scale(1.1)" : "none",
          }}
          onMouseEnter={() => {
            setHover("combat_simulator");
          }}
          onMouseLeave={() => {
            setHover("");
          }}
          onClick={() => {
            navigate("/combat");
          }}
        />

        <CardMedia
          component="img"
          image={items_rituals_projects}
          alt=""
          sx={{
            objectFit: "contain",
            width: 360,
            cursor: "pointer",
            transform:
              hover === "items_rituals_projects" ? " scale(1.1)" : "none",
          }}
          onMouseEnter={() => {
            setHover("items_rituals_projects");
          }}
          onMouseLeave={() => {
            setHover("");
          }}
          onClick={() => {
            navigate("/generate");
          }}
        />

        <CardMedia
          component="img"
          image={dice_roller}
          alt=""
          sx={{
            objectFit: "contain",
            width: 360,
            cursor: "pointer",
            transform: hover === "dice_roller" ? " scale(1.1)" : "none",
          }}
          onMouseEnter={() => {
            setHover("dice_roller");
          }}
          onMouseLeave={() => {
            setHover("");
          }}
          onClick={() => {
            navigate("/roller");
          }}
        />
      </div>
      <Typography sx={{ p: 3, textAlign: "center" }}>
        {t("If you have any feedback, give us your thoughts here")}{" "}
        <a href=" https://forms.gle/3P7Bq1CtZrnFwQsm8">{t("Google Form.")}</a>{" "}
        <br />
        {t("The wonderful Fultimator Icons are made by Runty! Email:")}{" "}
        <a href="mailto:contactrunty@iCloud.com">contactrunty@iCloud.com</a>
        <br />
        {t("Monster Icons are taken from:")}{" "}
        <a href="http://www.akashics.moe/" target="_blank" rel="noreferrer">
          http://www.akashics.moe/
        </a>
      </Typography>
    </Layout>
  );
}

export default Home;
