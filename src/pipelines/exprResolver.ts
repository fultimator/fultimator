import type { ExprValue } from "../types/Effects";

export interface ExprBindings {
  sl: number;
  source?: Record<string, unknown>;
  target?: Record<string, unknown>;
  item?: Record<string, unknown>;
}

function getPath(
  obj: Record<string, unknown> | undefined,
  path: string,
): number {
  if (!obj) return 0;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return 0;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "number" ? cur : 0;
}

function resolveToken(token: string, bindings: ExprBindings): number {
  const t = token.trim();
  if (t === "$sl") return bindings.sl;
  if (t.startsWith("@source.")) return getPath(bindings.source, t.slice(8));
  if (t.startsWith("@target.")) return getPath(bindings.target, t.slice(8));
  if (t.startsWith("@item.")) return getPath(bindings.item, t.slice(6));
  const n = Number(t);
  return isNaN(n) ? 0 : n;
}

// Evaluate a single multiplicative term: tokens joined by * and /.
function evalTerm(term: string, bindings: ExprBindings): number {
  const parts = term.split(/([*/])/);
  let result: number | null = null;
  let op = "*";
  for (const part of parts) {
    const p = part.trim();
    if (p === "*" || p === "/") {
      op = p;
    } else if (p !== "") {
      const val = resolveToken(p, bindings);
      if (result === null) {
        result = val;
      } else {
        result = op === "*" ? result * val : val !== 0 ? result / val : 0;
      }
    }
  }
  return result ?? 0;
}

export function resolveExpr(expr: ExprValue, bindings: ExprBindings): number {
  // Split on + and - (additive), evaluate each term (multiplicative) separately.
  // Handles: "$sl * 10", "$sl * @source.bonds.count + 3", "$sl + @target.statusCount - 1"
  const raw = expr.expr;
  const tokens = raw.split(/([+-])/);
  let result = 0;
  let op = "+";
  for (const tok of tokens) {
    const t = tok.trim();
    if (t === "+" || t === "-") {
      op = t;
    } else if (t !== "") {
      const val = evalTerm(t, bindings);
      result = op === "+" ? result + val : result - val;
    }
  }
  return result;
}

export function isExprValue(v: unknown): v is ExprValue {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as ExprValue).expr === "string"
  );
}
