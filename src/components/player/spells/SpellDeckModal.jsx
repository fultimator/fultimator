import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { Add, Remove, Shuffle } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";

export default function SpellDeckModal({ open, onClose, onSave, onDelete, deck }) {
  const { t } = useTranslate();
  
  const [editedDeck, setEditedDeck] = useState({
    spellType: "deck",
    spellName: "Ace of Cards Deck",
    showInPlayerSheet: true,
    
    // Deck configuration
    suitConfiguration: {
      Air: 'air',
      Earth: 'earth', 
      Fire: 'fire',
      Ice: 'ice'
    },
    
    // Current deck state (only available during conflict)
    cardsInDeck: 30,
    hand: [],
    discardPile: [],
    
    // Deck composition (for reference)
    deckComposition: [
      // Jokers
      { type: 'joker', count: 2 },
      // Air suit (1-7)
      ...Array.from({length: 7}, (_, i) => ({ type: 'card', suit: 'Air', value: i + 1, count: 1 })),
      // Earth suit (1-7)  
      ...Array.from({length: 7}, (_, i) => ({ type: 'card', suit: 'Earth', value: i + 1, count: 1 })),
      // Fire suit (1-7)
      ...Array.from({length: 7}, (_, i) => ({ type: 'card', suit: 'Fire', value: i + 1, count: 1 })),
      // Ice suit (1-7)
      ...Array.from({length: 7}, (_, i) => ({ type: 'card', suit: 'Ice', value: i + 1, count: 1 })),
    ]
  });

  useEffect(() => {
    if (deck) {
      setEditedDeck(prev => ({
        ...prev,
        ...deck,
        suitConfiguration: deck.suitConfiguration || prev.suitConfiguration,
        deckComposition: deck.deckComposition || prev.deckComposition,
        hand: deck.hand || [],
        discardPile: deck.discardPile || [],
        cardsInDeck: deck.cardsInDeck || 30,
      }));
    }
  }, [deck]);

  const handleSave = () => {
    onSave(deck?.index || 0, editedDeck);
  };

  const handleDelete = () => {
    if (window.confirm(t("Are you sure you want to delete this spell?"))) {
      onDelete(deck?.index || 0);
    }
  };

  const handleSuitConfigChange = (suit, damageType) => {
    setEditedDeck(prev => ({
      ...prev,
      suitConfiguration: {
        ...prev.suitConfiguration,
        [suit]: damageType
      }
    }));
  };

  const generateNewDeck = () => {
    const newDeck = [];
    
    // Add 2 jokers
    newDeck.push({ type: 'joker', isJoker: true }, { type: 'joker', isJoker: true });
    
    // Add cards for each suit (1-7)
    ['Air', 'Earth', 'Fire', 'Ice'].forEach(suit => {
      for (let value = 1; value <= 7; value++) {
        newDeck.push({ 
          type: 'card', 
          suit: suit, 
          value: value, 
          isJoker: false 
        });
      }
    });
    
    // Shuffle the deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    setEditedDeck(prev => ({
      ...prev,
      cardsInDeck: 30,
      hand: [],
      discardPile: [],
      fullDeck: newDeck
    }));
  };

  const drawCards = (count) => {
    const newHand = [...(editedDeck.hand || [])];
    const remaining = editedDeck.cardsInDeck || 0;
    const actualDraw = Math.min(count, remaining);
    
    // For simulation purposes, generate random cards
    for (let i = 0; i < actualDraw; i++) {
      const suits = ['Air', 'Earth', 'Fire', 'Ice'];
      const isJoker = Math.random() < 0.067; // ~2/30 chance
      
      if (isJoker) {
        newHand.push({ type: 'joker', isJoker: true });
      } else {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = Math.floor(Math.random() * 7) + 1;
        newHand.push({ type: 'card', suit, value, isJoker: false });
      }
    }
    
    setEditedDeck(prev => ({
      ...prev,
      hand: newHand,
      cardsInDeck: remaining - actualDraw
    }));
  };

  const discardHand = () => {
    const newDiscard = [...(editedDeck.discardPile || []), ...(editedDeck.hand || [])];
    setEditedDeck(prev => ({
      ...prev,
      hand: [],
      discardPile: newDiscard
    }));
  };

  const resetForNewConflict = () => {
    setEditedDeck(prev => ({
      ...prev,
      cardsInDeck: 30,
      hand: [],
      discardPile: []
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{deck ? t("ace_deck_edit") : t("ace_deck_add")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t("Basic Information")}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t("ace_deck_name")}
              value={editedDeck.spellName || ""}
              onChange={(e) =>
                setEditedDeck({ ...editedDeck, spellName: e.target.value })
              }
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedDeck.showInPlayerSheet !== false}
                  onChange={(e) =>
                    setEditedDeck({
                      ...editedDeck,
                      showInPlayerSheet: e.target.checked,
                    })
                  }
                />
              }
              label={t("Show in Player Sheet")}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t("ace_suit_configuration")}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("ace_suit_configuration_hint")}
            </Typography>
          </Grid>

          {/* Suit Configuration */}
          {['Air', 'Earth', 'Fire', 'Ice'].map((suit) => (
            <Grid item xs={12} sm={6} key={suit}>
              <FormControl fullWidth>
                <InputLabel>{suit} {t("ace_suit")}</InputLabel>
                <Select
                  value={editedDeck.suitConfiguration?.[suit] || suit.toLowerCase()}
                  onChange={(e) => handleSuitConfigChange(suit, e.target.value)}
                  label={`${suit} ${t("ace_suit")}`}
                >
                  <MenuItem value="air">{t("ace_suit_damage_air")}</MenuItem>
                  <MenuItem value="earth">{t("ace_suit_damage_earth")}</MenuItem>
                  <MenuItem value="fire">{t("ace_suit_damage_fire")}</MenuItem>
                  <MenuItem value="ice">{t("ace_suit_damage_ice")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t("ace_deck_management")} ({t("ace_deck_conflict_only")})
            </Typography>
          </Grid>

          {/* Deck State */}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{t("ace_cards_in_deck")}</Typography>
                <Typography variant="h4">{editedDeck.cardsInDeck || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{t("ace_hand_size")}</Typography>
                <Typography variant="h4">{editedDeck.hand ? editedDeck.hand.length : 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{t("ace_discard_pile")}</Typography>
                <Typography variant="h4">{editedDeck.discardPile ? editedDeck.discardPile.length : 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Deck Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => drawCards(1)}
                disabled={!editedDeck.cardsInDeck}
                startIcon={<Add />}
              >
                {t("ace_draw_1_card")}
              </Button>
              <Button
                variant="outlined"
                onClick={() => drawCards(5)}
                disabled={!editedDeck.cardsInDeck}
                startIcon={<Add />}
              >
                {t("ace_draw_5_card")}
              </Button>
              <Button
                variant="outlined"
                onClick={discardHand}
                disabled={!editedDeck.hand || editedDeck.hand.length === 0}
                startIcon={<Remove />}
              >
                {t("ace_discard_hand")}
              </Button>
              <Button
                variant="outlined"
                onClick={generateNewDeck}
                startIcon={<Shuffle />}
              >
                {t("ace_shufle_new_deck")}
              </Button>
              <Button
                variant="contained"
                onClick={resetForNewConflict}
                color="primary"
              >
                {t("ace_reset_for_new_conflict")}
              </Button>
            </Box>
          </Grid>

          {/* Card Set Reference */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t("ace_card_set_reference")}
            </Typography>
            <Box sx={{ fontSize: '0.9em' }}>
              <Typography variant="body2"><strong>{t("ace_jackpot")}</strong> {t("ace_jackpot_desc")}</Typography>
              <Typography variant="body2"><strong>{t("ace_magic_flush")}</strong> {t("ace_magic_flush_desc")}</Typography>
              <Typography variant="body2"><strong>{t("ace_blinding_flush")}</strong> {t("ace_blinding_flush_desc")}</Typography>
              <Typography variant="body2"><strong>{t("ace_full_status")}</strong> {t("ace_full_status_desc")}</Typography>
              <Typography variant="body2"><strong>{t("ace_triple_support")}</strong> {t("ace_triple_support_desc")}</Typography>
              <Typography variant="body2"><strong>{t("ace_double_trouble")}</strong> {t("ace_double_trouble_desc")}</Typography>
              <Typography variant="body2"><strong>{t("ace_magic_pair")}</strong> {t("ace_magic_pair_desc")}</Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {deck && (
          <Button onClick={handleDelete} color="error">
            {t("Delete")}
          </Button>
        )}
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button onClick={handleSave} variant="contained">
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}