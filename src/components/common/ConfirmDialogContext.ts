import { createContext } from "react";
import type { ConfirmFn } from "./imperativeConfirm";

export interface ConfirmOptions {
  title?: string;
  message: string;
}

export const ConfirmDialogContext = createContext<ConfirmFn | null>(null);
