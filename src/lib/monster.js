// Return either
// - normal
// - resistant
// - vulnerable
// - immune
// - absorb
function element(monster, type) {
  // Check Construct immunities and resistances
  if (monster.type === "Costrutto" && type === "poison") {
    return "immune";
  }
  if (monster.type === "Costrutto" && type === "earth") {
    return "resistant";
  }

  // Check demon resistances
  if (monster.type === "Demone" && monster.typeRules.demonResistances[type]) {
    return "resistant";
  }

  // Check elemental immunities
  if (
    monster.type === "Elementale" &&
    monster.typeRules.elementalImmunities[type]
  ) {
    return "immune";
  }

  // Check plant vulnerabilities
  if (
    monster.type === "Pianta" &&
    monster.typeRules.plantVulnerabilities[type]
  ) {
    return "vulnerable";
  }

  // Check undead immunities and vulnerabilities
  if (monster.type === "Non Morto" && type === "dark") {
    return "immune";
  }
  if (monster.type === "Non Morto" && type === "poison") {
    return "immune";
  }
  if (monster.type === "Non Morto" && type === "light") {
    return "vulnerable";
  }

  return "normal";
}

function skills(monster) {
  let number = 4;

  if (
    monster.type === "Costrutto" ||
    monster.type === "Elementale" ||
    monster.type === "Non Morto"
  ) {
    number = 2;
  }

  if (
    monster.type === "Demone" ||
    monster.type === "Pianta" ||
    monster.type === "Umanoide"
  ) {
    number = 3;
  }

  return number;
}

export { element, skills };
