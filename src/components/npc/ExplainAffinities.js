import { Card, Typography } from "@mui/material";

export default function ExplainAffinities({ npc }) {
  return (
    <Card sx={{ p: 2 }}>
      <Typography>Assegnare vulnerabilità conferisce Abilità</Typography>
      <Typography>
        Assegnare vulnerabilità a fisico conferisce 2 Abilità
      </Typography>
      <Typography>Assegnare resistenze costa 0.5 Abilità</Typography>
      <Typography>Assegnare immunità costa 1 Abilità</Typography>
      <Typography>Assegnare assorbimento costa 2 Abilità</Typography>
      {npc.species === "Costrutto" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Specie: costrutto
          </Typography>
          <Typography>
            I costrutti sono Immuni al danno da <strong>veleno</strong> e
            Resistenti al danno da <strong>terra</strong>.
          </Typography>
        </>
      )}
      {npc.species === "Demone" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Specie: Demone
          </Typography>
          <Typography>
            I demoni sono resistenti a due tipi di danno a tua scelta.
          </Typography>
        </>
      )}
      {npc.species === "Elementale" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Specie: Elementale
          </Typography>
          <Typography>
            Gli elementali sono Immuni al danno da <strong>veleno</strong> e a
            un altro tipo di danno a tua scelta.
          </Typography>
        </>
      )}
      {npc.species === "Non Morto" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Specie: Non Morto
          </Typography>
          <Typography>
            I non morti sono Immuni al danno da <strong>ombra</strong> e da{" "}
            <strong>veleno</strong> e Vulnerabili al danno da{" "}
            <strong>luce</strong>.
          </Typography>
        </>
      )}
      {npc.species === "Pianta" && (
        <>
          <Typography
            fontFamily="Antonio"
            sx={{ mt: 2, textTransform: "uppercase" }}
          >
            Specie: Pianta
          </Typography>
          <Typography>
            Le piante sono Vulnerabili al danno da (scegliere uno tra{" "}
            <strong>aria</strong>, <strong>fulmine</strong>,{" "}
            <strong>fuoco</strong>, <strong>ghiaccio</strong>)
          </Typography>
        </>
      )}
    </Card>
  );
}
