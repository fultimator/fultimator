import {
  generateTasteKey,
  getTasteCombinations,
} from "/src/libs/gourmetCookingData";

export function getTasteLabel(taste, t) {
  const translate =
    typeof t === "function"
      ? t
      : (key) =>
          ({
            gourmet_taste_no_assigned: "No Taste Assigned",
            gourmet_taste_your_choice: "Your Choice",
            gourmet_taste_bitter: "Bitter",
            gourmet_taste_salty: "Salty",
            gourmet_taste_sour: "Sour",
            gourmet_taste_sweet: "Sweet",
            gourmet_taste_umami: "Umami",
          })[key] || key;

  if (!taste || taste.trim() === "")
    return translate("gourmet_taste_no_assigned");
  if (taste === "choice") return translate("gourmet_taste_your_choice");

  const tasteMap = {
    bitter: translate("gourmet_taste_bitter"),
    salty: translate("gourmet_taste_salty"),
    sour: translate("gourmet_taste_sour"),
    sweet: translate("gourmet_taste_sweet"),
    umami: translate("gourmet_taste_umami"),
  };
  return tasteMap[taste.toLowerCase()] || taste;
}

export function combineIngredientInventory(inventory = [], t = null) {
  const combined = [];
  const byKey = new Map();

  inventory.forEach((item) => {
    const parsedQuantity = Number(item.quantity);
    const quantity = Number.isFinite(parsedQuantity) ? parsedQuantity : 1;
    if (quantity <= 0) return;
    const taste = (item.taste || "").trim().toLowerCase();
    const rawName = (item.name || "").trim();
    const displayName = taste ? getTasteLabel(taste, t) : rawName;
    const key = taste ? `taste:${taste}` : `name:${displayName.toLowerCase()}`;
    const existingIndex = byKey.get(key);

    if (existingIndex == null) {
      byKey.set(key, combined.length);
      combined.push({
        ...item,
        id: item.id || key,
        name: displayName,
        rawName,
        taste,
        quantity,
      });
      return;
    }

    combined[existingIndex] = {
      ...combined[existingIndex],
      quantity: combined[existingIndex].quantity + quantity,
    };
  });

  return combined;
}

export function buildCookbookEffectMap(effects = []) {
  return Object.fromEntries(
    effects
      .filter((effect) => effect.taste1 && effect.taste2)
      .map((effect) => [
        generateTasteKey(effect.taste1, effect.taste2),
        effect,
      ]),
  );
}

export function getSelectedTasteCombinations(selectedIngredients, t) {
  const tasteInstances = selectedIngredients.flatMap((ingredient) =>
    Array.from({ length: ingredient.amount }, () => ingredient.taste),
  );
  const allCombinations = getTasteCombinations(t);
  const combinations = [];
  const seen = new Set();

  for (let i = 0; i < tasteInstances.length; i += 1) {
    for (let j = i + 1; j < tasteInstances.length; j += 1) {
      const key = generateTasteKey(tasteInstances[i], tasteInstances[j]);
      if (seen.has(key)) continue;
      seen.add(key);
      const combo = allCombinations.find((entry) => entry.key === key);
      combinations.push(
        combo || {
          key,
          taste1: tasteInstances[i],
          taste2: tasteInstances[j],
          combination: `${getTasteLabel(tasteInstances[i], t)} + ${getTasteLabel(tasteInstances[j], t)}`,
        },
      );
    }
  }

  return combinations;
}
