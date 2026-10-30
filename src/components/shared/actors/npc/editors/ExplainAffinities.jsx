import { useEffect, useRef, useMemo } from "react";
import { Card, Chip, Typography, Box, Divider } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { DAMAGE_TYPES } from "/src/libs/quickAssembly/constants";

const LABEL_SX = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "text.secondary",
  mb: 0.5,
  textTransform: "uppercase",
};

const SPECIES_GRANTS_CONFIG = {
  Construct: {
    affinities: {
      fixed: [
        { type: "poison", value: "im" },
        { type: "earth", value: "rs" },
      ],
    },
    immunities: ["poisoned"],
  },
  Elemental: {
    affinities: {
      fixed: [{ type: "poison", value: "im" }],
      optional: {
        max: 1,
        value: "im",
        types: DAMAGE_TYPES.filter((t) => t !== "poison"),
      },
    },
    immunities: ["poisoned"],
  },
  Undead: {
    affinities: {
      fixed: [
        { type: "dark", value: "im" },
        { type: "poison", value: "im" },
      ],
      optional: { max: 1, value: "vu", types: ["light"] },
    },
    immunities: ["poisoned"],
  },
  Demon: {
    affinities: {
      optional: { max: 2, value: "rs", types: DAMAGE_TYPES },
    },
  },
  Plant: {
    affinities: {
      optional: { max: 1, value: "vu", types: ["air", "bolt", "fire", "ice"] },
    },
    immunities: ["dazed", "shaken", "enraged"],
  },
};

