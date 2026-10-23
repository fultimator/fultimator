export const ATTR_LABEL: Record<string, string> = {
  dex: "DEX",
  ins: "INS",
  mig: "MIG",
  wlp: "WLP",
};

export const STUDY_TIERS: { threshold: number; label: string }[] = [
  { threshold: 16, label: "Encyclopedic" },
  { threshold: 13, label: "Detailed" },
  { threshold: 10, label: "Complete" },
  { threshold: 7, label: "Basic" },
];

export const dieCellSx = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 0.25,
  px: 0.75,
  py: 0.5,
  borderRadius: 1.25,
  border: "1px solid",
  backgroundColor: "background.default",
  minWidth: 50,
};

export const gridSx = {
  px: 0.75,
  py: 0.5,
  display: "grid",
  gridTemplateColumns: "24px max-content max-content 24px",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
};
