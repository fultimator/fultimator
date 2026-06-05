import { Grid, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { resolveWellsprings, affinityIconSrc } from "/src/libs/player/wellsprings";
import { invocationsByWellspring } from "/src/libs/player/spellOptionData";
/**
 * InvokerContentSection - Content tab for Invoker spell
 * Manages active wellsprings and displays available invocations
 */
import { SharedInvocationCard } from "/src/components/shared/items";

function WellspringChip({ wellspring, isSelected, isInner, isAlways, onClick }) {
  const theme = useTheme();
  const isLocked = isInner || isAlways;
  const lockColor = isInner ? "#4CAF50" : "#FF9800";
  const lockGlow = isInner
    ? "0 0 0 3px #4CAF50, 0 0 8px rgba(76, 175, 80, 0.4)"
    : "0 0 0 3px #FF9800, 0 0 8px rgba(255, 152, 0, 0.4)";

  const bgColor = isSelected
    ? wellspring.color
    : theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(0, 0, 0, 0.08)";

  return (
    <Box
      component="button"
      type="button"
      onClick={isLocked ? undefined : onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: "16px",
        border: "2px solid",
        borderColor: isLocked
          ? lockColor
          : isSelected
            ? wellspring.color
            : theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.3)"
              : "rgba(0,0,0,0.3)",
        backgroundColor: bgColor,
        fontWeight: isSelected ? "bold" : "normal",
        fontSize: "0.8125rem",
        fontFamily: (theme) => theme.typography.fontFamily,
        cursor: isLocked ? "default" : "pointer",
        opacity: isLocked ? 0.9 : 1,
        transition: "border-color 0.15s, background-color 0.15s",
        ...(isLocked && { boxShadow: lockGlow }),
        "&:hover": !isLocked ? { borderColor: wellspring.color, opacity: 0.85 } : {},
      }}
    >
      <img
        src={affinityIconSrc(wellspring.icon)}
        width={18}
        height={18}
        style={{
          objectFit: "contain",
          filter: isSelected ? undefined : "grayscale(0.4)",
        }}
        alt={wellspring.key}
      />
      <span
        style={{
          color: isSelected ? wellspring.textColor : undefined,
        }}
      >
        {wellspring.key}
      </span>
    </Box>
  );
}

export default function InvokerContentSection({ formState, setFormState, t }) {
  const tracker = formState.tracker || {};
  const activeWellsprings = tracker.activeWellsprings || [];
  const skillLevel = formState.skillLevel || 1;
  const innerWellspring = formState.innerWellspring || tracker.innerWellspring || false;
  const chosenWellspring = formState.chosenWellspring || tracker.chosenWellspring || "";
  const customWellsprings = formState.customWellsprings || [];
  const customInvocations = formState.invocations || [];
  const alwaysActiveWellsprings = formState.alwaysActiveWellsprings || [];

  const effectiveWellsprings = [...new Set([...activeWellsprings, ...alwaysActiveWellsprings])];

  const allWellsprings = resolveWellsprings(customWellsprings);

  const handleWellspringToggle = (wellspringKey) => {
    setFormState((prev) => {
      const prevTracker = prev.tracker || {};
      const current = prevTracker.activeWellsprings || [];
      const isActive = current.includes(wellspringKey);

      if ((innerWellspring && chosenWellspring === wellspringKey && isActive) ||
        alwaysActiveWellsprings.includes(wellspringKey)) {
        return prev;
      }

      const newWellsprings = isActive
        ? current.filter((w) => w !== wellspringKey)
        : current.length < 2
          ? [...current, wellspringKey]
          : [current[1], wellspringKey];

      return {
        ...prev,
        tracker: { ...prevTracker, activeWellsprings: newWellsprings },
      };
    });
  };

  const getAvailableInvocations = () => {
    const availableTypes = [];
    switch (skillLevel) {
      case 1: availableTypes.push("Blast"); break;
      case 2: availableTypes.push("Blast", "Hex"); break;
      case 3: availableTypes.push("Blast", "Hex", "Utility"); break;
      default: return [];
    }

    const results = [];

    effectiveWellsprings.forEach((wellspringKey) => {
      const wellspringInvs = invocationsByWellspring[wellspringKey] || [];
      wellspringInvs.forEach((inv) => {
        if (availableTypes.includes(inv.type)) {
          results.push({ ...inv, wellspring: wellspringKey, isCustom: false });
        }
      });
    });

    customInvocations
      .filter(
        (inv) =>
          inv.wellspring &&
          inv.key &&
          availableTypes.includes(inv.type) &&
          effectiveWellsprings.includes(inv.wellspring),
      )
      .forEach((inv) => {
        results.push({ ...inv, name: inv.customName || inv.key, isCustom: true });
      });

    return results;
  };

  const availableInvocations = getAvailableInvocations();

  return (
    <Grid container spacing={2}>
      {/* Wellspring Selection */}
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          {t("Active Wellsprings")} (Max 2)
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {allWellsprings.map((wellspring) => {
            const isActive = activeWellsprings.includes(wellspring.key);
            const isInner = innerWellspring && chosenWellspring === wellspring.key;
            const isAlways = alwaysActiveWellsprings.includes(wellspring.key);
            return (
              <WellspringChip
                key={wellspring.key}
                wellspring={wellspring}
                isSelected={isActive || isInner || isAlways}
                isInner={isInner}
                isAlways={isAlways}
                onClick={() => handleWellspringToggle(wellspring.key)}
              />
            );
          })}
        </Box>
      </Grid>
      {/* Available Invocations */}
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          {t("Available Invocations")} ({availableInvocations.length})
        </Typography>
        {availableInvocations.length === 0 ? (
          <Typography sx={{ color: "text.secondary", fontStyle: "italic" }}>
            {t("Select wellsprings to see available invocations")}
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {availableInvocations.map((inv, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                <SharedInvocationCard item={inv} wellsprings={allWellsprings} />
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}
