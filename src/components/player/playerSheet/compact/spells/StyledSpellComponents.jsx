import React from "react";
import { TableCell } from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from "react-markdown";
import { useMarkdown } from "../../../../../hooks/useMarkdown";

export const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export const StyledMarkdown = ({ children, ...props }) => {
  const markdownConfig = useMarkdown({ fontSize: "0.8rem" });
  return (
    <div style={markdownConfig.containerStyle}>
      <ReactMarkdown {...markdownConfig} {...props}>
        {children}
      </ReactMarkdown>
    </div>
  );
};
