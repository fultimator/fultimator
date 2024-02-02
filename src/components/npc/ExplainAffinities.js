import { Card, Typography, useTheme } from "@mui/material";

export default function ExplainAffinities({ npc }) {
  const theme = useTheme();
  const ternary = theme.palette.ternary.main;
  return (
    <Card sx={{ p: 1.61, background: `linear-gradient(to right, ${ternary}, transparent)`, }}>
      <Typography>Gain 1 skill per vulnerability.</Typography>
      <Typography>Gain 2 skills per physical vulnerability.</Typography>
      <Typography>Use 0.5 skill per Resistance </Typography>
      <Typography>Use 1 skill per Immunity</Typography>
      <Typography>Use 2 skill per Absorption</Typography>
      {npc.species === "Construct" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Species: Construct
          </Typography>
          <Typography>
            <strong>Constructs</strong> are Immune to <strong>poison</strong>{" "}
            damage and Resistant to <strong>earth</strong> damage.
          </Typography>
        </>
      )}
      {npc.species === "Demon" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Species: Demon
          </Typography>
          <Typography>
            <strong>Demons</strong> are Resistant to two damage types of your
            choice.
          </Typography>
        </>
      )}
      {npc.species === "Elemental" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Species: Elemental
          </Typography>
          <Typography>
            <strong>Elementals</strong> are Immune to <strong>poison</strong>{" "}
            damage, Immune to a second damage type of your choice, and immune to{" "}
            <strong>poisoned</strong>.
          </Typography>
        </>
      )}
      {npc.species === "Undead" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Species: Undead
          </Typography>
          <Typography>
            <strong>Undead</strong> are Immune to <strong>dark</strong> and{" "}
            <strong>poison</strong> damage, and Vulnerable to{" "}
            <strong>light</strong> damage.
          </Typography>
        </>
      )}
      {npc.species === "Plant" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Species: Plant
          </Typography>
          <Typography>
            <strong>Plants</strong> are Vulnerable to (choose one:{" "}
            <strong>air</strong>, <strong>bolt</strong>, <strong>fire</strong>,{" "}
            <strong>ice</strong>) damage.
          </Typography>
        </>
      )}
    </Card>
  );
}
