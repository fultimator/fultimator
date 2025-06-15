import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Collapse,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { format, isToday } from "date-fns";
import { useTheme } from "@mui/material/styles";
import DragHandleIcon from "@mui/icons-material/DragHandle"; // Handle icon
import { TypeIcon } from "../../components/types";
import {
  DistanceIcon,
  MeleeIcon,
  OffensiveSpellIcon,
  SpellIcon,
} from "../icons.jsx";
import { GiDeathSkull } from "react-icons/gi";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { t } from "../../translation/translate";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Define the mapping of tags to components
const tagMap = {
  "{{physical-icon}}": (
    <TypeIcon type={"physical"} sx={{ verticalAlign: "middle" }} />
  ),
  "{{wind-icon}}": <TypeIcon type={"wind"} sx={{ verticalAlign: "middle" }} />,
  "{{bolt-icon}}": <TypeIcon type={"bolt"} sx={{ verticalAlign: "middle" }} />,
  "{{dark-icon}}": <TypeIcon type={"dark"} sx={{ verticalAlign: "middle" }} />,
  "{{earth-icon}}": (
    <TypeIcon type={"earth"} sx={{ verticalAlign: "middle" }} />
  ),
  "{{fire-icon}}": <TypeIcon type={"fire"} sx={{ verticalAlign: "middle" }} />,
  "{{ice-icon}}": <TypeIcon type={"ice"} sx={{ verticalAlign: "middle" }} />,
  "{{light-icon}}": (
    <TypeIcon type={"light"} sx={{ verticalAlign: "middle" }} />
  ),
  "{{poison-icon}}": (
    <TypeIcon type={"poison"} sx={{ verticalAlign: "middle" }} />
  ),
  "{{ranged-icon}}": <DistanceIcon sx={{ verticalAlign: "middle" }} />,
  "{{melee-icon}}": <MeleeIcon sx={{ verticalAlign: "middle" }} />,
  "{{offensive-spell-icon}}": (
    <OffensiveSpellIcon sx={{ verticalAlign: "middle" }} />
  ),
  "{{spell-icon}}": <SpellIcon sx={{ verticalAlign: "middle" }} />,
  "{{fainted-icon}}": <GiDeathSkull sx={{ verticalAlign: "middle" }} />,
  "{{crit-failure}}": <b style={{ color: "red" }}>{t("Critical Failure")}</b>,
  "{{crit-success}}": <b style={{ color: "green" }}>{t("Critical Success")}</b>,
};

