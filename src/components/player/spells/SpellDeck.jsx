import React, { useState, useMemo, useCallback } from "react";
import {
  Typography,
  ThemeProvider,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Box,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { 
  ExpandMore, 
  Style, 
  Shuffle,
  Casino,
  GetApp,
  Delete,
  Refresh,
  Air,
  Terrain,
  LocalFireDepartment,
  AcUnit,
  PanTool,
  Layers,
  AutoFixHigh,
  Lightbulb,
  CheckCircle,
  Warning,
  Stars,
  NewReleases,
} from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function ThemedSpellDeck({ deck = {}, onEdit, onDeckUpdate = () => {}, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const handleDeckUpdate = onDeckUpdate || (() => {});

  // Helper function to generate a fresh shuffled deck of 30 cards
  const generateShuffledDeck = useCallback(() => {
    const newDeck = [];

    // Add 2 jokers
    newDeck.push({ isJoker: true, jokerValue: null, jokerSuit: null });
    newDeck.push({ isJoker: true, jokerValue: null, jokerSuit: null });

    // Add cards for each suit (1-7)
    const suits = ['Air', 'Earth', 'Fire', 'Ice'];
    suits.forEach(suit => {
      for (let value = 1; value <= 7; value++) {
        newDeck.push({
          isJoker: false,
          suit: suit,
          value: value,
        });
      }
    });

    // Fisher-Yates shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    return newDeck;
  }, []);

  // Helper function to shuffle an array (Fisher-Yates)
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Memoized deck state to prevent unnecessary recalculations
  const deckState = useMemo(() => ({
    fullDeck: deck?.fullDeck || [],
    cardsInDeck: deck?.fullDeck?.length ?? (deck?.cardsInDeck !== undefined ? deck.cardsInDeck : 30),
    hand: deck?.hand || [],
    discardPile: deck?.discardPile || [],
  }), [deck?.fullDeck, deck?.cardsInDeck, deck?.hand, deck?.discardPile]);
  

  const [selectedCards, setSelectedCards] = useState([]);
  const [potentialSet, setPotentialSet] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);
  const [trapCardDialogOpen, setTrapCardDialogOpen] = useState(false);

  const handleTrapCard = (suit) => {
    setTrapCardDialogOpen(false);

    // Initialize fullDeck if it doesn't exist
    let currentFullDeck = deck?.fullDeck || [];

    // If fullDeck is empty but cardsInDeck > 0, generate a fresh deck
    if (currentFullDeck.length === 0 && deckState.cardsInDeck > 0) {
      currentFullDeck = generateShuffledDeck();
    }

    if (currentFullDeck.length <= 0) {
      const logEntry = {
        id: Date.now(),
        timestamp: new Date(),
        setType: `Trap Card (Fail)`,
        cards: [],
        effect: "Attempted Trap Card with empty deck."
      };
      setCombatLog(prev => [logEntry, ...prev]);
      return;
    }

    // Draw the top card from the actual deck
    const revealedCard = currentFullDeck[0];
    const remainingDeck = currentFullDeck.slice(1);

    const success = revealedCard.isJoker || revealedCard.suit === suit;

    const newDiscardPile = [...(deck.discardPile || []), revealedCard];

    handleDeckUpdate({
      ...deck,
      fullDeck: remainingDeck,
      cardsInDeck: remainingDeck.length,
      discardPile: newDiscardPile,
    });

    const resultMessage = `Declared ${suit}. Revealed ${revealedCard.isJoker ? 'Joker' : `${revealedCard.value} of ${revealedCard.suit}`}.`;

    const logEntry = {
      id: Date.now(),
      timestamp: new Date(),
      setType: `Trap Card`,
      cards: [revealedCard],
      effect: resultMessage + (success ? " Success! You may perform the Spell action for free (mp cost <= SL x 5)." : " Failure.")
    };
    setCombatLog(prev => [logEntry, ...prev]);
  };

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: (props) => <p style={inlineStyles} {...props} />,
  };

  // Helper functions for deck management
  const getSuitColor = (suit) => {
    const colorMap = {
      'Air': '#87CEEB',
      'Earth': '#8B4513',
      'Fire': '#FF4500',
      'Ice': '#4682B4'
    };
    return colorMap[suit] || theme.primary;
  };

  const getSuitIcon = (suit, isComponent = false) => {
    if (isComponent) {
      // Return MUI icon components
      const iconMap = {
        'Air': Air,
        'Earth': Terrain,
        'Fire': LocalFireDepartment,
        'Ice': AcUnit,
      };
      return iconMap[suit] || Casino;
    } else {
      // Return symbols for card display
      const iconMap = {
        'Air': '♢', // Diamond for air
        'Earth': '♣', // Club for earth  
        'Fire': '♡', // Heart for fire
        'Ice': '♠'   // Spade for ice
      };
      return iconMap[suit] || '?';
    }
  };

  // Card set detection logic
  const detectSet = useCallback((cards) => {
    if (!cards || cards.length < 2) return null;

    const sortedCards = [...cards].sort((a, b) => {
      if (a.value !== b.value) return a.value - b.value;
      return a.suit.localeCompare(b.suit);
    });

    // Check for different set types
    const valueGroups = {};
    const suitGroups = {};
    
    sortedCards.forEach(card => {
      const value = card.isJoker ? card.jokerValue || 1 : card.value;
      const suit = card.isJoker ? card.jokerSuit || 'Air' : card.suit;
      
      if (!valueGroups[value]) valueGroups[value] = [];
      if (!suitGroups[suit]) suitGroups[suit] = [];
      
      valueGroups[value].push(card);
      suitGroups[suit].push(card);
    });

    const values = Object.keys(valueGroups).map(Number).sort((a, b) => a - b);
    const valueCounts = Object.values(valueGroups).map(group => group.length);

    // Jackpot: 4 cards of same value, none jokers
    if (cards.length === 4 && valueCounts.includes(4) && !cards.some(c => c.isJoker)) {
      return { type: 'Jackpot', cards: sortedCards };
    }

    // Magic Flush: 4 consecutive values, same suit
    if (cards.length === 4) {
      const suits = Object.keys(suitGroups);
      if (suits.length === 1 && areConsecutive(values)) {
        return { type: 'Magic Flush', cards: sortedCards };
      }
    }

    // Blinding Flush: 4 consecutive values
    if (cards.length === 4 && areConsecutive(values)) {
      return { type: 'Blinding Flush', cards: sortedCards };
    }

    // Full Status: 3 of a kind + 2 of a kind
    if (cards.length === 5) {
      const counts = valueCounts.sort((a, b) => b - a);
      if (counts[0] === 3 && counts[1] === 2) {
        return { type: 'Full Status', cards: sortedCards };
      }
    }

    // Triple Support: 3 cards of same value
    if (cards.length === 3 && valueCounts.includes(3)) {
      return { type: 'Triple Support', cards: sortedCards };
    }

    // Double Trouble: 2 pairs
    if (cards.length === 4) {
      const pairs = valueCounts.filter(count => count === 2);
      if (pairs.length === 2) {
        return { type: 'Double Trouble', cards: sortedCards };
      }
    }

    // Magic Pair: 2 cards of same value
    if (cards.length === 2 && valueCounts.includes(2)) {
      return { type: 'Magic Pair', cards: sortedCards };
    }

    return null;
  }, []);

  const areConsecutive = (values) => {
    for (let i = 1; i < values.length; i++) {
      if (values[i] - values[i-1] !== 1) return false;
    }
    return true;
  };

  const getSetEffect = (setType, cards) => {
    const totalValue = cards.reduce((sum, card) => {
      const value = card.isJoker ? (card.jokerValue || 1) : card.value;
      return sum + value;
    }, 0);

    const highestValue = Math.max(...cards.map(card => 
      card.isJoker ? (card.jokerValue || 1) : card.value
    ));

    switch (setType) {
      case 'Jackpot':
        return t('ace_jackpot_enriched');
      
      case 'Magic Flush': {
        const suit = cards[0].isJoker ? (cards[0].jokerSuit || 'Air') : cards[0].suit;
        return t('ace_magic_flush_enriched', [25 + totalValue, suit.toLowerCase()]);
      }
      
      case 'Blinding Flush': {
        const isEven = totalValue % 2 === 0;
        return isEven 
          ? t('ace_blinding_flush_desc_light_enriched', [15 + totalValue])
          : t('ace_blinding_flush_desc_dark_enriched', [15 + totalValue]);
      }
      
      case 'Full Status': {
        const isEven = highestValue % 2 === 0;
        return isEven
          ? t('ace_effect_full_status_even_enriched', [highestValue])
          : t('ace_effect_full_status_odd_enriched', [highestValue]);
      }
      
      case 'Triple Support':
        return t('ace_triple_support_enriched', [totalValue * 3]);
      
      case 'Double Trouble':
        return t('ace_double_trouble_enriched', [10 + highestValue]);
      
      case 'Magic Pair':
        return t('ace_magic_pair_enriched');
      
      default:
        return t('ace_unknown_effect');
    }
  };

  // Detect ALL possible sets from current hand - no limits, every combination
  const detectPossibleSets = (hand) => {
    if (!hand || hand.length < 2) return [];
    
    const allSuggestions = [];
    
    // Group cards by value and suit for analysis
    const valueGroups = {};
    const suitGroups = {};
    
    hand.forEach((card, index) => {
      const value = card.isJoker ? 'joker' : card.value;
      const suit = card.isJoker ? 'joker' : card.suit;
      
      if (!valueGroups[value]) valueGroups[value] = [];
      if (!suitGroups[suit]) suitGroups[suit] = [];
      
      valueGroups[value].push({ ...card, handIndex: index });
      suitGroups[suit].push({ ...card, handIndex: index });
    });

    // Helper to find ALL consecutive sequences of a given length
    const findAllConsecutiveSequences = (cards, length) => {
      const sequences = [];
      const nonJokers = cards.filter(card => !card.isJoker);
      
      // Generate all possible combinations of cards for consecutive checking
      const generateCombinations = (arr, size) => {
        if (size === 1) return arr.map(el => [el]);
        const combinations = [];
        arr.forEach((el, i) => {
          const rest = arr.slice(i + 1);
          const restCombinations = generateCombinations(rest, size - 1);
          restCombinations.forEach(combination => {
            combinations.push([el, ...combination]);
          });
        });
        return combinations;
      };

      if (nonJokers.length >= length) {
        const combinations = generateCombinations(nonJokers, length);
        
        for (const combo of combinations) {
          const sortedCombo = combo.sort((a, b) => a.value - b.value);
          let isConsecutive = true;
          
          for (let i = 1; i < sortedCombo.length; i++) {
            if (sortedCombo[i].value !== sortedCombo[i-1].value + 1) {
              isConsecutive = false;
              break;
            }
          }
          
          if (isConsecutive) {
            sequences.push(sortedCombo);
          }
        }
      }
      return sequences;
    };

    // Helper to generate all combinations of cards
    const generateCardCombinations = (cards, size) => {
      if (size === 1) return cards.map(card => [card]);
      if (size > cards.length) return [];
      
      const combinations = [];
      for (let i = 0; i <= cards.length - size; i++) {
        const rest = cards.slice(i + 1);
        const restCombinations = generateCardCombinations(rest, size - 1);
        restCombinations.forEach(combo => {
          combinations.push([cards[i], ...combo]);
        });
      }
      return combinations;
    };

    // 1. Find ALL Jackpots (4 same value, no jokers)
    Object.entries(valueGroups).forEach(([value, cards]) => {
      if (cards.length >= 4 && value !== 'joker') {
        const combinations = generateCardCombinations(cards, 4);
        combinations.forEach(combo => {
          allSuggestions.push({
            type: 'Jackpot',
            cards: combo,
            description: t('ace_suggestion_jackpot_desc'),
            priority: 6,
            id: `jackpot-${value}-${combo.map(c => c.handIndex).join('-')}`
          });
        });
      }
    });

    // 2. Find ALL Magic Flushes (4 consecutive, same suit)
    Object.entries(suitGroups).forEach(([suit, cards]) => {
      if (cards.length >= 4 && suit !== 'joker') {
        const sequences = findAllConsecutiveSequences(cards, 4);
        sequences.forEach((seq, index) => {
          const totalValue = seq.reduce((sum, card) => {
            const value = card.isJoker ? (card.jokerValue || 1) : card.value;
            return sum + value;
          }, 0);
          allSuggestions.push({
            type: 'Magic Flush',
            cards: seq,
            description: t('ace_magic_flush_enriched', [25 + totalValue, suit.toLowerCase()]),
            priority: 5,
            id: `magic-flush-${suit}-${index}-${seq.map(c => c.handIndex).join('-')}`
          });
        });
      }
    });

    // 3. Find ALL Blinding Flushes (4 consecutive, any suits)
    const allNonJokersWithIndex = hand
      .map((card, index) => ({ ...card, handIndex: index }))
      .filter(card => !card.isJoker);
    
    if (allNonJokersWithIndex.length >= 4) {
      const sequences = findAllConsecutiveSequences(allNonJokersWithIndex, 4);
      sequences.forEach((seq, index) => {
        allSuggestions.push({
          type: 'Blinding Flush',
          cards: seq,
          description: t('ace_suggestion_blinding_flush_desc'),
          priority: 4,
          id: `blinding-flush-${index}-${seq.map(c => c.handIndex).join('-')}`
        });
      });
    }

    // 4. Find ALL Full Status combinations (3 of a kind + 2 of a kind)
    const allPairs = [];
    const allTriples = [];
    
    Object.entries(valueGroups).forEach(([value, cards]) => {
      if (value !== 'joker') {
        if (cards.length >= 3) {
          const tripleCombinations = generateCardCombinations(cards, 3);
          tripleCombinations.forEach(combo => {
            allTriples.push({ value, cards: combo });
          });
        }
        if (cards.length >= 2) {
          const pairCombinations = generateCardCombinations(cards, 2);
          pairCombinations.forEach(combo => {
            allPairs.push({ value, cards: combo });
          });
        }
      }
    });
    
    allTriples.forEach(triple => {
      allPairs.forEach(pair => {
        if (triple.value !== pair.value) {
          // Check if cards don't overlap
          const tripleIndices = triple.cards.map(c => c.handIndex);
          const pairIndices = pair.cards.map(c => c.handIndex);
          const hasOverlap = tripleIndices.some(i => pairIndices.includes(i));
          
          if (!hasOverlap) {
            const fullStatusCards = [...triple.cards, ...pair.cards];
            allSuggestions.push({
              type: 'Full Status',
              cards: fullStatusCards,
              description: t('ace_suggestion_full_status_desc'),
              priority: 3,
              id: `full-status-${triple.value}-${pair.value}-${fullStatusCards.map(c => c.handIndex).join('-')}`
            });
          }
        }
      });
    });

    // 5. Find ALL Triple Support combinations (3 same value)
    Object.entries(valueGroups).forEach(([value, cards]) => {
      if (cards.length >= 3 && value !== 'joker') {
        const combinations = generateCardCombinations(cards, 3);
        combinations.forEach(combo => {
          allSuggestions.push({
            type: 'Triple Support',
            cards: combo,
            description: t('ace_suggestion_triple_support_desc'),
            priority: 3,
            id: `triple-support-${value}-${combo.map(c => c.handIndex).join('-')}`
          });
        });
      }
    });

    // 6. Find ALL Double Trouble combinations (2 different pairs)
    for (let i = 0; i < allPairs.length; i++) {
      for (let j = i + 1; j < allPairs.length; j++) {
        const pair1 = allPairs[i];
        const pair2 = allPairs[j];
        
        if (pair1.value !== pair2.value) {
          // Check if cards don't overlap
          const pair1Indices = pair1.cards.map(c => c.handIndex);
          const pair2Indices = pair2.cards.map(c => c.handIndex);
          const hasOverlap = pair1Indices.some(i => pair2Indices.includes(i));
          
          if (!hasOverlap) {
            const doubleCards = [...pair1.cards, ...pair2.cards];
            allSuggestions.push({
              type: 'Double Trouble',
              cards: doubleCards,
              description: t('ace_suggestion_double_trouble_desc'),
              priority: 2,
              id: `double-trouble-${pair1.value}-${pair2.value}-${doubleCards.map(c => c.handIndex).join('-')}`
            });
          }
        }
      }
    }

    // 7. Find ALL Magic Pair combinations (2 same value)
    Object.entries(valueGroups).forEach(([value, cards]) => {
      if (cards.length >= 2 && value !== 'joker') {
        const combinations = generateCardCombinations(cards, 2);
        combinations.forEach(combo => {
          allSuggestions.push({
            type: 'Magic Pair',
            cards: combo,
            description: t('ace_suggestion_magic_pair_desc'),
            priority: 1,
            id: `magic-pair-${value}-${combo.map(c => c.handIndex).join('-')}`
          });
        });
      }
    });

    // Remove exact duplicates based on card indices used
    const uniqueSuggestions = [];
    const seenIds = new Set();
    
    allSuggestions.forEach(suggestion => {
      const cardIndices = suggestion.cards.map(c => c.handIndex).sort().join('-');
      const uniqueId = `${suggestion.type}-${cardIndices}`;
      
      if (!seenIds.has(uniqueId)) {
        seenIds.add(uniqueId);
        uniqueSuggestions.push(suggestion);
      }
    });

    // Sort by priority (highest first), then by type
    return uniqueSuggestions
      .sort((a, b) => {
        if (b.priority !== a.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        return a.type.localeCompare(b.type);
      })
      .slice(0, 5); // Show top 5 instead of 3 for comprehensive view
  };

  const handleCardSelection = useCallback((card, index) => {
    const cardWithId = { ...card, uniqueId: index };
    const cardIndex = selectedCards.findIndex(c => c.uniqueId === index);
    let newSelection;
    
    if (cardIndex >= 0) {
      newSelection = selectedCards.filter(c => c.uniqueId !== index);
    } else {
      newSelection = [...selectedCards, cardWithId];
    }
    
    setSelectedCards(newSelection);
    setPotentialSet(detectSet(newSelection));
  }, [selectedCards, detectSet]);

  const resolveSet = () => {
    if (!potentialSet) return;
    
    // Get the indices of selected cards
    const selectedIndices = selectedCards.map(card => card.uniqueId);
    
    // Move selected cards to discard pile (filter by index, not by ID)
    const newHand = deck.hand.filter((_, index) => 
      !selectedIndices.includes(index)
    );
    
    // Add the actual cards from the hand to discard pile (not the selected card objects)
    const cardsToDiscard = deck.hand.filter((_, index) => 
      selectedIndices.includes(index)
    );
    const newDiscardPile = [...(deck.discardPile || []), ...cardsToDiscard];
    
    // Add to combat log
    const logEntry = {
      id: Date.now(),
      timestamp: new Date(),
      setType: potentialSet.type,
      cards: cardsToDiscard.map(card => ({
        suit: card.suit,
        value: card.value,
        isJoker: card.isJoker
      })),
      effect: getSetEffect(potentialSet.type, cardsToDiscard)
    };
    setCombatLog(prev => [logEntry, ...prev]);
    
    // Update deck state
    handleDeckUpdate({
      ...deck,
      hand: newHand,
      discardPile: newDiscardPile,
    });
    
    // Clear selection
    setSelectedCards([]);
    setPotentialSet(null);
  };

  // Deck management functions
  const drawCards = (numCards = 1) => {
    // Initialize fullDeck if it doesn't exist
    let currentFullDeck = deck?.fullDeck || [];

    // If fullDeck is empty but cardsInDeck > 0, generate a fresh deck
    if (currentFullDeck.length === 0 && deckState.cardsInDeck > 0) {
      currentFullDeck = generateShuffledDeck();
    }

    // Can't draw if deck is empty
    if (currentFullDeck.length <= 0) {
      return;
    }

    const cardsToDraw = Math.min(numCards, currentFullDeck.length);

    // Draw cards from the top of the deck (pop from array)
    const drawnCards = currentFullDeck.slice(0, cardsToDraw);
    const remainingDeck = currentFullDeck.slice(cardsToDraw);

    const updatedDeck = {
      ...deck,
      fullDeck: remainingDeck,
      hand: [...deckState.hand, ...drawnCards],
      cardsInDeck: remainingDeck.length,
    };

    handleDeckUpdate(updatedDeck);
  };


  const discardSelectedCards = () => {
    if (selectedCards.length === 0) return;
    
    const selectedIndices = selectedCards.map(card => card.uniqueId);
    const newHand = deck.hand.filter((_, index) => !selectedIndices.includes(index));
    const newDiscardPile = [...(deck.discardPile || []), ...selectedCards];
    
    const updatedDeck = {
      ...deck,
      hand: newHand,
      discardPile: newDiscardPile,
    };
    
    handleDeckUpdate(updatedDeck);
    
    // Clear selection
    setSelectedCards([]);
    setPotentialSet(null);
  };

  const resetDeck = () => {
    // Generate a fresh shuffled deck
    const newFullDeck = generateShuffledDeck();

    // Reset to full deck with the actual card array
    handleDeckUpdate({
      ...deck,
      fullDeck: newFullDeck,
      cardsInDeck: 30,
      hand: [],
      discardPile: [],
    });

    // Clear any selection and combat log
    setSelectedCards([]);
    setPotentialSet(null);
    setCombatLog([]);
  };

  const shuffleDeck = () => {
    // Add discard pile back to deck and shuffle
    const currentFullDeck = deck?.fullDeck || [];
    const discardPile = deck?.discardPile || [];

    if (discardPile.length === 0) return; // Nothing to shuffle

    // Combine remaining deck cards with discard pile
    const combinedDeck = [...currentFullDeck, ...discardPile];

    // Fisher-Yates shuffle the combined deck
    const shuffledDeck = shuffleArray(combinedDeck);

    handleDeckUpdate({
      ...deck,
      fullDeck: shuffledDeck,
      cardsInDeck: shuffledDeck.length,
      discardPile: [],
    });
  };

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Style />
          </Icon>
          <Typography variant="h4">{t("ace_deck_management")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 1 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {t("ace_card_set_summary")}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, lineHeight: 1.6 }}>
              {t("ace_suit_damage_type_hint")}
            </Typography>
            
            {/* Deck Management Rules */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: theme.primary }}>
                {t("ace_details")}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 2 }}>
                <ReactMarkdown components={components}>
                  {t("ace_details_1")}
                </ReactMarkdown>
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 'bold', color: theme.primary }}>
                {t("ace_details_2_header")}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 2 }}>
                <ReactMarkdown components={components}>
                  {t("ace_details_2")}
                </ReactMarkdown>
              </Typography>
            </Box>

            {/* Card Set Reference */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: theme.primary }}>
                {t("ace_card_set_reference")}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  <strong>{t("ace_trap_card")}</strong>: {t("ace_trap_card_desc")}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  <strong>{t("ace_jackpot")}</strong> {t("ace_jackpot_desc")}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  <strong>{t("ace_magic_flush")}</strong> {t("ace_magic_flush_desc")}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  <strong>{t("ace_blinding_flush")}</strong> {t("ace_blinding_flush_desc")}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  <strong>{t("ace_full_status")}</strong> {t("ace_full_status_desc")}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  <strong>{t("ace_triple_support")}</strong> {t("ace_triple_support_desc")}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  <strong>{t("ace_double_trouble")}</strong> {t("ace_double_trouble_desc")}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  <strong>{t("ace_magic_pair")}</strong> {t("ace_magic_pair_desc")}
                </Typography>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Combat Status - Compact version */}
      {deckState.hand.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1.5, 
          backgroundColor: theme.ternary, 
          borderRadius: 1,
          mb: 1 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Stars sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              {t("ace_deck_conflict_active")}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Casino sx={{ fontSize: '1rem', color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {deckState.cardsInDeck}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                {t("ace_deck")}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PanTool sx={{ fontSize: '1rem', color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {deckState.hand.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                {t("Hand")}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Layers sx={{ fontSize: '1rem', color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {deckState.discardPile.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                {t("ace_discard_pile")}
              </Typography>
            </Box>
          </Box>
          
          {/* Card count validation */}
          {(deckState.cardsInDeck + deckState.hand.length + deckState.discardPile.length) !== 30 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Warning sx={{ fontSize: '1rem', color: 'error.main' }} />
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                {deckState.cardsInDeck + deckState.hand.length + deckState.discardPile.length}/30
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Unified Action Section */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        p: 1.5, 
        backgroundColor: theme.secondary, 
        borderRadius: 1,
        mb: 1 
      }}>
        {deckState.hand.length > 0 ? (
          <>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={() => drawCards(1)}
              disabled={deckState.cardsInDeck <= 0}
              size="small"
              color="primary"
            >
              {t("ace_draw_card")} ({deckState.cardsInDeck})
            </Button>

            <Button
              variant="contained"
              startIcon={<NewReleases />}
              onClick={() => setTrapCardDialogOpen(true)}
              disabled={deckState.cardsInDeck <= 0}
              size="small"
              color="secondary"
            >
              {t("ace_trap_card")}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Layers />}
              onClick={() => setDiscardModalOpen(true)}
              disabled={deckState.discardPile.length === 0}
              size="small"
              color="secondary"
            >
              {t("ace_discard_pile")} ({deckState.discardPile.length})
            </Button>
            
            {deckState.discardPile.length > 0 && deckState.cardsInDeck === 0 && (
              <Button 
                variant="contained" 
                startIcon={<Shuffle />}
                onClick={shuffleDeck}
                size="small"
                color="warning"
              >
                {t("ace_shuffle")}
              </Button>
            )}

            {potentialSet && (
              <Button 
                variant="contained"
                onClick={resolveSet}
                size="small"
                color="success"
                sx={{ 
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                    '100%': { opacity: 1 }
                  }
                }}
              >
                <AutoFixHigh sx={{ mr: 0.5 }} />
                {potentialSet.type}
              </Button>
            )}

            {/* Clear selection */}
            {selectedCards.length > 0 && (
              <Button
                variant="contained"
                color="info"
                onClick={() => {
                  setSelectedCards([]);
                  setPotentialSet(null);
                }}
                size="small"
              >
                {t("Clear")}
              </Button>
            )}

            {!potentialSet && (
              <>
                {selectedCards.length > 0 ? (
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<Delete />}
                    onClick={discardSelectedCards}
                    size="small"
                  >
                    {t("ace_discard_selected")} ({selectedCards.length})
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<Delete />}
                    onClick={() => {
                      const currentState = deckState;
                      const newDiscardPile = [...currentState.discardPile, ...currentState.hand];
                      handleDeckUpdate({
                        ...deck,
                        cardsInDeck: currentState.cardsInDeck, // Explicitly preserve deck count
                        hand: [],
                        discardPile: newDiscardPile,
                      });
                      setSelectedCards([]);
                      setPotentialSet(null);
                    }}
                    disabled={deckState.hand.length === 0}
                    size="small"
                  >
                    {t("ace_discard_all")}
                  </Button>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Button 
              variant="contained" 
              startIcon={<GetApp />}
              onClick={() => drawCards(5)}
              disabled={deckState.cardsInDeck < 5}
              size="small"
              color="primary"
            >
              {t("ace_deck_conflict_start")} (5)
            </Button>
            
            <Button 
              variant="contained"
              color="error"
              startIcon={<Refresh />}
              onClick={resetDeck}
              size="small"
            >
              {t("Reset")}
            </Button>
          </>
        )}
        
        {isEditMode && (
          <Button
            variant="contained"
            onClick={onEdit}
            size="small"
          >
            {t("Edit")}
          </Button>
        )}
      </Box>

      {/* Current Hand */}
      {deckState.hand.length > 0 && (
        <>
          {/* Compact Hand Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            backgroundColor: theme.primary,
            color: theme.white,
            borderRadius: '8px 8px 0 0',
            mb: 0
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {t("Hand")} ({deckState.hand.length})
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'primary.contrastText', 
                fontSize: '0.9rem',
                fontStyle: 'italic',
                fontWeight: 'medium'
              }}>
                {t("ace_card_suit_symbols")}
              </Typography>
            </Box>
            
            {potentialSet && (
              <Chip 
                icon={<AutoFixHigh fontSize="small" />}
                label={potentialSet.type} 
                size="small" 
                sx={{ 
                  backgroundColor: 'success.main', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }} 
              />
            )}
          </Box>
          
          {/* Compact Set Preview */}
          {potentialSet && (
            <Box sx={{ 
              backgroundColor: 'success.main', 
              color: 'white',
              p: 1.5,
              borderRadius: 0,
              mb: 0
            }}>
              <Box sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderLeft: '4px solid',
                borderLeftColor: 'primary.main',
                borderRadius: 1,
                p: 1.5,
                mb: 1,
                boxShadow: 2,
                ...(theme.mode === 'dark' && {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                })
              }}>
                <Typography variant="body2" sx={{ 
                  textAlign: 'left',
                  lineHeight: 1.4,
                  color: theme.mode === 'dark' ? '#ffffff' : '#000000',
                  fontWeight: 'normal',
                  fontStyle: 'italic',
                  fontSize: '0.85rem'
                }}>
                  "{getSetEffect(potentialSet.type, potentialSet.cards)}"
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {selectedCards.map((card, index) => (
                  <Typography 
                    key={card.uniqueId || index}
                    variant="caption" 
                    sx={{ 
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      border: '1px solid',
                      borderColor: 'primary.dark'
                    }}
                  >
                    {card.isJoker ? t('ace_joker_abbr') : `${card.value}${card.suit?.charAt(0)}`}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
      
      <Box sx={{ 
        padding: potentialSet ? 1.5 : 2, 
        backgroundColor: theme.ternary, 
        borderRadius: potentialSet ? '0 0 8px 8px' : '8px',
        marginBottom: 1 
      }}>
        {deckState.hand.length > 0 ? (
          <>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}>
              {deckState.hand.map((card, index) => {
                const isSelected = selectedCards.some(c => c.uniqueId === index);
                const isHoveredPreview = hoveredSuggestion && hoveredSuggestion.cards.some(c => c.handIndex === index);
                const isRed = ['Fire', 'Lightning'].includes(card.suit);
                
                return (
                  <Box 
                    key={index}
                    sx={{
                      // Dynamic sizing with balanced min/max bounds
                      width: (() => {
                        const handSize = deckState.hand.length;
                        // Smaller max size for few cards, larger min size for many cards
                        if (handSize <= 3) return { xs: '28%', sm: '25%', md: '20%' };
                        if (handSize <= 5) return { xs: '18%', sm: '18%', md: '16%' };
                        if (handSize <= 8) return { xs: '15%', sm: '14%', md: '12%' };
                        if (handSize <= 12) return { xs: '12%', sm: '11%', md: '10%' };
                        if (handSize <= 16) return { xs: '11%', sm: '10%', md: '9%' };
                        if (handSize <= 20) return { xs: '10%', sm: '9%', md: '8%' };
                        return { xs: '9%', sm: '8%', md: '7%' };
                      })(),
                      minWidth: '80px', // Larger minimum to prevent tiny cards
                      maxWidth: '140px', // Maximum to prevent oversized cards
                      flexShrink: 0
                    }}
                  >
                    <Card 
                      onClick={() => handleCardSelection && handleCardSelection(card, index)}
                      sx={{ 
                        width: '100%',
                        aspectRatio: '5/7', // Playing card proportions
                        backgroundColor: 'background.paper',
                        border: isSelected ? '3px solid #00bcd4' : (isHoveredPreview ? '2px solid #ffa726' : '1px solid'), // Selected: cyan, Preview: orange, Default: divider
                        borderColor: isSelected ? '#00bcd4' : (isHoveredPreview ? '#ffa726' : 'divider'),
                        borderRadius: 2,
                        position: 'relative',
                        cursor: handleCardSelection ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? 4 : 1,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                          zIndex: 1,
                          // Hover styling takes precedence over selected/preview states
                          border: '2px solid',
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      {/* Corner value and suit - Top Left */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 4, 
                        left: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        lineHeight: 1,
                      }}>
                        <Typography sx={{ 
                          fontSize: { xs: '1rem', sm: '1.3rem' }, 
                          fontWeight: 'bold',
                          color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                          fontFamily: 'serif',
                        }}>
                          {card.isJoker ? t('ace_joker_abbr') : card.value}
                        </Typography>
                        <Box sx={{ 
                          fontSize: { xs: '0.9rem', sm: '1.1rem' },
                          color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                          lineHeight: 1,
                          mt: -0.2
                        }}>
                          {card.isJoker ? '🃏' : getSuitIcon(card.suit)}
                        </Box>
                      </Box>

                      {/* Corner value and suit - Bottom Right (rotated) */}
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 4, 
                        right: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transform: 'rotate(180deg)',
                        lineHeight: 1,
                      }}>
                        <Typography sx={{ 
                          fontSize: { xs: '1rem', sm: '1.3rem' }, 
                          fontWeight: 'bold',
                          color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                          fontFamily: 'serif',
                        }}>
                          {card.isJoker ? t('ace_joker_abbr') : card.value}
                        </Typography>
                        <Box sx={{ 
                          fontSize: { xs: '0.9rem', sm: '1.1rem' },
                          color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                          lineHeight: 1,
                          mt: -0.2
                        }}>
                          {card.isJoker ? '🃏' : getSuitIcon(card.suit)}
                        </Box>
                      </Box>

                      {/* Center symbol */}
                      <Box sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                        color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                        textAlign: 'center',
                      }}>
                        {card.isJoker ? (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <Casino sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />
                            <Typography sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              color: 'text.primary'
                            }}>
                              {t('ace_joker')}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 0.3
                          }}>
                            {getSuitIcon(card.suit)}
                            {/* Damage Type Icon */}
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: { xs: '1rem', sm: '1.3rem' },
                              color: 'text.secondary',
                              opacity: 0.7
                            }}>
                              {React.createElement(getSuitIcon(card.suit, true), { 
                                sx: { fontSize: { xs: '1rem', sm: '1.2rem' } } 
                              })}
                            </Box>
                          </Box>
                        )}
                      </Box>


                      {/* Selection indicator - Clean border only */}
                      {isSelected && (
                        <Box sx={{
                          position: 'absolute',
                          top: -4,
                          left: -4,
                          right: -4,
                          bottom: -4,
                          border: '3px solid #00bcd4', // Bright cyan for visibility
                          borderRadius: 2.5,
                          pointerEvents: 'none',
                          boxShadow: `0 0 0 1px`,
                          boxShadowColor: 'background.paper',
                        }} />
                      )}
                    </Card>
                  </Box>
                );
              })}
            </Box>
            
            {/* Set suggestions */}
            {deckState.hand.length > 1 && (
              (() => {
                const suggestions = detectPossibleSets(deckState.hand);
                return suggestions.length > 0 ? (
                  <Card sx={{ mt: 1.5 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Lightbulb sx={{ fontSize: '1rem', color: 'warning.main' }} />
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                          {t("ace_quick_sets")} ({suggestions.length})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion.type}
                          size="small"
                          clickable
                          color="primary"
                          variant="outlined"
                          icon={<CheckCircle fontSize="small" />}
                          onMouseEnter={() => setHoveredSuggestion(suggestion)}
                          onMouseLeave={() => setHoveredSuggestion(null)}
                          sx={{ 
                            fontSize: '0.75rem',
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            fontWeight: 'medium',
                            transition: 'all 0.2s ease',
                            border: '1px solid',
                            borderColor: 'primary.main',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3,
                              backgroundColor: 'primary.dark !important',
                              color: 'white !important',
                              borderColor: 'primary.dark !important'
                            },
                            '&.MuiChip-outlined': {
                              backgroundColor: 'primary.main',
                              borderColor: 'primary.main'
                            },
                            '&.MuiChip-outlined:hover': {
                              backgroundColor: 'primary.dark !important',
                              color: 'white !important',
                              borderColor: 'primary.dark !important'
                            }
                          }}
                          onClick={() => {
                            // Auto-select the suggested cards (replace current selection)
                            const cardsToSelect = suggestion.cards.map(card => ({
                              ...card,
                              uniqueId: card.handIndex
                            }));
                            // Ensure we completely replace the selection
                            setSelectedCards([...cardsToSelect]);
                            setPotentialSet(detectSet(cardsToSelect));
                          }}
                        />
                      ))}
                      </Box>
                    </CardContent>
                  </Card>
                ) : null;
              })()
            )}
          </>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <PanTool sx={{ fontSize: '3rem', color: 'text.disabled' }} />
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              {t("ace_no_cards_in_hand")}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {t("ace_draw_card_hint")}
            </Typography>
            {onDeckUpdate && deckState.cardsInDeck > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<GetApp />}
                  onClick={() => drawCards(5)}
                  size="small"
                  color="primary"
                >
                  {t("ace_draw_5_card")}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<GetApp />}
                  onClick={() => drawCards(1)}
                  size="small"
                >
                  {t("ace_draw_1_card")}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

            {/* Combat Log */}
      {combatLog.length > 0 && (
        <Card sx={{ mb: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AutoFixHigh sx={{ fontSize: '1rem', color: 'success.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t("ace_resolved_set")} ({combatLog.length})
              </Typography>
            </Box>
            <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
              {combatLog.map((entry, index) => (
                <Box 
                  key={entry.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    py: 0.5,
                    borderBottom: index < combatLog.length - 1 ? '1px solid' : 'none',
                    borderBottomColor: 'divider'
                  }}
                >
                  <Chip 
                    label={entry.setType} 
                    size="small" 
                    color="success" 
                    sx={{ minWidth: '80px', fontSize: '0.7rem' }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {entry.cards.map((card, cardIndex) => (
                      <Typography 
                        key={cardIndex}
                        variant="caption" 
                        sx={{ 
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontSize: '0.65rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {card.isJoker ? t('ace_joker_abbr') : `${card.value}${card.suit?.charAt(0)}`}
                      </Typography>
                    ))}
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: '0.7rem',
                      fontStyle: 'italic',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={entry.effect}
                  >
                    {entry.effect}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Suit Configuration */}
      {deckState.hand.length === 0 && (
        <Box
          sx={{
            backgroundColor: theme.primary,
            fontFamily: "Antonio",
            fontWeight: "normal",
            fontSize: "1.1em",
            padding: "8px 17px",
            color: theme.white,
            textTransform: "uppercase",
            marginBottom: 0,
          }}
        >
          <Typography variant="h3" sx={{ fontSize: "1rem", margin: 0 }}>
            {t("ace_suit_configuration")}
          </Typography>
        </Box>
      )}
      
      {deckState.hand.length === 0 && (
        <Box sx={{ padding: 2, backgroundColor: theme.ternary, marginBottom: 2 }}>
          <Grid container spacing={2}>
            {[
              { name: 'Air', damageKey: 'air_damage' },
              { name: 'Earth', damageKey: 'earth_damage' },
              { name: 'Fire', damageKey: 'fire_damage' },
              { name: 'Ice', damageKey: 'ice_damage' }
            ].map((suit) => {
              const IconComponent = getSuitIcon(suit.name, true);
              const suitSymbol = getSuitIcon(suit.name);
              return (
                <Grid item xs={6} sm={3} key={suit.name}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    backgroundColor: getSuitColor(suit.name), 
                    color: 'white',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <IconComponent sx={{ fontSize: '2.5rem' }} />
                        <Box sx={{ textAlign: 'center', color: 'white' }}>
                          <ReactMarkdown components={components}>
                            {`${suitSymbol}\n**${t(suit.name.toLowerCase())}** ${t("damage")}`}
                          </ReactMarkdown>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              {t("ace_suit_damage_type_hint")}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Trap Card Dialog */}
      <Dialog open={trapCardDialogOpen} onClose={() => setTrapCardDialogOpen(false)}>
        <DialogTitle>{t("ace_trap_card_title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t("ace_trap_card_desc")}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', pt: 1 }}>
            {['Air', 'Earth', 'Fire', 'Ice'].map(suit => (
              <Button
                key={suit}
                variant="contained"
                startIcon={React.createElement(getSuitIcon(suit, true))}
                onClick={() => handleTrapCard(suit)}
                sx={{ 
                  minWidth: 120,
                  backgroundColor: getSuitColor(suit), 
                  color: 'white', 
                  '&:hover': { backgroundColor: getSuitColor(suit), opacity: 0.9 } 
                }}
              >
                {t(suit)}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrapCardDialogOpen(false)}>{t("Cancel")}</Button>
        </DialogActions>
      </Dialog>

      {/* Discard Pile Modal */}
      <Dialog 
        open={discardModalOpen} 
        onClose={() => setDiscardModalOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Layers />
          {t("ace_discard_pile")} ({deckState.discardPile.length})
        </DialogTitle>
        <DialogContent>
          {deckState.discardPile.length > 0 ? (
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {deckState.discardPile.slice().reverse().map((card, index) => {
                const actualIndex = deckState.discardPile.length - 1 - index;
                const isRed = ['Fire', 'Lightning'].includes(card.suit);
                
                return (
                  <Grid item xs={4} sm={3} md={2.4} lg={2} key={actualIndex}>
                    <Card 
                      sx={{ 
                        width: '100%',
                        aspectRatio: '5/7',
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        position: 'relative',
                        boxShadow: 1,
                        opacity: index === 0 ? 1 : 0.8,
                      }}
                    >
                      {/* Corner value and suit - Top Left */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 4, 
                        left: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        lineHeight: 1,
                      }}>
                        <Typography sx={{ 
                          fontSize: { xs: '1rem', sm: '1.3rem' }, 
                          fontWeight: 'bold',
                          color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                          fontFamily: 'serif',
                        }}>
                          {card.isJoker ? t('ace_joker_abbr') : card.value}
                        </Typography>
                        <Box sx={{ 
                          fontSize: { xs: '0.9rem', sm: '1.1rem' },
                          color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                          lineHeight: 1,
                          mt: -0.2
                        }}>
                          {card.isJoker ? '🃏' : getSuitIcon(card.suit)}
                        </Box>
                      </Box>

                      {/* Corner value and suit - Bottom Right (rotated) */}
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 4, 
                        right: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transform: 'rotate(180deg)',
                        lineHeight: 1,
                      }}>
                        <Typography sx={{ 
                          fontSize: { xs: '1rem', sm: '1.3rem' }, 
                          fontWeight: 'bold',
                          color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                          fontFamily: 'serif',
                        }}>
                          {card.isJoker ? t('ace_joker_abbr') : card.value}
                        </Typography>
                        <Box sx={{ 
                          fontSize: { xs: '0.9rem', sm: '1.1rem' },
                          color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                          lineHeight: 1,
                          mt: -0.2
                        }}>
                          {card.isJoker ? '🃏' : getSuitIcon(card.suit)}
                        </Box>
                      </Box>

                      {/* Center symbol */}
                      <Box sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                        color: card.isJoker ? '#8B4513' : (isRed ? '#DC143C' : 'text.primary'),
                        textAlign: 'center',
                      }}>
                        {card.isJoker ? (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <Casino sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />
                            <Typography sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              color: 'text.primary'
                            }}>
                              {t('ace_joker')}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 0.3
                          }}>
                            {getSuitIcon(card.suit)}
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: { xs: '1rem', sm: '1.3rem' },
                              color: 'text.secondary',
                              opacity: 0.7
                            }}>
                              {React.createElement(getSuitIcon(card.suit, true), { 
                                sx: { fontSize: { xs: '1rem', sm: '1.2rem' } } 
                              })}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Card order indicator */}
                      <Box sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        backgroundColor: index === 0 ? '#22c55e' : '#3b82f6', // Explicit bright colors
                        color: '#ffffff', // Explicit white
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        border: '2px solid #ffffff', // White border
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                      }}>
                        {index + 1}
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <Layers sx={{ fontSize: '3rem', color: 'text.disabled' }} />
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                {t("ace_discard_pile_empty")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscardModalOpen(false)}>
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function SpellDeck(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellDeck {...props} />
    </ThemeProvider>
  );
}
