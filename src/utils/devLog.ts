const debugEnabled =
  import.meta.env.DEV || localStorage.getItem("debug-combat") === "1";

export const devLog = (...args: unknown[]) => {
  if (!debugEnabled) return;
  console.debug(...args);
};
