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
import { OffensiveSpellIcon } from "../../../../icons";
import attributes from "../../../../../libs/attributes";
import { CloseBracket, OpenBracket } from "../../../../Bracket";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const StyledTableCell = styled(TableCell)({ 
  padding: "4px 8px",
  fontSize: "0.85rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)"
});

const StyledMarkdown = ({ children, ...props }) => {
  return (
    <div style={{ whiteSpace: "pre-line", display: "inline", margin: 0, padding: 0 }}>
      <ReactMarkdown
        {...props}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: (props) => <p style={{ margin: 0, padding: 0, fontSize: "0.8rem" }} {...props} />,
          ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
          li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
          strong: (props) => (
            <strong style={{ fontWeight: "bold" }} {...props} />
          ),
          em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          mark: (props) => <mark style={{ backgroundColor: "#ffeb3b", padding: "0 1px" }} {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default function SpellDefault({
  spellName,
  mp,
  maxTargets,
  targetDesc,
  duration,
  description,
  isOffensive,
  attr1,
  attr2,
  isMagisphere,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        <TableRow
          sx={{
            backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`, 
          }}
        >
          <StyledTableCell sx={{ width: "40%" }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography
                fontWeight="bold"
                sx={{ fontSize: "0.85rem" }}
              >
                {spellName}
              </Typography>
              {isOffensive && <OffensiveSpellIcon sx={{ fontSize: "0.85rem" }} />}
            </Box>
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "15%" }}>
            <Typography sx={{ fontSize: "0.8rem" }}>
              {mp}
              {maxTargets !== 1 ? " × " + t("T") : ""}
            </Typography>
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "20%" }}>
            <Typography sx={{ fontSize: "0.8rem" }}>
              {targetDesc}
            </Typography>
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "25%" }}>
            <Typography sx={{ fontSize: "0.8rem" }}>
              {duration}
            </Typography>
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell colSpan={4}>
            <Box sx={{ padding: "4px 0" }}>
              <Typography component="div" sx={{ fontSize: "0.8rem", marginBottom: 0.5 }}>
                <StyledMarkdown allowedElements={["p", "ul", "li", "strong", "em", "mark"]} unwrapDisallowed>
                  {description}
                </StyledMarkdown>
              </Typography>
              {isOffensive && (
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    marginTop: 0.5,
                  }}
                >
                  {t("Magic Check") + ": "}
                  <strong>
                    <OpenBracket />
                    {t(attributes[attr1].shortcaps)}
                    {t(" + ")}
                    {t(attributes[attr2].shortcaps)}
                    <CloseBracket />
                  </strong>
                </Typography>
              )}
            </Box>
          </StyledTableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
