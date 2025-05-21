import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { t } from "../../../translation/translate";

import {
  GiRaiseZombie as UndeadIcon,
  GiWolfHead as BeastIcon,
  GiRobotGolem as ConstructIcon,
  GiEvilBat as DemonIcon,
  GiFire as ElementalIcon,
  GiSwordwoman as HumanoidIcon,
  GiGooeyDaemon as MonsterIcon,
  GiRose as PlantIcon,
} from "react-icons/gi";

const npcIcons = [
  UndeadIcon,
  BeastIcon,
  ConstructIcon,
  DemonIcon,
  ElementalIcon,
  HumanoidIcon,
  MonsterIcon,
  PlantIcon,
];

function getRandomIcon(currentIcon) {
  // Filter out the current icon to ensure a different selection
  const availableIcons = currentIcon
    ? npcIcons.filter((icon) => icon !== currentIcon)
    : npcIcons;

  const randomIndex = Math.floor(Math.random() * availableIcons.length);
  return availableIcons[randomIndex];
}

export default function EmptyList({ isMobile, showIcon = true }) {
  const [randomIcon, setRandomIcon] = useState(() => getRandomIcon(null)); // Random icon for the NPC empty state

  const handleIconClick = () => {
    setRandomIcon(() => getRandomIcon(randomIcon));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: 0.5,
        maxWidth: 350,
        cursor: showIcon ? "pointer" : "default",
      }}
      onClick={handleIconClick}
    >
      {showIcon &&
        React.createElement(randomIcon, {
          size: 110,
          color: "text.secondary",
        })}
      <Typography
        variant="h4"
        color="text.secondary"
        sx={{
          fontStyle: "italic",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {t("combat_sim_no_npc_selected")}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontStyle: "italic",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {isMobile
          ? t("combat_sim_no_npc_selected_helper_mobile")
          : t("combat_sim_no_npc_selected_helper_desktop")}
      </Typography>
    </Box>
  );
}
