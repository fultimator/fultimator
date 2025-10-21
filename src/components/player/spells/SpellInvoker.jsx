import React from "react";
import {
  Typography,
  ThemeProvider,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Box,
} from "@mui/material";
import { ExpandMore, FlashOn, Air, Terrain, LocalFireDepartment, ElectricBolt, Water } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function ThemedSpellInvoker({ invoker, onEditInvocations, isEditMode, onWellspringToggle }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: (props) => <p style={inlineStyles} {...props} />,
  };

  // Helper function to get wellspring colors
  const getWellspringColor = (wellspring) => {
    const colorMap = {
      'Air': '#87CEEB',
      'Earth': '#8B4513',
      'Fire': '#FF4500',
      'Lightning': '#FFD700',
      'Water': '#4682B4'
    };
    return colorMap[wellspring] || theme.primary;
  };

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <FlashOn />
          </Icon>
          <Typography variant="h4">{t("invoker_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("invoker_details_1")}</ReactMarkdown>
        </AccordionDetails>
      </Accordion>

      {/* Wellspring Selection */}
      {isEditMode && (
        <Box sx={{ padding: 2, backgroundColor: theme.ternary, marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              {t("invoker_invocation_active_wellspring")} ({invoker.activeWellsprings?.length || 0}/2)
              {invoker.innerWellspring && (
                <Typography component="span" sx={{ fontSize: '0.8rem', fontStyle: 'italic', marginLeft: 1, color: '#4CAF50' }}>
                  + {t("invoker_invocation_inner")}: {invoker.chosenWellspring}
                </Typography>
              )}
              <Typography component="span" sx={{ fontSize: '0.8rem', fontStyle: 'italic', marginLeft: 1 }}>
                ({t("invoker_sl")} {invoker.skillLevel || 'Not Set'}: {(invoker.skillLevel === 1) ? t("invoker_select_sl_1") : (invoker.skillLevel === 2) ? t("invoker_select_sl_2") : (invoker.skillLevel === 3) ? t("invoker_select_sl_3") : t("invoker_select_sl")})
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { name: 'Air', icon: Air },
                { name: 'Earth', icon: Terrain },
                { name: 'Fire', icon: LocalFireDepartment },
                { name: 'Lightning', icon: ElectricBolt },
                { name: 'Water', icon: Water }
              ].map((wellspring) => {
                const wellspringColor = getWellspringColor(wellspring.name);
                const isActive = invoker.activeWellsprings?.includes(wellspring.name) || false;
                const isInnerWellspring = invoker.innerWellspring && invoker.chosenWellspring === wellspring.name;
                const IconComponent = wellspring.icon;

                return (
                  <Chip
                    key={wellspring.name}
                    label={t(`invoker_${wellspring.name.toLowerCase()}`)}
                    icon={<IconComponent />}
                    onClick={isInnerWellspring ? undefined : () => onWellspringToggle && onWellspringToggle(wellspring.name)}
                    variant={isActive || isInnerWellspring ? "filled" : "outlined"}
                    sx={{
                      backgroundColor: (isActive || isInnerWellspring) ? wellspringColor : 'transparent',
                      color: (isActive || isInnerWellspring) ? 'white !important' : theme.primary,
                      borderColor: isInnerWellspring ? '#4CAF50' : wellspringColor,
                      borderWidth: (isActive || isInnerWellspring) ? '2px' : '1px',
                      fontWeight: (isActive || isInnerWellspring) ? 'bold' : 'normal',
                      cursor: isInnerWellspring ? 'default' : 'pointer',
                      '& .MuiChip-icon': {
                        color: (isActive || isInnerWellspring) ? 'white' : wellspringColor,
                      },
                      '&:hover': {
                        backgroundColor: isInnerWellspring ? wellspringColor : (isActive ? wellspringColor : `${wellspringColor}20`),
                        color: (isActive || isInnerWellspring) ? 'white !important' : theme.primary,
                      },
                      ...(isInnerWellspring && {
                        boxShadow: `0 0 0 3px #4CAF50, 0 0 8px rgba(76, 175, 80, 0.4)`,
                        border: '2px solid #2E7D32',
                      })
                    }}
                  />
                );
              })}
            </Box>
            {invoker.activeWellsprings?.length !== 2 && (
              <Typography variant="body2" sx={{ color: theme.primary, fontStyle: 'italic', marginTop: 1 }}>
                {t("Select exactly 2 wellsprings to determine available invocations")}
                {invoker.innerWellspring && (
                  <Typography component="span" sx={{ display: 'block', color: '#4CAF50' }}>
                    {t("invoker_inner_wellspring_always_available").replace("{wellspring}", invoker.chosenWellspring)}
                  </Typography>
                )}
              </Typography>
            )}
          </Box>
          {/* Edit Buttons */}
          {isEditMode && (
            <Box sx={{ display: "flex", alignItems: "center", padding: "16px 17px", gap: 2 }}>
              <Button
                onClick={onEditInvocations}
                variant="outlined"
              >
                {t("Manage Invocations")}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* INVOCATIONS */}
      <div
        style={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <Box sx={{ 
            flex: "0 0 25%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "flex-start", 
            minHeight: "40px" 
          }}>
            <Typography
              variant="h3"
              sx={{
                flexGrow: 1,
                marginRight: "5px",
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("Invocation")}
            </Typography>
          </Box>
          <Box sx={{ 
            flex: "0 0 16.67%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            minHeight: "40px" 
          }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("Wellspring")}
            </Typography>
          </Box>
          <Box sx={{ 
            flex: "0 0 16.67%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            minHeight: "40px" 
          }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("Type")}
            </Typography>
          </Box>
          <Box sx={{ 
            flex: "0 0 41.66%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "flex-start", 
            minHeight: "40px" 
          }}>
            <Typography
              variant="h3"
              sx={{
                flexGrow: 1,
                marginRight: "5px",
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("Effect")}
            </Typography>
          </Box>
        </Box>
      </div>

      {(!invoker.availableInvocations || invoker.availableInvocations.length === 0) ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("invoker_no_invocation_warning")}
        </Typography>
      ) : (
        invoker.availableInvocations &&
        invoker.availableInvocations
          .filter(invocation => {
            // Show if invocation matches active wellsprings
            if (invoker.activeWellsprings && invoker.activeWellsprings.includes(invocation.wellspring)) {
              return true;
            }
            
            // Show if invocation matches inner wellspring
            if (invoker.innerWellspring && invoker.chosenWellspring === invocation.wellspring) {
              return true;
            }
            
            return false;
          })
          .map((invocation, i) => (
            <React.Fragment key={i}>
              <div
                style={{
                  background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                  padding: "3px 17px",
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: `1px solid ${theme.secondary}`,
                  borderBottom: `1px solid ${theme.secondary}`,
                  borderLeft: `4px solid ${getWellspringColor(invocation.wellspring)}`,
                }}
              >
                <Box sx={{ display: "flex", flexGrow: 1 }}>
                  <Box sx={{ 
                    flex: "0 0 25%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "flex-start" 
                  }}>
                    <Typography
                      fontWeight="bold"
                      sx={{ 
                        flexGrow: 1, 
                        marginRight: "5px",
                        fontSize: { xs: "0.8rem", sm: "1rem" }
                      }}
                    >
                      {t(invocation.name)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: "0 0 16.67%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center" 
                  }}>
                    <Typography sx={{ fontSize: { xs: "0.7rem", sm: "1rem" } }}>
                      {t(`invoker_${invocation.wellspring.toLowerCase()}`)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: "0 0 16.67%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center" 
                  }}>
                    <Typography sx={{ fontSize: { xs: "0.7rem", sm: "1rem" } }}>
                      {t(invocation.type)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: "0 0 41.66%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "flex-start" 
                  }}>
                    <Typography sx={{ fontSize: { xs: "0.7rem", sm: "1rem" } }}>
                      <ReactMarkdown components={components}>
                        {t(invocation.effect)}
                      </ReactMarkdown>
                    </Typography>
                  </Box>
                </Box>
              </div>
            </React.Fragment>
          ))
      )}
    </>
  );
}

export default function SpellInvoker(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellInvoker {...props} />
    </ThemeProvider>
  );
}