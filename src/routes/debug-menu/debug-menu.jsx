import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Divider,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import TabletMacOutlinedIcon from "@mui/icons-material/TabletMacOutlined";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EditOffOutlinedIcon from "@mui/icons-material/EditOffOutlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import Layout from "../../components/Layout";
import { useTranslate } from "../../translation/translate";
import weapons from "../../libs/weapons";
import armor from "../../libs/armor";
import shields from "../../libs/shields";
import qualities from "../../libs/qualities";
import heroics from "../../libs/heroics";
import classList, {
  spellList,
  arcanumList,
  tinkererInfusion,
} from "../../libs/classes";
import { availableFrames, availableModules } from "../../libs/pilotVehicleData";
import { npcSpells } from "../../libs/npcSpells";
import { npcAttacks } from "../../libs/npcAttacks";
import { magiseeds } from "../../libs/floralistMagiseedData";
import {
  availableGifts,
  availableDances,
  availableTherioforms,
  availableSymbols,
  invocationsByWellspring,
  availableMagichantKeys,
  availableMagichantTones,
} from "../../libs/player/spellOptionData";
import {
  SharedWeaponCard,
  SharedCustomWeaponCard,
  SharedArmorCard,
  SharedShieldCard,
  SharedAccessoryCard,
  SharedSpellCard,
  SharedPlayerSpellCard,
  SharedGambleSpellCard,
  SharedGiftCard,
  SharedDanceCard,
  SharedTherioformCard,
  SharedArcanumCard,
  SharedArcanumReworkCard,
  SharedPilotVehicleCard,
  SharedMagichantCard,
  SharedAlchemyCard,
  SharedInfusionCard,
  SharedMagitechCard,
  SharedInvocationCard,
  SharedCookingCard,
  SharedMagiseedCard,
  SharedSymbolCard,
  SharedAttackCard,
  SharedSpecialRuleCard,
  SharedActionCard,
  SharedClassCard,
  SharedSkillCard,
  SharedHeroicCard,
  SharedOptionalCard,
  SharedQualityCard,
  SharedRitualCard,
  SharedProjectCard,
  SharedZeroPowerCard,
} from "../../components/shared/items";
import { NpcActorCard } from "../../components/shared/actors";
import { PcActorCard } from "../../components/shared/actors";
import { PcActorCardCompact } from "../../components/shared/actors";
import { SAMPLE_PC } from "./pc-fixtures";
import { SAMPLE_NPC } from "./npc-fixtures";
import {
  applyExpLevelUp,
  canLevelUpFromExp as canLevelUpFromExpCheck,
} from "../../libs/player/levelUpLogic";
import { executeCommand } from "../../components/app-drawer/panels/chat/domain/commands";
import { useChatMessagesStore } from "../../store/chatMessagesStore";
// Item card sample data

