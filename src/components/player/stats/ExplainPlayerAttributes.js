import React from "react";
import { useTranslate } from "../../../translation/translate";
import {
    Grid,
    Card,
    Typography,
    Divider,
    useTheme
} from "@mui/material";
import ReactMarkdown from "react-markdown";

export default function ExplainPlayerAttributes() {
    const { t } = useTranslate();
    const theme = useTheme();
    const ternary = theme.palette.ternary.main;

return (
    <Grid item>
            <Card
              sx={{
                p: 1.61,
                background: `linear-gradient(to right, ${ternary}, transparent)`,
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
                    "Upon reaching levels **20**, **40**, and **60**, the Character chooses one of its Attributes and increases it by one die size (to a maximum of d12).",
                    true
                  )}
                </ReactMarkdown>
              </Typography>
            </Card>
          </Grid>
)}