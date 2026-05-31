import { Box, Card, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslate } from "/src/translation/translate";
import StatTooltip from "/src/components/common/StatTooltip";
import { highlightMatch } from "/src/components/shared/actors/core-utils";

const POSITIVE_SENTIMENTS = ["admiration", "loyality", "affection"];
const NEGATIVE_SENTIMENTS = ["inferiority", "mistrust", "hatred"];

function getSentiments(bond) {
  return [...POSITIVE_SENTIMENTS, ...NEGATIVE_SENTIMENTS].filter(
    (key) => bond[key],
  );
}

export default function BondCard({
  bond,
  isEditMode,
  onEdit,
  compact = false,
  searchQuery = "",
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const positiveColor = theme.palette.success.main;
  const negativeColor = theme.palette.error.main;

  const sentiments = getSentiments(bond);
  const strength = sentiments.length;

  const tooltipBreakdown = sentiments.map((s) => ({
    label: t(s.charAt(0).toUpperCase() + s.slice(1)),
    value: POSITIVE_SENTIMENTS.includes(s) ? "+" : "−",
  }));

  const card = (
    <Card
      sx={{
        height: "100%",
        minHeight: 48,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...(compact && {
          cursor: isEditMode ? "pointer" : "default",
          transition: "border-color 0.15s ease",
        }),
      }}
      onClick={compact && isEditMode ? onEdit : undefined}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1,
          py: 0.5,
          gap: 0.25,
          bgcolor: primary,
        }}
      >
        <Typography
          noWrap
          sx={{
            color: "#fff",
            fontFamily: "Antonio",
            fontWeight: 800,
            fontSize: compact ? { xs: "0.82rem", sm: "0.88rem" } : { xs: "0.9rem", sm: "0.95rem" },
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            flex: 1,
          }}
        >
          {compact
            ? highlightMatch(bond.name || "-", searchQuery)
            : (bond.name || t("Bond Name"))}
        </Typography>
        {strength > 0 && (
          <Typography
            sx={{
              color: "#fff",
              fontFamily: "Antonio",
              fontWeight: 800,
              fontSize: compact ? { xs: "0.82rem", sm: "0.88rem" } : { xs: "0.9rem", sm: "0.95rem" },
              flexShrink: 0,
            }}
          >
            {"★ " + strength}
          </Typography>
        )}
        {!compact && isEditMode && onEdit && (
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{ p: 0.5, color: "#fff" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box
        sx={{
          px: 1,
          py: 0.75,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.4,
          justifyContent: sentiments.length > 0 ? "flex-start" : "center",
        }}
      >
        {sentiments.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
            {sentiments.map((key) => {
              const isPositive = POSITIVE_SENTIMENTS.includes(key);
              return (
                <Typography
                  key={key}
                  variant="caption"
                  sx={{
                    px: 0.5,
                    py: 0.2,
                    borderRadius: 0.5,
                    fontFamily: "Antonio",
                    fontWeight: 800,
                    fontSize: compact ? "0.6rem" : "0.7rem",
                    letterSpacing: "0.03em",
                    color: isPositive ? positiveColor : negativeColor,
                    bgcolor: isPositive
                      ? "rgba(76, 175, 80, 0.2)"
                      : "rgba(244, 67, 54, 0.2)",
                    border: "1px solid",
                    borderColor: isPositive
                      ? "rgba(76, 175, 80, 0.35)"
                      : "rgba(244, 67, 54, 0.35)",
                  }}
                >
                  {t(key.charAt(0).toUpperCase() + key.slice(1))}
                </Typography>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              {t("No sentiments")}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );

  return (
    <StatTooltip
      title={bond.name || "-"}
      formula={
        strength > 0 ? `★ ${t("Strength")}: ${strength}` : t("No sentiments")
      }
      breakdown={tooltipBreakdown}
      display="block"
    >
      {card}
    </StatTooltip>
  );
}
