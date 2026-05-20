import { useState } from "react";

export default function useLevelUpFlow() {
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState(false);
  const [levelUpCelebrationOpen, setLevelUpCelebrationOpen] = useState(false);

  const openLevelUpDialog = () => setLevelUpDialogOpen(true);
  const closeLevelUpDialog = () => setLevelUpDialogOpen(false);
  const closeCelebration = () => setLevelUpCelebrationOpen(false);
  const closeAll = () => {
    setLevelUpDialogOpen(false);
    setLevelUpCelebrationOpen(false);
  };

  const confirmLevelUp = (applyFn) => {
    const didLevel = applyFn?.() !== false;
    setLevelUpDialogOpen(false);
    if (didLevel) setLevelUpCelebrationOpen(true);
  };

  return {
    levelUpDialogOpen,
    levelUpCelebrationOpen,
    openLevelUpDialog,
    closeLevelUpDialog,
    closeCelebration,
    closeAll,
    confirmLevelUp,
  };
}

