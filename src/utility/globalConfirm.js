// Function to get the appropriate confirmation function
export const getConfirmFunction = () => {
    // Check if the Electron API is available
    return window.electron && typeof window.electron.confirm === 'function'
      ? window.electron.confirm
      : (message) => Promise.resolve(window.confirm(message));
  };
  
  // Global confirm function
  export const globalConfirm = async (message) => {
    const confirmFunction = getConfirmFunction();
    return confirmFunction(message);
  };
  