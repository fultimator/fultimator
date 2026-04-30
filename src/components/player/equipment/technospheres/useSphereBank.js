import { useCallback } from "react";

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
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
    (hoplo) => patchBank("hoplospheres", (arr) => [...arr, hoplo]),
    [patchBank],
  );

  const addFromCompendium = useCallback(
    (item, type) => {
      if (type === "mnemospheres") addMnemo({ ...item, id: genId() });
      else if (type === "hoplospheres")
        addHoplo({ ...item, id: item.id ?? genId() });
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
    getMnemoAvailableLevels,
  };
}
