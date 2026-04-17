import React from "react";
import PlayerControls from "../playerSheet/PlayerControls";

export default function EditPlayerStats({
  player,
  setPlayer,
  updateMaxStats: _updateMaxStats,
  isEditMode: _isEditMode,
}) {
  return <PlayerControls player={player} setPlayer={setPlayer} />;
}
