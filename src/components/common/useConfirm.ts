import { useContext } from "react";
import { ConfirmDialogContext } from "./ConfirmDialogContext";
import type { ConfirmFn } from "./imperativeConfirm";

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx)
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  return ctx;
};
