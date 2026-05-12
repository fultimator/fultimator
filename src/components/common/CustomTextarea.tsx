import React, { useRef, useCallback, useState, useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../hooks/useCustomTheme";

interface CustomTextareaProps {
  id?: string;
  label: string;
  value: string;
  helperText?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onMouseOver?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseOut?: (event: React.MouseEvent<HTMLElement>) => void;
  readOnly?: boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  placeholder?: string;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  id,
  label,
  value,
  helperText = "",
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

  const effectiveMinRows = minRows || 4;
  const showPreview = !isFocused && !!value;

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
    (e: React.MouseEvent<HTMLElement>) => {
      if (onMouseOver) onMouseOver(e);
    },
    [onMouseOver],
  );

  const handleMouseOut = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (onMouseOut) onMouseOut(e);
    },
    [onMouseOut],
  );

  const handleFormat = useCallback(
    (format: string) => {
      const textarea = textareaRef.current;
      if (!textarea || readOnly) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      let formattedText = "";
      let cursorOffset = 0;

      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`;
          cursorOffset = 2;
          break;
        case "italic":
          formattedText = `*${selectedText}*`;
          cursorOffset = 1;
          break;
        case "brackets":
          formattedText = `【${selectedText}】`;
          cursorOffset = 1;
          break;
        default:
          return;
      }

      const newText = `${value.substring(0, start)}${formattedText}${value.substring(end)}`;
      onChange({
        target: { value: newText },
      } as React.ChangeEvent<HTMLTextAreaElement>);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + cursorOffset,
          start + cursorOffset + selectedText.length,
        );
      });
    },
    [value, onChange, readOnly],
  );

  const textFieldSx = {
    width: "100%",
    "& .MuiOutlinedInput-input": {
      fontFamily: theme.typography.body1.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      lineHeight: "1.4375em",
      color: showPreview ? "transparent" : theme.text.primary,
      WebkitTextFillColor: showPreview ? "transparent" : theme.text.primary,
      textShadow: showPreview ? "none" : "none",
      caretColor: showPreview ? "transparent" : theme.text.primary,
      userSelect: showPreview ? "none" : "text",
    },
    "& .MuiOutlinedInput-input::placeholder": {
      color: theme.text.secondary,
      opacity: 0.7,
    },
    "& .MuiInputBase-input.MuiOutlinedInput-inputMultiline": {
      color: showPreview ? "transparent !important" : theme.text.primary,
      WebkitTextFillColor: showPreview ? "transparent" : theme.text.primary,
    },
    "& .MuiFormHelperText-root": {
      marginLeft: 0,
      marginRight: 0,
      marginTop: "4px",
      marginBottom: 0,
    },
  };

  return (
    <Box sx={{ my: "5px", position: "relative" }}>
      <Box
        sx={{ position: "relative" }}
        onMouseDown={(e) => {
          if (showPreview && !readOnly) {
            e.preventDefault();
            setIsFocused(true);
            setPendingFocus(true);
          }
        }}
      >
        <TextField
          id={id}
          inputRef={textareaRef}
          label={label}
          value={value}
          onChange={(e) =>
            onChange(e as React.ChangeEvent<HTMLTextAreaElement>)
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          disabled={readOnly}
          multiline
          minRows={effectiveMinRows}
          maxRows={maxRows}
          slotProps={{
            htmlInput: { maxLength, tabIndex: showPreview ? -1 : 0 },
          }}
          placeholder={placeholder}
          helperText={helperText}
          variant="outlined"
          fullWidth
          sx={textFieldSx}
        />

        {showPreview ? (
          <Box
            sx={{
              position: "absolute",
              top: "14px",
              left: "14px",
              right: "14px",
              bottom: helperText ? "26px" : "14px",
              overflow: "auto",
              color: theme.text.primary,
              fontFamily: theme.typography.body1.fontFamily,
              fontSize: theme.typography.body1.fontSize,
              lineHeight: "1.4375em",
              pointerEvents: "none",
              "& p": { margin: 0 },
              "& p + p": { marginTop: 0 },
              "& ul, & ol": {
                margin: "0 0 0 1.25rem",
                padding: 0,
              },
            }}
          >
            <ReactMarkdown>{value}</ReactMarkdown>
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
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
        }}
      >
        <Button
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            handleFormat("bold");
          }}
          disabled={readOnly}
          sx={{
            fontSize: "12px",
            padding: "6px 8px",
            minWidth: "auto",
            textTransform: "none",
            color: theme.text.primary,
          }}
        >
          Bold
        </Button>
        <Button
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            handleFormat("italic");
          }}
          disabled={readOnly}
          sx={{
            fontSize: "12px",
            padding: "6px 8px",
            minWidth: "auto",
            textTransform: "none",
            color: theme.text.primary,
          }}
        >
          Italic
        </Button>
        <Button
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            handleFormat("brackets");
          }}
          disabled={readOnly}
          sx={{
            fontSize: "12px",
            padding: "6px 8px",
            minWidth: "auto",
            textTransform: "none",
            color: theme.text.primary,
          }}
        >
          【】
        </Button>
      </Box>
    </Box>
  );
};

export default CustomTextarea;
