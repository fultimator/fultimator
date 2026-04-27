import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { styled } from "@mui/system";

const StyledMarkdownBase = styled(ReactMarkdown)({
  "& ul, & ol": {
    paddingLeft: "1.5em",
    margin: 0,
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  "& p": {
    margin: 0,
    marginTop: "0.5em",
    marginBottom: "0.5em",
    lineHeight: 1.5,
  },
  "& ul": { listStyle: "disc", lineHeight: 1.6 },
  "& ol": { listStyle: "decimal", lineHeight: 1.6 },
  "& li": { display: "list-item", lineHeight: 1.6 },
  "& strong": { fontWeight: 600 },
  "& em": { fontStyle: "italic" },
  display: "inline",
});

export const StyledMarkdown = ({ children, ...props }) => (
  <StyledMarkdownBase remarkPlugins={[remarkBreaks]} {...props}>
    {typeof children === "string" ? children.replace(/\\n/g, "\n") : children}
  </StyledMarkdownBase>
);

// eslint-disable-next-line react-refresh/only-export-components
export const md = (text) => (
  <StyledMarkdown
    allowedElements={["strong", "em", "p", "ul", "ol", "li", "br"]}
    unwrapDisallowed
  >
    {text || ""}
  </StyledMarkdown>
);
