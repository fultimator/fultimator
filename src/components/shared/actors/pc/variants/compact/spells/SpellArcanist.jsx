import {
  Box,
  Button,
  Step,
  StepButton,
  Stepper,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { styled } from "@mui/system";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import { setSpellListActivation } from "/src/components/shared/actors/pc/spells/spellActivationPolicies";
import {
  ARCANA_POLICY_KEY,
  getArcanaStageDetails,
  getArcanaStepperStage,
} from "/src/components/shared/actors/pc/spells/arcanaActions";
import { useEffect, useState } from "react";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  lineHeight: 1.35,
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

const StyledMarkdown = ({ children, ...props }) => {
  return (
    <div
      style={{
        whiteSpace: "pre-line",
        display: "inline",
        margin: 0,
        padding: 0,
      }}
    >
      <ReactMarkdown
        {...props}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: (props) => (
            <p
              style={{ margin: 0, padding: 0, fontSize: "0.85rem" }}
              {...props}
            />
          ),
          ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
          li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
          strong: (props) => (
            <strong style={{ fontWeight: "bold" }} {...props} />
          ),
          em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          mark: (props) => (
            <mark
              style={{ backgroundColor: "#ffeb3b", padding: "0 1px" }}
              {...props}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default function SpellArcanist({
  arcana,
  rework,
  setPlayer,
  classIndex,
  spellIndex,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const mergeLabel = arcana.merge || t("MERGE");
  const pulseLabel = arcana.pulse || t("PULSE");
  const dismissLabel = arcana.dismiss || t("DISMISS");
  const canUpdate = setPlayer && classIndex != null && spellIndex != null;
  const [arcanaStage, setArcanaStage] = useState(
    arcana.enabled ? "merge" : null,
  );

  useEffect(() => {
    setArcanaStage(arcana.enabled ? "merge" : null);
  }, [arcana.enabled, arcana.name]);

  const sendArcanaStageToChat = (stage) => {
    const {
      label,
      tag,
      itemType = "spell",
      description,
      cost,
    } = getArcanaStageDetails(arcana, stage, t);
    sendDisplayMessage(itemType, `${arcana.name} - ${label}`, {
      speaker: "",
      tags: [tag],
      description,
      cost,
    });
  };

  const setArcanaActive = (active) => {
    if (!canUpdate) return;
    setPlayer((prev) => ({
      ...prev,
      classes: (prev.classes || []).map((cls, clsIndex) =>
        clsIndex === classIndex
          ? {
              ...cls,
              spells: setSpellListActivation(
                cls.spells || [],
                spellIndex,
                ARCANA_POLICY_KEY,
                active,
              ),
            }
          : cls,
      ),
    }));
  };

  const handlePulse = () => {
    if (!arcana.enabled) return;
    sendArcanaStageToChat("pulse");
    setArcanaStage("pulse");
  };

  const handleDismiss = () => {
    sendArcanaStageToChat("dismiss");
    setArcanaStage(null);
    setArcanaActive(false);
  };

  const handleAdvance = () => {
    if (rework && arcanaStage !== "pulse") {
      handlePulse();
      return;
    }
    handleDismiss();
  };

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Header Row */}
        <TableRow sx={{ backgroundColor: theme.primary }}>
          <StyledTableCell
            sx={{
              color: theme.white,
              fontWeight: "bold",
              fontSize: "0.85rem",
              "& *": { color: `${theme.white} !important` },
            }}
          >
            {arcana.name}
          </StyledTableCell>
        </TableRow>

        {/* Description Row */}
        <TableRow
          sx={{
            backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          }}
        >
          <StyledTableCell>
            <Typography
              sx={{
                fontStyle: "italic",
                fontSize: "0.85rem",
              }}
            >
              {!arcana.description ? (
                t("No Description")
              ) : (
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  allowedElements={["strong", "em", "mark"]}
                  unwrapDisallowed={true}
                  components={{
                    p: (props) => (
                      <span style={{ fontSize: "0.85rem" }} {...props} />
                    ),
                    mark: (props) => (
                      <mark
                        style={{ backgroundColor: "#ffeb3b", padding: "0 1px" }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {arcana.description}
                </ReactMarkdown>
              )}
            </Typography>
          </StyledTableCell>
        </TableRow>

        <TableRow>
          <StyledTableCell>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 0.5,
              }}
            >
              <Stepper
                nonLinear
                activeStep={getArcanaStepperStage(
                  arcanaStage,
                  arcana.enabled,
                  rework,
                )}
                sx={{ flex: 1, minWidth: 0 }}
              >
                <Step completed={false}>
                  <StepButton
                    onClick={() => {
                      sendArcanaStageToChat("merge");
                      setArcanaStage("merge");
                    }}
                    disabled={!arcana.enabled}
                  >
                    {mergeLabel}
                  </StepButton>
                </Step>
                {rework && (
                  <Step completed={false}>
                    <StepButton
                      onClick={handlePulse}
                      disabled={!arcana.enabled}
                    >
                      {pulseLabel}
                    </StepButton>
                  </Step>
                )}
                <Step completed={false}>
                  <StepButton
                    onClick={handleDismiss}
                    disabled={!arcana.enabled}
                  >
                    {dismissLabel}
                  </StepButton>
                </Step>
              </Stepper>
              <Button
                size="small"
                variant="outlined"
                endIcon={<ArrowForward />}
                disabled={!arcana.enabled || !canUpdate}
                onClick={handleAdvance}
                sx={{ flexShrink: 0, minWidth: 82 }}
              >
                {t("Advance")}
              </Button>
            </Box>
          </StyledTableCell>
        </TableRow>

        {/* Domain Row */}
        {arcana.domain && (
          <TableRow>
            <StyledTableCell>
              <Typography sx={{ fontSize: "0.85rem" }}>
                <strong>{t("Domains: ")}</strong>
                <ReactMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed={true}
                  components={{
                    p: (props) => (
                      <span style={{ fontSize: "0.85rem" }} {...props} />
                    ),
                  }}
                >
                  {arcana.domain}
                </ReactMarkdown>
              </Typography>
            </StyledTableCell>
          </TableRow>
        )}

        {/* Merge Row */}
        <TableRow sx={{ backgroundColor: theme.secondary }}>
          <StyledTableCell
            sx={{ color: "white", fontWeight: "bold", fontSize: "0.85rem" }}
          >
            {t("MERGE")}: {arcana.merge}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell>
            <Typography sx={{ fontSize: "0.85rem" }}>
              {!arcana.mergeDesc ? (
                t("No Merge Benefit")
              ) : (
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed
                >
                  {arcana.mergeDesc}
                </StyledMarkdown>
              )}
            </Typography>
          </StyledTableCell>
        </TableRow>

        {/* Pulse Row (if rework) */}
        {rework && (
          <>
            <TableRow sx={{ backgroundColor: theme.secondary }}>
              <StyledTableCell
                sx={{ color: "white", fontWeight: "bold", fontSize: "0.85rem" }}
              >
                {t("PULSE")}: {arcana.pulse}
              </StyledTableCell>
            </TableRow>
            <TableRow>
              <StyledTableCell>
                <Typography sx={{ fontSize: "0.85rem" }}>
                  {!arcana.pulseDesc ? (
                    t("No Pulse Benefit")
                  ) : (
                    <StyledMarkdown
                      allowedElements={["strong", "em"]}
                      unwrapDisallowed
                    >
                      {arcana.pulseDesc}
                    </StyledMarkdown>
                  )}
                </Typography>
              </StyledTableCell>
            </TableRow>
          </>
        )}

        {/* Dismiss Row */}
        <TableRow sx={{ backgroundColor: theme.secondary }}>
          <StyledTableCell
            sx={{ color: "white", fontWeight: "bold", fontSize: "0.85rem" }}
          >
            {t("DISMISS")}: {arcana.dismiss}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell>
            <Typography sx={{ fontSize: "0.85rem" }}>
              {!arcana.dismissDesc ? (
                t("No Dismiss Benefit")
              ) : (
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed
                >
                  {arcana.dismissDesc}
                </StyledMarkdown>
              )}
            </Typography>
          </StyledTableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
