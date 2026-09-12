import React from "react";
import { Box, Typography } from "@mui/material";
import {
  SkipNext as SkipNextIcon,
  Replay as ReplayIcon,
  Flag as FlagIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Favorite as FavoriteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Brightness7 as StatusAddIcon,
  Brightness4 as StatusRemoveIcon,
  CheckCircleOutlined as TurnCheckedIcon,
  Casino as CasinoIcon,
  AutoFixHigh as SpellIcon,
  AccessTime as ClockIcon,
  DriveFileRenameOutline as RenameIcon,
  Notes as NotesIcon,
  LocalFireDepartment as DamageIcon,
  Star as CritSuccessIcon,
  Warning as CritFailureIcon,
  WaterDrop as ResourceIcon,
} from "@mui/icons-material";
import { GiDeathSkull } from "react-icons/gi";
import type { CombatLogEvent } from "../types";

function EventIcon({ event }: { event: CombatLogEvent }) {
  const sx = { fontSize: 15, color: "text.secondary", flexShrink: 0 };
  switch (event.type) {
    case "round-change":
      if (event.direction === "new") return <FlagIcon sx={sx} />;
      if (event.direction === "up") return <SkipNextIcon sx={sx} />;
      return <ReplayIcon sx={sx} />;
    case "actor-added":
      return <PersonAddIcon sx={sx} />;
    case "actor-removed":
      return <PersonRemoveIcon sx={sx} />;
    case "fainted":
      return (
        <GiDeathSkull
          size={15}
          style={{ color: "var(--icon-color)", flexShrink: 0 }}
        />
      );
    case "damage":
      return <DamageIcon sx={sx} />;
    case "heal":
      return <FavoriteIcon sx={{ ...sx, color: "success.main" }} />;
    case "resource-loss":
    case "expenditure":
    case "resource-application":
      return <ResourceIcon sx={sx} />;
    case "ultima-used":
      return <AutoAwesomeIcon sx={sx} />;
    case "status-added":
      return <StatusAddIcon sx={sx} />;
    case "status-removed":
      return <StatusRemoveIcon sx={sx} />;
    case "turn-checked":
      return <TurnCheckedIcon sx={sx} />;
    case "accuracy-check":
    case "magic-check":
    case "generic-roll":
      return <CasinoIcon sx={sx} />;
    case "spell-use":
      return <SpellIcon sx={sx} />;
    case "crit-success":
      return <CritSuccessIcon sx={{ ...sx, color: "primary.main" }} />;
    case "crit-failure":
      return <CritFailureIcon sx={{ ...sx, color: "error.main" }} />;
    case "clock-added":
    case "clock-updated":
    case "clock-state":
    case "clock-reset":
    case "clock-removed":
      return <ClockIcon sx={sx} />;
    case "encounter-renamed":
      return <RenameIcon sx={sx} />;
    default:
      return <NotesIcon sx={sx} />;
  }
}

function actor(name: string) {
  return (
    <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
      {name}
    </Typography>
  );
}

function val(v: number | string) {
  return (
    <Typography
      component="span"
      variant="body2"
      sx={{ fontWeight: 700, color: "primary.main" }}
    >
      {v}
    </Typography>
  );
}

function muted(text: string) {
  return (
    <Typography component="span" variant="body2" color="text.secondary">
      {text}
    </Typography>
  );
}

