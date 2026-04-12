const CONFIRM_TIMEOUT_MS = 1500;

// Function to get the appropriate confirmation function
export const getConfirmFunction = () => {
  // Check if the Electron API is available
  return window.electron && typeof window.electron.confirm === "function"
    ? window.electron.confirm
    : (confirmMessage) => Promise.resolve(window.confirm(confirmMessage));
};

// Global confirm function with a safe fallback to avoid renderer hangs
export const globalConfirm = async (message) => {
  const confirmFunction = getConfirmFunction();

  try {
    const result = await Promise.race([
      Promise.resolve(confirmFunction(message)),
      new Promise((resolve) =>
        setTimeout(() => resolve("__confirm_timeout__"), CONFIRM_TIMEOUT_MS)
      ),
    ]);

    if (result === "__confirm_timeout__") {
      return window.confirm(message);
    }

    return Boolean(result);
  } catch (error) {
    console.warn("globalConfirm failed, falling back to window.confirm", error);
    return window.confirm(message);
  }
};
  
