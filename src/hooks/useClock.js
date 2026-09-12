/**
 * Business logic for boolean-array clocks (sections stored as boolean[]).
 * All consumers should use this hook instead of inlining increment/decrement/reset.
 *
 * @param {number}   sections  - Total number of clock sections
 * @param {boolean[]} state    - Current filled state array
 * @param {function} onChange  - Called with the new boolean[] on any change
 */
export function useClock(sections, state, onChange) {
  const filledCount = state.filter(Boolean).length;

  const set = (newState) => onChange(newState);

  const increment = () => {
    if (filledCount < sections) {
      const next = new Array(sections).fill(false);
      for (let i = 0; i <= filledCount; i++) next[i] = true;
      onChange(next);
    }
  };

  const decrement = () => {
    if (filledCount > 0) {
      const next = [...state];
      next[filledCount - 1] = false;
      onChange(next);
    }
  };

  const reset = () => onChange(new Array(sections).fill(false));

  return { filledCount, set, increment, decrement, reset };
}

/**
 * Adapter for numeric clocks (gift/magiseed spells store clock as a number 0-N).
 *
 * @param {number} maxSections - Max value (always 4 for gift/magiseed)
 * @param {number} value       - Current numeric value
 * @param {function} onChange  - Called with new numeric value
 */
export function useNumericClock(maxSections, value, onChange) {
  const toState = (n) => {
    const s = new Array(maxSections).fill(false);
    for (let i = 0; i < n && i < maxSections; i++) s[i] = true;
    return s;
  };

  const fromState = (boolArr) => boolArr.filter(Boolean).length;

  const state = toState(value);

  const set = (newState) => onChange(fromState(newState));
  const increment = () => {
    if (value < maxSections) onChange(value + 1);
  };
  const decrement = () => {
    if (value > 0) onChange(value - 1);
  };
  const reset = () => onChange(0);

  return { filledCount: value, state, set, increment, decrement, reset };
}
