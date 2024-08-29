import React, { useState, useRef, useCallback } from "react";
import { TextareaAutosize, Button } from "@mui/material";
import { useCustomTheme } from "../../hooks/useCustomTheme";

interface CustomTextareaProps {
  label: string;
  value: string;
  helperText: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onMouseOver?: (event: React.MouseEvent<HTMLTextAreaElement>) => void;
  onMouseOut?: (event: React.MouseEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
  maxRows?: number;
  maxLength?: number;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  label,
  value,
  helperText,
  onChange,
  onFocus,
  onBlur,
  onMouseOver,
  onMouseOut,
  readOnly = false,
  maxRows,
  maxLength,
}) => {
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const handleMouseOver = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    setIsHovered(true);
    if (onMouseOver) onMouseOver(e);
  }, [onMouseOver]);

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    setIsHovered(false);
    if (onMouseOut) onMouseOut(e);
  }, [onMouseOut]);

  const handleFormat = useCallback((format: string) => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let formattedText = "";

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "brackets":
        formattedText = `【${selectedText}】`;
        break;
      default:
        break;
    }

    const newText = `${value.substring(0, start)}${formattedText}${value.substring(end)}`;

    onChange({
      target: { value: newText },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
    textarea.focus();
  }, [value, onChange]);

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    fontSize: "1rem",
    fontFamily: "inherit",
    borderRadius: "4px",
    border: isFocused ? "none" : `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.23)" : "#c4c4c4"}`,
    outline: isHovered ? `2px solid white` : "none",  // Outline when hovered
    resize: "vertical",
    boxShadow: isFocused ? `0 0 0 2px ${theme.primary}` : "none",
    backgroundColor: readOnly ? "#f5f5f5" : `${theme.transparent}`,
    cursor: readOnly ? "not-allowed" : "text",
    color: isDarkMode ? "white" : "black",
  };

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    padding: "0 2px",
    top: isFocused || value ? "-8px" : "12px",
    backgroundColor: isDarkMode ? "#252525" : "white",
    left: "14px",
    transition: "top 0.2s ease, font-size 0.2s ease",
    fontSize: isFocused || value ? "0.8rem" : "1rem",
    color: isFocused ? `${theme.primary}` : isDarkMode ? "white" : "black",
    pointerEvents: "none",
    borderRadius: "4px",
  };

  const helperStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    color: isDarkMode ? "white" : "#252525",
    marginTop: "4px",
    marginRight: "14px",
    marginBottom: "0",
    marginLeft: "14px",
  };

  const toolbarStyle: React.CSSProperties = {
    position: "absolute",
    top: "-10px",
    right: "10px",
    display: "flex",
    border: `1px solid ${theme.primary}`,
    borderRadius: "50px",
    overflow: "hidden",
    backgroundColor: isDarkMode ? "#252525" : `${theme.ternary}`,
  };

  const buttonStyle: React.CSSProperties & { "&:hover"?: React.CSSProperties } = {
    fontSize: "12px",
    padding: "0",
    marginRight: "8px",
    transition: "font-weight 0.3s ease",
    fontWeight: "normal",
    color: isDarkMode ? "white" : "black",
  };

  buttonStyle["&:hover"] = {
    fontWeight: "bold",
  };

  return (
    <div style={{ position: "relative", margin: "5px 0" }}>
      <div style={toolbarStyle}>
        <Button
          onClick={() => handleFormat("bold")}
          style={buttonStyle}
          disabled={readOnly}
        >
          Bold
        </Button>
        <Button
          onClick={() => handleFormat("italic")}
          style={buttonStyle}
          disabled={readOnly}
        >
          Italic
        </Button>
        <Button
          onClick={() => handleFormat("brackets")}
          style={buttonStyle}
          disabled={readOnly}
        >
          【】
        </Button>
      </div>
      <TextareaAutosize
        ref={textareaRef}
        aria-label={label}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        readOnly={readOnly}
        style={textareaStyle}
        maxRows={maxRows}
        maxLength={maxLength}
      />
      <label style={labelStyle}>{label}</label>
      <div style={helperStyle}>{helperText}</div>
    </div>
  );
};

export default CustomTextarea;
