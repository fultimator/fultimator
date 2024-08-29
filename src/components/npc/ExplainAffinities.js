import { Card, Typography } from "@mui/material";
import { useTranslate } from "../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../hooks/useCustomTheme";

export default function ExplainAffinities({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background = theme.mode === 'dark'
  ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
  : `linear-gradient(to right, ${theme.ternary}, transparent)`;

  return (
    <Card
      sx={{
        p: 1.61,
        background,
      }}
    >
      <Typography>{t("Gain 1 skill per vulnerability.")}</Typography>
      <Typography>{t("Gain 2 skills per physical vulnerability.")}</Typography>
      <Typography>{t("Use 0.5 skill per Resistance")}</Typography>
      <Typography>{t("Use 1 skill per Immunity")}</Typography>
      <Typography>{t("Use 2 skill per Absorption")}</Typography>
      {npc.species === "Construct" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            {t("Species: Construct")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "**Constructs** are Immune to **poison** damage and Resistant to **earth** damage, and immune to poisoned.",
                true
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
      {npc.species === "Demon" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            {t("Species: Demon")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "**Demons** are Resistant to two damage types of your choice.",
                true
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
      {npc.species === "Elemental" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            {t("Species: Elemental")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "**Elementals** are Immune to **poison** damage, Immune to a second damage type of your choice, and immune to **poisoned**.",
                true
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
      {npc.species === "Undead" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            {t("Species: Undead")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "**Undead** are Immune to **dark** and **poison** damage, and Vulnerable to **light** damage.",
                true
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
      {npc.species === "Plant" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            {t("Species: Plant")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "  **Plants** are Vulnerable to (choose one: **air**, **bolt**, **fire**, **ice**) damage.",
                true
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
    </Card>
  );
}
