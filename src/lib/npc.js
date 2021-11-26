// Return either
// - normal
// - resistant
// - vulnerable
// - immune
// - absorb
function element(npc, type) {
  // Check Construct immunities and resistances
  if (npc.type === "Costrutto" && type === "poison") {
    return "immune";
  }
  if (npc.type === "Costrutto" && type === "earth") {
    return "resistant";
  }

  // Check demon resistances
  if (npc.type === "Demone" && npc.typeRules.demonResistances[type]) {
    return "resistant";
  }

  // Check elemental immunities
  if (npc.type === "Elementale" && npc.typeRules.elementalImmunities[type]) {
    return "immune";
  }

  // Check plant vulnerabilities
  if (npc.type === "Pianta" && npc.typeRules.plantVulnerabilities[type]) {
    return "vulnerable";
  }

  // Check undead immunities and vulnerabilities
  if (npc.type === "Non Morto" && type === "dark") {
    return "immune";
  }
  if (npc.type === "Non Morto" && type === "poison") {
    return "immune";
  }
  if (npc.type === "Non Morto" && type === "light") {
    return "vulnerable";
  }

  return "normal";
}

function skills(npc) {
  let number = 4;

  if (
    npc.type === "Costrutto" ||
    npc.type === "Elementale" ||
    npc.type === "Non Morto"
  ) {
    number = 2;
  }

  if (
    npc.type === "Demone" ||
    npc.type === "Pianta" ||
    npc.type === "Umanoide"
  ) {
    number = 3;
  }

  return number;
}

export { element, skills };