const SpanMarkdown = ({ children, ...props }) => {
  return (
    <span
      style={{
        whiteSpace: "pre-line",
        display: "inline",
        margin: 0,
        padding: 0,
      }}
    >
      <ReactMarkdown
        {...props}
        components={{
          p: ({ ...props }) => <span {...props} />, // Render <p> as <span>
          strong: ({ ...props }) => (
            <strong style={{ fontWeight: "bold" }} {...props} />
          ),
          em: ({ ...props }) => (
            <em style={{ fontStyle: "italic" }} {...props} />
          ),
          span: ({ ...props }) => <span {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </span>
  );
};

function replaceTagsWithComponents(
  text,
  value1,
  value2,
  value3,
  value4,
  value5
) {
  if (value1 === "--isAttack--") {
    return t(text)
      .split(/(\{\{.*?\}\})/)
      .map((part) => {
        if (part === "{{npc-name}}") {
          return <b>{value2.npcName}</b>; // Return npcName wrapped in <b> tags
        }
        if (part === "{{attack-name}}") {
          return <b>{value2.attackName}</b>; // Return attackName wrapped in <b> tags
        }
        if (part === "{{dice1}}") {
          return <b>{value2.dice1}</b>;
        }
        if (part === "{{dice2}}") {
          return <b>{value2.dice2}</b>;
        }
        if (part === "{{prec}}") {
          return <b>{value2.prec}</b>;
        }
        if (part === "{{total-hit-score}}") {
          return <b>{value2.totalHitScore}</b>;
        }
        if (part === "{{hr}}") {
          return <b>{value2.hr}</b>; // Return hr wrapped in <b> tags
        }
        if (part === "{{extra-damage}}") {
          return <b>{value2.extraDamage}</b>; // Return extra damage wrapped in <b> tags
        }
        if (part === "{{damage}}") {
          return <b>{value2.damage}</b>; // Return damage wrapped in <b> tags
        }
        if (part === "{{attack-range-icon}}") {
          if (value2.range === "melee") {
            return <MeleeIcon sx={{ verticalAlign: "middle" }} />;
          } else {
            return <DistanceIcon sx={{ verticalAlign: "middle" }} />;
          }
        }
        if (part === "{{damage-type-icon}}") {
          return (
            <TypeIcon
              type={value2.damageType}
              sx={{ verticalAlign: "middle" }}
            />
          );
        }
        if (part === "{{damage-type}}") {
          return <b>{t(value2.damageType)}</b>;
        }
        if (part === "{{effect}}") {
          return (
            <SpanMarkdown>
              {typeof value2.effect === "string" ? value2.effect : ""}
            </SpanMarkdown>
          );
        }

        // Return the part as it is if no match
        return part;
      });
  } else if (value1 === "--isSpell--") {
    return t(text)
      .split(/(\{\{.*?\}\})/)
      .map((part) => {
        if (part === "{{npc-name}}") {
          return <b>{value2.npcName}</b>; // Return npcName wrapped in <b> tags
        }
        if (part === "{{spell-name}}") {
          return <b>{value2.spellName}</b>;
        }
        if (part === "{{dice1}}") {
          return <b>{value2.dice1}</b>;
        }
        if (part === "{{dice2}}") {
          return <b>{value2.dice2}</b>;
        }
        if (part === "{{extra-magic}}") {
          return <b>{value2.extraMagic}</b>;
        }
        if (part === "{{total-hit-score}}") {
          return <b>{value2.totalHitScore}</b>;
        }
        if (part === "{{hr}}") {
          return <b>{value2.hr}</b>; // Return hr wrapped in <b> tags
        }
        if (part === "{{offensive-spell-icon}}") {
          return <OffensiveSpellIcon sx={{ verticalAlign: "middle" }} />;
        }
        if (part === "{{targets}}") {
          return <b>{value2.targets}</b>;
        }
        if (part === "{{effect}}") {
          return (
            <SpanMarkdown>
              {typeof value2.effect === "string" ? value2.effect : ""}
            </SpanMarkdown>
          );
        }

        // Return the part as it is if no match
        return part;
      });
  } else if (value1 === "--isStandardRoll--") {
    return t(text)
      .split(/(\{\{.*?\}\})/)
      .map((part) => {
        if (part === "{{npc-name}}") {
          return <b>{value2.npcName}</b>; // Return npcName wrapped in <b> tags
        }
        if (part === "{{dice1}}") {
          return <b>{value2.dice1}</b>;
        }
        if (part === "{{dice2}}") {
          return <b>{value2.dice2}</b>;
        }
        if (part === "{{dice1-label}}") {
          return <b>{t(value2.dice1Label)}</b>;
        }
        if (part === "{{dice2-label}}") {
          return <b>{t(value2.dice2Label)}</b>;
        }
        if (part === "{{total-hit-score}}") {
          return <b>{value2.totalHitScore}</b>;
        }

        // Return the part as it is if no match
        return part;
      });
  } else if (value1 === "--isClock--") {
    return t(text)
      .split(/(\{\{.*?\}\})/)
      .map((part) => {
        // If the part matches the value placeholders, replace with actual values
        if (part === "{{name}}") {
          return <b>{value2.name}</b>; // Return value2 wrapped in <b> tags
        }
        if (part === "{{current}}") {
          return <b>{value2.current}</b>; // Return value2 wrapped in <b> tags
        }
        if (part === "{{max}}") {
          return <b>{value2.max}</b>; // Return value2 wrapped in <b> tags
        }

        // Return the part as it is if no match
        return part;
      });
  } else {
    // Use a regular expression to replace tags with the corresponding component
    return t(text)
      .split(/(\{\{.*?\}\})/)
      .map((part) => {
        // If the part matches the value placeholders, replace with actual values
        if (part === "{{value1}}") {
          return <b>{value1}</b>; // Return value1 wrapped in <b> tags
        }
        if (part === "{{value2}}") {
          return <b>{value2}</b>; // Return value2 wrapped in <b> tags
        }
        if (part === "{{value3}}") {
          return <b>{t(value3)}</b>; // Return translated value3 wrapped in <b> tags
        }
        if (part === "{{value4}}") {
          // if value4 is object and markdown is true, render it as a markdown component
          if (typeof value4 === "object" && value4.markdown) {
            return (
              <SpanMarkdown>
                {typeof value4.effect === "string" ? value4.effect : ""}
              </SpanMarkdown>
            );
          }

          return <b>{value4}</b>; // Return value4 wrapped in <b> tags
        }
        if (part === "{{value5}}") {
          return <b>{value5}</b>; // Return value5 wrapped in <b> tags
        }
        if (part === "{{attack-range-icon}}" && value2) {
          return <TypeIcon type={value2} sx={{ verticalAlign: "middle" }} />;
        }

        if (part === "{{attack-type-icon}}" && value3) {
          return <TypeIcon type={value3} sx={{ verticalAlign: "middle" }} />;
        }

        // Otherwise, check if it's a tag that maps to an icon or other component
        if (tagMap[part]) {
          return tagMap[part]; // Replace with the corresponding component if tag matches
        }

        // Return the part as it is if no match
        return part;
      });
  }
}

export default function CombatLog({
  isMobile,
  logs = [],
  open: controlledOpen = false,
  onToggle = () => {},
  clearLogs,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Detects small screens

  // Sort logs in descending order (newest first)
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  const [open, setOpen] = useState(controlledOpen);
  const [height, setHeight] = useState(isSmallScreen ? 150 : 200);
  const logContainerRef = useRef(null);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(height);

  const toggleLog = () => {
    const newOpen = !open;
    setOpen(newOpen);
    onToggle(newOpen); // Notify parent of the change
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = 0; // Scroll to top (latest log first)
      }
    }, 100);
  };

  const handleMouseDown = (e) => {
    if (isSmallScreen) return; // Disable resizing on mobile
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = height;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current || isSmallScreen) return;

    const deltaY = e.clientY - startY.current;
    const newHeight = Math.max(
      100,
      Math.min(400, startHeight.current - deltaY)
    );
    setHeight(newHeight);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (controlledOpen !== open) {
      setOpen(controlledOpen); // Sync with parent prop
    }
    if (open && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // Scroll to top when new logs are added
    }
  }, [controlledOpen, open, logs]); // Re-run the effect when logs, controlledOpen, or open changes

  // Add this function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Optional: Show toast notification or some feedback
        // Example: enqueueSnackbar(t("copied_to_clipboard"), { variant: "success" });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Add this function to convert formatted log text to plain text
  // Improved function to convert formatted log text to plain text
  const getPlainTextLog = (text, value1, value2, value3, value4, value5) => {
    // Start with the original text template
    let plainText = t(text);

    // Handle special case for attack logs
    if (value1 === "--isAttack--") {
      // Replace attack tags with their text values
      plainText = plainText.replace(/\{\{npc-name\}\}/g, value2.npcName);
      plainText = plainText.replace(/\{\{attack-name\}\}/g, value2.attackName);
      plainText = plainText.replace(/\{\{dice1\}\}/g, value2.dice1);
      plainText = plainText.replace(/\{\{dice2\}\}/g, value2.dice2);
      plainText = plainText.replace(/\{\{prec\}\}/g, value2.prec);
      plainText = plainText.replace(
        /\{\{total-hit-score\}\}/g,
        value2.totalHitScore
      );
      plainText = plainText.replace(/\{\{hr\}\}/g, value2.hr);
      plainText = plainText.replace(
        /\{\{extra-damage\}\}/g,
        value2.extraDamage
      );
      plainText = plainText.replace(/\{\{damage\}\}/g, value2.damage);
      plainText = plainText.replace(
        /\{\{damage-type\}\}/g,
        t(value2.damageType)
      );

      // Replace icons with text descriptions
      plainText = plainText.replace(
        /\{\{attack-range-icon\}\}/g,
        value2.range === "melee" ? "" : ""
      );
      plainText = plainText.replace(/\{\{damage-type-icon\}\}/g, "");

      // Handle effect text
      plainText = plainText.replace(/\{\{effect\}\}/g, value2.effect);
    }
    // Handle special case for spell logs
    else if (value1 === "--isSpell--") {
      // Replace spell tags with their text values
      plainText = plainText.replace(/\{\{npc-name\}\}/g, value2.npcName);
      plainText = plainText.replace(/\{\{spell-name\}\}/g, value2.spellName);
      plainText = plainText.replace(/\{\{dice1\}\}/g, value2.dice1);
      plainText = plainText.replace(/\{\{dice2\}\}/g, value2.dice2);
      plainText = plainText.replace(/\{\{extra-magic\}\}/g, value2.extraMagic);
      plainText = plainText.replace(
        /\{\{total-hit-score\}\}/g,
        value2.totalHitScore
      );
      plainText = plainText.replace(/\{\{hr\}\}/g, value2.hr);
      plainText = plainText.replace(/\{\{targets\}\}/g, value2.targets);

      // Replace icons with text descriptions
      plainText = plainText.replace(/\{\{offensive-spell-icon\}\}/g, "");

      // Handle effect text
      plainText = plainText.replace(/\{\{effect\}\}/g, value2.effect);
    }
    // Handle special case for standard roll logs
    else if (value1 === "--isStandardRoll--") {
      plainText = plainText.replace(/\{\{npc-name\}\}/g, value2.npcName);
      plainText = plainText.replace(/\{\{dice1\}\}/g, value2.dice1);
      plainText = plainText.replace(/\{\{dice2\}\}/g, value2.dice2);
      plainText = plainText.replace(
        /\{\{dice1-label\}\}/g,
        t(value2.dice1Label)
      );
      plainText = plainText.replace(
        /\{\{dice2-label\}\}/g,
        t(value2.dice2Label)
      );
      plainText = plainText.replace(
        /\{\{total-hit-score\}\}/g,
        value2.totalHitScore
      );
    }
    // Handle special case for clock logs
    else if (value1 === "--isClock--") {
      plainText = plainText.replace(/\{\{name\}\}/g, value2.name);
      plainText = plainText.replace(/\{\{current\}\}/g, value2.current);
      plainText = plainText.replace(/\{\{max\}\}/g, value2.max);
    }
    // Handle general case for other logs
    else {
      // Replace value placeholders
      if (value1) plainText = plainText.replace(/\{\{value1\}\}/g, value1);
      if (value2) plainText = plainText.replace(/\{\{value2\}\}/g, value2);
      if (value3) plainText = plainText.replace(/\{\{value3\}\}/g, t(value3));

      // Handle value4 which might be an object with markdown
      if (value4) {
        if (typeof value4 === "object" && value4.markdown) {
          plainText = plainText.replace(/\{\{value4\}\}/g, value4.effect);
        } else {
          plainText = plainText.replace(/\{\{value4\}\}/g, value4);
        }
      }

      if (value5) plainText = plainText.replace(/\{\{value5\}\}/g, value5);

      // Replace icon tags with text descriptions
      if (value2)
        plainText = plainText.replace(
          /\{\{attack-range-icon\}\}/g,
          `[${value2}]`
        );
      if (value3)
        plainText = plainText.replace(
          /\{\{attack-type-icon\}\}/g,
          `[${t(value3)}]`
        );
    }

    // Replace other standard icon tags from tagMap with text equivalents
    plainText = plainText.replace(/\{\{physical-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{wind-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{bolt-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{dark-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{earth-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{fire-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{ice-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{light-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{poison-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{ranged-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{melee-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{offensive-spell-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{spell-icon\}\}/g, "");
    plainText = plainText.replace(/\{\{fainted-icon\}\}/g, "");
    plainText = plainText.replace(
      /\{\{crit-failure\}\}/g,
      t("Critical Failure")
    );
    plainText = plainText.replace(
      /\{\{crit-success\}\}/g,
      t("Critical Success")
    );

    // Replace any remaining markdown syntax or double asterisks with appropriate text formatting
    plainText = plainText.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold formatting

    return plainText;
  };

  return (
    <Box sx={{ mt: 2, width: "100%", mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          onClick={toggleLog}
          size={isMobile ? "small" : "medium"}
          fullWidth
          startIcon={open ? <ExpandMore /> : <ExpandLess />}
        >
          {open ? t("combat_sim_log_hide") : t("combat_sim_log_show")}
        </Button>

        {/* Clear Logs Button (Only visible if expanded) */}
        {open && (
          <Tooltip title={t("combat_sim_log_clear")} placement="top">
            <Button
              onClick={clearLogs}
              size="small"
              sx={{
                minWidth: "auto",
                padding: 0,
                marginLeft: 1,
                color: isDarkMode ? "#ddd" : "#555",
              }}
            >
              <DeleteSweepIcon />
            </Button>
          </Tooltip>
        )}
      </Box>

      <Collapse in={open}>
        {/* Resize Handle (Hidden on Mobile) */}
        {!isSmallScreen && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "ns-resize",
              backgroundColor: isDarkMode ? "#555" : "#ccc",
              borderRadius: "8px 8px 0 0",
              py: 0.5,
              mt: 1,
              "&:hover": { backgroundColor: isDarkMode ? "#777" : "#aaa" },
            }}
            onMouseDown={handleMouseDown}
          >
            <DragHandleIcon
              fontSize="small"
              sx={{ color: isDarkMode ? "#ddd" : "#555", m: -1 }}
            />
          </Box>
        )}

        {/* Combat Log Panel */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            height: isSmallScreen ? 150 : height, // Fixed height on mobile
            overflowY: "auto",
            backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
            borderRadius: "0 0 8px 8px",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: 3,
            },
          }}
          ref={logContainerRef}
        >
          {sortedLogs.map((log, index) => {
            // Process the log text to get the plain text version for copying
            const plainTextLog = getPlainTextLog(
              log.text,
              log.value1,
              log.value2,
              log.value3,
              log.value4,
              log.value5
            );

            return (
              <Box
                key={index}
                sx={{
                  mb: 1,
                  position: "relative",
                  p: 0.5,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {isToday(log.timestamp)
                      ? format(log.timestamp, "HH:mm:ss")
                      : format(log.timestamp, "PP HH:mm:ss")}
                  </Typography>
                  <Tooltip
                    title={t("combat_sim_copy_log_entry")}
                    placement="top"
                  >
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(plainTextLog)}
                      sx={{
                        ml: 1,
                        p: 0.5,
                        opacity: 0.6,
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2">
                  {/* Replace tags in log.text with actual components */}
                  {replaceTagsWithComponents(
                    log.text,
                    log.value1,
                    log.value2,
                    log.value3,
                    log.value4,
                    log.value5
                  ).map((part, idx) =>
                    typeof part === "string" ? (
                      <span key={idx}>{part}</span>
                    ) : (
                      <span key={idx}>{part}</span>
                    )
                  )}
                </Typography>
              </Box>
            );
          })}
          {sortedLogs.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              {t("combat_sim_log_empty")}
            </Typography>
          )}
        </Paper>
      </Collapse>
    </Box>
  );
}
