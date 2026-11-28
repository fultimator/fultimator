import React from "react";
import ReactMarkdown from "/src/components/common/Markdown";
import { useMarkdown } from "/src/hooks/useMarkdown";

export const StyledMarkdown = ({ children, ...props }) => {
  const markdownConfig = useMarkdown({ fontSize: "0.85rem" });
  return (
    <div style={markdownConfig.containerStyle}>
      <ReactMarkdown {...markdownConfig} {...props}>
        {children}
      </ReactMarkdown>
    </div>
  );
};
