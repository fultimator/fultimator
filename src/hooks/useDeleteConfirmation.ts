import { useState, useCallback, useEffect, useRef } from "react";

interface UseDeleteConfirmationOptions {
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * Hook for managing delete confirmation dialogs with Ctrl+click bypass
 *
 * @param options - Configuration with onConfirm callback
 * @returns Object with state and handlers for delete confirmation flow
 *
 * @example
 * const { isOpen, openDialog, closeDialog, handleDelete } = useDeleteConfirmation({
 *   onConfirm: () => { delete the item }
 * });
 *
 * // In your delete button:
 * <Button onClick={handleDelete}>Delete</Button>
 *
 * // In your dialog:
 * <DeleteConfirmationDialog open={isOpen} onConfirm={onConfirm} onClose={closeDialog} ... />
 */

// Global state for tracking if Ctrl is currently pressed
let isCtrlPressed = false;

// Initialize global listeners
if (typeof window !== "undefined") {
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      isCtrlPressed = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (!e.ctrlKey && !e.metaKey) {
      isCtrlPressed = false;
    }
  });
}

export function useDeleteConfirmation({
  onConfirm,
  onCancel,
}: UseDeleteConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const ctrlPressedRef = useRef(false);

  // Update ref when window focus changes
  useEffect(() => {
    const handleFocus = () => {
      ctrlPressedRef.current = isCtrlPressed;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      ctrlPressedRef.current = e.ctrlKey || e.metaKey;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      ctrlPressedRef.current = e.ctrlKey || e.metaKey;
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    onCancel?.();
  }, [onCancel]);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleDelete = useCallback(
    (event?: React.MouseEvent) => {
      // Try multiple ways to detect Ctrl key
      let isCtrl = false;

      if (event) {
        // Direct event properties
        isCtrl = event.ctrlKey || event.metaKey;

        // Try native event
        if (!isCtrl && (event as React.MouseEvent<HTMLElement>).nativeEvent) {
          const nativeEvent = (event as React.MouseEvent<HTMLElement>)
            .nativeEvent;
          isCtrl = nativeEvent.ctrlKey || nativeEvent.metaKey;
        }
      }

      // Fall back to tracking state if direct detection fails
      if (!isCtrl) {
        isCtrl = ctrlPressedRef.current || isCtrlPressed;
      }

      if (isCtrl) {
        // Ctrl/Cmd+click: bypass confirmation dialog and delete directly
        event?.preventDefault?.();
        // Execute the confirmation, whether it's sync or async
        const result = onConfirm() as Promise<void> | void;

        // Handle both sync and async operations
        if (
          result &&
          typeof result === "object" &&
          typeof (result as Promise<void>).finally === "function"
        ) {
          (result as Promise<void>).finally(() => closeDialog());
        } else {
          closeDialog();
        }
      } else {
        // Normal click: show confirmation dialog
        openDialog();
      }
    },
    [onConfirm, openDialog, closeDialog],
  );

  return {
    isOpen,
    openDialog,
    closeDialog,
    handleDelete,
  };
}
