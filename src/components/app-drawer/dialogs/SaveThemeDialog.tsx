import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { CompendiumPack } from "../../../types/CompendiumPack";

interface SaveThemeDialogProps {
  open: boolean;
  packs: CompendiumPack[];
  onConfirm: (name: string, description: string | null, packId: string) => void;
  onCancel: () => void;
}

export const SaveThemeDialog: React.FC<SaveThemeDialogProps> = ({
  open,
  packs,
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [packId, setPackId] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      const personal = packs.find((p) => p.isPersonal);
      setPackId(personal?.id ?? packs[0]?.id ?? "");
    }
  }, [open, packs]);

  const handleConfirm = () => {
    const trimmedName = name.trim();
    if (!trimmedName || !packId) return;
    onConfirm(trimmedName, description.trim() || null, packId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim() && packId) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Save Theme</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: "16px !important",
        }}
      >
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          size="small"
          autoFocus
          required
          slotProps={{ htmlInput: { maxLength: 80 } }}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={2}
          slotProps={{ htmlInput: { maxLength: 300 } }}
        />
        <FormControl fullWidth size="small" required>
          <InputLabel id="save-theme-pack-label">Save to Pack</InputLabel>
          <Select
            labelId="save-theme-pack-label"
            value={packId}
            label="Save to Pack"
            onChange={(e) => setPackId(e.target.value)}
          >
            {packs.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
                {p.isPersonal ? " (Personal)" : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!name.trim() || !packId}
        >
          Save Theme
        </Button>
      </DialogActions>
    </Dialog>
  );
};
