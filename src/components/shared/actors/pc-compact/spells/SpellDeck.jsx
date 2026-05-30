import { useState, useCallback } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  GetApp,
  Shuffle,
  Refresh,
  Delete,
  NewReleases,
  Air,
  Terrain,
  LocalFireDepartment,
  AcUnit,
  Casino,
  Warning,
  Lightbulb,
  CheckCircle,
  AutoFixHigh,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellDeck({ spell, setPlayer, _isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const [trapCardDialogOpen, setTrapCardDialogOpen] = useState(false);
  const [combatLog, setCombatLog] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [potentialSet, setPotentialSet] = useState(null);

  // helpers

  const generateShuffledDeck = useCallback(() => {
    const newDeck = [];
    newDeck.push({ isJoker: true });
    newDeck.push({ isJoker: true });
    ["Air", "Earth", "Fire", "Ice"].forEach((suit) => {
      for (let value = 1; value <= 7; value++) {
        newDeck.push({ isJoker: false, suit, value });
      }
    });
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }, []);

  const getSuitIcon = (suit) =>
    ({ Air: "♢", Earth: "♣", Fire: "♡", Ice: "♠" })[suit] || "?";

  const getSuitColor = (suit) =>
    ({ Air: "#87CEEB", Earth: "#8B4513", Fire: "#FF4500", Ice: "#4682B4" })[
      suit
    ] || theme.primary;

  const getSuitMuiIcon = (suit) =>
    ({ Air: Air, Earth: Terrain, Fire: LocalFireDepartment, Ice: AcUnit })[
      suit
    ] || Casino;

  // derived state

  const cardsInDeck =
    spell.fullDeck?.length ??
    (spell.cardsInDeck !== undefined ? spell.cardsInDeck : 30);
  const hand = spell.hand || [];
  const discardPile = spell.discardPile || [];
  const totalTracked = cardsInDeck + hand.length + discardPile.length;

  // deck actions

  // Matches SpellGift's pattern: scope to the spell's class by className,
  // then match the spell by spellType === "deck".
  const handleUpdate = useCallback(
    (patch) => {
      if (!setPlayer) return;
      setPlayer((prev) => ({
        ...prev,
        classes: prev.classes.map((cls) => {
          if (cls.name !== spell.className) return cls;
          return {
            ...cls,
            spells: cls.spells.map((s) =>
              s.spellType === "deck" ? { ...s, ...patch } : s,
            ),
          };
        }),
      }));
    },
    [spell.className, setPlayer],
  );

  const drawCards = (num = 1) => {
    let currentFullDeck = spell.fullDeck || [];
    if (currentFullDeck.length === 0 && cardsInDeck > 0) {
      currentFullDeck = generateShuffledDeck();
    }
    if (currentFullDeck.length <= 0) return;
    const count = Math.min(num, currentFullDeck.length);
    const drawn = currentFullDeck.slice(0, count);
    const remaining = currentFullDeck.slice(count);
    handleUpdate({
      fullDeck: remaining,
      cardsInDeck: remaining.length,
      hand: [...hand, ...drawn],
    });
  };

  const discardHand = () => {
    handleUpdate({
      hand: [],
      discardPile: [...discardPile, ...hand],
    });
    setSelectedCards([]);
    setPotentialSet(null);
  };

  const shuffleDeck = () => {
    if (discardPile.length === 0) return;
    const combined = [...(spell.fullDeck || []), ...discardPile];
    const shuffled = [...combined];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    handleUpdate({
      fullDeck: shuffled,
      cardsInDeck: shuffled.length,
      discardPile: [],
    });
  };

  const resetDeck = () => {
    const fresh = generateShuffledDeck();
    handleUpdate({
      fullDeck: fresh,
      cardsInDeck: 30,
      hand: [],
      discardPile: [],
    });
    setCombatLog([]);
  };

  const handleTrapCard = (suit) => {
    setTrapCardDialogOpen(false);
    let currentFullDeck = spell.fullDeck || [];
    if (currentFullDeck.length === 0 && cardsInDeck > 0) {
      currentFullDeck = generateShuffledDeck();
    }
    if (currentFullDeck.length <= 0) return;

    const revealed = currentFullDeck[0];
    const remaining = currentFullDeck.slice(1);
    const success = revealed.isJoker || revealed.suit === suit;

    handleUpdate({
      fullDeck: remaining,
      cardsInDeck: remaining.length,
      discardPile: [...discardPile, revealed],
    });

    const resultLabel = revealed.isJoker
      ? t("ace_joker_abbr")
      : `${revealed.value}${getSuitIcon(revealed.suit)}`;
    setCombatLog((prev) => [
      {
        id: Date.now(),
        setType: "Trap Card",
        cards: [revealed],
        effect: `${t("ace_trap_card")}: ${suit} → ${resultLabel} ${success ? "✓" : "✗"}`,
        isTrap: true,
        success,
      },
      ...prev.slice(0, 4),
    ]);
  };

  const detectSet = useCallback((cards) => {
    if (!cards || cards.length < 2) return null;
    const sorted = [...cards].sort((a, b) => {
      const av = a.isJoker ? a.jokerValue || 1 : a.value;
      const bv = b.isJoker ? b.jokerValue || 1 : b.value;
      return av - bv;
    });
    const valueGroups = {};
    const suitGroups = {};
    sorted.forEach((card) => {
      const v = card.isJoker ? card.jokerValue || 1 : card.value;
      const s = card.isJoker ? card.jokerSuit || "Air" : card.suit;
      if (!valueGroups[v]) valueGroups[v] = [];
      if (!suitGroups[s]) suitGroups[s] = [];
      valueGroups[v].push(card);
      suitGroups[s].push(card);
    });
    const values = Object.keys(valueGroups)
      .map(Number)
      .sort((a, b) => a - b);
    const valueCounts = Object.values(valueGroups).map((g) => g.length);
    const suits = Object.keys(suitGroups);
    if (
      cards.length === 4 &&
      valueCounts.includes(4) &&
      !cards.some((c) => c.isJoker)
    )
      return { type: "Jackpot", cards: sorted };
    if (cards.length === 4 && suits.length === 1 && areConsecutive(values))
      return { type: "Magic Flush", cards: sorted };
    if (cards.length === 4 && areConsecutive(values))
      return { type: "Blinding Flush", cards: sorted };
    if (cards.length === 5) {
      const counts = valueCounts.slice().sort((a, b) => b - a);
      if (counts[0] === 3 && counts[1] === 2)
        return { type: "Full Status", cards: sorted };
    }
    if (cards.length === 3 && valueCounts.includes(3))
      return { type: "Triple Support", cards: sorted };
    if (cards.length === 4) {
      const pairs = valueCounts.filter((c) => c === 2);
      if (pairs.length === 2) return { type: "Double Trouble", cards: sorted };
    }
    if (cards.length === 2 && valueCounts.includes(2))
      return { type: "Magic Pair", cards: sorted };
    return null;
  }, []);

  const getSetEffect = (setType, cards) => {
    const totalValue = cards.reduce(
      (sum, card) => sum + (card.isJoker ? card.jokerValue || 1 : card.value),
      0,
    );
    const highestValue = Math.max(
      ...cards.map((card) =>
        card.isJoker ? card.jokerValue || 1 : card.value,
      ),
    );
    switch (setType) {
      case "Jackpot":
        return t("ace_jackpot_enriched");
      case "Magic Flush": {
        const suit = cards[0].isJoker
          ? cards[0].jokerSuit || "Air"
          : cards[0].suit;
        return t("ace_magic_flush_enriched", [
          25 + totalValue,
          suit.toLowerCase(),
        ]);
      }
      case "Blinding Flush": {
        const isEven = totalValue % 2 === 0;
        return isEven
          ? t("ace_blinding_flush_desc_light_enriched", [15 + totalValue])
          : t("ace_blinding_flush_desc_dark_enriched", [15 + totalValue]);
      }
      case "Full Status": {
        const isEven = highestValue % 2 === 0;
        return isEven
          ? t("ace_effect_full_status_even_enriched", [highestValue])
          : t("ace_effect_full_status_odd_enriched", [highestValue]);
      }
      case "Triple Support":
        return t("ace_triple_support_enriched", [totalValue * 3]);
      case "Double Trouble":
        return t("ace_double_trouble_enriched", [10 + highestValue]);
      case "Magic Pair":
        return t("ace_magic_pair_enriched");
      default:
        return t("ace_unknown_effect");
    }
  };

  const handleCardToggle = (card, index) => {
    const cardWithId = { ...card, uniqueId: index };
    const already = selectedCards.findIndex((c) => c.uniqueId === index);
    let next;
    if (already >= 0) {
      next = selectedCards.filter((c) => c.uniqueId !== index);
    } else {
      next = [...selectedCards, cardWithId];
    }
    setSelectedCards(next);
    setPotentialSet(detectSet(next));
  };

  const resolveSet = () => {
    if (!potentialSet) return;
    const selectedIndices = selectedCards.map((c) => c.uniqueId);
    const newHand = hand.filter((_, i) => !selectedIndices.includes(i));
    const cardsToDiscard = hand.filter((_, i) => selectedIndices.includes(i));
    const newDiscardPile = [...discardPile, ...cardsToDiscard];
    setCombatLog((prev) => [
      {
        id: Date.now(),
        setType: potentialSet.type,
        cards: cardsToDiscard,
        effect: getSetEffect(potentialSet.type, cardsToDiscard),
        isTrap: false,
      },
      ...prev.slice(0, 4),
    ]);
    handleUpdate({ hand: newHand, discardPile: newDiscardPile });
    setSelectedCards([]);
    setPotentialSet(null);
  };

  const areConsecutive = (values) => {
    for (let i = 1; i < values.length; i++) {
      if (values[i] - values[i - 1] !== 1) return false;
    }
    return true;
  };

  const generateCardCombinations = (cards, size) => {
    if (size === 1) return cards.map((card) => [card]);
    if (size > cards.length) return [];
    const combinations = [];
    for (let i = 0; i <= cards.length - size; i++) {
      const rest = cards.slice(i + 1);
      generateCardCombinations(rest, size - 1).forEach((combo) => {
        combinations.push([cards[i], ...combo]);
      });
    }
    return combinations;
  };

  const detectPossibleSets = (currentHand) => {
    if (!currentHand || currentHand.length < 2) return [];
    const allSuggestions = [];
    const valueGroups = {};
    const suitGroups = {};

    currentHand.forEach((card, index) => {
      const value = card.isJoker ? "joker" : card.value;
      const suit = card.isJoker ? "joker" : card.suit;
      if (!valueGroups[value]) valueGroups[value] = [];
      if (!suitGroups[suit]) suitGroups[suit] = [];
      valueGroups[value].push({ ...card, handIndex: index });
      suitGroups[suit].push({ ...card, handIndex: index });
    });

    const findAllConsecutiveSequences = (cards, length) => {
      const sequences = [];
      const nonJokers = cards.filter((c) => !c.isJoker);
      if (nonJokers.length >= length) {
        generateCardCombinations(nonJokers, length).forEach((combo) => {
          const sorted = [...combo].sort((a, b) => a.value - b.value);
          let consecutive = true;
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].value !== sorted[i - 1].value + 1) {
              consecutive = false;
              break;
            }
          }
          if (consecutive) sequences.push(sorted);
        });
      }
      return sequences;
    };

    // Jackpot
    Object.entries(valueGroups).forEach(([value, cards]) => {
      if (cards.length >= 4 && value !== "joker") {
        generateCardCombinations(cards, 4).forEach((combo) => {
          allSuggestions.push({
            type: "Jackpot",
            cards: combo,
            priority: 6,
            id: `jackpot-${value}-${combo.map((c) => c.handIndex).join("-")}`,
          });
        });
      }
    });

    // Magic Flush
    Object.entries(suitGroups).forEach(([suit, cards]) => {
      if (cards.length >= 4 && suit !== "joker") {
        findAllConsecutiveSequences(cards, 4).forEach((seq, i) => {
          allSuggestions.push({
            type: "Magic Flush",
            cards: seq,
            priority: 5,
            id: `magic-flush-${suit}-${i}-${seq.map((c) => c.handIndex).join("-")}`,
          });
        });
      }
    });

    // Blinding Flush
    const allNonJokers = currentHand
      .map((card, index) => ({ ...card, handIndex: index }))
      .filter((c) => !c.isJoker);
    if (allNonJokers.length >= 4) {
      findAllConsecutiveSequences(allNonJokers, 4).forEach((seq, i) => {
        allSuggestions.push({
          type: "Blinding Flush",
          cards: seq,
          priority: 4,
          id: `blinding-flush-${i}-${seq.map((c) => c.handIndex).join("-")}`,
        });
      });
    }

    // Full Status
    const allPairs = [];
    const allTriples = [];
    Object.entries(valueGroups).forEach(([value, cards]) => {
      if (value !== "joker") {
        if (cards.length >= 3)
          generateCardCombinations(cards, 3).forEach((combo) =>
            allTriples.push({ value, cards: combo }),
          );
        if (cards.length >= 2)
          generateCardCombinations(cards, 2).forEach((combo) =>
            allPairs.push({ value, cards: combo }),
          );
      }
    });
    allTriples.forEach((triple) => {
      allPairs.forEach((pair) => {
        if (triple.value !== pair.value) {
          const ti = triple.cards.map((c) => c.handIndex);
          const pi = pair.cards.map((c) => c.handIndex);
          if (!ti.some((i) => pi.includes(i))) {
            const cards = [...triple.cards, ...pair.cards];
            allSuggestions.push({
              type: "Full Status",
              cards,
              priority: 3,
              id: `full-status-${triple.value}-${pair.value}-${cards.map((c) => c.handIndex).join("-")}`,
            });
          }
        }
      });
    });

    // Triple Support
    Object.entries(valueGroups).forEach(([value, cards]) => {
      if (cards.length >= 3 && value !== "joker") {
        generateCardCombinations(cards, 3).forEach((combo) => {
          allSuggestions.push({
            type: "Triple Support",
            cards: combo,
            priority: 3,
            id: `triple-${value}-${combo.map((c) => c.handIndex).join("-")}`,
          });
        });
      }
    });

    // Double Trouble
    for (let i = 0; i < allPairs.length; i++) {
      for (let j = i + 1; j < allPairs.length; j++) {
        const p1 = allPairs[i],
          p2 = allPairs[j];
        if (p1.value !== p2.value) {
          const i1 = p1.cards.map((c) => c.handIndex);
          const i2 = p2.cards.map((c) => c.handIndex);
          if (!i1.some((x) => i2.includes(x))) {
            const cards = [...p1.cards, ...p2.cards];
            allSuggestions.push({
              type: "Double Trouble",
              cards,
              priority: 2,
              id: `double-${p1.value}-${p2.value}-${cards.map((c) => c.handIndex).join("-")}`,
            });
          }
        }
      }
    }

    // Magic Pair
    Object.entries(valueGroups).forEach(([value, cards]) => {
      if (cards.length >= 2 && value !== "joker") {
        generateCardCombinations(cards, 2).forEach((combo) => {
          allSuggestions.push({
            type: "Magic Pair",
            cards: combo,
            priority: 1,
            id: `pair-${value}-${combo.map((c) => c.handIndex).join("-")}`,
          });
        });
      }
    });

    // Deduplicate
    const seen = new Set();
    return allSuggestions
      .filter((s) => {
        const key = `${s.type}-${s.cards
          .map((c) => c.handIndex)
          .sort()
          .join("-")}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5);
  };

  // render

  const canUpdate = !!setPlayer;

  return (
    <>
      <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
        <TableBody>
          {/* Status Row */}
          <TableRow
            sx={{
              background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
            }}
          >
            <StyledTableCell sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {t("ace_deck")}: {cardsInDeck}
              </Typography>
            </StyledTableCell>
            <StyledTableCell sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {t("Hand")}: {hand.length}
              </Typography>
            </StyledTableCell>
            <StyledTableCell sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  {t("ace_discard_pile")}: {discardPile.length}
                </Typography>
                {totalTracked !== 30 && (
                  <Warning sx={{ fontSize: "0.85rem", color: "error.main" }} />
                )}
              </Box>
            </StyledTableCell>
          </TableRow>

          {/* Hand Row */}
          {hand.length > 0 && (
            <TableRow>
              <StyledTableCell colSpan={3}>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, py: 0.5 }}
                >
                  {hand.map((card, i) => {
                    const isSelected = selectedCards.some(
                      (c) => c.uniqueId === i,
                    );
                    const isRed = ["Fire"].includes(card.suit);
                    return (
                      <Box
                        key={i}
                        onClick={() => handleCardToggle(card, i)}
                        sx={{
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 0.5,
                          border: "2px solid",
                          borderColor: isSelected ? "primary.main" : "divider",
                          backgroundColor: isSelected
                            ? "primary.main"
                            : theme.ternary + "10",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: isSelected
                            ? "primary.contrastText"
                            : isRed
                              ? "error.main"
                              : "text.primary",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          userSelect: "none",
                          "&:hover": {
                            borderColor: "primary.light",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        {card.isJoker
                          ? t("ace_joker_abbr")
                          : `${card.value}${getSuitIcon(card.suit)}`}
                      </Box>
                    );
                  })}
                </Box>
              </StyledTableCell>
            </TableRow>
          )}

          {/* Set Effect Preview Row */}
          {potentialSet && (
            <TableRow>
              <StyledTableCell colSpan={3} sx={{ p: 0 }}>
                <Box
                  sx={{
                    backgroundColor: "success.main",
                    px: 1,
                    py: 0.75,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    icon={
                      <AutoFixHigh sx={{ fontSize: "0.8rem !important" }} />
                    }
                    label={potentialSet.type}
                    size="small"
                    onClick={resolveSet}
                    sx={{
                      backgroundColor: "white",
                      color: "success.dark",
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      flexShrink: 0,
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%": { opacity: 1 },
                        "50%": { opacity: 0.75 },
                        "100%": { opacity: 1 },
                      },
                      "&:hover": { backgroundColor: "grey.100" },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "white",
                      fontStyle: "italic",
                      lineHeight: 1.4,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {getSetEffect(potentialSet.type, selectedCards)}
                  </Typography>
                  <Chip
                    label="✗"
                    size="small"
                    onClick={() => {
                      setSelectedCards([]);
                      setPotentialSet(null);
                    }}
                    sx={{
                      fontSize: "0.65rem",
                      height: 18,
                      minWidth: 0,
                      cursor: "pointer",
                      backgroundColor: "rgba(255,255,255,0.3)",
                      color: "white",
                      flexShrink: 0,
                    }}
                  />
                </Box>
              </StyledTableCell>
            </TableRow>
          )}

          {/* Quick Sets Row */}
          {hand.length > 1 &&
            (() => {
              const suggestions = detectPossibleSets(hand);
              if (suggestions.length === 0) return null;
              return (
                <TableRow>
                  <StyledTableCell colSpan={3} sx={{ py: 0.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Lightbulb
                        sx={{ fontSize: "0.9rem", color: "warning.main" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "bold", mr: 0.5 }}
                      >
                        {t("ace_quick_sets")} ({suggestions.length}):
                      </Typography>
                      {suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion.type}
                          size="small"
                          clickable
                          icon={
                            <CheckCircle
                              sx={{ fontSize: "0.8rem !important" }}
                            />
                          }
                          onClick={() => {
                            const cards = suggestion.cards.map((c) => ({
                              ...c,
                              uniqueId: c.handIndex,
                            }));
                            setSelectedCards(cards);
                            setPotentialSet(detectSet(cards));
                          }}
                          sx={{
                            fontSize: "0.65rem",
                            height: 20,
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            "& .MuiChip-icon": {
                              color: "primary.contrastText",
                            },
                            "&:hover": { backgroundColor: "primary.dark" },
                          }}
                        />
                      ))}
                      {selectedCards.length > 0 && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.25,
                              flexWrap: "wrap",
                              ml: 0.5,
                            }}
                          >
                            {selectedCards.map((card, i) => (
                              <Typography
                                key={i}
                                variant="caption"
                                sx={{
                                  backgroundColor: "success.main",
                                  color: "white",
                                  px: 0.5,
                                  borderRadius: 0.5,
                                  fontSize: "0.65rem",
                                  fontWeight: "bold",
                                }}
                              >
                                {card.isJoker
                                  ? t("ace_joker_abbr")
                                  : `${card.value}${getSuitIcon(card.suit)}`}
                              </Typography>
                            ))}
                          </Box>
                          <Chip
                            label="✗"
                            size="small"
                            onClick={() => setSelectedCards([])}
                            sx={{
                              fontSize: "0.65rem",
                              height: 18,
                              minWidth: 0,
                              cursor: "pointer",
                            }}
                          />
                        </>
                      )}
                    </Box>
                  </StyledTableCell>
                </TableRow>
              );
            })()}

          {/* Combat Log Row */}
          {combatLog.length > 0 && (
            <TableRow>
              <StyledTableCell colSpan={3}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.25,
                    py: 0.5,
                  }}
                >
                  {combatLog.map((entry) => (
                    <Box
                      key={entry.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={entry.setType}
                        size="small"
                        color={
                          entry.isTrap
                            ? entry.success
                              ? "success"
                              : "error"
                            : "success"
                        }
                        sx={{ fontSize: "0.65rem", height: 18, flexShrink: 0 }}
                      />
                      <Box sx={{ display: "flex", gap: 0.25 }}>
                        {entry.cards.map((card, ci) => (
                          <Typography
                            key={ci}
                            variant="caption"
                            sx={{
                              backgroundColor: "primary.main",
                              color: "primary.contrastText",
                              px: 0.4,
                              borderRadius: 0.5,
                              fontSize: "0.65rem",
                              fontWeight: "bold",
                            }}
                          >
                            {card.isJoker
                              ? t("ace_joker_abbr")
                              : `${card.value}${getSuitIcon(card.suit)}`}
                          </Typography>
                        ))}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.65rem",
                          fontStyle: "italic",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={entry.effect}
                      >
                        {entry.effect}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </StyledTableCell>
            </TableRow>
          )}

          {/* Action Buttons Row */}
          {canUpdate && (
            <TableRow>
              <StyledTableCell colSpan={3} sx={{ pt: 0.75, pb: 0.75 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {hand.length > 0 ? (
                    <>
                      {/* Resolve Set */}
                      {potentialSet && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={
                            <AutoFixHigh
                              sx={{ fontSize: "0.8rem !important" }}
                            />
                          }
                          onClick={resolveSet}
                          sx={{
                            fontSize: "0.65rem",
                            py: 0.25,
                            px: 0.75,
                            minWidth: 0,
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                              "0%": { opacity: 1 },
                              "50%": { opacity: 0.7 },
                              "100%": { opacity: 1 },
                            },
                          }}
                        >
                          {potentialSet.type}
                        </Button>
                      )}
                      {/* Clear selection */}
                      {selectedCards.length > 0 && !potentialSet && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => {
                            setSelectedCards([]);
                            setPotentialSet(null);
                          }}
                          sx={{
                            fontSize: "0.65rem",
                            py: 0.25,
                            px: 0.75,
                            minWidth: 0,
                          }}
                        >
                          {t("Clear")}
                        </Button>
                      )}
                      {/* Draw 1 */}
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={
                          <GetApp sx={{ fontSize: "0.8rem !important" }} />
                        }
                        onClick={() => drawCards(1)}
                        disabled={cardsInDeck <= 0}
                        sx={{
                          fontSize: "0.65rem",
                          py: 0.25,
                          px: 0.75,
                          minWidth: 0,
                        }}
                      >
                        {t("ace_draw_card")} ({cardsInDeck})
                      </Button>

                      {/* Trap Card */}
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={
                          <NewReleases sx={{ fontSize: "0.8rem !important" }} />
                        }
                        onClick={() => setTrapCardDialogOpen(true)}
                        disabled={cardsInDeck <= 0}
                        sx={{
                          fontSize: "0.65rem",
                          py: 0.25,
                          px: 0.75,
                          minWidth: 0,
                        }}
                      >
                        {t("ace_trap_card")}
                      </Button>

                      {/* Shuffle (only when deck is empty and discard has cards) */}
                      {cardsInDeck === 0 && discardPile.length > 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={
                            <Shuffle sx={{ fontSize: "0.8rem !important" }} />
                          }
                          onClick={shuffleDeck}
                          sx={{
                            fontSize: "0.65rem",
                            py: 0.25,
                            px: 0.75,
                            minWidth: 0,
                          }}
                        >
                          {t("ace_shuffle")}
                        </Button>
                      )}

                      {/* Discard All */}
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        startIcon={
                          <Delete sx={{ fontSize: "0.8rem !important" }} />
                        }
                        onClick={discardHand}
                        sx={{
                          fontSize: "0.65rem",
                          py: 0.25,
                          px: 0.75,
                          minWidth: 0,
                        }}
                      >
                        {t("ace_discard_all")}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Start Conflict (draw 5) */}
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={
                          <GetApp sx={{ fontSize: "0.8rem !important" }} />
                        }
                        onClick={() => drawCards(5)}
                        disabled={cardsInDeck < 5}
                        sx={{
                          fontSize: "0.65rem",
                          py: 0.25,
                          px: 0.75,
                          minWidth: 0,
                        }}
                      >
                        {t("ace_deck_conflict_start")} (5)
                      </Button>

                      {/* Draw 1 */}
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={
                          <GetApp sx={{ fontSize: "0.8rem !important" }} />
                        }
                        onClick={() => drawCards(1)}
                        disabled={cardsInDeck <= 0}
                        sx={{
                          fontSize: "0.65rem",
                          py: 0.25,
                          px: 0.75,
                          minWidth: 0,
                        }}
                      >
                        {t("ace_draw_1_card")}
                      </Button>

                      {/* Shuffle discard back */}
                      {discardPile.length > 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={
                            <Shuffle sx={{ fontSize: "0.8rem !important" }} />
                          }
                          onClick={shuffleDeck}
                          sx={{
                            fontSize: "0.65rem",
                            py: 0.25,
                            px: 0.75,
                            minWidth: 0,
                          }}
                        >
                          {t("ace_shuffle")} ({discardPile.length})
                        </Button>
                      )}

                      {/* Reset */}
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={
                          <Refresh sx={{ fontSize: "0.8rem !important" }} />
                        }
                        onClick={resetDeck}
                        sx={{
                          fontSize: "0.65rem",
                          py: 0.25,
                          px: 0.75,
                          minWidth: 0,
                        }}
                      >
                        {t("Reset")}
                      </Button>
                    </>
                  )}
                </Box>
              </StyledTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Trap Card Dialog */}
      <Dialog
        open={trapCardDialogOpen}
        onClose={() => setTrapCardDialogOpen(false)}
      >
        <DialogTitle>{t("ace_trap_card_title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t("ace_trap_card_desc")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              justifyContent: "center",
              pt: 1,
            }}
          >
            {["Air", "Earth", "Fire", "Ice"].map((suit) => {
              const IconComponent = getSuitMuiIcon(suit);
              return (
                <Button
                  key={suit}
                  variant="contained"
                  startIcon={<IconComponent />}
                  onClick={() => handleTrapCard(suit)}
                  sx={{
                    minWidth: 110,
                    backgroundColor: getSuitColor(suit),
                    color: "white",
                    "&:hover": {
                      backgroundColor: getSuitColor(suit),
                      opacity: 0.9,
                    },
                  }}
                >
                  {t(suit)}
                </Button>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrapCardDialogOpen(false)}>
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
