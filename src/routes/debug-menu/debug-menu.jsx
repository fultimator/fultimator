import React from "react";
import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
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
} from "../../components/player/spells/spellOptionData";
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
} from "../../components/shared/itemCards";

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

function Section({ label, children }) {
  return (
    <Box>
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

function CardSlot({ children }) {
  return <Grid size={{ xs: 12, md: 6 }}>{children}</Grid>;
}

export default function DebugMenu() {
  const { t } = useTranslate();
  const s = React.useMemo(() => buildSamples(), []);

  return (
    <Layout fullWidth>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t("Debug Menu")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("Shared card preview")}
          </Typography>
        </Stack>

        <Stack spacing={4}>
          <Section label="Equipment">
            <CardSlot>
              <SharedWeaponCard
                item={s.weapon}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedCustomWeaponCard
                item={s.customWeapon}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedArmorCard
                item={s.armor}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedShieldCard
                item={s.shield}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedAccessoryCard
                item={s.accessory}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
          </Section>

          <Section label="Spells">
            {s.npcSpell && (
              <CardSlot>
                <SharedSpellCard
                  item={s.npcSpell}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.playerSpell && (
              <CardSlot>
                <SharedPlayerSpellCard
                  item={s.playerSpell}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.gambleSpell && (
              <CardSlot>
                <SharedGambleSpellCard
                  item={s.gambleSpell}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.gift && (
              <CardSlot>
                <SharedGiftCard
                  item={s.gift}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.dance && (
              <CardSlot>
                <SharedDanceCard
                  item={s.dance}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.therioform && (
              <CardSlot>
                <SharedTherioformCard
                  item={s.therioform}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.arcanum && (
              <CardSlot>
                <SharedArcanumCard
                  item={s.arcanum}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.arcanumRework && (
              <CardSlot>
                <SharedArcanumReworkCard
                  item={s.arcanumRework}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            <CardSlot>
              <SharedPilotVehicleCard
                item={s.pilotFrame}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedPilotVehicleCard
                item={s.pilotWeapon}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedPilotVehicleCard
                item={s.vehicleModule}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedMagichantCard
                item={s.magichantKey}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedMagichantCard
                item={s.magichantTone}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            {s.symbol && (
              <CardSlot>
                <SharedSymbolCard
                  item={s.symbol}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.invocation && (
              <CardSlot>
                <SharedInvocationCard
                  item={s.invocation}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.magiseed && (
              <CardSlot>
                <SharedMagiseedCard
                  item={s.magiseed}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            <CardSlot>
              <SharedAlchemyCard
                item={s.alchemy}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedInfusionCard
                item={s.infusion}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedMagitechCard
                item={s.magitech}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedCookingCard
                item={s.cooking}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
          </Section>

          <Section label="NPC Items">
            {s.npcAttack && (
              <CardSlot>
                <SharedAttackCard
                  item={s.npcAttack}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            <CardSlot>
              <SharedSpecialRuleCard
                item={s.npcSpecialRule}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedActionCard
                item={s.npcAction}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
          </Section>

          <Section label="Classes & Skills">
            {s.cls && (
              <CardSlot>
                <SharedClassCard
                  item={s.cls}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.skill && (
              <CardSlot>
                <SharedSkillCard
                  item={s.skill}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
            {s.heroic && (
              <CardSlot>
                <SharedHeroicCard
                  item={s.heroic}
                  variant="compendium"
                  imageMode="slot"
                  showImageToggle
                />
              </CardSlot>
            )}
          </Section>

          <Section label="Optional Rules">
            <CardSlot>
              <SharedOptionalCard
                item={s.optional}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedZeroPowerCard
                item={s.zeroPower}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedQualityCard
                item={s.quality}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedRitualCard
                item={s.ritual}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
            <CardSlot>
              <SharedProjectCard
                item={s.project}
                variant="compendium"
                imageMode="slot"
                showImageToggle
              />
            </CardSlot>
          </Section>
        </Stack>
      </Box>
    </Layout>
  );
}