export default function ExplainAffinities({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
      : `linear-gradient(to right, ${theme.ternary}, transparent)`;

  const speciesConfig = useMemo(
    () => SPECIES_GRANTS_CONFIG[npc.species] || {},
    [npc.species],
  );
  const prevSpeciesRef = useRef(npc.species);

  useEffect(() => {
    if (prevSpeciesRef.current !== npc.species && setNpc) {
      const speciesGrants = {};

      if (speciesConfig.affinities?.fixed) {
        const affinities = {};
        speciesConfig.affinities.fixed.forEach((grant) => {
          affinities[grant.type] = grant.value;
        });
        speciesGrants.affinities = affinities;
      }

      if (speciesConfig.immunities?.length) {
        const immunities = {};
        speciesConfig.immunities.forEach((status) => {
          immunities[status] = true;
        });
        speciesGrants.immunities = immunities;
      }

      setNpc((prev) => ({
        ...prev,
        speciesGrants:
          Object.keys(speciesGrants).length > 0 ? speciesGrants : undefined,
      }));
      prevSpeciesRef.current = npc.species;
    }
  }, [npc.species, setNpc, speciesConfig]);

  const toggleSpeciesAffinity = (type, value = "im") => {
    setNpc((prev) => {
      const speciesGrants = prev.speciesGrants || {};
      const affinities = { ...speciesGrants.affinities };
      const npcAffinities = { ...prev.affinities };

      if (affinities[type]) {
        delete affinities[type];
        npcAffinities[type] = "no";
      } else {
        affinities[type] = value;
        npcAffinities[type] = value;
      }

      return {
        ...prev,
        speciesGrants: {
          ...speciesGrants,
          affinities:
            Object.keys(affinities).length > 0 ? affinities : undefined,
        },
        affinities: npcAffinities,
      };
    });
  };

  const toggleOptionalAffinity = (type, value) => {
    setNpc((prev) => {
      const affinities = { ...prev.affinities };
      if (affinities[type] === value) {
        affinities[type] = "no";
      } else {
        affinities[type] = value;
      }
      return { ...prev, affinities };
    });
  };

  return (
    <Card
      sx={{
        p: 1.61,
        mb: 2,
        background,
      }}
    >
      <Typography>{t("Gain 1 skill per vulnerability.")}</Typography>
      <Typography>{t("Gain 2 skills per physical vulnerability.")}</Typography>
      <Typography>{t("Use 0.5 skill per Resistance")}</Typography>
      <Typography>{t("Use 1 skill per Immunity")}</Typography>
      <Typography>{t("Use 2 skill per Absorption")}</Typography>
      {npc.species === "Construct" && (
        <>
          <Typography
            sx={{
              fontFamily: "Antonio",
              fontWeight: 600,
              fontSize: "0.875rem",
              mt: 2,
              textTransform: "uppercase",
            }}
          >
            {t("Species: Construct")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "**Constructs** are Immune to **poison** damage and Resistant to **earth** damage, and immune to **poisoned**.",
                true,
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
      {npc.species === "Demon" && (
        <>
          <Typography
            sx={{
              fontFamily: "Antonio",
              fontWeight: 600,
              fontSize: "0.875rem",
              mt: 2,
              textTransform: "uppercase",
            }}
          >
            {t("Species: Demon")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "**Demons** are Resistant to two damage types of your choice.",
                true,
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
      {npc.species === "Elemental" && (
        <>
          <Typography
            sx={{
              fontFamily: "Antonio",
              fontWeight: 600,
              fontSize: "0.875rem",
              mt: 2,
              textTransform: "uppercase",
            }}
          >
            {t("Species: Elemental")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "**Elementals** are Immune to **poison** damage, Immune to a second damage type of your choice, and immune to **poisoned**.",
                true,
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
      {npc.species === "Undead" && (
        <>
          <Typography
            sx={{
              fontFamily: "Antonio",
              fontWeight: 600,
              fontSize: "0.875rem",
              mt: 2,
              textTransform: "uppercase",
            }}
          >
            {t("Species: Undead")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "**Undead** are Immune to **dark** and **poison** damage, and Vulnerable to **light** damage.",
                true,
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}
      {npc.species === "Plant" && (
        <>
          <Typography
            sx={{
              fontFamily: "Antonio",
              fontWeight: 600,
              fontSize: "0.875rem",
              mt: 2,
              textTransform: "uppercase",
            }}
          >
            {t("Species: Plant")}
          </Typography>
          <Typography>
            <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
              {t(
                "  **Plants** are Vulnerable to (choose one: **air**, **bolt**, **fire**, **ice**) damage.",
                true,
              )}
            </ReactMarkdown>
          </Typography>
        </>
      )}

      {setNpc &&
        (speciesConfig.affinities || speciesConfig.immunities?.length > 0) && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography
              sx={{
                fontFamily: "Antonio",
                fontWeight: 600,
                mt: 1.5,
                mb: 1,
                textTransform: "uppercase",
                fontSize: "0.875rem",
              }}
            >
              {t("Species Grants (Free - don't cost skill points)")}
            </Typography>

            {(speciesConfig.affinities?.fixed || []).length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography sx={LABEL_SX}>
                  {t(npc.species)} Affinities -{" "}
                  {(speciesConfig.affinities.fixed || [])
                    .map(
                      (g) =>
                        `${t(g.type, undefined, true)} ${t(g.value, undefined, true)}`,
                    )
                    .join(" • ")}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {(speciesConfig.affinities.fixed || []).map((grant) => {
                    const isGranted =
                      npc.speciesGrants?.affinities?.[grant.type];
                    return (
                      <Chip
                        key={grant.type}
                        size="small"
                        label={`${t(grant.type, undefined, true)} - ${t(grant.value, undefined, true)}`}
                        color={isGranted ? "primary" : "default"}
                        variant={isGranted ? "filled" : "outlined"}
                        onClick={() =>
                          toggleSpeciesAffinity(grant.type, grant.value)
                        }
                        sx={{ cursor: "pointer" }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            {(() => {
              const untickedFixed = (
                speciesConfig.affinities?.fixed || []
              ).filter((g) => !npc.speciesGrants?.affinities?.[g.type]);
              const hasOptional =
                speciesConfig.affinities?.optional?.types?.length > 0;
              const hasUnticked = untickedFixed.length > 0;

              if (!hasOptional && !hasUnticked) return null;

              const untickedByValue = untickedFixed.reduce((acc, unticked) => {
                if (!acc[unticked.value]) acc[unticked.value] = [];
                acc[unticked.value].push(unticked);
                return acc;
              }, {});

              return (
                <>
                  {hasOptional && speciesConfig.affinities.optional?.max && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography sx={LABEL_SX}>
                        Choose {speciesConfig.affinities.optional.max} - Sets to{" "}
                        {t(
                          speciesConfig.affinities.optional.value,
                          undefined,
                          true,
                        )}
                      </Typography>
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
                      >
                        {speciesConfig.affinities.optional.types.map((type) => {
                          const affinity = npc.affinities?.[type];
                          const isSelected =
                            affinity ===
                              speciesConfig.affinities.optional.value &&
                            !npc.speciesGrants?.affinities?.[type];
                          return (
                            <Chip
                              key={type}
                              size="small"
                              label={`${t(type, undefined, true)}${affinity && affinity !== "no" ? ` - ${t(affinity, undefined, true)}` : ""}`}
                              color={isSelected ? "primary" : "default"}
                              variant={isSelected ? "filled" : "outlined"}
                              onClick={() =>
                                toggleOptionalAffinity(
                                  type,
                                  speciesConfig.affinities.optional.value,
                                )
                              }
                              sx={{ cursor: "pointer" }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {hasUnticked && (
                    <>
                      {Object.entries(untickedByValue).map(
                        ([value, untickedItems]) => (
                          <Box key={value} sx={{ mb: 1.5 }}>
                            <Typography sx={LABEL_SX}>
                              Choose {untickedItems.length} - Sets to{" "}
                              {t(value, undefined, true)}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.75,
                              }}
                            >
                              {DAMAGE_TYPES.map((type) => {
                                const isGranted =
                                  npc.speciesGrants?.affinities?.[type] ===
                                  value;
                                return (
                                  <Chip
                                    key={type}
                                    size="small"
                                    label={t(type, undefined, true)}
                                    color={isGranted ? "primary" : "default"}
                                    variant={isGranted ? "filled" : "outlined"}
                                    onClick={() =>
                                      toggleSpeciesAffinity(type, value)
                                    }
                                    sx={{ cursor: "pointer" }}
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        ),
                      )}
                    </>
                  )}
                </>
              );
            })()}
          </>
        )}
    </Card>
  );
}
