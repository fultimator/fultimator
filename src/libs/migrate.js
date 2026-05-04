function clamp(value, max) {
  return Math.min(value, max);
}

function changed(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

// Returns human-readable change descriptions, or [] if nothing changed.
export function diffItem(instance, source, type) {
  if (!instance || !source) return [];
  const diffs = [];

  switch (type) {
    case "mnemosphere":
    case "class": {
      if (changed(instance.name, source.name))
        diffs.push(`Name: "${instance.name}" -> "${source.name}"`);

      const instSkills = instance.skills ?? [];
      const srcSkills = source.skills ?? [];
      srcSkills.forEach((srcSkill, i) => {
        const instSkill = instSkills[i];
        if (!instSkill) {
          diffs.push(`Skill ${i + 1}: added "${srcSkill.name}"`);
          return;
        }
        if (changed(instSkill.name, srcSkill.name))
          diffs.push(`Skill "${instSkill.name}": name -> "${srcSkill.name}"`);
        if (changed(instSkill.description, srcSkill.description))
          diffs.push(`Skill "${srcSkill.name}": description changed`);
        if (instSkill.maxLvl !== srcSkill.maxLvl) {
          const wouldClamp = (instSkill.currentLvl ?? 0) > srcSkill.maxLvl;
          diffs.push(
            `Skill "${srcSkill.name}": maxLvl ${instSkill.maxLvl} -> ${srcSkill.maxLvl}` +
              (wouldClamp
                ? ` (your level will be reduced to ${srcSkill.maxLvl})`
                : ""),
          );
        }
      });
      if (instSkills.length > srcSkills.length)
        diffs.push(
          `${instSkills.length - srcSkills.length} skill(s) removed from source`,
        );

      if (
        source.heroic !== undefined &&
        changed(instance.heroic, source.heroic)
      )
        diffs.push("Heroic skill(s) changed");
      if (
        source.spells !== undefined &&
        changed(instance.spells, source.spells)
      )
        diffs.push("Spell list changed");
      break;
    }

    case "hoplosphere": {
      if (changed(instance.name, source.name))
        diffs.push(`Name: "${instance.name}" -> "${source.name}"`);
      if (changed(instance.description, source.description))
        diffs.push("Description changed");
      if (changed(instance.cost, source.cost))
        diffs.push(`Cost: ${instance.cost}z -> ${source.cost}z`);
      if (changed(instance.requiredSlots, source.requiredSlots))
        diffs.push(
          `Required slots: ${instance.requiredSlots} -> ${source.requiredSlots}`,
        );
      if (changed(instance.socketable, source.socketable))
        diffs.push(
          `Socketable: ${instance.socketable} -> ${source.socketable}`,
        );
      if (changed(instance.coagEffects, source.coagEffects))
        diffs.push("Coagulation effects changed");
      break;
    }

    case "heroic": {
      if (changed(instance.name, source.name))
        diffs.push(`Name: "${instance.name}" -> "${source.name}"`);
      if (changed(instance.description, source.description))
        diffs.push("Description changed");
      break;
    }

    case "player-spell": {
      const fields = [
        "name",
        "mp",
        "maxTargets",
        "targetDesc",
        "duration",
        "description",
        "isOffensive",
        "attr1",
        "attr2",
        "opportunity",
        "quality",
      ];
      for (const f of fields) {
        if (changed(instance[f], source[f])) diffs.push(`${f}: changed`);
      }
      break;
    }

    case "npc-spell": {
      const fields = [
        "name",
        "attr1",
        "attr2",
        "type",
        "mp",
        "maxTargets",
        "target",
        "duration",
        "effect",
        "special",
      ];
      for (const f of fields) {
        if (changed(instance[f], source[f])) diffs.push(`${f}: changed`);
      }
      break;
    }

    default:
      break;
  }

  return diffs;
}

// Returns a new instance with source fields merged in, preserving instance-owned data.
export function applyMigration(instance, source, type) {
  if (!instance || !source) return instance;

  switch (type) {
    case "mnemosphere":
    case "class": {
      const srcSkills = source.skills ?? [];
      const instSkills = instance.skills ?? [];
      const mergedSkills = srcSkills.map((srcSkill, i) => {
        const inst = instSkills[i] ?? {};
        const newMaxLvl = srcSkill.maxLvl ?? inst.maxLvl ?? 0;
        return {
          ...srcSkill,
          currentLvl: clamp(inst.currentLvl ?? 0, newMaxLvl),
        };
      });
      return {
        ...instance,
        name: source.name ?? instance.name,
        skills: mergedSkills,
        ...(source.heroic !== undefined && { heroic: source.heroic }),
        ...(source.spells !== undefined && { spells: source.spells }),
      };
    }

    case "hoplosphere":
      return {
        ...instance,
        name: source.name ?? instance.name,
        description: source.description ?? instance.description,
        cost: source.cost ?? instance.cost,
        requiredSlots: source.requiredSlots ?? instance.requiredSlots,
        socketable: source.socketable ?? instance.socketable,
        coagEffects: source.coagEffects ?? instance.coagEffects,
      };

    case "heroic":
      return {
        ...instance,
        name: source.name ?? instance.name,
        description: source.description ?? instance.description,
      };

    case "player-spell": {
      const fields = [
        "name",
        "mp",
        "maxTargets",
        "targetDesc",
        "duration",
        "description",
        "isOffensive",
        "attr1",
        "attr2",
        "opportunity",
        "quality",
      ];
      const patch = {};
      for (const f of fields) {
        if (source[f] !== undefined) patch[f] = source[f];
      }
      return { ...instance, ...patch };
    }

    case "npc-spell": {
      const fields = [
        "name",
        "attr1",
        "attr2",
        "type",
        "mp",
        "maxTargets",
        "target",
        "duration",
        "effect",
        "special",
      ];
      const patch = {};
      for (const f of fields) {
        if (source[f] !== undefined) patch[f] = source[f];
      }
      return { ...instance, ...patch };
    }

    default:
      return instance;
  }
}

function slugify(str) {
  return (str ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Returns all player items that have a _packItemId (or a builtin match) and differ from their source.
export function findPendingMigrations(player, packMap, builtinSources = {}) {
  const results = [];

  function resolveSource(packItemId, expectedType) {
    if (!packItemId) return null;
    if (packItemId.startsWith("builtin:")) {
      const list = builtinSources[expectedType] ?? [];
      return list.find((s) => s._packItemId === packItemId) ?? null;
    }
    for (const pack of packMap.values()) {
      const entry = pack.items.find((i) => i.id === packItemId);
      if (entry) return entry.data;
    }
    return null;
  }

  function resolveBuiltinClass(cls) {
    const list = builtinSources["classes"] ?? [];
    return (
      list.find(
        (s) => s._packItemId === `builtin:${slugify(cls.name ?? "")}`,
      ) ?? null
    );
  }

  (player.classes ?? []).forEach((cls, i) => {
    const source = cls._packItemId
      ? resolveSource(cls._packItemId, "classes")
      : resolveBuiltinClass(cls);
    if (!source) return;
    const normalizedCls = {
      ...cls,
      skills: (cls.skills ?? []).map((s) => ({
        ...s,
        name: s.skillName ?? s.name,
      })),
    };
    const diffs = diffItem(normalizedCls, source, "class");
    if (diffs.length > 0)
      results.push({
        instancePath: `classes[${i}]`,
        instance: cls,
        source,
        type: "class",
        diffs,
      });
  });

  const mnemospheres = player.equipment?.[0]?.mnemospheres ?? [];
  mnemospheres.forEach((m, i) => {
    if (!m._packItemId) return;
    const source = resolveSource(m._packItemId, "mnemospheres");
    if (!source) return;
    const diffs = diffItem(m, source, "mnemosphere");
    if (diffs.length > 0)
      results.push({
        instancePath: `equipment[0].mnemospheres[${i}]`,
        instance: m,
        source,
        type: "mnemosphere",
        diffs,
      });
  });

  const hoplospheres = player.equipment?.[0]?.hoplospheres ?? [];
  hoplospheres.forEach((h, i) => {
    if (!h._packItemId) return;
    const source = resolveSource(h._packItemId, "hoplospheres");
    if (!source) return;
    const diffs = diffItem(h, source, "hoplosphere");
    if (diffs.length > 0)
      results.push({
        instancePath: `equipment[0].hoplospheres[${i}]`,
        instance: h,
        source,
        type: "hoplosphere",
        diffs,
      });
  });

  (player.classes ?? []).forEach((cls, ci) => {
    (cls.spells ?? []).forEach((spell, si) => {
      if (!spell._packItemId) return;
      const source = resolveSource(spell._packItemId, "player-spells");
      if (!source) return;
      const diffs = diffItem(spell, source, "player-spell");
      if (diffs.length > 0)
        results.push({
          instancePath: `classes[${ci}].spells[${si}]`,
          instance: spell,
          source,
          type: "player-spell",
          diffs,
        });
    });
  });

  (player.classes ?? []).forEach((cls, ci) => {
    const heroic = Array.isArray(cls.heroic) ? cls.heroic : [];
    heroic.forEach((h, hi) => {
      if (!h._packItemId) return;
      const source = resolveSource(h._packItemId, "heroics");
      if (!source) return;
      const diffs = diffItem(h, source, "heroic");
      if (diffs.length > 0)
        results.push({
          instancePath: `classes[${ci}].heroic[${hi}]`,
          instance: h,
          source,
          type: "heroic",
          diffs,
        });
    });
  });

  return results;
}

// Applies selected migrations to a player object, returns updated player.
export function applyMigrations(player, migrations, selectedPaths) {
  let updated = { ...player };

  for (const migration of migrations) {
    if (!selectedPaths.has(migration.instancePath)) continue;
    const merged = applyMigration(
      migration.instance,
      migration.source,
      migration.type,
    );
    updated = setAtPath(updated, migration.instancePath, merged);
  }

  return updated;
}

function setAtPath(obj, path, value) {
  const parts = parsePath(path);
  return setDeep(obj, parts, value);
}

function parsePath(path) {
  return path
    .split(/[.[\]]+/)
    .filter(Boolean)
    .map((p) => (/^\d+$/.test(p) ? Number(p) : p));
}

function setDeep(obj, parts, value) {
  if (parts.length === 0) return value;
  const [head, ...tail] = parts;
  if (Array.isArray(obj)) {
    const arr = [...obj];
    arr[head] = setDeep(arr[head], tail, value);
    return arr;
  }
  return { ...obj, [head]: setDeep(obj[head], tail, value) };
}
