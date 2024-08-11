export const validateCharacter = (character) => {
    // Error messages array
    let errors = [];
  
    // Check if character is an object and not an array
    if (
      typeof character !== "object" ||
      Array.isArray(character) ||
      character === null
    ) {
      errors.push("The provided JSON is not a valid character.");
      console.log(errors[0]);
      return false;
    }
  
    // Validate basic properties
    const basicProperties = [
      "name",
      "lvl",
      "info",
      "attributes",
      "stats",
      "statuses",
      "classes",
      "weapons",
      "armor",
      "notes",
      "modifiers",
    ];
    for (const prop of basicProperties) {
      if (!character.hasOwnProperty(prop)) {
        errors.push(`Missing: ${prop}`);
      }
    }
  
    // Validate 'info' object
    const infoProps = [
      "pronouns",
      "identity",
      "theme",
      "origin",
      "bonds",
      "description",
      "fabulapoints",
      "exp",
      "zenit",
      "imgurl",
    ];
    if (
      typeof character.info !== "object" ||
      Array.isArray(character.info) ||
      character.info === null
    ) {
      errors.push("Missing: info");
    } else {
      for (const prop of infoProps) {
        if (!character.info.hasOwnProperty(prop)) {
          errors.push(`Missing: ${prop} in info`);
        }
      }
    }
  
    // Validate 'attributes' object
    const attributeProps = ["dexterity", "insight", "might", "willpower"];
    if (
      typeof character.attributes !== "object" ||
      Array.isArray(character.attributes) ||
      character.attributes === null
    ) {
      errors.push("Missing: attributes");
    } else {
      for (const prop of attributeProps) {
        if (
          !character.attributes.hasOwnProperty(prop) ||
          typeof character.attributes[prop] !== "number"
        ) {
          errors.push(`Missing or invalid: ${prop} in attributes`);
        }
      }
    }
  
    // Validate 'stats' object
    const statsProps = ["hp", "mp", "ip"];
    if (
      typeof character.stats !== "object" ||
      Array.isArray(character.stats) ||
      character.stats === null
    ) {
      errors.push("Missing: stats");
    } else {
      for (const stat of statsProps) {
        if (
          !character.stats.hasOwnProperty(stat) ||
          typeof character.stats[stat] !== "object"
        ) {
          errors.push(`Missing: ${stat} in stats`);
        } else {
          const subProps = ["max", "current"];
          for (const prop of subProps) {
            if (
              !character.stats[stat].hasOwnProperty(prop) ||
              typeof character.stats[stat][prop] !== "number"
            ) {
              errors.push(`Missing or invalid: ${stat} ${prop} in stats`);
            }
          }
        }
      }
    }
  
    // Validate 'statuses' object
    const statusProps = [
      "slow",
      "dazed",
      "enraged",
      "weak",
      "shaken",
      "poisoned",
      "dexUp",
      "insUp",
      "migUp",
      "wlpUp",
    ];
    if (
      typeof character.statuses !== "object" ||
      Array.isArray(character.statuses) ||
      character.statuses === null
    ) {
      errors.push("Missing: statuses");
    } else {
      for (const prop of statusProps) {
        if (
          !character.statuses.hasOwnProperty(prop) ||
          typeof character.statuses[prop] !== "boolean"
        ) {
          errors.push(`Missing or invalid: ${prop} in statuses`);
        }
      }
    }
  
    // Validate 'classes', 'weapons', 'armor', 'notes' arrays
    const arrayProps = ["classes", "weapons", "armor", "notes"];
    for (const prop of arrayProps) {
      if (!Array.isArray(character[prop])) {
        errors.push(`Missing or invalid: ${prop}`);
      }
    }
  
    // Validate 'modifiers' object
    const modifierProps = [
      "hp",
      "mp",
      "ip",
      "def",
      "mdef",
      "init",
      "meleePrec",
      "rangedPrec",
      "magicPrec",
    ];
    if (
      typeof character.modifiers !== "object" ||
      Array.isArray(character.modifiers) ||
      character.modifiers === null
    ) {
      errors.push("Missing: modifiers");
    } else {
      for (const prop of modifierProps) {
        if (
          !character.modifiers.hasOwnProperty(prop) ||
          typeof character.modifiers[prop] !== "number"
        ) {
          errors.push(`Missing or invalid: ${prop} in modifiers`);
        }
      }
    }
  
    // Log all errors if any
    if (errors.length > 0) {
      errors.forEach((error) => console.log("Error:", error));
      return false;
    }
  
    return true;
  };
  
  export const validateNpc = (npc) => {
    // Error messages array
    let errors = [];
  
    // Check if npc is an object and not an array
    if (typeof npc !== "object" || Array.isArray(npc) || npc === null) {
      errors.push("The provided JSON is not a valid NPC.");
      console.log(errors[0]);
      return false;
    }
  
    // Validate basic properties
    const basicProperties = [
      "name",
      "species",
      "lvl",
      "attributes",
      "attacks",
      "affinities",
    ];
    for (const prop of basicProperties) {
      if (!npc.hasOwnProperty(prop)) {
        errors.push(`Missing: ${prop}`);
      }
    }
  
    // Validate 'attributes' object
    const attributeProps = ["dexterity", "might", "will", "insight"];
    if (
      typeof npc.attributes !== "object" ||
      Array.isArray(npc.attributes) ||
      npc.attributes === null
    ) {
      errors.push("Missing: attributes");
    } else {
      for (const prop of attributeProps) {
        if (
          !npc.attributes.hasOwnProperty(prop) ||
          typeof npc.attributes[prop] !== "number"
        ) {
          errors.push(`Missing or invalid: ${prop} in attributes`);
        }
      }
    }
  
    // Validate 'attacks' array
    if (!Array.isArray(npc.attacks)) {
      errors.push("Missing or invalid: attacks");
    }
  
    // Validate 'affinities' object
    if (
      typeof npc.affinities !== "object" ||
      Array.isArray(npc.affinities) ||
      npc.affinities === null
    ) {
      errors.push("Missing or invalid: affinities");
    }
  
    // Log all errors if any
    if (errors.length > 0) {
      errors.forEach((error) => console.log("Error:", error));
      return false;
    }
  
    return true;
  };
  