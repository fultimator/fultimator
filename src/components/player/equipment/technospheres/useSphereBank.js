import { useCallback } from "react";
import {
  buildMnemosphere,
  getMnemosphereClassDefinition,
} from "../../../../libs/mnemospheres";

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function clampMnemosphereLevel(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.max(0, Math.min(5, numeric));
}

function prepareMnemosphereImport(item, options = {}) {
  const lvl = clampMnemosphereLevel(
    options.level ?? options.lvl ?? item.lvl ?? 1,
  );
  const className = item.class ?? "";
  const officialDef = getMnemosphereClassDefinition(className);
  const rebuilt = officialDef ? buildMnemosphere(className, lvl) : null;

  return {
    ...item,
    ...(rebuilt ?? {}),
    id: genId(),
    name: item.name ?? rebuilt?.name,
    class: className || rebuilt?.class,
    lvl,
    baseLvl: lvl,
  };
}

export default function useSphereBank(player, setPlayer) {
  const eq0 = player?.equipment?.[0] ?? {};
  const mnemospheres = eq0.mnemospheres ?? [];
  const hoplospheres = eq0.hoplospheres ?? [];

  const patchBank = useCallback(
    (key, updater) => {
      setPlayer((prev) => {
        const prevEq0 = prev?.equipment?.[0] ?? {};
        const eq0New = { ...prevEq0, [key]: updater(prevEq0[key] ?? []) };
        const equipment = prev?.equipment
          ? [eq0New, ...prev.equipment.slice(1)]
          : [eq0New];
        return { ...prev, equipment };
      });
    },
    [setPlayer],
  );

  const addMnemo = useCallback(
    (mnemo) => patchBank("mnemospheres", (arr) => [...arr, mnemo]),
    [patchBank],
  );

  const addHoplo = useCallback(
    (hoplo) =>
      patchBank("hoplospheres", (arr) => [
        ...arr,
        { ...hoplo, id: hoplo.id ?? genId() },
      ]),
    [patchBank],
  );

  const addFromCompendium = useCallback(
    (item, type, options = {}) => {
      if (type === "mnemospheres")
        addMnemo(prepareMnemosphereImport(item, options));
      else if (type === "hoplospheres") addHoplo({ ...item, id: genId() });
    },
    [addMnemo, addHoplo],
  );

  const deleteMnemo = useCallback(
    (id) => patchBank("mnemospheres", (arr) => arr.filter((m) => m.id !== id)),
    [patchBank],
  );

  const deleteHoplo = useCallback(
    (id) => patchBank("hoplospheres", (arr) => arr.filter((h) => h.id !== id)),
    [patchBank],
  );

  const changeMnemoSkillLevel = useCallback(
    (id, skillIndex, delta) => {
      patchBank("mnemospheres", (arr) =>
        arr.map((mnemo) => {
          if (mnemo.id !== id) return mnemo;
          const usedLevels = (mnemo.skills ?? []).reduce(
            (sum, s) => sum + (s.currentLvl ?? 0),
            0,
          );
          const mnemoLvl = mnemo.lvl ?? 1;
          const skills = (mnemo.skills ?? []).map((skill, index) => {
            if (index !== skillIndex) return skill;
            const currentLvl = skill.currentLvl ?? 0;
            const maxLvl = skill.maxLvl ?? 0;
            const next = currentLvl + delta;
            if (next > currentLvl && usedLevels >= mnemoLvl) return skill;
            return {
              ...skill,
              currentLvl: Math.max(0, Math.min(maxLvl, next)),
            };
          });
          return { ...mnemo, skills };
        }),
      );
    },
    [patchBank],
  );

  const investMnemoLevel = useCallback(
    (id) => {
      patchBank("mnemospheres", (arr) =>
        arr.map((mnemo) => {
          if (mnemo.id !== id) return mnemo;
          const currentLvl = mnemo.lvl ?? 1;
          const newLvl = Math.min(5, currentLvl + 1);
          if (newLvl === currentLvl) return mnemo;
          const classDef = getMnemosphereClassDefinition(mnemo.class);
          if (!classDef) {
            // Compendium-sourced sphere with no official definition, just bump the level
            return {
              ...mnemo,
              baseLvl: mnemo.baseLvl ?? currentLvl,
              lvl: newLvl,
            };
          }
          const rebuilt = buildMnemosphere(mnemo.class, newLvl);
          const existingNames = new Set(
            (mnemo.skills ?? []).map((s) => s.name),
          );
          const newSkills = rebuilt.skills.filter(
            (s) => !existingNames.has(s.name),
          );
          const existingHeroicNames = new Set(
            (mnemo.heroic ?? []).map((h) => h.name),
          );
          const newHeroic = rebuilt.heroic.filter(
            (h) => !existingHeroicNames.has(h.name),
          );
          return {
            ...mnemo,
            baseLvl: mnemo.baseLvl ?? currentLvl,
            lvl: newLvl,
            heroic: [...(mnemo.heroic ?? []), ...newHeroic],
            skills: [...(mnemo.skills ?? []), ...newSkills],
          };
        }),
      );
    },
    [patchBank],
  );

  const refundMnemoLevel = useCallback(
    (id) => {
      patchBank("mnemospheres", (arr) =>
        arr.map((mnemo) => {
          if (mnemo.id !== id) return mnemo;
          const currentLvl = mnemo.lvl ?? 1;
          const baseLvl = mnemo.baseLvl ?? 1;
          if (currentLvl <= baseLvl) return mnemo;
          const newLvl = currentLvl - 1;
          // Clamp allocated skill points down to fit the new level budget
          const usedLevels = (mnemo.skills ?? []).reduce(
            (sum, s) => sum + (s.currentLvl ?? 0),
            0,
          );
          let overflow = usedLevels - newLvl;
          const skills =
            overflow <= 0
              ? mnemo.skills
              : (mnemo.skills ?? []).reduceRight(
                  (acc, skill) => {
                    if (acc.overflow <= 0)
                      return { ...acc, skills: [skill, ...acc.skills] };
                    const remove = Math.min(
                      acc.overflow,
                      skill.currentLvl ?? 0,
                    );
                    return {
                      overflow: acc.overflow - remove,
                      skills: [
                        {
                          ...skill,
                          currentLvl: (skill.currentLvl ?? 0) - remove,
                        },
                        ...acc.skills,
                      ],
                    };
                  },
                  { overflow, skills: [] },
                ).skills;
          return { ...mnemo, lvl: newLvl, skills };
        }),
      );
    },
    [patchBank],
  );

  const getMnemoAvailableLevels = useCallback((mnemo) => {
    const usedLevels = (mnemo.skills ?? []).reduce(
      (sum, s) => sum + (s.currentLvl ?? 0),
      0,
    );
    return (mnemo.lvl ?? 1) - usedLevels;
  }, []);

  return {
    mnemospheres,
    hoplospheres,
    addMnemo,
    addHoplo,
    addFromCompendium,
    deleteMnemo,
    deleteHoplo,
    changeMnemoSkillLevel,
    investMnemoLevel,
    refundMnemoLevel,
    getMnemoAvailableLevels,
  };
}
