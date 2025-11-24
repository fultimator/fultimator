import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Typography, Box, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import remarkGfm from "remark-gfm"; // GitHub-flavored markdown
import rehypeRaw from "rehype-raw"; // Raw HTML
import remarkParse from "remark-parse"; // Parse nested markdown
import rehypeReact from "rehype-react"; // To render HTML as React components
import remarkCustomCallouts from "../../utility/remarkCustomCallouts";
import remarkDirective from "remark-directive";

import { TypeIcon } from "../types";
import {
  D4Icon,
  D6Icon,
  D8Icon,
  D10Icon,
  D12Icon,
  D20Icon,
  Martial,
  MeleeIcon,
  DistanceIcon,
  SpellIcon,
  OffensiveSpellIcon,
} from "../icons";

/**
 * NotesMarkdown Component
 */
const NotesMarkdown = ({ children, ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Preprocess custom blocks: {{type ...}} and icons [ICON:type] and [ICON:dice]
  const processedMarkdown = useMemo(() => {
    if (!children) return "";

    // Handle callout blocks
    const calloutRegex =
      /\{\{(primary|secondary|ternary|quaternary|warning|info|success|danger)\n([\s\S]*?)\n?\}\}/g;

    // Replace custom block syntax with HTML div elements with the class `callout-{type}`
    let intermediate = children.replace(calloutRegex, (_, type, content) => {
      // Check if the content contains nested callouts or tables
      if (content.includes("{{") || content.includes("<table")) {
        // If a nested callout or table is found, don't render it
        return `:::callout-${type}\nContent not supported\n:::`;
      }
      return `:::callout-${type}\n${content.trim()}\n:::`;
    });

    // Handle type icons with [ICON:type] syntax
    const typeIconRegex =
      /\[ICON:(physical|wind|bolt|dark|earth|fire|ice|light|poison)\]/g;
    intermediate = intermediate.replace(
      typeIconRegex,
      (_, type) => `<span class="type-icon" data-type="${type}"></span>`
    );

    // Handle dice icons with [ICON:d4], [ICON:d6], etc. syntax
    const diceIconRegex = /\[ICON:(d4|d6|d8|d10|d12|d20)\]/gi;
    intermediate = intermediate.replace(
      diceIconRegex,
      (_, dice) =>
        `<span class="dice-icon" data-dice="${dice.toLowerCase()}"></span>`
    );

    // Handle other icons with [ICON:...] "melee", "ranged", "magic", "spell", "martial"
    const otherIconRegex = /\[ICON:(melee|ranged|magic|spell|martial)\]/gi;
    intermediate = intermediate.replace(
      otherIconRegex,
      (_, icon) =>
        `<span class="other-icon" data-icon="${icon.toLowerCase()}"></span>`
    );

    // Return the processed markdown, including HTML for custom blocks and icons
    return intermediate;
  }, [children]);

  return (
    <ReactMarkdown
      {...props}
      remarkPlugins={[
        remarkDirective,
        remarkGfm,
        remarkParse,
        remarkCustomCallouts,
      ]}
      rehypePlugins={[rehypeRaw, rehypeReact]}
      components={{
        // Custom styling for paragraphs (p)
        p: ({ ...props }) => (
          <Typography
            variant="body1"
            sx={{
              fontFamily: "'PT Sans Narrow', sans-serif",
              mt: 0.75,
              mb: 0.75,
              marginLeft: 2,
              lineHeight: 1.6,
              fontSize: "1rem",
              color: theme.palette.text.primary,
            }}
            {...props}
          />
        ),

        // Custom styling for h1 headers
        h1: ({ children, ...props }) => (
          <Box sx={{ display: "flex", alignItems: "center", my: 3 }} {...props}>
            <Box
              sx={{
                flex: 1,
                height: "1px",
                backgroundColor: theme.palette.divider,
                mr: 2,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Antonio', sans-serif",
                textTransform: "uppercase",
                fontWeight: "bold",
                fontSize: "2rem",
                color: theme.palette.text.primary,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {children}
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: "1px",
                backgroundColor: theme.palette.divider,
                ml: 2,
              }}
            />
          </Box>
        ),

        // Custom styling for h2 headers
        h2: ({ ...props }) => (
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Antonio', sans-serif",
              fontWeight: "normal",
              textTransform: "uppercase",
              fontSize: "1.3em",
              pl: 2,
              py: 1,
              mb: 2,
              color: theme.palette.primary.contrastText,
              background: !isDark
                ? `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                : `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
            }}
            {...props}
          />
        ),

        // Custom styling for h3 headers
        h3: ({ ...props }) => (
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Antonio', sans-serif",
              fontWeight: "normal",
              fontSize: "1.1em",
              textTransform: "uppercase",
              pl: 2,
              py: 1,
              mt: 2,
              mb: 1,
              color: isDark ? "#fff" : "#000",
              backgroundColor: theme.palette.ternary?.main ?? "#e0e0e0",
              borderBottom: isDark
                ? `2px solid ${theme.palette.primary.light}`
                : `2px solid ${theme.palette.primary.main}`,
            }}
            {...props}
          />
        ),

        // Custom styling for h4 headers
        h4: ({ ...props }) => (
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Antonio', sans-serif",
              fontWeight: "normal",
              fontSize: "1em",
              textTransform: "uppercase",
              pl: 2,
              py: 1,
              mt: 2,
              color: isDark ? "#fff" : "#000",
              backgroundColor: theme.palette.ternary?.main ?? "#e0e0e0",
            }}
            {...props}
          />
        ),

        // Custom styling for h5 headers
        h5: ({ ...props }) => (
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Antonio', sans-serif",
              fontWeight: "normal",
              fontSize: "0.9em",
              textTransform: "uppercase",
              pl: 2,
              py: 1,
              mt: 2,
              color: "#fff",
              backgroundColor: theme.palette.primary?.main ?? "#e0e0e0",
            }}
            {...props}
          />
        ),

        // Custom styling for strong (bold) text
        strong: ({ ...props }) => (
          <strong
            style={{
              color: theme.palette.text.primary,
              fontWeight: 600,
            }}
            {...props}
          />
        ),

        // Custom styling for emphasized (italic) text
        em: ({ ...props }) => (
          <em
            style={{
              color: theme.palette.text.secondary,
              fontStyle: "italic",
            }}
            {...props}
          />
        ),

        // Custom styling for ordered lists (ol)
        ol: ({ children, start = 1, ...props }) => {
          let itemIndex = start - 1;
          return (
            <ol
              style={{
                listStyle: "none",
                paddingLeft: "1.5em",
                fontFamily: "'PT Sans Narrow', sans-serif",
                color: theme.palette.text.primary,
                marginTop: 8,
                marginBottom: 8,
              }}
              {...props}
            >
              {React.Children.map(children, (child) =>
                React.isValidElement(child)
                  ? React.cloneElement(child, {
                      ordered: true,
                      index: itemIndex++,
                    })
                  : child
              )}
            </ol>
          );
        },

        // Custom styling for unordered lists (ul)
        ul: ({ children, ...props }) => (
          <ul
            style={{
              listStyle: "none",
              paddingLeft: "1.5em",
              fontFamily: "'PT Sans Narrow', sans-serif",
              color: theme.palette.text.primary,
              marginTop: 8,
              marginBottom: 8,
            }}
            {...props}
          >
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child, { ordered: false })
                : child
            )}
          </ul>
        ),

        // Custom styling for list items (li)
        li: ({ ordered, index, children, ...props }) => (
          <li
            style={{
              position: "relative",
              paddingLeft: "1.5em",
              marginBottom: "0.5em",
              color: theme.palette.text.primary,
            }}
            {...props}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                minWidth: "1.5em",
                textAlign: "right",
                paddingRight: "0.3em",
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              {ordered ? `${index + 1}.` : "⬩"}
            </span>
            {children}
          </li>
        ),

        // Custom styling for tables
        table: ({ ...props }) => (
          <table
            style={{
              fontFamily: "'PT Sans Narrow', sans-serif",
              width: "100%",
              marginBottom: "1em",
              borderCollapse: "collapse",
              color: theme.palette.text.primary,
            }}
            {...props}
          />
        ),

        // Custom styling for table headers (th)
        th: ({ ...props }) => (
          <th
            style={{
              textAlign: "left",
              padding: "8px 12px",
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              borderBottom: `1px solid ${theme.palette.primary.main}`,
            }}
            {...props}
          />
        ),

        // Custom styling for table data (td)
        td: ({ ...props }) => (
          <td
            style={{
              padding: "8px 12px",
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark
                ? theme.palette.background.paper
                : theme.palette.background.default,
            }}
            {...props}
          />
        ),

        // Custom styling for links
        a: ({ ...props }) => (
          <Link
            style={{
              color: isDark
                ? theme.palette.secondary.light
                : theme.palette.primary.main,
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationColor: isDark
                ? theme.palette.secondary.light
                : theme.palette.primary.main,
            }}
            {...props}
          />
        ),

        // Custom styling for blockquotes
        blockquote: ({ children, ...props }) => (
          <Box
            component="blockquote"
            sx={{
              borderLeft: `4px solid ${theme.palette.divider}`,
              margin: "1em 0",
              padding: "0.5em 1em",
              fontStyle: "italic",
              backgroundColor: isDark
                ? theme.palette.background.default
                : theme.palette.action.hover,
              color: theme.palette.text.secondary,
            }}
            {...props}
          >
            {children}
          </Box>
        ),

        // Custom styling for code blocks
        code: ({ inline, children, ...props }) => {
          if (inline) {
            return (
              <Box
                component="code"
                sx={{
                  fontFamily: "monospace",
                  backgroundColor: isDark
                    ? theme.palette.grey[800]
                    : theme.palette.grey[200],
                  color: isDark
                    ? theme.palette.secondary.light
                    : theme.palette.primary.dark,
                  padding: "0.1em 0.4em",
                  borderRadius: "4px",
                  fontSize: "0.875em",
                }}
                {...props}
              >
                {children}
              </Box>
            );
          }
          // Let fenced code blocks be handled by `pre`
          return <code {...props}>{children}</code>;
        },

        // Custom styling for fenced code blocks
        pre: ({ children, ...props }) => (
          <Box
            component="pre"
            sx={{
              fontFamily: "monospace",
              backgroundColor: isDark
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
              color: theme.palette.text.primary,
              padding: 2,
              borderRadius: 2,
              overflowX: "auto",
              marginY: 2,
            }}
            {...props}
          >
            {children}
          </Box>
        ),

        // Custom styling for spans (used for icons)
        span: ({ ...props }) => {
          if (props.className === "type-icon" && props["data-type"]) {
            return (
              <TypeIcon
                type={props["data-type"]}
                sx={{ fontSize: "1.2rem", verticalAlign: "text-bottom" }}
              />
            );
          }
          if (props.className === "dice-icon" && props["data-dice"]) {
            const dice = props["data-dice"].toLowerCase();
            return (
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  verticalAlign: "text-bottom",
                  mx: "2px",
                }}
              >
                {dice === "d4" && <D4Icon fontSize="small" />}
                {dice === "d6" && <D6Icon fontSize="small" />}
                {dice === "d8" && <D8Icon fontSize="small" />}
                {dice === "d10" && <D10Icon fontSize="small" />}
                {dice === "d12" && <D12Icon fontSize="small" />}
                {dice === "d20" && <D20Icon fontSize="small" />}
              </Box>
            );
          }
          if (props.className === "other-icon" && props["data-icon"]) {
            const icon = props["data-icon"].toLowerCase();
            return (
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  verticalAlign: "text-bottom",
                  mx: "2px",
                }}
              >
                {icon === "melee" && <MeleeIcon fontSize="small" />}
                {icon === "ranged" && <DistanceIcon fontSize="small" />}
                {icon === "magic" && <SpellIcon fontSize="small" />}
                {icon === "spell" && <OffensiveSpellIcon fontSize="small" />}
                {icon === "martial" && <Martial fontSize="small" />}
              </Box>
            );
          }

          return <span {...props} />;
        },

        // Custom styling for callout blocks
        div: ({ className, children, ...props }) => {
          if (className?.startsWith("callout-")) {
            const type = className.split("-")[1];
            const {
              primary,
              secondary,
              ternary,
              quaternary,
              warning,
              info,
              success,
              error,
            } = theme.palette;

            const colors = {
              primary,
              secondary,
              ternary,
              quaternary,
              warning,
              info,
              success,
              danger: error,
            };

            const selectedColor = colors[type] || info;
            const backgroundColor =
              type === "ternary" || type === "quaternary"
                ? selectedColor?.main || "#e0e0e0"
                : isDark
                ? `linear-gradient(to right, ${selectedColor.dark}, ${selectedColor.light})`
                : `linear-gradient(to right, ${selectedColor.main}, ${selectedColor.light})`;

            return (
              <Box
                sx={{
                  background: backgroundColor,
                  paddingX: 0,
                  paddingY: 1,
                  marginY: 2,
                  display: "block",
                  lineHeight: 1.6,
                  color:
                    type === "primary" ||
                    type === "info" ||
                    type === "success" ||
                    type === "danger" ||
                    type === "warning"
                      ? "#fff"
                      : theme.palette.text.primary,
                }}
              >
                {children}
              </Box>
            );
          }

          return <div {...props}>{children}</div>;
        },
      }}
    >
      {processedMarkdown}
    </ReactMarkdown>
  );
};

export default NotesMarkdown;