function EventText({ event }: { event: CombatLogEvent }) {
  switch (event.type) {
    case "round-change":
      if (event.direction === "new")
        return (
          <>
            {muted("New round")} {val(event.round)}
            {muted(" started")}
          </>
        );
      if (event.direction === "up")
        return (
          <>
            {muted("Round")} {val(event.round)}
          </>
        );
      return (
        <>
          {muted("Round decreased to")} {val(event.round)}
        </>
      );

    case "actor-added":
      return (
        <>
          {actor(event.name)}
          {muted(" joined the encounter")}
        </>
      );

    case "actor-removed":
      return (
        <>
          {actor(event.name)}
          {muted(" left the encounter")}
        </>
      );

    case "fainted":
      return (
        <>
          {actor(event.targetName)}
          {muted(" fainted")}
        </>
      );

    case "turn-checked":
      return (
        <>
          {actor(event.actorName)}
          {muted("'s turn marked done")}
        </>
      );

    case "damage":
      return (
        <>
          {actor(event.targetName)}
          {muted(" took ")}
          {val(event.amount)}
          {muted(
            ` ${event.damageType !== "untyped" ? event.damageType : ""} damage`,
          )}
          {event.affinity === "vu" && muted(" (vulnerable)")}
          {event.affinity === "rs" && muted(" (resistant)")}
          {event.affinity === "im" && muted(" (immune)")}
          {event.affinity === "ab" && muted(" (absorbed)")}
        </>
      );

    case "heal":
      return (
        <>
          {actor(event.targetName)}
          {muted(" recovered ")}
          {val(event.amount)}
          {muted(` ${event.resource.toUpperCase()}`)}
        </>
      );

    case "resource-loss":
      return (
        <>
          {actor(event.targetName)}
          {muted(" lost ")}
          {val(event.amount)}
          {muted(` ${event.resource.toUpperCase()}`)}
        </>
      );

    case "expenditure":
      return (
        <>
          {actor(event.actorName)}
          {muted(" spent ")}
          {val(event.amount)}
          {muted(` ${event.resource.toUpperCase()}`)}
        </>
      );

    case "resource-application":
      return (
        <>
          {actor(event.actorName)}
          {muted(event.direction === "loss" ? " spent " : " gained ")}
          {val(event.amount)}
          {muted(` ${event.resource.toUpperCase()}`)}
          {event.status === "unavailable" && muted(" was not applied")}
        </>
      );

    case "ultima-used":
      return (
        <>
          {actor(event.actorName)}
          {muted(" used an Ultima Point")}
        </>
      );

    case "status-added":
      return (
        <>
          {actor(event.targetName)}
          {muted(" gained ")}
          {actor(event.status)}
        </>
      );

    case "status-removed":
      return (
        <>
          {actor(event.targetName)}
          {muted(" lost ")}
          {actor(event.status)}
        </>
      );

    case "accuracy-check":
      return (
        <>
          {actor(event.actorName)}
          {muted(" attacked with ")}
          {actor(event.weaponName)}
          {event.isCrit && <> {val("CRIT")}</>}
          {event.isFumble && <> {muted("fumble")}</>}
        </>
      );

    case "magic-check":
      return (
        <>
          {actor(event.actorName)}
          {muted(" cast ")}
          {actor(event.spellName)}
          {event.isCrit && <> {val("CRIT")}</>}
          {event.isFumble && <> {muted("fumble")}</>}
        </>
      );

    case "spell-use":
      return (
        <>
          {actor(event.actorName)}
          {muted(" used ")}
          {actor(event.spellName)}
        </>
      );

    case "generic-roll":
      return (
        <>
          {actor(event.actorName)}
          {muted(" rolled ")}
          {actor(event.label)}
        </>
      );

    case "crit-success":
      return (
        <>
          {actor(event.actorName)}
          {muted(" - ")}
          {"Critical Success"}
        </>
      );

    case "crit-failure":
      return (
        <>
          {actor(event.actorName)}
          {muted(" - ")}
          {"Critical Failure"}
        </>
      );

    case "clock-added":
      return (
        <>
          {muted("Clock ")} {actor(event.clockName)} {muted("added")}
        </>
      );

    case "clock-removed":
      return (
        <>
          {muted("Clock ")} {actor(event.clockName)} {muted("removed")}
        </>
      );

    case "clock-reset":
      return (
        <>
          {muted("Clock ")} {actor(event.clockName)} {muted("reset")}
        </>
      );

    case "clock-updated":
    case "clock-state":
      return (
        <>
          {muted("Clock ")}
          {actor(event.clockName)}
          {muted(": ")}
          {val(event.progress)}
          {muted("/")}
          {val(event.max)}
        </>
      );

    case "encounter-renamed":
      return (
        <>
          {muted("Encounter renamed to ")} {actor(event.newName)}
        </>
      );

    case "text":
      return (
        <Typography component="span" variant="body2">
          {event.text}
        </Typography>
      );

    default:
      return null;
  }
}

interface LogMessageTemplateProps {
  event: CombatLogEvent;
  undone?: boolean;
}

export const LogMessageTemplate: React.FC<LogMessageTemplateProps> = ({
  event,
  undone = false,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        // css variable for the GiDeathSkull icon color
        "--icon-color": "var(--mui-palette-text-secondary, #9e9e9e)",
      }}
    >
      <EventIcon event={event} />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          textDecoration: undone ? "line-through" : "none",
          opacity: undone ? 0.62 : 1,
        }}
      >
        <EventText event={event} />
      </Box>
    </Box>
  );
};
