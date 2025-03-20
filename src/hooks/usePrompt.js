import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

export const usePrompt = (message, when) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!when) return;

    // Handle navigation logic when the user tries to navigate
    const handleNavigate = (event) => {
      if (window.confirm(message)) {
        // Proceed with navigation
        return;
      } else {
        // Prevent navigation by pushing the current location again
        event.preventDefault();
      }
    };

    // Listen for location change and block navigation if necessary
    window.addEventListener("beforeunload", handleNavigate);

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener("beforeunload", handleNavigate);
    };
  }, [message, when, navigate, location]);

  return null;
};
