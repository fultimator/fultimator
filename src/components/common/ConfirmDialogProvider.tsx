import React, { useRef, useState } from "react";
import ConfirmConfirmationDialog from "./ConfirmConfirmationDialog";
import { setImperativeConfirm } from "./imperativeConfirm";
import type { ConfirmFn } from "./imperativeConfirm";
import { ConfirmDialogContext } from "./ConfirmDialogContext";
import type { ConfirmOptions } from "./ConfirmDialogContext";

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm: ConfirmFn = (options) => {
    const normalized: ConfirmOptions =
      typeof options === "string" ? { message: options } : options;

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setPending({ options: normalized, resolve });
    });
  };

  // Register so globalConfirm.js can call it imperatively
  React.useEffect(() => {
    setImperativeConfirm(confirm);
    return () => {
      setImperativeConfirm(null);
    };
  }, []);

  const handleClose = () => {
    resolveRef.current?.(false);
    setPending(null);
  };

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setPending(null);
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <ConfirmConfirmationDialog
        open={pending !== null}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={pending?.options.title}
        message={pending?.options.message ?? ""}
      />
    </ConfirmDialogContext.Provider>
  );
};
