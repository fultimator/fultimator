import { Box, Card, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useThemeStore } from "../../../../store/themeStore";
import PcHeader, { PcNameBar } from "./panels/PcHeader";
import PcStatsSummary from "../common/PcStatsSummary";
import PcAffinities from "./panels/PcAffinities";
import PcTraitsDescription from "./panels/PcTraitsDescription";
import PcClasses from "../common/PcClasses";
import PlayerBonds from "./playerSheet/PlayerBonds";
import CardLoadout from "./playerSheet/CardLoadout";
import PlayerEquipment from "./playerSheet/PlayerEquipment";
import PlayerNotes from "./playerSheet/PlayerNotes";
import PcOthers from "./panels/optional/PcOthers";
import PcVehicle from "./panels/optional/PcVehicle";
import PcCompanion from "./panels/optional/PcCompanion";
import PcRituals from "./panels/optional/PcRituals";
import PcQuirk from "./panels/optional/PcQuirk";
import PcCampActivities from "./panels/optional/PcCampActivities";
import PcZeroPower from "./panels/optional/PcZeroPower";
import PcMnemoReceptacle from "./panels/optional/PcMnemoReceptacle";
import PcControlsPanel from "./panels/PcControlsPanel";

const paperSx = (secondary) => ({
  borderRadius: "8px",
  border: "2px solid",
  borderColor: secondary,
  overflow: "hidden",
  containerType: "inline-size",
});

function PortraitStatsCard({
  sharedProps,
  characterImage,
  updateMaxStats,
  secondary,
  theme,
}) {
  return (
    <>
      {/* Mobile: portrait card stacked above stats card */}
      <Paper elevation={3} sx={{ ...paperSx(secondary), "@container (min-width: 521px)": { display: "none" } }}>
        <Box sx={{ height: 220, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <PcHeader {...sharedProps} characterImage={characterImage} hideNameBar compactPortraitOnly />
        </Box>
      </Paper>
      <Paper elevation={3} sx={{ ...paperSx(secondary), mt: 1.5, "@container (min-width: 521px)": { display: "none" } }}>
        <PcStatsSummary {...sharedProps} updateMaxStats={updateMaxStats} scale="sm" />
        <PcAffinities {...sharedProps} />
      </Paper>

      {/* Desktop: portrait + stats side by side in one card */}
      <Paper elevation={3} sx={{ ...paperSx(secondary), "@container (max-width: 520px)": { display: "none" } }}>
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
          <Box sx={{ flexShrink: 0, width: { xs: 120, sm: 150, md: 170 }, maxWidth: "25%", overflow: "hidden", alignSelf: "stretch", borderRight: `1px solid ${theme.palette.divider}` }}>
            <PcHeader {...sharedProps} characterImage={characterImage} hideNameBar compactPortraitOnly />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, containerType: "inline-size" }}>
            <PcStatsSummary {...sharedProps} updateMaxStats={updateMaxStats} scale="lg" />
          </Box>
        </Box>
        <PcAffinities {...sharedProps} />
      </Paper>
    </>
  );
}

export default function PcActorCard({
  pc,
  isInteractive = false,
  isOwner = false,
  onUpdate,
  onQuickCheck,
  characterImage,
  canLevelUpFromExp = false,
  onLevelUpRequest,
  updateMaxStats,
  optionalRules = {},
  clockSections,
  setClockSections,
  clockState,
  setClockState,
}) {
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const actorSheetEffectsEnabled = useThemeStore(
    (s) => s.customization.actorSheetEffectsEnabled,
  );

  // Owner always has edit access to core data tabs regardless of preview toggle.
  const ownerInteractive = isOwner || isInteractive;

  const sharedProps = { pc, isInteractive, onUpdate, onQuickCheck };
  const ownerSharedProps = { pc, isInteractive: ownerInteractive, onUpdate, onQuickCheck };
  const psProps = { player: pc, setPlayer: onUpdate, isEditMode: isInteractive, isCharacterSheet: false };
  const ownerPsProps = { player: pc, setPlayer: onUpdate, isEditMode: ownerInteractive, isCharacterSheet: false };
  const portraitCardProps = { sharedProps, characterImage, updateMaxStats, secondary, theme };

  const noEffects = actorSheetEffectsEnabled === false;

  return (
    <Box sx={{ containerType: "inline-size" }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          overflow: "hidden",
          mb: 1.5,
          ...(noEffects
            ? {
              background: theme.palette.background.paper,
              boxShadow: "none",
              border: "none",
            }
            : {}),
        }}
      >
        <PcNameBar
          {...sharedProps}
          canLevelUpFromExp={canLevelUpFromExp}
          onLevelUpRequest={onLevelUpRequest}
          updateMaxStats={updateMaxStats}
        />
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: "1fr",
          gridTemplateAreas: `"portrait" "left" "right"`,
          "@container (min-width: 900px)": {
            gridTemplateColumns: "1fr 1fr",
            gridTemplateAreas: `"left right"`,
          },
        }}
      >
        <Box
          sx={{
            gridArea: "portrait",
            "@container (min-width: 900px)": { display: "none" },
          }}
        >
          <PortraitStatsCard {...portraitCardProps} />
          <Box
            sx={{
              mt: 1.5,
              "@container (min-width: 900px)": { display: "none" },
            }}
          >
            <PcControlsPanel {...sharedProps} />
            <PcTraitsDescription {...sharedProps} />
          </Box>
        </Box>

        {/* Left column */}
        <Box
          sx={{
            gridArea: "left",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "none",
              "@container (min-width: 900px)": { display: "block" },
            }}
          >
            <PortraitStatsCard {...portraitCardProps} />
          </Box>
          <Box
            sx={{
              display: "none",
              "@container (min-width: 900px)": { display: "block" },
            }}
          >
            <PcControlsPanel {...sharedProps} />
            <PcTraitsDescription {...sharedProps} />
          </Box>

          <PlayerBonds {...ownerPsProps} />
          <CardLoadout {...ownerPsProps} isOwner={ownerInteractive} showHeader showSideDivider showSupportColumn={false} />
          <PlayerEquipment {...ownerPsProps} />
          <PlayerNotes {...ownerPsProps} defaultExpanded={!ownerInteractive} speaker={pc?.name ?? ""} />
          <PcRituals
            {...sharedProps}
            clockSections={clockSections}
            setClockSections={setClockSections}
            clockState={clockState}
            setClockState={setClockState}
          />
          {optionalRules.zeroPower && <PcZeroPower {...sharedProps} />}
          {optionalRules.campActivities && (
            <PcCampActivities {...sharedProps} />
          )}
          {optionalRules.quirks && <PcQuirk {...sharedProps} />}
        </Box>

        <Box
          sx={{
            gridArea: "right",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <PcClasses {...ownerSharedProps} variant="full" updateMaxStats={updateMaxStats} defaultExpanded={!ownerInteractive} />
          {optionalRules.technospheres &&
            ["integrated", "mnemospheres"].includes(
              optionalRules.technospheresVariant ?? "standard",
            ) && <PcMnemoReceptacle {...ownerSharedProps} />}
          <PcOthers {...sharedProps} />
          <PcVehicle {...sharedProps} />
          <PcCompanion {...sharedProps} />
        </Box>
      </Box>
    </Box>
  );
}
