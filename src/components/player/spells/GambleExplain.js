import {
  Typography,
  useTheme,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../translation/translate";
import { Info, ExpandMore } from "@mui/icons-material";

export default function GambleExplain() {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <div style={{marginBottom: "8px"}}>
    <Accordion >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Icon sx={{ color: primary, marginRight: 1 }}>
          <Info />
        </Icon>
        <Typography variant="h4">{t("Gamble Details")}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ReactMarkdown>{t("GambleSpell_desc")}</ReactMarkdown>
      </AccordionDetails>
    </Accordion>
    </div>
  );
}
