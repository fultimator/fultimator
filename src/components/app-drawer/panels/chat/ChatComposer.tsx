import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  PersonOutlineOutlined as PersonOutlineIcon,
  Close as CloseIcon,
  DeleteOutlined as DeleteOutlineIcon,
  KeyboardReturn as InsertIcon,
  SaveAlt as SaveAltIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { DICE_OPTIONS } from "./constants";
import { getActiveCommand, matchCommands } from "./domain/commands";
import type { Command } from "./domain/commands";
import type { useChatStore } from "./chatStore";

interface ChatComposerProps {
  store: ReturnType<typeof useChatStore>;
  speakerOptions: string[];
  selectedSpeaker: string;
  onSpeakerChange: (speaker: string) => void;
  onExport: () => void;
  onClearRequest: () => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  store,
  speakerOptions,
  selectedSpeaker,
  onSpeakerChange,
  onExport,
  onClearRequest,
}) => {
  const [input, setInput] = useState("");
  const [speakerMenuAnchor, setSpeakerMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [cmdSuggestions, setCmdSuggestions] = useState<Command[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [activeCommand, setActiveCommand] = useState<Command | null>(null);
  const textFieldRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = Boolean(input.trim()) || store.hasPendingRoll;
  const hasMessages = store.messages.length > 0;
  const showPopup = cmdSuggestions.length > 0 || activeCommand !== null;

  const updatePopupState = (value: string) => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setCmdSuggestions(matchCommands(value.slice(1)));
      setActiveCommand(null);
      setActiveSuggestion(0);
    } else if (value.startsWith("/") && value.includes(" ")) {
      setCmdSuggestions([]);
      setActiveCommand(getActiveCommand(value));
    } else {
      setCmdSuggestions([]);
      setActiveCommand(null);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    store.clearCommandError();
    updatePopupState(value);
  };

  const applySuggestion = (cmd: Command) => {
    setInput(`/${cmd.name} `);
    setCmdSuggestions([]);
    setActiveCommand(cmd);
  };

  const dismissPopup = () => {
    setCmdSuggestions([]);
    setActiveCommand(null);
  };

  const insertTrayIntoInput = () => {
    const parts = DICE_OPTIONS.flatMap((s) => {
      const count = store.pendingDice[s] ?? 0;
      return count > 0 ? [`${count}d${s}`] : [];
    });
    if (store.pendingD100 > 0) parts.push(`${store.pendingD100}d100`);
    if (parts.length === 0) return;

    let expr = parts.join("+");
    if (store.pendingModifier !== 0) {
      expr +=
        store.pendingModifier > 0
          ? `+${store.pendingModifier}`
          : `${store.pendingModifier}`;
    }

    const token = `/roll ${expr}`;
    const el = textareaRef.current;
    const cursor = el ? (el.selectionStart ?? input.length) : input.length;
    const before = input.slice(0, cursor);
    const after = input.slice(cursor);
    const sep = before.trimEnd().length > 0 ? " " : "";
    const next = `${before.trimEnd()}${sep}${token}${after.trimStart() ? ` ${after.trimStart()}` : ""}`;

    handleInputChange(next);
    store.clearPendingRoll();

    const pos = before.trimEnd().length + sep.length + token.length;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };

  const handleSend = () => {
    store.send(input);
    if (!store.commandError) {
      setInput("");
      dismissPopup();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (cmdSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.min(i + 1, cmdSuggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !input.includes(" "))) {
        e.preventDefault();
        applySuggestion(cmdSuggestions[activeSuggestion]);
        return;
      }
    }
    if (e.key === "Escape") {
      dismissPopup();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 1.25, pt: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Tooltip title={`Speaker: ${selectedSpeaker}`}>
          <IconButton
            size="small"
            aria-label="Select speaker"
            onClick={(e) => setSpeakerMenuAnchor(e.currentTarget)}
            sx={(theme) => ({
              borderRadius: 1,
              color: "text.secondary",
              backgroundColor: "transparent",
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": { backgroundColor: "action.hover" },
            })}
          >
            <PersonOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flex: 1,
            minWidth: 0,
            textAlign: "left",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pl: 0.25,
          }}
        >
          {selectedSpeaker}
        </Typography>
        <IconButton
          size="small"
          aria-label="Export chat logs as JSON"
          onClick={onExport}
          disabled={!hasMessages}
          sx={(theme) => ({
            borderRadius: 1,
            color: "text.primary",
            backgroundColor: "background.paper",
            border: `1px solid ${theme.palette.action.selected}`,
            "&:hover": { backgroundColor: "action.hover" },
            "&.Mui-disabled": {
              color: "text.disabled",
              borderColor: "divider",
            },
          })}
        >
          <SaveAltIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="Clear chat logs"
          onClick={onClearRequest}
          disabled={!hasMessages}
          sx={(theme) => ({
            borderRadius: 1,
            color: "error.main",
            backgroundColor: "transparent",
            border: `1px solid ${theme.palette.divider}`,
            "&:hover": { backgroundColor: "action.hover" },
            "&.Mui-disabled": {
              color: "text.disabled",
              borderColor: "divider",
            },
          })}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>

      <Menu
        anchorEl={speakerMenuAnchor}
        open={Boolean(speakerMenuAnchor)}
        onClose={() => setSpeakerMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {speakerOptions.map((speaker) => (
          <MenuItem
            key={speaker}
            selected={speaker === selectedSpeaker}
            onClick={() => {
              onSpeakerChange(speaker);
              setSpeakerMenuAnchor(null);
            }}
          >
            {speaker}
          </MenuItem>
        ))}
      </Menu>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          ref={textFieldRef}
          sx={{ flex: 1, position: "relative" }}
          onBlur={(e) => {
            if (!textFieldRef.current?.contains(e.relatedTarget as Node)) {
              dismissPopup();
            }
          }}
          onFocus={() => updatePopupState(input)}
        >
          {showPopup && (
            <Paper
              elevation={4}
              sx={{
                position: "absolute",
                bottom: "100%",
                left: 0,
                right: 0,
                mb: 0.5,
                zIndex: 10,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <List dense disablePadding>
                {cmdSuggestions.map((cmd, i) => (
                  <ListItemButton
                    key={cmd.name}
                    selected={i === activeSuggestion}
                    onClick={() => applySuggestion(cmd)}
                    sx={{ py: 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, fontFamily: "monospace" }}
                          >
                            /{cmd.name}
                          </Typography>
                          {cmd.aliases.length > 0 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              /{cmd.aliases.join(", /")}
                            </Typography>
                          )}
                          {cmd.params.map((p) => (
                            <Typography
                              key={p.name}
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {p.required ? `<${p.name}>` : `[${p.name}]`}
                            </Typography>
                          ))}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <span>{cmd.description}</span>
                          {cmd.params[0]?.description && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.disabled"
                            >
                              — {cmd.params[0].description}
                            </Typography>
                          )}
                        </Box>
                      }
                      slotProps={{ secondary: { variant: "caption" } }}
                    />
                  </ListItemButton>
                ))}
                {activeCommand && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, fontFamily: "monospace" }}
                          >
                            /{activeCommand.name}
                          </Typography>
                          {activeCommand.params.map((p) => (
                            <Typography
                              key={p.name}
                              variant="body2"
                              color="primary"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {p.required ? `<${p.name}>` : `[${p.name}]`}
                            </Typography>
                          ))}
                        </Box>
                      }
                      secondary={
                        activeCommand.params[0]?.description
                          ? `e.g. ${activeCommand.params[0].description}`
                          : activeCommand.description
                      }
                      slotProps={{ secondary: { variant: "caption" } }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          )}
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            maxRows={6}
            placeholder="Write to chat... (/ for commands)"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            error={Boolean(store.commandError)}
            inputRef={textareaRef}
            sx={{
              "& .MuiInputBase-root": { alignItems: "flex-start", py: 0.5 },
            }}
          />
          {store.commandError && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 0.75, display: "block", px: 0.5 }}
            >
              {store.commandError}
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          sx={(theme) => ({
            borderRadius: 1,
            color: "primary.contrastText",
            backgroundColor: "primary.main",
            border: `1px solid ${theme.palette.primary.dark}`,
            "&:hover": { backgroundColor: "primary.dark" },
            "&.Mui-disabled": {
              color: "text.disabled",
              backgroundColor: "action.disabledBackground",
              borderColor: "divider",
            },
          })}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{
          mt: 1,
          pt: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 0.5,
          width: "100%",
        }}
      >
        {DICE_OPTIONS.map((sides) => (
          <Button
            key={sides}
            type="button"
            size="small"
            variant={store.pendingDice[sides] ? "contained" : "outlined"}
            onClick={() => store.addDie(sides)}
            sx={{
              flex: 1,
              minWidth: 0,
              px: 0.5,
              minHeight: 30,
              height: 30,
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            {store.pendingDice[sides]
              ? `${store.pendingDice[sides]}d${sides}`
              : `d${sides}`}
          </Button>
        ))}
        <Button
          type="button"
          size="small"
          variant={store.pendingD100 ? "contained" : "outlined"}
          onClick={() => store.addD100()}
          sx={{
            flex: 1,
            minWidth: 0,
            px: 0.5,
            minHeight: 30,
            height: 30,
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {store.pendingD100 ? `${store.pendingD100}d100` : "d100"}
        </Button>
      </Box>

      <Box
        sx={{
          mt: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
        }}
      >
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => store.decrementModifier()}
          sx={{
            minWidth: 0,
            flex: 1,
            minHeight: 30,
            height: 30,
            lineHeight: 1,
          }}
        >
          -
        </Button>
        <InputBase
          value={store.pendingModifier}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) store.setModifier(next);
          }}
          inputProps={{
            "aria-label": "Roll modifier",
            inputMode: "numeric",
            style: { textAlign: "center" },
          }}
          sx={{
            flex: 1,
            minHeight: 30,
            height: 30,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
          }}
        />
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => store.incrementModifier()}
          sx={{
            minWidth: 0,
            flex: 1,
            minHeight: 30,
            height: 30,
            lineHeight: 1,
          }}
        >
          +
        </Button>
        <IconButton
          size="small"
          type="button"
          onClick={() => store.clearPendingRoll()}
          disabled={!store.hasPendingState}
          aria-label="Clear pending roll"
          sx={{
            flex: 1,
            minHeight: 30,
            height: 30,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          type="button"
          onClick={insertTrayIntoInput}
          disabled={!store.hasPendingRoll}
          aria-label="Insert roll into text"
          sx={{
            flex: 1,
            minHeight: 30,
            height: 30,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <InsertIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
