const SPELL_SUBITEMS = [
  ["gifts", "Gifts"],
  ["dances", "Dances"],
  ["tones", "Tones"],
  ["keys", "Keys"],
  ["symbols", "Symbols"],
  ["therioforms", "Therioforms"],
  ["magiseeds", "Magiseeds"],
  ["invocations", "Invocations"],
  ["effects", "Effects"],
  ["targets", "Targets"],
];

const EQUIPMENT_GROUPS = [
  ["weapons", "Weapons"],
  ["customWeapons", "Custom Weapons"],
  ["shields", "Shields"],
  ["armor", "Armor"],
  ["accessories", "Accessories"],
];

function itemName(item, fallback) {
  return item?.customName || item?.name || item?.key || item?.id || fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function joinSource(...parts) {
  return parts.filter(Boolean).join(" > ");
}

function spellModalName(spellType) {
  if (spellType === "arcanist" || spellType === "arcanist-rework")
    return "arcanist";
  if (spellType === "gamble") return "gamble";
  if (spellType === "magichant") return "chanter";
  if (spellType === "symbol") return "symbolist";
  if (spellType === "dance") return "dancer";
  if (spellType === "gift") return "gift";
  if (spellType === "therioform") return "mutant";
  if (spellType === "pilot-vehicle") return "pilot";
  if (spellType === "magiseed") return "magiseed";
  if (spellType === "cooking") return "gourmet";
  if (spellType === "invocation") return "invoker";
  if (spellType?.startsWith("tinkerer-alchemy")) return "tinkerer-alchemy";
  if (spellType?.startsWith("tinkerer-infusion")) return "tinkerer-infusion";
  if (spellType?.startsWith("tinkerer-magitech")) return "tinkerer-magitech";
  if (spellType === "deck") return "deck";
  return "default";
}

function spellSubitemModalName(spell, key) {
  if (spell?.spellType === "magichant" && key === "keys") return "chantKey";
  if (spell?.spellType === "magichant" && key === "tones") return "chantTone";
  return spellModalName(spell?.spellType);
}

function addEffectsFromItem(item, source, out, sourceRef) {
  asArray(item?.behaviors).forEach((behavior, index) => {
    out.behaviors.push({ effect: behavior, source, sourceRef: { ...sourceRef, effectKind: "behavior", effectIndex: index } });
  });
}

function collectSpellEffects(spell, source, out, sourceRef) {
  addEffectsFromItem(spell, source, out, sourceRef);

  for (const [key, label] of SPELL_SUBITEMS) {
    asArray(spell?.[key]).forEach((item, index) => {
      addEffectsFromItem(
        item,
        joinSource(source, label, itemName(item, `${label} ${index + 1}`)),
        out,
        {
          ...sourceRef,
          modalName: spellSubitemModalName(spell, key),
        },
      );
    });
  }

  const vehicles = Array.isArray(spell?.vehicles)
    ? spell.vehicles
    : spell?.currentVehicles;
  asArray(vehicles).forEach((vehicle, vehicleIndex) => {
    const vehicleSource = joinSource(
      source,
      "Vehicles",
      itemName(vehicle, `Vehicle ${vehicleIndex + 1}`),
    );
    addEffectsFromItem(vehicle, vehicleSource, out, {
      ...sourceRef,
      modalName: "pilot",
    });

    asArray(vehicle?.modules).forEach((module, moduleIndex) => {
      addEffectsFromItem(
        module,
        joinSource(
          vehicleSource,
          "Modules",
          itemName(module, `Module ${moduleIndex + 1}`),
        ),
        out,
        {
          ...sourceRef,
          modalName: "pilot",
        },
      );
    });
  });
}

export function collectPlayerEffects(player) {
  const out = { behaviors: [] };

  for (const [index, effect] of asArray(player?.effects).entries()) {
    out.behaviors.push({
      effect,
      source: "Actor",
      sourceRef: { kind: "actorEffect", index },
    });
  }

  for (const klass of asArray(player?.classes)) {
    const className = itemName(klass, "Class");
    for (const skill of asArray(klass?.skills)) {
      addEffectsFromItem(
        skill,
        joinSource(className, "Skills", itemName(skill, "Skill")),
        out,
        { kind: "unsupported", reason: "class-skill" },
      );
    }
    for (const heroic of asArray(klass?.heroic)) {
      addEffectsFromItem(
        heroic,
        joinSource(className, "Heroic", itemName(heroic, "Heroic Skill")),
        out,
        { kind: "unsupported", reason: "heroic-skill" },
      );
    }
    for (const [spellIndex, spell] of asArray(klass?.spells).entries()) {
      collectSpellEffects(
        spell,
        joinSource(className, "Spells", itemName(spell, "Spell")),
        out,
        {
          kind: "spell",
          owner: "class",
          className,
          spellIndex,
          modalName: spellModalName(spell?.spellType),
        },
      );
    }
  }

  for (const [equipmentIndex, equipment] of asArray(player?.equipment).entries()) {
    for (const [key, label] of EQUIPMENT_GROUPS) {
      asArray(equipment?.[key]).forEach((item, index) => {
        addEffectsFromItem(
          item,
          joinSource(label, itemName(item, `${label} ${index + 1}`)),
          out,
          {
            kind: "equipment",
            equipmentIndex,
            group: key,
            itemIndex: index,
          },
        );
      });
    }

    for (const hoplo of asArray(equipment?.hoplospheres)) {
      addEffectsFromItem(
        hoplo,
        joinSource("Hoplospheres", itemName(hoplo, "Hoplosphere")),
        out,
        { kind: "unsupported", reason: "hoplosphere" },
      );
    }

    for (const mnemo of asArray(equipment?.mnemospheres)) {
      const mnemoSource = joinSource(
        "Mnemospheres",
        itemName(mnemo, mnemo?.class || "Mnemosphere"),
      );
      for (const skill of asArray(mnemo?.skills)) {
        addEffectsFromItem(
          skill,
          joinSource(mnemoSource, "Skills", itemName(skill, "Skill")),
          out,
          { kind: "unsupported", reason: "mnemosphere-skill" },
        );
      }
      for (const heroic of asArray(mnemo?.heroic)) {
        addEffectsFromItem(
          heroic,
          joinSource(mnemoSource, "Heroic", itemName(heroic, "Heroic Skill")),
          out,
          { kind: "unsupported", reason: "mnemosphere-heroic" },
        );
      }
      for (const [spellIndex, spell] of asArray(mnemo?.spells).entries()) {
        collectSpellEffects(
          spell,
          joinSource(mnemoSource, "Spells", itemName(spell, "Spell")),
          out,
          {
            kind: "spell",
            owner: "mnemo",
            mnemoId: mnemo?.id,
            spellIndex,
            modalName: spellModalName(spell?.spellType),
          },
        );
      }
    }
  }

  return out;
}
