import React from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";
import ReactMarkdown from "react-markdown";
import {
  DistanceIcon,
  MeleeIcon,
  OffensiveSpellIcon,
  SpellIcon,
} from "../../icons.jsx";
import Diamond from "../../Diamond.jsx";
import { calcPrecision, calcDamage, calcMagic } from "../../../libs/npcs.js";
import { t } from "../../../translation/translate.jsx";
import { useCombatSimSettingsStore } from "../../../stores/combatSimSettingsStore.js";

const RollsTab = ({
  selectedNPC,
  setClickedData,
  setOpen,
  handleAttack,
  handleSpell,
}) => {
  const hideLogs = useCombatSimSettingsStore.getState().settings.hideLogs;
  const autoUseMP = useCombatSimSettingsStore.getState().settings.autoUseMP;
  const autoRollSpellOneTarget =
    useCombatSimSettingsStore.getState().settings.autoRollSpellOneTarget;

  const generateButtonLabel = (attack) => {
    const attributeMap = {
      dexterity: "DEX",
      insight: "INS",
      might: "MIG",
      will: "WLP",
    };

    // Determine the source and correct attribute keys
    let source, attrKey1, attrKey2;

    if (attack.weapon) {
      source = attack.weapon;
      attrKey1 = "att1";
      attrKey2 = "att2";
    } else if (attack.spell) {
      source = attack.spell;
      attrKey1 = "attr1";
      attrKey2 = "attr2";
    } else {
      source = attack;
      attrKey1 = "attr1";
      attrKey2 = "attr2";
    }

    // Extract attributes
    const attr1 = source?.[attrKey1];
    const attr2 = source?.[attrKey2];

    if (!attr1 || !attr2) return "Invalid Attack"; // Handle missing attributes

    const translatedAttribute1 = `${t(attributeMap[attr1])} d${
      selectedNPC.attributes[attr1]
    }`;
    const translatedAttribute2 = `${t(attributeMap[attr2])} d${
      selectedNPC.attributes[attr2]
    }`;

    return `【${translatedAttribute1} + ${translatedAttribute2}】`;
  };

  const damageTypeLabels = {
    physical: "physical_damage",
    wind: "air_damage",
    bolt: "bolt_damage",
    dark: "dark_damage",
    earth: "earth_damage",
    fire: "fire_damage",
    ice: "ice_damage",
    light: "light_damage",
    poison: "poison_damage",
  };

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 1,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  const handleSpellClick = (spellData) => {
    let updatedSpellData = spellData;
    if (!spellData.maxTargets || spellData.maxTargets === 0) {
      updatedSpellData = {
        ...spellData,
        maxTargets: 1,
      };
    }

    setClickedData(updatedSpellData);
    if (autoRollSpellOneTarget && updatedSpellData.maxTargets === 1) {
      handleSpell(updatedSpellData);
    } else {
      setOpen(true);
    }
  };

  // Check if the selected NPC has enough MP to cast the spell for at least 1 target
  const getHasEnoughMP = (selectedNPC, spellData) => {
    if (!autoUseMP) return true;
    const mpCost = spellData.mp;
    const currentMp = selectedNPC.combatStats.currentMp;
    return mpCost <= currentMp;
  };

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {[
        ...(selectedNPC?.attacks || []).map((attack) => ({
          type: "Attack",
          data: attack,
          extra: attack.special?.length ? attack.special.join("\n\n") : null,
          icon: attack.range === "distance" ? <DistanceIcon /> : <MeleeIcon />,
        })),
        ...(selectedNPC?.weaponattacks || []).map((wattack) => ({
          type: "Weapon Attack",
          data: wattack,
          extra: wattack.special?.length ? wattack.special.join("\n\n") : null,
          icon:
            wattack.weapon.range === "distance" ? (
              <DistanceIcon />
            ) : (
              <MeleeIcon />
            ),
        })),
        ...(selectedNPC?.spells || []).map((spell) => ({
          type: "Spell",
          data: spell,
          extra: spell.effect || null,
          icon: <SpellIcon />,
        })),
      ].map(({ type, data, extra, icon }, index) => (
        <ListItem
          key={index}
          sx={{
            display: "flex",
            alignItems: "stretch",
            borderBottom: "1px solid #ddd",
            py: 1,
            minHeight: 80,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 25 }}>
            {icon}
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: -1 }} />
          <Box sx={{ flexGrow: 1, px: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {data.name}{" "}
              {type === "Spell" && data.type === "offensive" && (
                <OffensiveSpellIcon />
              )}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                ml: type === "Spell" && data.type !== "offensive" ? 0 : -1,
              }}
            >
              {(type === "Attack" || type === "Weapon Attack") && (
                <>
                  <strong>{generateButtonLabel(data)}</strong>
                  {calcPrecision(data, selectedNPC) > 0 &&
                    `+${calcPrecision(data, selectedNPC)} `}
                  {data.type !== "nodmg" && (
                    <>
                      <strong>
                        <Diamond />【
                        {t("HR") + " + " + calcDamage(data, selectedNPC)}】
                      </strong>
                      <span style={{ textTransform: "lowercase" }}>
                        <StyledMarkdown
                          allowedElements={["strong"]}
                          unwrapDisallowed={true}
                        >
                          {t(
                            damageTypeLabels[
                              type === "Attack" ? data.type : data.weapon.type
                            ]
                          )}
                        </StyledMarkdown>
                      </span>
                    </>
                  )}
                </>
              )}
              {type === "Spell" && (
                <>
                  {data.type === "offensive" && (
                    <>
                      <strong>{generateButtonLabel(data)}</strong>
                      {calcMagic(selectedNPC) > 0 &&
                        `+${calcMagic(selectedNPC)} `}
                      <Diamond />
                    </>
                  )}{" "}
                  {data.mp} MP <Diamond /> {data.target} <Diamond />{" "}
                  {data.duration}
                </>
              )}
            </Typography>
            {extra && (
              <Box sx={{ maxWidth: "80%", overflowWrap: "break-word" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="div"
                  sx={{ whiteSpace: "pre-wrap", my: -1 }}
                >
                  <StyledMarkdown>{extra}</StyledMarkdown>
                </Typography>
              </Box>
            )}
          </Box>
          {!hideLogs && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "stretch",
                my: -1,
                mx: -2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (type === "Spell") {
                    handleSpellClick(data);
                  } else {
                    handleAttack(
                      data,
                      type === "Attack"
                        ? "attack"
                        : type === "Weapon Attack"
                        ? "weapon"
                        : "spell"
                    );
                  }
                }}
                disabled={
                  type === "Spell" && !getHasEnoughMP(selectedNPC, data)
                }
                sx={{
                  color: "#fff",
                  minWidth: 40,
                  width: 40,
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 0,
                }}
              >
                <CasinoIcon />
              </Button>
            </Box>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default RollsTab;
