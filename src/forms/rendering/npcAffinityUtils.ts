const AFFINITY_STR_TO_NUM: Record<string, number> = {
  vu: 0,
  "": 1,
  rs: 2,
  im: 3,
  ab: 4,
};

const AFFINITY_NUM_TO_STR: Record<number, string> = {
  0: "vu",
  1: "",
  2: "rs",
  3: "im",
  4: "ab",
};

export function affinityStrToNum(v: string | undefined): number {
  if (v == null) return 1;
  return AFFINITY_STR_TO_NUM[v] ?? 1;
}

export function affinityNumToStr(n: number): string {
  return AFFINITY_NUM_TO_STR[n] ?? "";
}
