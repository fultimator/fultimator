import React from "react";
import MnemoReceptaclePanel from "/src/components/shared/actors/pc/equipment/technospheres/MnemoReceptaclePanel";

export default function PcMnemoReceptacle({ pc, isInteractive, onUpdate }) {
  return (
    <MnemoReceptaclePanel
      player={pc}
      setPlayer={onUpdate}
      readOnly={!isInteractive}
    />
  );
}
