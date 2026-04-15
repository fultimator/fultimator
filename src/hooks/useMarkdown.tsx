import React, { useMemo, ReactNode } from "react";
import rehypeRaw from "rehype-raw";

interface MarkdownConfig {
  fontSize?: string;
  whiteSpace?: "pre-line" | "pre-wrap" | "normal";
}

interface MarkdownComponentProps {
  children?: ReactNode;
  [key: string]: unknown;
}

export const useMarkdown = (config: MarkdownConfig = {}) => {
  const { fontSize = "0.8rem", whiteSpace = "pre-line" } = config;

  return useMemo(
    () => ({
      rehypePlugins: [rehypeRaw],
      components: {
        p: (props: MarkdownComponentProps) => (
          <p style={{ margin: 0, padding: 0, fontSize }} {...props} />
        ),
        ul: (props: MarkdownComponentProps) => (
          <ul
            style={{ margin: 0, padding: 0, paddingLeft: "1.5em" }}
            {...props}
          />
        ),
        li: (props: MarkdownComponentProps) => (
          <li style={{ margin: 0, padding: 0 }} {...props} />
        ),
        strong: (props: MarkdownComponentProps) => (
          <strong style={{ fontWeight: "bold" }} {...props} />
        ),
        em: (props: MarkdownComponentProps) => (
          <em style={{ fontStyle: "italic" }} {...props} />
        ),
        mark: (props: MarkdownComponentProps) => (
          <mark
            style={{ backgroundColor: "#ffeb3b", padding: "0 1px" }}
            {...props}
          />
        ),
        br: (props: MarkdownComponentProps) => <br {...props} />,
        a: (props: MarkdownComponentProps) => (
          <a
            style={{ color: "inherit", textDecoration: "underline" }}
            {...props}
          />
        ),
      },
      containerStyle: {
        whiteSpace,
        display: "inline",
        margin: 0,
        padding: 0,
      } as React.CSSProperties,
    }),
    [fontSize, whiteSpace],
  );
};

export type { MarkdownConfig };
