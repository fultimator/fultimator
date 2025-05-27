export const SETTINGS_CONFIG = {
  autoUseMP: {
    key: "combatSimAutoUseMP",
    defaultValue: true,
  },
  autoOpenLogs: {
    key: "combatSimAutoOpenLogs",
    defaultValue: true,
  },
  npcReorderingMethod: {
    key: "combatSimNpcReorderingMethod",
    defaultValue: "dragAndDrop",
  },
  noteReorderingMethod: {
    key: "combatSimNoteReorderingMethod",
    defaultValue: "dragAndDrop",
  },
  autosaveEnabled: {
    key: "combatSimAutosave",
    defaultValue: false,
  },
  showSaveSnackbar: {
    key: "combatSimShowSaveSnackbar",
    defaultValue: true,
  },
  hideLogs: {
    key: "combatSimHideLogs",
    defaultValue: false,
  },
  showBaseAttackEffect: {
    key: "combatSimShowBaseAttackEffect",
    defaultValue: true,
  },
  showWeaponAttackEffect: {
    key: "combatSimShowWeaponAttackEffect",
    defaultValue: true,
  },
  showSpellEffect: {
    key: "combatSimShowSpellEffect",
    defaultValue: true,
  },
  autoCheckTurnAfterRoll: {
    key: "combatSimAutoCheckTurnAfterRoll",
    defaultValue: false,
  },
  askBeforeRemoveNpc: {
    key: "combatSimAskBeforeRemove",
    defaultValue: true,
  },
  askBeforeRemoveClock: {
    key: "combatSimAskBeforeRemoveClock",
    defaultValue: true,
  },
  autoRemoveNPCFaint: {
    key: "combatSimAutoRemoveNPCFaint",
    defaultValue: false,
  },
  autoRollSpellOneTarget: {
    key: "combatSimAutoRollSpellOneTarget",
    defaultValue: false,
  },
  studyValues: {
    key: "combatSimStudyValues",
    defaultValue: "default",
  },

  // Log types
  logEncounterNameUpdated: {
    key: "combatSimLogEncounterNameUpdated",
    defaultValue: true,
    label: "combat_sim_log_encounter_name_updated_label",
    category: "logVisibility",
  },
  logNewRound: {
    key: "combatSimLogNewRound",
    defaultValue: true,
    label: "combat_sim_log_new_round_label",
    category: "logVisibility",
  },
  logRoundIncrease: {
    key: "combatSimLogRoundIncrease",
    defaultValue: true,
    label: "combat_sim_log_round_increase_label",
    category: "logVisibility",
  },
  logRoundDecrease: {
    key: "combatSimLogRoundDecrease",
    defaultValue: true,
    label: "combat_sim_log_round_decrease_label",
    category: "logVisibility",
  },
  logTurnChecked: {
    key: "combatSimLogTurnChecked",
    defaultValue: true,
    label: "combat_sim_log_turn_checked_label",
    category: "logVisibility",
  },
  logNpcAdded: {
    key: "combatSimLogNpcAdded",
    defaultValue: true,
    label: "combat_sim_log_npc_added_label",
    category: "logVisibility",
  },
  logNpcRemoved: {
    key: "combatSimLogNpcRemoved",
    defaultValue: true,
    label: "combat_sim_log_npc_removed_label",
    category: "logVisibility",
  },
  logNpcUsedMp: {
    key: "combatSimLogNpcUsedMp",
    defaultValue: true,
    label: "combat_sim_log_npc_used_mp_label",
    category: "logVisibility",
  },
  logNpcDamage: {
    key: "combatSimLogNpcDamage",
    defaultValue: true,
    label: "combat_sim_log_npc_damage_label",
    category: "logVisibility",
  },
  logNpcDamageNoType: {
    key: "combatSimLogNpcDamageNoType",
    defaultValue: true,
    label: "combat_sim_log_npc_damage_no_type_label",
    category: "logVisibility",
  },
  logNpcHeal: {
    key: "combatSimLogNpcHeal",
    defaultValue: true,
    label: "combat_sim_log_npc_heal_label",
    category: "logVisibility",
  },
  logNpcFainted: {
    key: "combatSimLogNpcFainted",
    defaultValue: true,
    label: "combat_sim_log_npc_fainted_label",
    category: "logVisibility",
  },
  logAttack: {
    key: "combatSimLogAttack",
    defaultValue: true,
    label: "combat_sim_log_attack_label",
    category: "logVisibility",
  },
  logStandardRoll: {
    key: "combatSimLogStandardRoll",
    defaultValue: true,
    label: "combat_sim_log_standard_roll_label",
    category: "logVisibility",
  },
  logSpellUse: {
    key: "combatSimLogSpellUse",
    defaultValue: true,
    label: "combat_sim_log_spell_use_label",
    category: "logVisibility",
  },
  logSpellOffensiveRoll: {
    key: "combatSimLogSpellOffensiveRoll",
    defaultValue: true,
    label: "combat_sim_log_spell_offensive_roll_label",
    category: "logVisibility",
  },
  logCritSuccess: {
    key: "combatSimLogCritSuccess",
    defaultValue: true,
    label: "combat_sim_log_crit_success_label",
    category: "logVisibility",
  },
  logCritFailure: {
    key: "combatSimLogCritFailure",
    defaultValue: true,
    label: "combat_sim_log_crit_failure_label",
    category: "logVisibility",
  },
  logStatusEffectAdded: {
    key: "combatSimLogStatusEffectAdded",
    defaultValue: true,
    label: "combat_sim_log_status_effect_added_label",
    category: "logVisibility",
  },
  logStatusEffectRemoved: {
    key: "combatSimLogStatusEffectRemoved",
    defaultValue: true,
    label: "combat_sim_log_status_effect_removed_label",
    category: "logVisibility",
  },
  logClockAdded: {
    key: "combatSimLogClockAdded",
    defaultValue: true,
    label: "combat_sim_log_clock_added_label",
    category: "logVisibility",
  },
  logClockRemoved: {
    key: "combatSimLogClockRemoved",
    defaultValue: true,
    label: "combat_sim_log_clock_removed_label",
    category: "logVisibility",
  },
  logClockReset: {
    key: "combatSimLogClockReset",
    defaultValue: true,
    label: "combat_sim_log_clock_reset_label",
    category: "logVisibility",
  },
  logClockUpdate: {
    key: "combatSimLogClockUpdate",
    defaultValue: true,
    label: "combat_sim_log_clock_updated_label",
    category: "logVisibility",
  },
  logClockCurrentState: {
    key: "combatSimLogClockCurrentState",
    defaultValue: true,
    label: "combat_sim_log_clock_current_state_label",
    category: "logVisibility",
  },
  logUsedUltimaPoint: {
    key: "combatSimLogUsedUltimaPoint",
    defaultValue: true,
    label: "combat_sim_log_used_ultima_point_label",
    category: "logVisibility",
  },
};

// Helper function to get default settings
export const getDefaultSettings = () => {
  const defaultSettings = {};
  Object.entries(SETTINGS_CONFIG).forEach(([settingName, config]) => {
    defaultSettings[settingName] = config.defaultValue;
  });
  return defaultSettings;
};
