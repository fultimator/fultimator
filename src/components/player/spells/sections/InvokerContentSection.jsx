import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Air,
  Terrain,
  LocalFireDepartment,
  ElectricBolt,
  Water,
} from "@mui/icons-material";
import { invocationsByWellspring } from "../spellOptionData";
import ReactMarkdown from "react-markdown";

/**
 * InvokerContentSection - Content tab for Invoker spell
 * Manages active wellsprings and displays available invocations
 */
export default function InvokerContentSection({ formState, setFormState, t }) {
  const theme = useTheme();
  const activeWellsprings = formState.activeWellsprings || [];
  const skillLevel = formState.skillLevel || 1;
  const innerWellspring = formState.innerWellspring || false;
  const chosenWellspring = formState.chosenWellspring || "";

  const wellspringList = [
    { name: "Air", icon: Air },
    { name: "Earth", icon: Terrain },
    { name: "Fire", icon: LocalFireDepartment },
    { name: "Lightning", icon: ElectricBolt },
    { name: "Water", icon: Water },
  ];

  const getWellspringColor = (wellspring, isActive) => {
    if (!isActive) {
      return theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.08)";
    }
    const colorMap = {
      Air: "#87cfeb",
      Earth: "#8B4513",
      Fire: "#D63B00",
      Lightning: "#E6C800",
      Water: "#2F6FA1",
    };
    return colorMap[wellspring] || theme.palette.primary.main;
  };

  const getSelectedTextColor = (wellspring) => {
    return wellspring === "Air" || wellspring === "Lightning" ? "#000" : "#fff";
  };

  const handleWellspringToggle = (wellspring) => {
    setFormState((prev) => {
      const current = prev.activeWellsprings || [];
      const isActive = current.includes(wellspring);

      if (innerWellspring && chosenWellspring === wellspring && isActive) {
        // Don't allow deselecting the inner wellspring
        return prev;
      }

      const newWellsprings = isActive
        ? current.filter((w) => w !== wellspring)
        : current.length < 2
        ? [...current, wellspring]
        : [current[1], wellspring]; // Replace first with new

      return { ...prev, activeWellsprings: newWellsprings };
    });
  };

  const getAvailableInvocations = () => {
    const availableTypes = [];
    switch (skillLevel) {
      case 1:
        availableTypes.push("Blast");
        break;
      case 2:
        availableTypes.push("Blast", "Hex");
        break;
      case 3:
        availableTypes.push("Blast", "Hex", "Utility");
        break;
      default:
        return [];
    }

    const invocations = [];
    activeWellsprings.forEach((wellspring) => {
      const wellspringInvs = invocationsByWellspring[wellspring] || [];
      wellspringInvs.forEach((inv) => {
        if (availableTypes.includes(inv.type)) {
          invocations.push({ ...inv, wellspring });
        }
      });
    });
    return invocations;
  };

  const availableInvocations = getAvailableInvocations();
  const markdownComponents = {
    p: ({ _node, ...props }) => <p style={{ margin: 0 }} {...props} />,
  };

  return (
    <Grid container spacing={2}>
      {/* Wellspring Selection */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("Active Wellsprings")} (Max 2)
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {wellspringList.map((wellspring) => {
            const isActive = activeWellsprings.includes(wellspring.name);
            const isInner = innerWellspring && chosenWellspring === wellspring.name;
            const isSelected = isActive || isInner;
            const backgroundColor = getWellspringColor(wellspring.name, isSelected);
            const selectedTextColor = getSelectedTextColor(wellspring.name);
            const IconComponent = wellspring.icon;

            return (
              <Chip
                key={wellspring.name}
                label={t(`invoker_${wellspring.name.toLowerCase()}`)}
                icon={<IconComponent />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isInner) handleWellspringToggle(wellspring.name);
                }}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  backgroundColor,
                  color: isSelected ? `${selectedTextColor} !important` : "text.primary",
                  border: isSelected
                    ? undefined
                    : `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}`,
                  borderColor: isInner ? "#4CAF50" : backgroundColor,
                  borderWidth: isSelected ? "2px" : "1px",
                  fontWeight: isSelected ? "bold" : "normal",
                  cursor: isInner ? "default" : "pointer",
                  opacity: isInner ? 0.9 : 1,
                  "& .MuiChip-label": {
                    color: isSelected ? `${selectedTextColor} !important` : undefined,
                    fontSize: "0.75rem",
                    fontWeight: isSelected ? "bold" : "normal",
                  },
                  "& .MuiChip-icon": {
                    color: isSelected ? `${selectedTextColor} !important` : backgroundColor,
                  },
                  "&:hover": {
                    opacity: isInner ? 0.9 : 0.8,
                    color: isSelected ? `${selectedTextColor} !important` : "text.primary",
                  },
                  ...(isInner && {
                    boxShadow: "0 0 0 3px #4CAF50, 0 0 8px rgba(76, 175, 80, 0.4)",
                    border: "2px solid #2E7D32",
                  }),
                }}
              />
            );
          })}
        </Box>
      </Grid>

      {/* Available Invocations */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("Available Invocations")} ({availableInvocations.length})
        </Typography>
        {availableInvocations.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
            {t("Select wellsprings to see available invocations")}
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {availableInvocations.map((inv, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {t(inv.name)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inv.type} • {t(inv.wellspring)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <ReactMarkdown components={markdownComponents}>
                        {t(inv.effect)}
                      </ReactMarkdown>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}
