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
  Popover,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  PersonOutlineOutlined as PersonOutlineIcon,
  Close as CloseIcon,
  DeleteOutlined as DeleteOutlineIcon,
  KeyboardReturn as InsertIcon,
  SaveAlt as SaveAltIcon,
  Send as SendIcon,
  DescriptionOutlined as DescriptionIcon,
} from "@mui/icons-material";
import { DICE_OPTIONS } from "./constants";
import {
  getActiveCommand,
  matchCommands,
  ACTION_OPTIONS,
} from "./domain/commands";
import { resolveAttributeDie, resolveAttackOptions } from "./domain/speakers";
import type { Command } from "./domain/commands";
import type { Attribute } from "./types";
import { DIFFICULTY_PRESETS } from "./types";
import type { useChatStore } from "./chatStore";
import { t } from "../../../../translation/translate";
import NotesMarkdown from "../../../common/NotesMarkdown";

const ATTRIBUTES: { id: Attribute; label: string }[] = [
  { id: "dex", label: "DEX" },
  { id: "ins", label: "INS" },
  { id: "mig", label: "MIG" },
  { id: "wlp", label: "WLP" },
];

interface ChatComposerProps {
  store: ReturnType<typeof useChatStore>;
  speakerOptions: string[];
  selectedSpeaker: string;
  playerDoc: Record<string, unknown> | null;
  onSpeakerChange: (speaker: string) => void;
  onExport: () => void;
  onClearRequest: () => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  store,
  speakerOptions,
  selectedSpeaker,
  playerDoc,
  onSpeakerChange,
  onExport,
  onClearRequest,
}) => {
  const theme = useTheme();
  const [input, setInput] = useState("");
  const [speakerMenuAnchor, setSpeakerMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [cmdSuggestions, setCmdSuggestions] = useState<Command[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [activeCommand, setActiveCommand] = useState<Command | null>(null);
  const [actionRuleHint, setActionRuleHint] = useState<{
    action: string;
    anchorEl: HTMLElement | null;
  } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const textFieldRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customModRef = useRef<HTMLInputElement>(null);
  const customDlRef = useRef<HTMLInputElement>(null);

  const canSend = Boolean(input.trim()) || store.hasPendingRoll;
  const hasMessages = store.messages.length > 0;
  const blockedCommand =
    activeCommand?.name === "check" && !playerDoc ? activeCommand : null;
  const showPopup =
    cmdSuggestions.length > 0 ||
    (activeCommand !== null && blockedCommand === null);

  // 0 = awaiting primary, 1 = awaiting secondary, 2 = awaiting modifier, 3 = awaiting DL, null = not a check command
  const checkParamIndex: 0 | 1 | 2 | 3 | null =
    activeCommand?.name === "check" && playerDoc !== null
      ? (() => {
          const after = input.slice(input.indexOf(" ") + 1).trimStart();
          const parts = after.trim() ? after.trim().split(/\s+/) : [];
          if (parts.length === 0) return 0;
          if (parts.length === 1) return 1;
          if (parts.length === 2) return 2;
          return 3;
        })()
      : null;

  const showActionPicker =
    activeCommand?.name === "action" &&
    !input.slice(input.indexOf(" ") + 1).trim();

  const getActionRuleDescription = (action: string): string => {
    const actionKey = action.toLowerCase();
    const ruleKey =
      actionKey === "study_roll" ? "study_rule" : `${actionKey}_rule`;
    const translated = t(ruleKey, undefined, true);
    return translated === ruleKey ? "" : translated;
  };

  const applyAction = (action: string) => {
    const next = `/action ${action.toLowerCase()}`;
    // Attack and action-check actions need more inputs, so stay in composer
    if (
      action.toLowerCase() === "attack" ||
      action.toLowerCase() === "hinder" ||
      action.toLowerCase() === "study"
    ) {
      handleInputChange(next + " ");
      requestAnimationFrame(() => textareaRef.current?.focus());
      return;
    }
    sendAndRecord(next);
  };

  // Show weapon/attack picker when "/action attack " is typed (space present, awaiting weapon)
  const actionArgs =
    activeCommand?.name === "action"
      ? input.slice(input.indexOf(" ") + 1).trimStart()
      : "";
  const showWeaponPicker =
    activeCommand?.name === "action" &&
    actionArgs.toLowerCase().startsWith("attack") &&
    actionArgs.slice("attack".length).startsWith(" ") &&
    !actionArgs.slice("attack".length).trim();

  const actionCheckMode: "hinder" | "study" | null =
    activeCommand?.name === "action"
      ? (() => {
          const mode = actionArgs.split(/\s+/)[0]?.toLowerCase();
          return mode === "hinder" || mode === "study" ? mode : null;
        })()
      : null;

  // 0 = awaiting primary, 1 = awaiting secondary, 2 = optional modifier
  const actionCheckParamIndex: 0 | 1 | 2 | null = actionCheckMode
    ? (() => {
        const remainder = actionArgs
          .slice(actionCheckMode.length)
          .trim()
          .toLowerCase();
        const parts = remainder ? remainder.split(/\s+/) : [];
        if (parts.length === 0) return 0;
        if (parts.length === 1) return 1;
        return 2;
      })()
    : null;

  const attackOptions = showWeaponPicker ? resolveAttackOptions(playerDoc) : [];

  const applyWeapon = (arg: string) => {
    sendAndRecord(`/action attack ${arg}`);
  };

  const applyActionCheckAttribute = (attr: Attribute) => {
    const next = input.trimEnd() + " " + attr;
    handleInputChange(next);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const applyStudyDefaultAttributes = () => {
    handleInputChange("/action study ins ins");
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const sendActionCheckWithModifier = (mod?: number) => {
    const parts = input.trimEnd().split(/\s+/);
    const base = parts.slice(0, 4).join(" ");
    if (mod == null) {
      sendAndRecord(base);
      return;
    }
    sendAndRecord(`${base} ${mod > 0 ? "+" : ""}${mod}`);
  };

  const applyCheckAttribute = (attr: Attribute) => {
    const next = input.trimEnd() + " " + attr;
    handleInputChange(next);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const applyCheckModifier = (mod: number) => {
    const parts = input.trimEnd().split(/\s+/);
    const base = parts.slice(0, 3).join(" ");
    const next = `${base} ${mod > 0 ? "+" : ""}${mod}`;
    handleInputChange(next);
  };

  const applyCheckDifficulty = (dl: number | null) => {
    const parts = input.trimEnd().split(/\s+/);
    const base = parts.slice(0, 4).join(" ");
    const next = dl != null ? `${base} ${dl}` : base;
    sendAndRecord(next);
  };

  const openActionHint = () => {
    handleInputChange("/action ");
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const closeActionRuleHint = () => {
    setActionRuleHint(null);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      updatePopupState(input);
    });
  };

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

  const buildTrayExpression = (): string | null => {
    const parts = DICE_OPTIONS.flatMap((s) => {
      const count = store.pendingDice[s] ?? 0;
      return count > 0 ? [`${count}d${s}`] : [];
    });
    if (store.pendingD100 > 0) parts.push(`${store.pendingD100}d100`);
    if (parts.length === 0) return null;
    let expr = parts.join("+");
    if (store.pendingModifier !== 0) {
      expr +=
        store.pendingModifier > 0
          ? `+${store.pendingModifier}`
          : `${store.pendingModifier}`;
    }
    return `/roll ${expr}`;
  };

  const insertTrayIntoInput = () => {
    const token = buildTrayExpression();
    if (!token) return;

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

  const sendAndRecord = (value: string) => {
    store.send(value);
    if (!store.commandError) {
      const entry = value.trim();
      if (entry) setHistory((prev) => [entry, ...prev].slice(0, 50));
      setHistoryIndex(null);
      setInput("");
      dismissPopup();
    }
  };

  const handleSend = () => {
    const trayExpr = !input.trim() ? buildTrayExpression() : null;
    store.send(input);
    if (!store.commandError) {
      const historyEntry = input.trim() || trayExpr;
      if (historyEntry) {
        setHistory((prev) => [historyEntry, ...prev].slice(0, 50));
      }
      setHistoryIndex(null);
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
    if (e.key === "ArrowUp") {
      const el = textareaRef.current;
      const atTop = !el || el.selectionStart === 0;
      if (atTop && history.length > 0) {
        e.preventDefault();
        const next =
          historyIndex === null
            ? 0
            : Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(next);
        handleInputChange(history[next]);
        return;
      }
    }
    if (e.key === "ArrowDown") {
      if (historyIndex !== null) {
        const el = textareaRef.current;
        const atBottom = !el || el.selectionStart === el.value.length;
        if (atBottom) {
          e.preventDefault();
          if (historyIndex === 0) {
            setHistoryIndex(null);
            handleInputChange("");
          } else {
            const next = historyIndex - 1;
            setHistoryIndex(next);
            handleInputChange(history[next]);
          }
          return;
        }
      }
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
        <Button
          size="small"
          variant="outlined"
          onClick={openActionHint}
          sx={{
            flex: 1,
            minWidth: 0,
            justifyContent: "flex-start",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            px: 1,
            py: 0.35,
            color: "text.secondary",
            borderColor: "divider",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "action.hover",
              borderColor: "divider",
            },
          }}
        >
          {selectedSpeaker}
        </Button>
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
            if (actionRuleHint?.anchorEl) return;
            const nextTarget = e.relatedTarget;
            if (
              !nextTarget ||
              !textFieldRef.current?.contains(nextTarget as never)
            ) {
              dismissPopup();
            }
          }}
          onFocus={() => updatePopupState(input)}
        >
          {showPopup && (
            <Paper
              elevation={4}
              onMouseDown={(e) => {
                // Keep composer focus while interacting with hint content.
                e.preventDefault();
              }}
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
                              sx={{
                                fontFamily: "monospace",
                                color:
                                  theme.palette.mode === "dark"
                                    ? "grey.100"
                                    : "text.secondary",
                              }}
                            >
                              {p.required ? `<${p.name}>` : `[${p.name}]`}
                            </Typography>
                          ))}
                        </Box>
                      }
                      secondary={
                        cmd.params[0]?.description
                          ? `${cmd.description}: ${cmd.params[0].description}`
                          : cmd.description
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
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 700,
                                color:
                                  theme.palette.mode === "dark"
                                    ? "#cfe8ff"
                                    : "primary.main",
                              }}
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
                {showActionPicker && (
                  <ListItem sx={{ py: 0.75, px: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 0.5,
                          width: "100%",
                        }}
                      >
                        {ACTION_OPTIONS.map((action) => {
                          const actionKey = action.toLowerCase();
                          const ruleText = getActionRuleDescription(actionKey);
                          return (
                            <Box
                              key={action}
                              sx={{
                                display: "flex",
                                alignItems: "stretch",
                                gap: 0.25,
                              }}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => applyAction(action)}
                                sx={{
                                  flex: 1,
                                  minWidth: 0,
                                  fontFamily: "monospace",
                                  fontSize: "0.7rem",
                                  py: 0.25,
                                  textTransform: "none",
                                }}
                              >
                                {action}
                              </Button>
                              {ruleText && (
                                <IconButton
                                  size="small"
                                  onPointerDown={(e) => e.preventDefault()}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={(e) => {
                                    const anchor = e.currentTarget;
                                    setActionRuleHint({
                                      action: actionKey,
                                      anchorEl: anchor,
                                    });
                                  }}
                                  sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    p: 0.25,
                                  }}
                                >
                                  <DescriptionIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </ListItem>
                )}
                <Popover
                  open={Boolean(actionRuleHint?.anchorEl)}
                  anchorEl={actionRuleHint?.anchorEl}
                  onClose={closeActionRuleHint}
                  hideBackdrop={false}
                  disableAutoFocus
                  disableEnforceFocus
                  disableRestoreFocus
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{
                    backdrop: {
                      sx: { backgroundColor: "rgba(0, 0, 0, 0.45)" },
                    },
                    paper: {
                      sx: {
                        maxWidth: 420,
                        p: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.default",
                      },
                    },
                  }}
                >
                  <NotesMarkdown sx={{ fontSize: "0.8rem", m: 0 }}>
                    {actionRuleHint
                      ? getActionRuleDescription(actionRuleHint.action)
                      : ""}
                  </NotesMarkdown>
                </Popover>
                {showWeaponPicker && (
                  <ListItem sx={{ py: 0.75, px: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      {attackOptions.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          No weapons equipped
                        </Typography>
                      ) : (
                        attackOptions.map((opt) => (
                          <Button
                            key={opt.arg}
                            size="small"
                            variant="outlined"
                            fullWidth
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyWeapon(opt.arg)}
                            sx={{
                              justifyContent: "space-between",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              py: 0.25,
                              px: 1,
                              textTransform: "none",
                            }}
                          >
                            <span>{opt.name}</span>
                            {opt.slot && (
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontFamily: "monospace" }}
                              >
                                {opt.slot}
                              </Typography>
                            )}
                          </Button>
                        ))
                      )}
                    </Box>
                  </ListItem>
                )}
                {(checkParamIndex === 0 || checkParamIndex === 1) && (
                  <ListItem sx={{ py: 0.75, px: 1 }}>
                    <Box sx={{ display: "flex", gap: 0.5, width: "100%" }}>
                      {ATTRIBUTES.map(({ id, label }) => (
                        <Button
                          key={id}
                          size="small"
                          variant="outlined"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyCheckAttribute(id)}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            fontFamily: "monospace",
                            fontSize: "0.7rem",
                            py: 0.25,
                          }}
                        >
                          {label} d{resolveAttributeDie(playerDoc, id)}
                        </Button>
                      ))}
                    </Box>
                  </ListItem>
                )}
                {(actionCheckParamIndex === 0 ||
                  actionCheckParamIndex === 1) && (
                  <ListItem sx={{ py: 0.75, px: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5, width: "100%" }}>
                        {ATTRIBUTES.map(({ id, label }) => (
                          <Button
                            key={id}
                            size="small"
                            variant="outlined"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyActionCheckAttribute(id)}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              py: 0.25,
                            }}
                          >
                            {label} d{resolveAttributeDie(playerDoc, id)}
                          </Button>
                        ))}
                      </Box>
                      {actionCheckMode === "study" &&
                        actionCheckParamIndex === 0 && (
                          <Button
                            size="small"
                            variant="outlined"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={applyStudyDefaultAttributes}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              py: 0.25,
                              textTransform: "none",
                            }}
                          >
                            Use default (INS + INS)
                          </Button>
                        )}
                    </Box>
                  </ListItem>
                )}
                {checkParamIndex === 2 && (
                  <ListItem sx={{ py: 0.75, px: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5, width: "100%" }}>
                        {[-3, -2, -1, 0, 1, 2, 3].map((mod) => (
                          <Button
                            key={mod}
                            size="small"
                            variant="outlined"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyCheckModifier(mod)}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              py: 0.25,
                              px: 0,
                            }}
                          >
                            {mod > 0 ? `+${mod}` : mod}
                          </Button>
                        ))}
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <InputBase
                          inputRef={customModRef}
                          size="small"
                          placeholder="custom mod"
                          inputProps={{
                            inputMode: "numeric",
                            style: {
                              textAlign: "center",
                              fontSize: "0.75rem",
                              padding: "2px 4px",
                            },
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = parseInt(
                                (e.target as HTMLInputElement).value,
                                10,
                              );
                              applyCheckModifier(Number.isNaN(val) ? 0 : val);
                            }
                          }}
                          sx={{
                            flex: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            px: 0.5,
                            height: 26,
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            const val = parseInt(
                              customModRef.current?.value ?? "",
                              10,
                            );
                            applyCheckModifier(Number.isNaN(val) ? 0 : val);
                          }}
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.7rem",
                            py: 0.25,
                            px: 1,
                          }}
                        >
                          next
                        </Button>
                      </Box>
                    </Box>
                  </ListItem>
                )}
                {actionCheckParamIndex === 2 && (
                  <ListItem sx={{ py: 0.75, px: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5, width: "100%" }}>
                        {[-3, -2, -1, 0, 1, 2, 3].map((mod) => (
                          <Button
                            key={mod}
                            size="small"
                            variant="outlined"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => sendActionCheckWithModifier(mod)}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              py: 0.25,
                              px: 0,
                            }}
                          >
                            {mod > 0 ? `+${mod}` : mod}
                          </Button>
                        ))}
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => sendActionCheckWithModifier()}
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.7rem",
                          py: 0.25,
                          textTransform: "none",
                        }}
                      >
                        Roll without mod
                      </Button>
                    </Box>
                  </ListItem>
                )}
                {checkParamIndex === 3 && (
                  <ListItem sx={{ py: 0.75, px: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Difficulty
                      </Typography>
                      {DIFFICULTY_PRESETS.map(({ value, label }) => (
                        <Button
                          key={value}
                          size="small"
                          variant="outlined"
                          fullWidth
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyCheckDifficulty(value)}
                          sx={{
                            justifyContent: "space-between",
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            py: 0.25,
                            px: 1,
                          }}
                        >
                          <span>{value}</span>
                          <span>{label}</span>
                        </Button>
                      ))}
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <InputBase
                          inputRef={customDlRef}
                          size="small"
                          placeholder="custom DL"
                          inputProps={{
                            inputMode: "numeric",
                            style: {
                              textAlign: "center",
                              fontSize: "0.75rem",
                              padding: "2px 4px",
                            },
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = parseInt(
                                (e.target as HTMLInputElement).value,
                                10,
                              );
                              if (!Number.isNaN(val)) applyCheckDifficulty(val);
                            }
                          }}
                          sx={{
                            flex: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            px: 0.5,
                            height: 26,
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            const val = parseInt(
                              customDlRef.current?.value ?? "",
                              10,
                            );
                            if (!Number.isNaN(val)) applyCheckDifficulty(val);
                          }}
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.7rem",
                            py: 0.25,
                            px: 1,
                          }}
                        >
                          roll
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyCheckDifficulty(null)}
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.7rem",
                            py: 0.25,
                            px: 1,
                            color: "text.secondary",
                          }}
                        >
                          open
                        </Button>
                      </Box>
                    </Box>
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
          {blockedCommand && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 0.75, display: "block", px: 0.5 }}
            >
              Switch to a character speaker to roll a check.
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
