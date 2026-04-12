import { useRef } from "react";
import { Card, Grid, Stack, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

function PrettyAccessory({ accessory, isCharacterSheet, showCard = true, showHeader = true }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)` // Dark mode gradient with black end
      : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`; // Light mode gradient

  const cardBackground =
    theme.mode === "dark"
      ? `backgroundColor: "#181a1b", background: "#181a1b"`
      : `backgroundColor: "white", background: "white"`;

  const ref = useRef();

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div style={{ whiteSpace: "pre-line", margin: 0, padding: 0 }}>
        <ReactMarkdown
          {...props}
          components={{
            p: ({ _node, ...props }) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: ({ _node, ...props }) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: ({ _node, ...props }) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: ({ _node, ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ _node, ...props }) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  const content = (
    <div ref={ref} style={{ cardBackground }}>
      <Stack>
        {showHeader && (
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            sx={{
              p: 0.5,
              background: `${theme.primary}`,
              color: "#ffffff",
              "& .MuiTypography-root": {
                fontSize: { xs: "0.6rem", sm: "1.0rem" },
                textTransform: "uppercase",
              },
            }}
          >
            <Grid item xs={6}>
              <Typography variant="h4" textAlign="left">
                {t("Accessory")}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="h4" textAlign="center">
                {t("Cost")}
              </Typography>
            </Grid>
          </Grid>
        )}
        <Grid container>
          <Grid container direction="column" item xs>
            {/* First Row */}
            <Grid
              container
              justifyContent="space-between"
              item
              sx={{
                background,
                borderBottom: `1px solid ${theme.secondary}`,
                padding: "2px 5px",
                "& .MuiTypography-root": {
                  fontSize: { xs: "0.7rem", sm: "1.0rem" },
                },
              }}
            >
              <Grid item xs={6}>
                <Typography fontWeight="bold">{accessory.name}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography textAlign="center">{`${accessory.cost}z`}</Typography>
              </Grid>
            </Grid>

            {/* Second Row */}
            <Typography
              sx={{
                background: "transparent",
                borderBottom: `1px solid ${theme.secondary}`,
                px: 1,
                py: 0.5,
              }}
            >
              {!accessory.quality}{" "}
              <StyledMarkdown
                components={{
                  strong: ({ _node, ...props }) => (
                    <strong style={{ fontWeight: "bold" }} {...props} />
                  ),
                  em: ({ _node, ...props }) => (
                    <em style={{ fontStyle: "italic" }} {...props} />
                  ),
                }}
              >
                {accessory.quality}
              </StyledMarkdown>
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </div>
  );

  if (!showCard) return content;

  return (
    <>
      <Card sx={{ boxShadow: isCharacterSheet ? 0 : 2 }}>
        {content}
      </Card>
    </>
  );
}

export default PrettyAccessory;
