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
import { t } from "../../../../../translation/translate";

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

// Translates a sentence key, rendering {0}, {1}... as the given nodes and the
// rest as muted text, so translators can reorder words.
function sentence(key: string, parts: React.ReactNode[]) {
  return t(key, undefined, true)
    .split(/\{(\d+)\}/)
    .map((chunk: string, i: number) => (
      <React.Fragment key={i}>
        {i % 2 ? parts[Number(chunk)] : chunk && muted(chunk)}
      </React.Fragment>
    ));
}

const AFFINITY_SUFFIX: Record<string, string> = {
  vu: "(vulnerable)",
  rs: "(resistant)",
  im: "(immune)",
  ab: "(absorbed)",
};

function rollFlag(event: { isCrit?: boolean; isFumble?: boolean }) {
  if (event.isCrit) return <> {val(t("CRIT"))}</>;
  if (event.isFumble) return <> {muted(t("fumble"))}</>;
  return null;
}

function EventText({ event }: { event: CombatLogEvent }) {
  switch (event.type) {
    case "round-change":
      if (event.direction === "new")
        return sentence("New round {0} started", [val(event.round)]);
      if (event.direction === "up")
        return sentence("Round {0}", [val(event.round)]);
      return sentence("Round decreased to {0}", [val(event.round)]);

    case "actor-added":
      return sentence("{0} joined the encounter", [actor(event.name)]);

    case "actor-removed":
      return sentence("{0} left the encounter", [actor(event.name)]);

    case "fainted":
      return sentence("{0} fainted", [actor(event.targetName)]);

    case "turn-checked":
      return sentence("{0}'s turn marked done", [actor(event.actorName)]);

    case "damage": {
      const typed = event.damageType !== "untyped";
      return (
        <>
          {sentence(typed ? "{0} took {1} {2} damage" : "{0} took {1} damage", [
            actor(event.targetName),
            val(event.amount),
            typed ? muted(t(event.damageType)) : null,
          ])}
          {AFFINITY_SUFFIX[event.affinity ?? ""] &&
            muted(` ${t(AFFINITY_SUFFIX[event.affinity ?? ""])}`)}
        </>
      );
    }

    case "heal":
      return sentence("{0} recovered {1} {2}", [
        actor(event.targetName),
        val(event.amount),
        muted(t(event.resource.toUpperCase())),
      ]);

    case "resource-loss":
      return sentence("{0} lost {1} {2}", [
        actor(event.targetName),
        val(event.amount),
        muted(t(event.resource.toUpperCase())),
      ]);

    case "expenditure":
      return sentence("{0} spent {1} {2}", [
        actor(event.actorName),
        val(event.amount),
        muted(t(event.resource.toUpperCase())),
      ]);

    case "resource-application":
      return (
        <>
          {sentence(
            event.direction === "loss"
              ? "{0} spent {1} {2}"
              : "{0} gained {1} {2}",
            [
              actor(event.actorName),
              val(event.amount),
              muted(t(event.resource.toUpperCase())),
            ],
          )}
          {event.status === "unavailable" && muted(` ${t("(not applied)")}`)}
        </>
      );

    case "ultima-used":
      return sentence("{0} used an Ultima Point", [actor(event.actorName)]);

    case "status-added":
      return sentence("{0} gained {1}", [
        actor(event.targetName),
        actor(t(event.status)),
      ]);

    case "status-removed":
      return sentence("{0} lost {1}", [
        actor(event.targetName),
        actor(t(event.status)),
      ]);

    case "accuracy-check":
      return (
        <>
          {sentence("{0} attacked with {1}", [
            actor(event.actorName),
            actor(t(event.weaponName)),
          ])}
          {rollFlag(event)}
        </>
      );

    case "magic-check":
      return (
        <>
          {sentence("{0} cast {1}", [
            actor(event.actorName),
            actor(t(event.spellName)),
          ])}
          {rollFlag(event)}
        </>
      );

    case "spell-use":
      return sentence("{0} used {1}", [
        actor(event.actorName),
        actor(t(event.spellName)),
      ]);

    case "generic-roll":
      return sentence("{0} rolled {1}", [
        actor(event.actorName),
        actor(t(event.label)),
      ]);

    case "crit-success":
      return sentence("{0} - Critical Success", [actor(event.actorName)]);

    case "crit-failure":
      return sentence("{0} - Critical Failure", [actor(event.actorName)]);

    case "clock-added":
      return sentence("Clock {0} added", [actor(event.clockName)]);

    case "clock-removed":
      return sentence("Clock {0} removed", [actor(event.clockName)]);

    case "clock-reset":
      return sentence("Clock {0} reset", [actor(event.clockName)]);

    case "clock-updated":
    case "clock-state":
      return sentence("Clock {0}: {1}/{2}", [
        actor(event.clockName),
        val(event.progress),
        val(event.max),
      ]);

    case "encounter-renamed":
      return sentence("Encounter renamed to {0}", [actor(event.newName)]);

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
