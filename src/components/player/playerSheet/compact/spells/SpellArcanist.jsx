import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";

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

export default function SpellArcanist({ arcana, rework }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Header Row */}
        <TableRow sx={{ backgroundColor: theme.primary }}>
          <StyledTableCell
            sx={{ color: "white", fontWeight: "bold", fontSize: "0.85rem" }}
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
                fontSize: "0.8rem",
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
                      <span style={{ fontSize: "0.8rem" }} {...props} />
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

        {/* Domain Row */}
        {arcana.domain && (
          <TableRow>
            <StyledTableCell>
              <Typography sx={{ fontSize: "0.8rem" }}>
                <strong>{t("Domains: ")}</strong>
                <ReactMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed={true}
                  components={{
                    p: (props) => (
                      <span style={{ fontSize: "0.8rem" }} {...props} />
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
            sx={{ color: "white", fontWeight: "bold", fontSize: "0.8rem" }}
          >
            {t("MERGE")}: {arcana.merge}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell>
            <Typography sx={{ fontSize: "0.75rem" }}>
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
                sx={{ color: "white", fontWeight: "bold", fontSize: "0.8rem" }}
              >
                {t("PULSE")}: {arcana.pulse}
              </StyledTableCell>
            </TableRow>
            <TableRow>
              <StyledTableCell>
                <Typography sx={{ fontSize: "0.75rem" }}>
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
            sx={{ color: "white", fontWeight: "bold", fontSize: "0.8rem" }}
          >
            {t("DISMISS")}: {arcana.dismiss}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell>
            <Typography sx={{ fontSize: "0.75rem" }}>
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