function buildSamples() {
  const weaponBase =
    weapons.find((w) => w.name !== "Unarmed Strike") || weapons[0];
  const armorBase = armor[0];
  const shieldBase = shields[0];
  const quality = qualities[0];
  const heroic = heroics[0];
  const cls = classList[0];
  const npcSpell = npcSpells[0];
  const npcAttack = npcAttacks[0];
  const playerSpell = spellList[0];
  const gambleSpell = spellList.find((spell) => spell.spellType === "gamble");
  const arcanum = arcanumList[0];
  const gift = availableGifts.find((g) => !g.customName) || availableGifts[0];
  const dance = availableDances[0];
  const therioform = availableTherioforms[0];
  const symbol = availableSymbols?.[0];
  const wellspring = Object.keys(invocationsByWellspring)[0];
  const invocation = invocationsByWellspring[wellspring]?.[0];
  const magiseed = magiseeds[0];
  const magichantKey = availableMagichantKeys[0];
  const magichantTone = availableMagichantTones[0];
  const pilotFrame = availableFrames[0];
  const pilotWeapon =
    availableModules.weapon.find(
      (m) => m.name === "pilot_module_machine_gun",
    ) ?? availableModules.weapon[0];
  const vehicleModule = availableModules.support[1];
  const infusionEffect = tinkererInfusion.effects[0];

  const classSkill = cls?.skills?.[0];
  const skill = classSkill
    ? {
        className: cls.name,
        skillName: classSkill.skillName,
        currentLvl: 1,
        description: classSkill.description,
      }
    : null;

  return {
    weapon: {
      ...weaponBase,
      quality:
        weaponBase.quality ||
        "When you increase/decrease a clock, your damage type for all melee attacks changes to fire. This effect last till the end of your next turn.",
    },
    armor: {
      ...armorBase,
      quality:
        armorBase.quality ||
        "When you get hit by a ranged attack and the accuracy is an even number, you increase your dexterity by one die size higher. This effect last till the end of your next turn.",
    },
    shield: {
      ...shieldBase,
      quality:
        shieldBase.quality ||
        "When you get hit by a melee attack, you are immune to poisoned. This effect last till the start of your next turn.",
    },
    accessory: {
      name: "Chronometer Pendant",
      cost: 300,
      quality: "Once per scene, reroll a failed accuracy check.",
    },
    customWeapon: {
      name: "Prototype Halberd",
      cost: 300,
      category: "weapon_category_heavy",
      range: "weapon_range_reach",
      hands: 2,
      type: "physical",
      accuracyCheck: { att1: "dexterity", att2: "might" },
      customizations: [
        { name: "weapon_customization_accurate" },
        { name: "weapon_customization_powerful" },
      ],
      damageModifier: 0,
      precModifier: 0,
    },
    npcSpell,
    playerSpell: playerSpell ? { ...playerSpell, isMagisphere: true } : null,
    gambleSpell: gambleSpell ? { ...gambleSpell, isMagisphere: true } : null,
    gift: gift ? { ...gift, spellType: "gift" } : null,
    dance: dance ? { ...dance, spellType: "dance" } : null,
    therioform: therioform ? { ...therioform, spellType: "therioform" } : null,
    arcanum: arcanum ? { ...arcanum, spellType: "arcanist" } : null,
    symbol: symbol ? { ...symbol, spellType: "symbol" } : null,
    invocation: invocation
      ? { ...invocation, wellspring, spellType: "invocation" }
      : null,
    magiseed: magiseed ? { ...magiseed, spellType: "magiseed" } : null,
    npcAttack,
    npcSpecialRule: {
      name: "Lorem Ipsum",
      spCost: 2,
      effect: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    npcAction: {
      name: "Lorem Ipsum",
      spCost: 1,
      effect: "Lorem ipsum dolor sit amet, **consectetur** adipiscing elit.",
    },
    cls,
    skill,
    heroic,
    optional: {
      name: "Lorem Ipsum",
      subtype: "quirk",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      effect: "Lorem Ipsum, **consectetur** adipiscing elit.",
    },
    quality,
    ritual: {
      name: "Lorem Ipsum",
      pm: 20,
      dl: 10,
      clock: "4",
      power: "medium",
      area: "individual",
      itemHeld: true,
      dlReduction: 3,
      fastRitual: true,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    project: {
      name: "Lorem Ipsum",
      power: "strong",
      area: "individual",
      uses: "consumable",
      cost: 1000,
      progress: 24,
      defect: false,
      tinkerers: 2,
      progressPerDay: 3,
      visionary: 2,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    zeroPower: {
      name: "Lorem Ipsum",
      clock: { sections: 6 },
      zeroTrigger: {
        name: "Truth",
        description: "Lorem ipsum, **consectetur** adipiscing elit.",
      },
      zeroEffect: {
        name: "Zero Ipsum",
        description:
          "Lorem ipsum dolor sit amet, **consectetur** adipiscing elit.",
      },
    },
    arcanumRework: arcanum
      ? {
          ...arcanum,
          spellType: "arcanist-rework",
          mergeName: "Lorem Ipsum",
          dismissName: "Lorem Ipsum",
          pulseName: "Lorem Ipsum",
          pulseDesc: "Lorem Ipsum, **consectetur** adipiscing elit.",
        }
      : null,
    pilotFrame: pilotFrame
      ? { ...pilotFrame, spellType: "pilot", pilotSubtype: "frame" }
      : null,
    pilotWeapon: pilotWeapon
      ? { ...pilotWeapon, spellType: "pilot", pilotSubtype: "weapon" }
      : null,
    vehicleModule: vehicleModule
      ? { ...vehicleModule, spellType: "pilot", pilotSubtype: "support" }
      : null,
    magichantKey: magichantKey
      ? { ...magichantKey, spellType: "magichant", magichantSubtype: "key" }
      : null,
    magichantTone: magichantTone
      ? { ...magichantTone, spellType: "magichant" }
      : null,
    alchemy: {
      name: "Lorem Ipsum",
      spellType: "alchemy",
      category: "Potion",
      effect: "Lorem ipsum dolor sit amet, **consectetur** adipiscing elit.",
    },
    infusion: infusionEffect
      ? { ...infusionEffect, spellType: "tinkerer-infusion" }
      : null,
    magitech: {
      name: "Lorem Ipsum",
      spellType: "magitech",
      effect: "Lorem ipsum dolor sit amet, **consectetur** adipiscing elit.",
    },
    cooking: {
      name: "Lorem Ipsum",
      spellType: "cooking",
      effect: "Lorem ipsum dolor sit amet, **consectetur** adipiscing elit.",
    },
  };
}
// Actor card sample data

const EMPTY_AFFINITIES = {
  physical: "no",
  air: "no",
  bolt: "no",
  dark: "no",
  earth: "no",
  fire: "no",
  ice: "no",
  light: "no",
  poison: "no",
};

const EMPTY_IMMUNITIES = {
  slow: false,
  weak: false,
  poisoned: false,
  dazed: false,
  shaken: false,
  enraged: false,
  confused: false,
};

const EMPTY_STATUSES = {
  slow: false,
  weak: false,
  poisoned: false,
  dazed: false,
  shaken: false,
  enraged: false,
  confused: false,
};

function _buildSamplePc() {
  const swordsman =
    classList.find((c) => c.name === "Swordsman") || classList[0];
  const elementalist =
    classList.find((c) => c.name === "Elementalist") ||
    classList[1] ||
    classList[0];

  const makeClass = (cls) => ({
    fuid: cls.name,
    name: cls.name,
    lvl: 5,
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 0,
      other: [],
      rituals: {
        ritualism: false,
        arcanism: false,
        chimerism: false,
        elementalism: false,
        entropism: false,
        spiritism: false,
      },
    },
    skills: (cls.skills || []).slice(0, 3).map((sk) => ({
      fuid: sk.skillName || sk.name,
      name: sk.skillName || sk.name,
      description: sk.description || "No description.",
      currentLvl: 1,
      maxLvl: sk.maxLvl || 1,
    })),
    heroic: cls.heroic ? [cls.heroic] : [],
    spells: (cls.spells || []).slice(0, 2).map((sp) => ({
      ...sp,
      cost: sp.cost ?? { mp: 10 },
      duration: sp.duration ?? "instantaneous",
      range: sp.range ?? "melee",
      isOffensive: sp.isOffensive ?? false,
      maxTargets: sp.maxTargets ?? 1,
      targetDescription: sp.targetDescription ?? "",
      accuracy: sp.accuracy ?? {
        attr1: "insight",
        attr2: "willpower",
        value: 0,
      },
      effect1: sp.effect1 ?? "",
      effect2: sp.effect2 ?? "",
      effect3: sp.effect3 ?? "",
      effect4: sp.effect4 ?? "",
      effect5: sp.effect5 ?? "",
      effect6: sp.effect6 ?? "",
      description: sp.description ?? "",
      special: sp.special ?? [],
      itemType: "spell",
    })),
  });

  const pc = {
    id: "debug-pc-1",
    uid: "debug",
    name: "Mithra Bargoth",
    lvl: 10,
    info: {
      pronouns: "she/her",
      identity: "Wandering Blade",
      theme: "Storm & Steel",
      origin: "Kingdom of Highpass",
      description:
        "A seasoned mercenary who channels lightning through her blade. She travels the land seeking worthy challenges and ancient secrets.",
      fabulapoints: 3,
      exp: 85,
      zenit: 1200,
      imgurl: "",
      bonds: [
        {
          name: "Marco the Healer",
          admiration: true,
          loyality: false,
          affection: false,
          inferiority: false,
          mistrust: false,
          hatred: false,
        },
        {
          name: "Lord Vayne",
          admiration: false,
          loyality: false,
          affection: false,
          inferiority: false,
          mistrust: true,
          hatred: true,
        },
        {
          name: "Seraphina",
          admiration: false,
          loyality: true,
          affection: true,
          inferiority: false,
          mistrust: false,
          hatred: false,
        },
      ],
    },
    attributes: {
      dexterity: { base: 10, current: 10 },
      insight: { base: 8, current: 8 },
      might: { base: 10, current: 10 },
      willpower: { base: 8, current: 8 },
    },
    stats: {
      hp: { base: 60, current: 45, max: 60 },
      mp: { base: 50, current: 50, max: 50 },
      ip: { base: 6, current: 4, max: 6 },
    },
    statuses: { ...EMPTY_STATUSES },
    immunities: { ...EMPTY_IMMUNITIES },
    affinities: { ...EMPTY_AFFINITIES, bolt: "rs", fire: "vu" },
    classes: [makeClass(swordsman), makeClass(elementalist)],
    equipment: [
      {
        weapons: [
          {
            itemType: "weapon",
            name: "Tempest Blade",
            category: "sword",
            hands: 1,
            range: "melee",
            martial: true,
            accuracy: {
              attr1: "dexterity",
              attr2: "might",
              value: 0,
              defense: "def",
            },
            damage: { value: 8, type: "bolt", hrZero: false },
            quality: "On a critical hit, deal +5 bonus bolt damage.",
            cost: 500,
          },
        ],
        customWeapons: [],
        shields: [
          {
            itemType: "shield",
            name: "Gale Buckler",
            def: 2,
            mdef: 0,
            martial: false,
            cost: 200,
            quality: "Reduce incoming air damage by 5.",
          },
        ],
        armor: [
          {
            itemType: "armor",
            name: "Stormweave Jacket",
            def: 0,
            mdef: 0,
            init: 0,
            martial: false,
            rework: false,
            cost: 300,
            quality: "Reduce incoming bolt damage by 5.",
          },
        ],
        accessories: [
          {
            itemType: "accessory",
            name: "Amulet of Insight",
            cost: 250,
            quality: "Add +1 to all magic accuracy checks.",
          },
        ],
      },
    ],
    equippedSlots: {
      mainHand: { source: "weapons", name: "Tempest Blade" },
      offHand: { source: "shields", name: "Gale Buckler" },
      armor: { source: "armor", name: "Stormweave Jacket" },
      accessory1: { source: "accessories", name: "Amulet of Insight" },
      accessory2: null,
    },
    martials: {
      armor: true,
      shields: true,
      melee: true,
      ranged: false,
    },
    rituals: {
      ritualism: false,
      arcanism: false,
      chimerism: false,
      elementalism: true,
      entropism: false,
      spiritism: false,
    },
    items: [
      {
        name: "Hi-Potion",
        description: "Restores 50 HP.",
        value: 100,
        quantity: 3,
      },
      {
        name: "Ether",
        description: "Restores 50 MP.",
        value: 100,
        quantity: 2,
      },
      {
        name: "Antidote",
        description: "Removes poisoned status.",
        value: 50,
        quantity: 5,
      },
    ],
    consumables: [
      {
        name: "Charged Crystal",
        description: "Add +2 bolt damage on next attack.",
        ipCost: 2,
      },
    ],
    notes: [
      {
        name: "Mission: Citadel",
        description:
          "Investigate the ruins south of Highpass. Someone is reactivating the old war machines.",
        clocks: [
          {
            name: "Infiltrate the Ruins",
            sections: 6,
            state: [true, true, false, false, false, false],
          },
          {
            name: "Dismantle the Core",
            sections: 4,
            state: [false, false, false, false],
          },
        ],
      },
      {
        name: "Rumor",
        description:
          "A merchant in town claims a legendary Arcanum lies sealed beneath the mountain.",
        clocks: [
          {
            name: "Track Down the Merchant",
            sections: 4,
            state: [true, true, true, false],
          },
        ],
      },
    ],
    modifiers: {
      hp: 0,
      mp: 0,
      ip: 0,
      def: 0,
      mdef: 0,
      init: 0,
      meleePrec: 0,
      rangedPrec: 0,
      magicPrec: 0,
    },
    settings: {
      defaultView: "normal",
    },
  };

  return pc;
}
// Layout helpers

function Section({ label, children, sectionRef }) {
  return (
    <Box ref={sectionRef}>
      <Divider sx={{ mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
      </Divider>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );
}

function CardSlot({ children, singleColumn = false, itemRef }) {
  return (
    <Grid ref={itemRef} size={{ xs: 12, md: singleColumn ? 12 : 6 }}>
      {children}
    </Grid>
  );
}

function TabPanel({ value, index, children }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}
// Sub-tabs for Actors

const VIEWPORT_SIZES = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: null,
};

function ViewportToggle({ viewport, onViewportChange }) {
  return (
    <ToggleButtonGroup
      value={viewport}
      exclusive
      onChange={(_, v) => v && onViewportChange(v)}
      size="small"
      sx={{
        ml: 1,
        flexShrink: 0,
        "& .MuiToggleButton-root": {
          width: 36,
          height: 30,
          px: 0,
        },
      }}
    >
      <Tooltip title="Mobile (390×844)">
        <ToggleButton value="mobile">
          <SmartphoneOutlinedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Tablet (768×1024)">
        <ToggleButton value="tablet">
          <TabletMacOutlinedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Desktop (full width)">
        <ToggleButton value="desktop">
          <DesktopWindowsOutlinedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}

const ResponsivePreviewFrame = React.forwardRef(function ResponsivePreviewFrame(
  { viewport, children },
  ref,
) {
  const viewportSize = VIEWPORT_SIZES[viewport];

  return (
    <Box
      ref={ref}
      sx={
        viewportSize
          ? {
              mx: "auto",
              width: viewportSize.width,
              height: viewportSize.height,
              overflow: "hidden",
              border: "8px solid",
              borderColor: "divider",
              borderRadius: viewport === "mobile" ? "28px" : "16px",
              boxShadow: 6,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              transition:
                "width 0.2s ease, height 0.2s ease, border-radius 0.2s ease",
              "& > :first-of-type": {
                flex: 1,
                overflowY: "auto",
                minHeight: 0,
              },
            }
          : { position: "relative", transition: "all 0.2s ease" }
      }
    >
      {children}
    </Box>
  );
});

function recalculatePcMaxStats(pc) {
  const lvl = Number(pc.lvl) || 0;
  const might = Number(pc.attributes?.might?.base) || 0;
  const willpower = Number(pc.attributes?.willpower?.base) || 0;

  const classBonuses = (pc.classes || []).reduce(
    (acc, cls) => ({
      hp: acc.hp + (cls.benefits?.hpplus || 0),
      mp: acc.mp + (cls.benefits?.mpplus || 0),
      ip: acc.ip + (cls.benefits?.ipplus || 0),
    }),
    { hp: 0, mp: 0, ip: 0 },
  );

  const fortressBonus = (pc.classes || [])
    .flatMap((cls) => cls.skills || [])
    .filter((skill) => skill.specialSkill === "Fortress")
    .reduce((acc, skill) => acc + Number(skill.currentLvl) * 3, 0);

  const focusedBonus = (pc.classes || [])
    .flatMap((cls) => cls.skills || [])
    .filter((skill) => skill.specialSkill === "Focused")
    .reduce((acc, skill) => acc + Number(skill.currentLvl) * 3, 0);

  const maxHP =
    lvl +
    might * 5 +
    classBonuses.hp +
    fortressBonus +
    (pc.resources?.hp?.bonus ?? pc.modifiers?.hp ?? 0);
  const maxMP =
    lvl +
    willpower * 5 +
    classBonuses.mp +
    focusedBonus +
    (pc.resources?.mp?.bonus ?? pc.modifiers?.mp ?? 0);
  const maxIP = 6 + classBonuses.ip + (pc.modifiers?.ip || 0);

  return {
    ...pc,
    stats: {
      ...pc.stats,
      hp: { ...pc.stats.hp, max: maxHP },
      mp: { ...pc.stats.mp, max: maxMP },
      ip: { ...pc.stats.ip, max: maxIP },
    },
  };
}

function ActorsTab({ npc, pc, onUpdatePc, viewport }) {
  const [actorTab, setActorTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const addChatMessage = useChatMessagesStore((s) => s.addMessage);

  const updateMaxStats = useCallback(() => {
    onUpdatePc((prev) => recalculatePcMaxStats(prev));
  }, [onUpdatePc]);
  const handleLevelUp = useCallback(() => {
    onUpdatePc((prev) =>
      applyExpLevelUp(prev, { recalculateMaxStats: recalculatePcMaxStats }),
    );
  }, [onUpdatePc]);
  const canLevelUpFromExp = canLevelUpFromExpCheck(pc);
  const handleQuickCheck = useCallback(
    (payload) => {
      const normalizedKind =
        payload?.kind === "attribute" ? "attribute" : "open";
      const primary = payload?.primary || "dex";
      const secondary = payload?.secondary || "ins";
      const modifier = Number(payload?.modifier) || 0;
      const hasDifficulty =
        Number.isFinite(payload?.difficulty) && Number(payload?.difficulty) > 0;
      const difficulty = hasDifficulty ? Number(payload.difficulty) : null;
      const command = [
        "/check",
        normalizedKind,
        primary,
        secondary,
        String(modifier),
        ...(difficulty != null ? [String(difficulty)] : []),
      ].join(" ");
      const result = executeCommand(command, {
        speaker: pc?.name || "Player",
        playerDoc: pc || null,
      });
      if (result?.ok) result.messages.forEach(addChatMessage);
    },
    [pc, addChatMessage],
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
          mb: 1,
        }}
      >
        <Tabs
          value={actorTab}
          onChange={(_, v) => setActorTab(v)}
          sx={{ flex: "0 1 auto", minHeight: 32 }}
        >
          <Tab label="NPC" />
          <Tab label="PC - Full" />
          <Tab label="PC - Compact" />
        </Tabs>

        <Tooltip
          title={editMode ? "Switch to preview mode" : "Switch to edit mode"}
        >
          <ToggleButton
            value="edit"
            selected={editMode}
            onChange={() => setEditMode((v) => !v)}
            size="small"
            sx={{ width: 36, height: 30, px: 0, flexShrink: 0 }}
          >
            {editMode ? (
              <EditOutlinedIcon fontSize="small" />
            ) : (
              <EditOffOutlinedIcon fontSize="small" />
            )}
          </ToggleButton>
        </Tooltip>
      </Box>

      <ResponsivePreviewFrame viewport={viewport}>
        {/* NPC */}
        <TabPanel value={actorTab} index={0}>
          <NpcActorCard npc={npc} collapse variant="interactive" />
        </TabPanel>

        {/* PC Full */}
        <TabPanel value={actorTab} index={1}>
          <PcActorCard
            pc={pc}
            isInteractive={editMode}
            onUpdate={onUpdatePc}
            updateMaxStats={updateMaxStats}
            canLevelUpFromExp={canLevelUpFromExp}
            onLevelUpRequest={handleLevelUp}
            onQuickCheck={handleQuickCheck}
          />
        </TabPanel>

        {/* PC Compact */}
        <TabPanel value={actorTab} index={2}>
          <PcActorCardCompact
            pc={pc}
            isInteractive={editMode}
            onUpdate={onUpdatePc}
            updateMaxStats={updateMaxStats}
            canLevelUpFromExp={canLevelUpFromExp}
            onLevelUpRequest={handleLevelUp}
            onQuickCheck={handleQuickCheck}
          />
        </TabPanel>
      </ResponsivePreviewFrame>
    </Box>
  );
}
// Items tab

function ItemsTab({ s, viewport, itemVariant }) {
  const singleColumn = viewport !== "desktop";
  const [navOpen, setNavOpen] = useState(false);
  const frameRef = React.useRef(null);
  const [frameEl, setFrameEl] = useState(null);
  const sectionRefs = React.useRef({});
  const itemRefs = React.useRef({});
  const showCardNav = true;
  const navSections = [
    {
      label: "Equipment",
      items: ["Weapon", "Custom Weapon", "Armor", "Shield", "Accessory"],
    },
    {
      label: "Spells",
      items: [
        ...(s.npcSpell ? ["NPC Spell"] : []),
        ...(s.playerSpell ? ["Player Spell"] : []),
        ...(s.gambleSpell ? ["Gamble Spell"] : []),
        ...(s.gift ? ["Gift"] : []),
        ...(s.dance ? ["Dance"] : []),
        ...(s.therioform ? ["Therioform"] : []),
        ...(s.arcanum ? ["Arcanum"] : []),
        ...(s.arcanumRework ? ["Arcanum Rework"] : []),
        "Pilot Frame",
        "Pilot Weapon",
        "Vehicle Module",
        "Magichant Key",
        "Magichant Tone",
        ...(s.symbol ? ["Symbol"] : []),
        ...(s.invocation ? ["Invocation"] : []),
        ...(s.magiseed ? ["Magiseed"] : []),
        "Alchemy",
        "Infusion",
        "Magitech",
        "Cooking",
      ],
    },
    {
      label: "NPC Items",
      items: [
        ...(s.npcAttack ? ["NPC Attack"] : []),
        "Special Rule",
        "NPC Action",
      ],
    },
    {
      label: "Classes & Skills",
      items: [
        ...(s.cls ? ["Class"] : []),
        ...(s.skill ? ["Skill"] : []),
        ...(s.heroic ? ["Heroic"] : []),
      ],
    },
    {
      label: "Optional Rules",
      items: ["Optional", "Zero Power", "Quality", "Ritual", "Project"],
    },
  ];
  const scrollToSection = (label) => {
    sectionRefs.current[label]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setNavOpen(false);
  };
  const scrollToItem = (label) => {
    itemRefs.current[label]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setNavOpen(false);
  };
  const setItemRef = (label) => (node) => {
    itemRefs.current[label] = node;
  };
  const interactiveActionContent =
    itemVariant === "interactive" ? (
      <Tooltip title="Send to chat">
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <ChatBubbleOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ) : null;
  const setFrameNode = useCallback((node) => {
    frameRef.current = node;
    setFrameEl(node);
  }, []);

  useEffect(() => {
    if (!navOpen) return undefined;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [navOpen]);

  const portalTarget = viewport === "desktop" ? document.body : frameEl;
  const portalPosition = viewport === "desktop" ? "fixed" : "absolute";
  const navPortal =
    showCardNav && portalTarget
      ? createPortal(
          <>
            <Fab
              size="small"
              color="primary"
              aria-label="Open card navigation"
              onClick={() => setNavOpen(true)}
              sx={{
                position: portalPosition,
                left: viewport === "desktop" ? 24 : 14,
                bottom: viewport === "desktop" ? 24 : 14,
                zIndex: viewport === "desktop" ? 1301 : 3,
              }}
            >
              <FormatListBulletedIcon fontSize="small" />
            </Fab>
            {navOpen && (
              <Box
                onClick={() => setNavOpen(false)}
                sx={{
                  position: portalPosition,
                  inset: 0,
                  bgcolor: "rgba(0, 0, 0, 0.46)",
                  zIndex: viewport === "desktop" ? 1300 : 4,
                }}
              />
            )}
            <Box
              sx={{
                position: portalPosition,
                top: 0,
                bottom: 0,
                left: 0,
                width: 250,
                bgcolor: "background.paper",
                borderRight: "2px solid",
                borderColor: "primary.main",
                boxShadow: 8,
                zIndex: viewport === "desktop" ? 1301 : 5,
                display: "flex",
                flexDirection: "column",
                transform: navOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 160ms ease",
              }}
            >
              <Box sx={{ py: 1, flex: 1, minHeight: 0, overflowY: "auto" }}>
                <Typography
                  sx={{
                    px: 2,
                    py: 1,
                    fontFamily: "Antonio",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Cards
                </Typography>
                <List dense disablePadding>
                  {navSections.map((section) => (
                    <Box key={section.label}>
                      <ListItemButton
                        onClick={() => scrollToSection(section.label)}
                        sx={{ py: 0.5 }}
                      >
                        <ListItemText
                          primary={section.label}
                          slotProps={{
                            primary: {
                              sx: {
                                fontFamily: "Antonio",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                fontSize: "0.85rem",
                              },
                            },
                          }}
                        />
                      </ListItemButton>
                      {section.items.map((label) => (
                        <ListItemButton
                          key={label}
                          onClick={() => scrollToItem(label)}
                          sx={{ pl: 3, py: 0.25 }}
                        >
                          <ListItemText
                            primary={label}
                            slotProps={{
                              primary: {
                                sx: {
                                  fontSize: "0.78rem",
                                  color: "text.secondary",
                                },
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </Box>
                  ))}
                </List>
              </Box>
            </Box>
          </>,
          portalTarget,
        )
      : null;

  return (
    <ResponsivePreviewFrame ref={setFrameNode} viewport={viewport}>
      <Stack spacing={4} sx={{ p: viewport === "desktop" ? 0 : 1 }}>
        <Section
          label="Equipment"
          sectionRef={(node) => {
            sectionRefs.current.Equipment = node;
          }}
        >
          <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Weapon")}>
            <SharedWeaponCard
              item={s.weapon}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Custom Weapon")}
          >
            <SharedCustomWeaponCard
              item={s.customWeapon}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Armor")}>
            <SharedArmorCard
              item={s.armor}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Shield")}>
            <SharedShieldCard
              item={s.shield}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Accessory")}
          >
            <SharedAccessoryCard
              item={s.accessory}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
        </Section>

        <Section
          label="Spells"
          sectionRef={(node) => {
            sectionRefs.current.Spells = node;
          }}
        >
          {s.npcSpell && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("NPC Spell")}
            >
              <SharedSpellCard
                item={s.npcSpell}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.playerSpell && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Player Spell")}
            >
              <SharedPlayerSpellCard
                item={s.playerSpell}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.gambleSpell && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Gamble Spell")}
            >
              <SharedGambleSpellCard
                item={s.gambleSpell}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.gift && (
            <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Gift")}>
              <SharedGiftCard
                item={s.gift}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.dance && (
            <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Dance")}>
              <SharedDanceCard
                item={s.dance}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.therioform && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Therioform")}
            >
              <SharedTherioformCard
                item={s.therioform}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.arcanum && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Arcanum")}
            >
              <SharedArcanumCard
                item={s.arcanum}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.arcanumRework && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Arcanum Rework")}
            >
              <SharedArcanumReworkCard
                item={s.arcanumRework}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Pilot Frame")}
          >
            <SharedPilotVehicleCard
              item={s.pilotFrame}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Pilot Weapon")}
          >
            <SharedPilotVehicleCard
              item={s.pilotWeapon}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Vehicle Module")}
          >
            <SharedPilotVehicleCard
              item={s.vehicleModule}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Magichant Key")}
          >
            <SharedMagichantCard
              item={s.magichantKey}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Magichant Tone")}
          >
            <SharedMagichantCard
              item={s.magichantTone}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          {s.symbol && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Symbol")}
            >
              <SharedSymbolCard
                item={s.symbol}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.invocation && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Invocation")}
            >
              <SharedInvocationCard
                item={s.invocation}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.magiseed && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Magiseed")}
            >
              <SharedMagiseedCard
                item={s.magiseed}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Alchemy")}>
            <SharedAlchemyCard
              item={s.alchemy}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Infusion")}
          >
            <SharedInfusionCard
              item={s.infusion}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Magitech")}
          >
            <SharedMagitechCard
              item={s.magitech}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Cooking")}>
            <SharedCookingCard
              item={s.cooking}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
        </Section>

        <Section
          label="NPC Items"
          sectionRef={(node) => {
            sectionRefs.current["NPC Items"] = node;
          }}
        >
          {s.npcAttack && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("NPC Attack")}
            >
              <SharedAttackCard
                item={s.npcAttack}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Special Rule")}
          >
            <SharedSpecialRuleCard
              item={s.npcSpecialRule}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("NPC Action")}
          >
            <SharedActionCard
              item={s.npcAction}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
        </Section>

        <Section
          label="Classes & Skills"
          sectionRef={(node) => {
            sectionRefs.current["Classes & Skills"] = node;
          }}
        >
          {s.cls && (
            <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Class")}>
              <SharedClassCard
                item={s.cls}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.skill && (
            <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Skill")}>
              <SharedSkillCard
                item={s.skill}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
          {s.heroic && (
            <CardSlot
              singleColumn={singleColumn}
              itemRef={setItemRef("Heroic")}
            >
              <SharedHeroicCard
                item={s.heroic}
                variant={itemVariant}
                imageMode="slot"
                showImageToggle
                actionContent={interactiveActionContent}
              />
            </CardSlot>
          )}
        </Section>

        <Section
          label="Optional Rules"
          sectionRef={(node) => {
            sectionRefs.current["Optional Rules"] = node;
          }}
        >
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Optional")}
          >
            <SharedOptionalCard
              item={s.optional}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot
            singleColumn={singleColumn}
            itemRef={setItemRef("Zero Power")}
          >
            <SharedZeroPowerCard
              item={s.zeroPower}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Quality")}>
            <SharedQualityCard
              item={s.quality}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Ritual")}>
            <SharedRitualCard
              item={s.ritual}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
          <CardSlot singleColumn={singleColumn} itemRef={setItemRef("Project")}>
            <SharedProjectCard
              item={s.project}
              variant={itemVariant}
              imageMode="slot"
              showImageToggle
              actionContent={interactiveActionContent}
            />
          </CardSlot>
        </Section>
      </Stack>
      {navPortal}
    </ResponsivePreviewFrame>
  );
}
// Root component

export default function DebugMenu() {
  const { t } = useTranslate();
  const s = React.useMemo(() => buildSamples(), []);
  const npc = SAMPLE_NPC;
  const [pc, setPc] = useState(() => SAMPLE_PC);
  const [mainTab, setMainTab] = useState(0);
  const [viewport, setViewport] = useState("desktop");
  const [itemVariant, setItemVariant] = useState("interactive");

  return (
    <Layout fullWidth>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: 1,
            borderColor: "divider",
            mb: 1,
          }}
        >
          <Tabs
            value={mainTab}
            onChange={(_, v) => setMainTab(v)}
            sx={{ flex: 1, minHeight: 32 }}
          >
            <Tab label={t("Items")} />
            <Tab label={t("Actors")} />
          </Tabs>
          <FormControl size="small" sx={{ minWidth: 138 }}>
            <InputLabel id="item-variant-select-label">Card Variant</InputLabel>
            <Select
              labelId="item-variant-select-label"
              label="Card Variant"
              value={itemVariant}
              onChange={(e) => setItemVariant(e.target.value)}
            >
              <MenuItem value="interactive">Interactive</MenuItem>
              <MenuItem value="compendium">Compendium</MenuItem>
              <MenuItem value="print">Print</MenuItem>
            </Select>
          </FormControl>
          <ViewportToggle viewport={viewport} onViewportChange={setViewport} />
        </Box>

        <TabPanel value={mainTab} index={0}>
          <ItemsTab s={s} viewport={viewport} itemVariant={itemVariant} />
        </TabPanel>

        <TabPanel value={mainTab} index={1}>
          <ActorsTab npc={npc} pc={pc} onUpdatePc={setPc} viewport={viewport} />
        </TabPanel>
      </Box>
    </Layout>
  );
}
