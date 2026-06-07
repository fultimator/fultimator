import React, { useEffect, useRef } from "react";
import EditResourcesModal from "../shared/actors/common/EditResourcesModal";
import {
  buildDamageContext,
  resolveDamage,
} from "../../pipelines/damagePipeline";
import { useTheme } from "@mui/material/styles";
import { newShade } from "../../libs/playerCalculations";
import { villainUltimaMax } from "../../routes/combat/combatSimulator";
import { calcHP, calcMP } from "../../libs/npcs";

const DamageHealDialog = ({
  open,
  handleClose,
  handleSubmit,
  statType,
  npcClicked,
  typesList,
  value,
  setValue,
  isHealing,
  setIsHealing,
  damageType,
  setDamageType,
  isGuarding,
  setIsGuarding,
  clickedEntityType,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const resourceKey = String(statType || "HP").toLowerCase();
  const pendingSubmitRef = useRef(null);
  const resolveCurrent = (key) => {
    if (key === "hp") {
      return (
        npcClicked?.combatStats?.currentHp ??
        npcClicked?.stats?.hp?.current ??
        0
      );
    }
    if (key === "ip") {
      return (
        npcClicked?.combatStats?.currentIp ??
        npcClicked?.stats?.ip?.current ??
        0
      );
    }
    if (key === "fp") {
      return (
        npcClicked?.combatStats?.currentFp ??
        npcClicked?.info?.fabulapoints ??
        0
      );
    }
    if (key === "up") {
      return (
        npcClicked?.combatStats?.ultima ??
        npcClicked?.ultima ??
        npcClicked?.up ??
        0
      );
    }
    return (
      npcClicked?.combatStats?.currentMp ?? npcClicked?.stats?.mp?.current ?? 0
    );
  };
  const resolveMax = (key) => {
    if (key === "hp") {
      const calc = calcHP(npcClicked);
      return calc > 0
        ? calc
        : (npcClicked?.combatStats?.maxHp ??
            npcClicked?.stats?.hp?.max ??
            resolveCurrent("hp"));
    }
    if (key === "mp") {
      const storedMax =
        npcClicked?.combatStats?.maxMp ?? npcClicked?.stats?.mp?.max;
      if (Number.isFinite(storedMax) && storedMax > 0) return storedMax;
      const calc = calcMP(npcClicked);
      return calc > 0 ? calc : resolveCurrent("mp");
    }
    if (key === "ip") {
      return (
        npcClicked?.combatStats?.maxIp ??
        npcClicked?.stats?.ip?.max ??
        npcClicked?.ip ??
        resolveCurrent("ip")
      );
    }
    if (key === "fp") {
      if (clickedEntityType === "pc") return Infinity;
      return npcClicked?.combatStats?.maxFp ?? 6;
    }
    if (key === "up") {
      return villainUltimaMax(npcClicked?.villain);
    }
    return resolveCurrent(key);
  };

  const current = resolveCurrent(resourceKey);
  const max = resolveMax(resourceKey);

  useEffect(() => {
    const pending = pendingSubmitRef.current;
    if (!pending) return;
    const modeSettled = (isHealing ? "heal" : "damage") === pending.mode;
    const amountSettled = String(value ?? "") === String(pending.amount);
    const damageTypeSettled =
      String(damageType || "physical") ===
      String(pending.damageType || "physical");
    const guardingSettled = Boolean(isGuarding) === Boolean(pending.isGuarding);
    if (
      !modeSettled ||
      !amountSettled ||
      !damageTypeSettled ||
      !guardingSettled
    )
      return;
    pendingSubmitRef.current = null;
    handleSubmit?.({ preventDefault: () => {} });
  }, [value, isHealing, damageType, isGuarding, handleSubmit]);

  const onApply = ({
    amount,
    mode,
    damageType: nextDamageType,
    isGuarding: nextGuarding,
  }) => {
    const payload = {
      amount: Math.max(0, parseInt(amount, 10) || 0),
      mode: mode === "heal" ? "heal" : "damage",
      damageType: nextDamageType ?? "physical",
      isGuarding: Boolean(nextGuarding),
    };
    pendingSubmitRef.current = payload;
    setValue(payload.amount);
    setIsHealing(payload.mode === "heal");
    setDamageType(payload.damageType);
    setIsGuarding(payload.isGuarding);
  };

  const onCloseSafe = () => {
    if (pendingSubmitRef.current) return;
    handleClose?.();
  };

  const onSetCurrent = (nextCurrent) => {
    const boundedTarget = Math.max(
      0,
      Number.isFinite(max)
        ? Math.min(Number(nextCurrent) || 0, max)
        : Number(nextCurrent) || 0,
    );
    const delta = boundedTarget - current;
    if (delta === 0) {
      handleClose?.();
      return;
    }
    const nextMode = delta > 0 ? "heal" : "damage";
    const payload = {
      amount: Math.abs(delta),
      mode: nextMode,
      damageType: damageType || "physical",
      isGuarding: Boolean(isGuarding),
    };
    pendingSubmitRef.current = payload;
    setIsHealing(nextMode === "heal");
    setValue(payload.amount);
  };

  const filteredDamageTypes = Array.isArray(typesList)
    ? typesList.filter((type) => type && type !== "")
    : [];

  return (
    <EditResourcesModal
      open={open}
      onClose={onCloseSafe}
      title={String(statType || "").toUpperCase()}
      actorName={npcClicked?.name}
      resourceKey={resourceKey}
      current={current}
      max={max}
      damageTypes={
        filteredDamageTypes.length > 0 ? filteredDamageTypes : ["physical"]
      }
      amount={String(value ?? "")}
      onAmountChange={setValue}
      mode={isHealing ? "heal" : "damage"}
      onModeChange={(nextMode) => setIsHealing(nextMode === "heal")}
      damageType={damageType || "physical"}
      onDamageTypeChange={setDamageType}
      isGuarding={Boolean(isGuarding)}
      onGuardingChange={setIsGuarding}
      resourcePalette={{
        hp: {
          color1: isDark
            ? newShade(theme.palette.error.main, 10)
            : newShade(theme.palette.error.main, 80),
          color2: theme.palette.error.main,
        },
        mp: {
          color1: isDark
            ? newShade(theme.palette.info.main, 10)
            : newShade(theme.palette.info.main, 80),
          color2: theme.palette.info.main,
        },
        ip: {
          color1: isDark
            ? newShade(theme.palette.success.main, 10)
            : newShade(theme.palette.success.main, 80),
          color2: theme.palette.success.main,
        },
        fp: {
          color1: isDark
            ? newShade(theme.palette.warning.main, 10)
            : newShade(theme.palette.warning.main, 80),
          color2: theme.palette.warning.main,
        },
        up: {
          color1: isDark
            ? newShade(theme.palette.secondary.main, 10)
            : newShade(theme.palette.secondary.main, 80),
          color2: theme.palette.secondary.main,
        },
      }}
      resolvePreviewDelta={({
        amount,
        mode,
        damageType: previewType,
        isGuarding: previewGuarding,
        resourceKey: previewResource,
      }) => {
        if (mode === "heal") return amount;
        if (previewResource !== "hp") return -amount;
        const ctx = buildDamageContext({
          baseDamage: amount,
          damageType: previewType || "untyped",
          npcAffinities: npcClicked?.affinities || {},
          temporaryAffinities: npcClicked?.runtimeActor?.temporaryAffinities,
          isGuarding: Boolean(previewGuarding),
        });
        return -resolveDamage(ctx).finalDamage;
      }}
      onApply={onApply}
      onSetCurrent={onSetCurrent}
      showQuickHpTargets
      showGuardOption={resourceKey === "hp" && !isHealing}
      showDamageType={resourceKey === "hp" && !isHealing}
    />
  );
};

export default DamageHealDialog;
