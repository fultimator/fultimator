import React, { createContext, useContext, useRef, useState } from "react";
import ConfirmConfirmationDialog from "./ConfirmConfirmationDialog";

interface ConfirmOptions {
  title?: string;
  message: string;
}

type ConfirmFn = (options: string | ConfirmOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmFn | null>(null);

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
    return () => { _imperativeConfirm = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmDialogProvider");
  return ctx;
};

// Imperative escape hatch — set by the provider, consumed by globalConfirm.js
let _imperativeConfirm: ConfirmFn | null = null;

export const setImperativeConfirm = (fn: ConfirmFn) => {
  _imperativeConfirm = fn;
};

export const imperativeConfirm = (options: string | ConfirmOptions): Promise<boolean> | null => {
  return _imperativeConfirm ? _imperativeConfirm(options) : null;
};
