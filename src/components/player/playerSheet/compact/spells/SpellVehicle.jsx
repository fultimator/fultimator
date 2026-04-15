import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { availableFrames } from "../../../../../libs/pilotVehicleData";
import { Martial } from "../../../../icons";
import { OpenBracket, CloseBracket } from "../../../../Bracket";
import attributes from "../../../../../libs/attributes";
import types from "../../../../../libs/types";

const StyledTableCell = styled(TableCell)({
  padding: "2px 4px",
  fontSize: "0.8rem",
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
              style={{ margin: 0, padding: 0, fontSize: "0.75rem" }}
              {...props}
            />
          ),
          ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
          li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
          strong: (props) => (
            <strong style={{ fontWeight: "bold" }} {...props} />
          ),
          em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.split(regex).map((part, idx) =>
    idx % 2 === 1 ? (
      <mark
        key={`${part}-${idx}`}
        style={{ backgroundColor: "yellow", padding: 0 }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.replace(regex, "<mark>$1</mark>");
}

export default function SpellVehicle({ spell, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const activeVehicle = spell.vehicles?.find((v) => v.enabled);
  if (!activeVehicle) return null;

  const frame = availableFrames.find(
    (f) => f.name === (activeVehicle.frame || "pilot_frame_exoskeleton"),
  );
  const equippedModules =
    activeVehicle.modules?.filter((m) => m.equipped) || [];

  const armorModules = equippedModules.filter(
    (m) => m.type === "pilot_module_armor",
  );
  const weaponModules = equippedModules.filter(
    (m) => m.type === "pilot_module_weapon",
  );
  const supportModules = equippedModules.filter(
    (m) => m.type === "pilot_module_support",
  );

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Frame Details */}
        {frame && (
          <TableRow
            sx={{
              backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
            }}
          >
            <StyledTableCell colSpan={4}>
              <Box sx={{ display: "flex", gap: 2, fontSize: "0.75rem" }}>
                <Typography variant="caption">
                  <strong>{t("pilot_vehicles_frame")}:</strong> {t(frame.name)}
                </Typography>
                <Typography variant="caption">
                  <strong>{t("pilot_passengers")}:</strong>{" "}
                  {frame.passengers || t("None")}
                </Typography>
                <Typography variant="caption">
                  <strong>{t("pilot_distance")}:</strong>{" "}
                  {frame.distance > 1
                    ? `×${frame.distance}`
                    : t("pilot_distance_no_mod")}
                </Typography>
              </Box>
            </StyledTableCell>
          </TableRow>
        )}

        {/* Armor Modules */}
        {armorModules.length > 0 && (
          <>
            <TableRow sx={{ backgroundColor: theme.secondary }}>
              <StyledTableCell
                colSpan={4}
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  py: 0,
                }}
              >
                {t("Armor")}
              </StyledTableCell>
            </TableRow>
            {armorModules.map((m, i) => (
              <TableRow key={`armor-${i}`}>
                <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {highlightMatch(
                      m.name === "pilot_custom_armor"
                        ? m.customName
                        : t(m.name),
                      searchQuery,
                    )}
                    {m.martial && (
                      <Martial sx={{ fontSize: "0.8rem", ml: 0.5 }} />
                    )}
                  </Box>
                </StyledTableCell>
                <StyledTableCell sx={{ textAlign: "center", width: "20%" }}>
                  {t("DEF")}: {m.martial ? m.def : `+${m.def}`}
                </StyledTableCell>
                <StyledTableCell sx={{ textAlign: "center", width: "20%" }}>
                  {t("M.DEF")}: {m.martial ? m.mdef : `+${m.mdef}`}
                </StyledTableCell>
                <StyledTableCell sx={{ textAlign: "center", width: "30%" }}>
                  {t("INIT")}: {m.init >= 0 ? `+${m.init}` : m.init}
                </StyledTableCell>
              </TableRow>
            ))}
          </>
        )}

        {/* Weapon Modules */}
        {weaponModules.length > 0 && (
          <>
            <TableRow sx={{ backgroundColor: theme.secondary }}>
              <StyledTableCell
                colSpan={4}
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  py: 0,
                }}
              >
                {t("Weapons")}
              </StyledTableCell>
            </TableRow>
            {weaponModules.map((m, i) => (
              <React.Fragment key={`weapon-${i}`}>
                <TableRow>
                  <StyledTableCell sx={{ fontWeight: "bold" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {highlightMatch(
                        m.name === "pilot_custom_weapon"
                          ? m.customName
                          : t(m.name),
                        searchQuery,
                      )}
                      {m.martial && (
                        <Martial sx={{ fontSize: "0.8rem", ml: 0.5 }} />
                      )}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell sx={{ textAlign: "center" }}>
                    <OpenBracket />
                    {attributes[m.att1 || "might"].shortcaps} +{" "}
                    {attributes[m.att2 || "dexterity"].shortcaps}
                    <CloseBracket />
                    {m.prec !== 0 && (m.prec > 0 ? `+${m.prec}` : m.prec)}
                  </StyledTableCell>
                  <StyledTableCell sx={{ textAlign: "center" }}>
                    <OpenBracket />
                    {t("HR")} {m.damage >= 0 ? "+" : ""}
                    {m.damage}
                    <CloseBracket />
                    {types[m.damageType?.toLowerCase() || "physical"]?.long ||
                      t(m.damageType || "Physical")}
                  </StyledTableCell>
                  <StyledTableCell sx={{ fontSize: "0.7rem" }}>
                    {highlightMatch(t(m.category), searchQuery)}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell colSpan={4} sx={{ py: 0.5 }}>
                    <StyledMarkdown>
                      {highlightMarkdownText(
                        m.name === "pilot_custom_weapon"
                          ? m.description
                          : t(m.description),
                        searchQuery,
                      )}
                    </StyledMarkdown>
                  </StyledTableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </>
        )}

        {/* Support Modules */}
        {supportModules.length > 0 && (
          <>
            <TableRow sx={{ backgroundColor: theme.secondary }}>
              <StyledTableCell
                colSpan={4}
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  py: 0,
                }}
              >
                {t("Support")}
              </StyledTableCell>
            </TableRow>
            {supportModules.map((m, i) => (
              <TableRow key={`support-${i}`}>
                <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
                  {highlightMatch(
                    m.name === "pilot_custom_support"
                      ? m.customName
                      : t(m.name),
                    searchQuery,
                  )}
                </StyledTableCell>
                <StyledTableCell colSpan={3} sx={{ fontSize: "0.75rem" }}>
                  <StyledMarkdown>
                    {highlightMarkdownText(
                      m.name === "pilot_custom_support"
                        ? m.description
                        : t(m.description),
                      searchQuery,
                    )}
                  </StyledMarkdown>
                </StyledTableCell>
              </TableRow>
            ))}
          </>
        )}
      </TableBody>
    </Table>
  );
}
