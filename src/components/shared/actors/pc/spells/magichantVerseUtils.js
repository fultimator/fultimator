export const volumes = [
  { name: "magichant_volume_low", mp: 10, target: "magichant_volume_low_target" },
  { name: "magichant_volume_medium", mp: 20, target: "magichant_volume_medium_target" },
  { name: "magichant_volume_high", mp: 30, target: "magichant_volume_high_target" },
];

export function substituteKeyValues(text, chantKey, t) {
  if (!text || !chantKey) return text;
  const isCustom = chantKey.key === "magichant_custom_name";
  const type = isCustom ? chantKey.type || "-" : t(chantKey.type);
  const status = isCustom ? chantKey.status || "-" : t(chantKey.status);
  const attribute = isCustom ? chantKey.attribute || "-" : chantKey.attribute;
  const recovery = isCustom ? chantKey.recovery || "-" : chantKey.recovery;
  return text
    .replace(/key type/gi, type)
    .replace(/key status effect/gi, status)
    .replace(/key Attribute/gi, attribute)
    .replace(/key recovery/gi, recovery);
}
