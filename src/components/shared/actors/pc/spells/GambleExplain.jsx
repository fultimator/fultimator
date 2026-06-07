import {
  Typography,
  useTheme,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "/src/translation/translate";
import { Info, ExpandMore } from "@mui/icons-material";

export default function GambleExplain() {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Accordion disableGutters elevation={0} square sx={{ borderBottom: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Icon sx={{ color: primary, marginRight: 1 }}>
          <Info />
        </Icon>
        <Typography variant="h4">{t("Gamble Details")}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ py: "6px", px: "12px" }}>
        <ReactMarkdown components={{ p: ({ _node, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>{t("GambleSpell_desc")}</ReactMarkdown>
      </AccordionDetails>
    </Accordion>
  );
}
