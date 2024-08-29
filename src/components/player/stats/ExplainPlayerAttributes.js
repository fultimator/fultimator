import React from "react";
import { useTranslate } from "../../../translation/translate";
import {
    Grid,
    Card,
    Typography,
    Divider
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function ExplainPlayerAttributes() {
    const { t } = useTranslate();
    const theme = useCustomTheme();
    const background = theme.mode === 'dark'
    ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
    : `llinear-gradient(to right, ${theme.ternary}, transparent)`;

return (
    <Grid item>
            <Card
              sx={{
                p: 1.61,
                background,
              }}
            >
              <Typography>
                <strong>{t("Jack of All Trades")}</strong>: d8, d8, d8, d8
              </Typography>
              <Typography>
                <strong>{t("Standard")}</strong>: d10, d8, d8, d6
              </Typography>
              <Typography>
                <strong>{t("Specialized")}</strong>: d10, d10, d6, d6
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                <ReactMarkdown
                  allowedElements={["strong"]}
                  unwrapDisallowed={true}
                >
                  {t(
                    "Upon reaching levels **20** and **40**, the Character chooses one of its Attributes and increases it by one die size (to a maximum of d12).",
                    true
                  )}
                </ReactMarkdown>
              </Typography>
            </Card>
          </Grid>
)}