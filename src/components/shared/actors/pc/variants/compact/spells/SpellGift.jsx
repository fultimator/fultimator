import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add, Message, Remove, RestartAlt } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  lineHeight: 1.35,
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellGift({ spell, setPlayer, classIndex, spellIndex }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  if (!spell) return null;
  const clock = spell.clock || 0;
  const getClockProgress = (c) => (c / 4) * 100;

  const getGiftName = (gift, giftKey, isCustom) =>
    isCustom ? gift.customName : t(giftKey);

  const getGiftEvent = (gift) =>
    gift.event && gift.event.startsWith("esper_event_")
      ? t(gift.event)
      : gift.event || "";

  const getGiftEffect = (gift, isCustom) =>
    isCustom ? gift.effect : t(gift.effect);

  const handleGiftSendToChat = (event, gift, giftKey, isCustom) => {
    event.stopPropagation();
    const giftEvent = getGiftEvent(gift);
    const giftEffect = getGiftEffect(gift, isCustom);
    sendDisplayMessage("spell", getGiftName(gift, giftKey, isCustom), {
      speaker: "",
      description: [
        giftEvent && `**${t("esper_events")}:** ${giftEvent}`,
        giftEffect,
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  };

  const handleClockChange = (newClock) => {
    if (!setPlayer) return;
    const clampedClock = Math.max(0, Math.min(4, newClock));
    setPlayer((prevPlayer) => {
      const newClasses = (prevPlayer.classes || []).map((cls, clsIndex) => {
        const isTargetClass =
          clsIndex === classIndex ||
          (spell.className && cls.name === spell.className);
        if (!isTargetClass) return cls;

        const newSpells = (cls.spells || []).map((s, sIndex) => {
          const isTargetSpell =
            sIndex === spellIndex ||
            (spell.fuid && s.fuid === spell.fuid) ||
            (s.spellType === "gift" &&
              spellIndex === undefined &&
              !spell.fuid);
          return isTargetSpell ? { ...s, clock: clampedClock } : s;
        });

        return { ...cls, spells: newSpells };
      });
      return { ...prevPlayer, classes: newClasses };
    });
  };

  const handleClockReset = () => handleClockChange(0);

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Clock Row */}
        <TableRow
          sx={{
            backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          }}
        >
          <StyledTableCell colSpan={3}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}
            >
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {t("esper_brainwave_clock")}: {clock}/4
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={getClockProgress(clock)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Box sx={{ display: "flex" }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClockReset();
                  }}
                  disabled={clock === 0 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <RestartAlt fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClockChange(clock - 1);
                  }}
                  disabled={clock <= 0 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClockChange(clock + 1);
                  }}
                  disabled={clock >= 4 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </StyledTableCell>
        </TableRow>

        {/* Gifts List */}
        {spell.gifts?.map((gift, index) => {
          const giftKey = gift.key ?? gift.name;
          const isCustom = giftKey === "esper_gift_custom_name";
          return (
            <TableRow
              key={index}
              sx={{
                backgroundImage:
                  index % 2 === 0
                    ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                    : `linear-gradient(to right, ${gradientColor}, ${gradientColor})`,
              }}
            >
              <StyledTableCell sx={{ width: "30%", verticalAlign: "top" }}>
                <Typography sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                  {getGiftName(gift, giftKey, isCustom)}
                </Typography>
                <Box sx={{ mt: 0.5, fontSize: "0.85rem", lineHeight: 1.25 }}>
                  {gift.event ? (
                    <ReactMarkdown
                      components={{ p: (props) => <span {...props} /> }}
                    >
                      {getGiftEvent(gift)}
                    </ReactMarkdown>
                  ) : (
                    "-"
                  )}
                </Box>
              </StyledTableCell>
              <StyledTableCell
                sx={{ width: "70%", fontSize: "0.85rem", verticalAlign: "top" }}
              >
                <ReactMarkdown
                  components={{ p: (props) => <span {...props} /> }}
                >
                  {getGiftEffect(gift, isCustom)}
                </ReactMarkdown>
              </StyledTableCell>
              <StyledTableCell sx={{ width: 32, px: 0.5 }}>
                <Tooltip title={t("Send to Chat")} arrow>
                  <IconButton
                    size="small"
                    sx={{ p: "2px" }}
                    onClick={(event) =>
                      handleGiftSendToChat(event, gift, giftKey, isCustom)
                    }
                  >
                    <Message sx={{ fontSize: "0.9rem" }} />
                  </IconButton>
                </Tooltip>
              </StyledTableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
