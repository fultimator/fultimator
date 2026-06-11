import React from "react";
import ClockControls from "/src/components/shared/actors/pc/variants/compact/ClockControls";
import { useTranslate } from "/src/translation/translate";

/**
 * Unified clock display for item types that carry a clock definition.
 * Renders nothing when `clock` is absent or has no sections.
 *
 * Usage:
 *   <ItemClock
 *     clock={item.clock}          // { sections: number } from item schema
 *     clockState={item.clockState} // boolean[] from player state
 *     onStateChange={persistState}
 *   />
 */
export default function ItemClock({
  clock,
  clockState,
  onStateChange,
  label,
  clockSize = 36,
  compact = false,
}) {
  const { t } = useTranslate();

  if (!clock?.sections) return null;

  const sections = clock.sections;
  const state = clockState ?? new Array(sections).fill(false);

  return (
    <ClockControls
      sections={sections}
      state={state}
      setState={onStateChange}
      label={label ?? t("Clock")}
      clockSize={clockSize}
      compact={compact}
    />
  );
}
