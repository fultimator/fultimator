import React, { useState, useRef, useCallback, useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
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
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  placeholder?: string;
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
  minRows,
  maxRows,
  maxLength,
  placeholder,
}) => {
  const theme = useCustomTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [pendingFocus, setPendingFocus] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (pendingFocus && textareaRef.current) {
      textareaRef.current.focus();
      setPendingFocus(false);
    }
  }, [pendingFocus]);

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    },
    [onBlur],
  );

  const handleMouseOver = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (onMouseOver) onMouseOver(e);
    },
    [onMouseOver],
  );

  const handleMouseOut = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (onMouseOut) onMouseOut(e);
    },
    [onMouseOut],
  );

  const handleFormat = useCallback(
    (format: string) => {
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
    },
    [value, onChange],
  );

  const showMarkdown = !isFocused && !pendingFocus && !!value;

  const textFieldSx = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      fontFamily: theme.typography.body1.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      "& fieldset": {
        borderColor:
          theme.mode === "dark"
            ? "rgba(255, 255, 255, 0.23)"
            : "rgba(0, 0, 0, 0.23)",
      },
      "&:hover fieldset": {
        borderColor: theme.primary,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.primary,
      },
      "&:hover .MuiOutlinedInput-input": {
        color: theme.text.primary,
      },
      "&.Mui-focused .MuiOutlinedInput-input": {
        color: theme.text.primary,
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "14px",
      resize: "vertical",
      color: theme.text.primary,
      fontFamily: theme.typography.body1.fontFamily,
    },
    "& .MuiOutlinedInput-input::placeholder": {
      color: theme.text.secondary,
      opacity: 0.7,
    },
    "& .MuiFormLabel-root": {
      color: theme.text.secondary,
      "&.Mui-focused": {
        color: theme.text.primary,
      },
    },
    "& .MuiFormHelperText-root": {
      color: theme.text.secondary,
      marginLeft: 0,
      marginRight: 0,
      marginTop: "4px",
      marginBottom: 0,
    },
  };

  const previewSx = {
    width: "100%",
    padding: "14px",
    fontSize: "1rem",
    fontFamily: theme.typography.body1.fontFamily,
    borderRadius: "4px",
    border: `1px solid ${theme.ternary || theme.primary}`,
    overflow: "auto",
    minHeight: "56px",
    cursor: readOnly ? "not-allowed" : "text",
    backgroundColor: theme.background.paper,
    color: theme.text.primary,
    transition: "border-color 0.3s ease",
    "&:hover": !readOnly && {
      borderColor: theme.primary,
    },
  };

  const toolbarSx = {
    display: isFocused ? "flex" : "none",
    gap: "4px",
    mt: "8px",
    mb: isFocused ? "8px" : "0",
    p: "6px 8px",
    border: `1px solid ${theme.ternary || theme.primary}`,
    borderRadius: "50px",
    backgroundColor: theme.background.paper,
    boxShadow: `0 1px 3px rgba(0, 0, 0, ${theme.mode === "dark" ? "0.5" : "0.2"})`,
    width: "fit-content",
    animation: isFocused ? "slideUp 0.2s ease-out" : undefined,
    "@keyframes slideUp": {
      from: {
        opacity: 0,
        transform: "translateY(8px)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  };

  const buttonSx = {
    fontSize: "12px",
    padding: "6px 8px",
    minWidth: "auto",
    textTransform: "none",
    color: theme.text.primary,
    transition: "background-color 0.2s ease, color 0.2s ease",
    "&:hover": {
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
      color: theme.primary,
    },
    "&:disabled": {
      opacity: 0.5,
      color: theme.text.secondary,
    },
  };

  return (
    <Box sx={{ my: "5px" }}>
      {showMarkdown ? (
        <Box
          sx={previewSx}
          onClick={() => {
            if (!readOnly) setPendingFocus(true);
          }}
        >
          <ReactMarkdown>{value}</ReactMarkdown>
        </Box>
      ) : (
        <>
          <TextField
            inputRef={textareaRef}
            label={label}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            disabled={readOnly}
            multiline
            minRows={minRows || 4}
            maxRows={maxRows}
            maxLength={maxLength}
            placeholder={placeholder}
            helperText={helperText}
            variant="outlined"
            fullWidth
            sx={textFieldSx}
          />
          <Box sx={toolbarSx}>
            <Button
              size="small"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat("bold");
              }}
              sx={buttonSx}
              disabled={readOnly}
            >
              Bold
            </Button>
            <Button
              size="small"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat("italic");
              }}
              sx={buttonSx}
              disabled={readOnly}
            >
              Italic
            </Button>
            <Button
              size="small"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat("brackets");
              }}
              sx={buttonSx}
              disabled={readOnly}
            >
              【】
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CustomTextarea;
