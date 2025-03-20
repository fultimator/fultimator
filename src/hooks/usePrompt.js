import { useEffect } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";
import { useContext } from "react";

export const usePrompt = (message, when) => {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) return;

    const unblock = navigator.block((tx) => {
      if (window.confirm(message)) {
        unblock();
        tx.retry();
      }
    });

    return unblock;
  }, [navigator, message, when]);
};
