export type ConfirmFn = (
  options: string | { title?: string; message: string },
) => Promise<boolean>;

let _imperativeConfirm: ConfirmFn | null = null;

export const setImperativeConfirm = (fn: ConfirmFn | null) => {
  _imperativeConfirm = fn;
};

export const imperativeConfirm = (
  options: string | { title?: string; message: string },
): Promise<boolean> | null => {
  return _imperativeConfirm ? _imperativeConfirm(options) : null;
};
