import { Card, Divider, Typography } from "@mui/material";

function ExplainAbilities() {
  return (
    <Card sx={{ p: 1.61 }}>
      <Typography>
        <strong>Tuttofare</strong>: d8, d8, d8, d8
      </Typography>
      <Typography>
        <strong>Standard</strong>: d10, d8, d8, d6
      </Typography>
      <Typography>
        <strong>Specializzato</strong>: d10, d10, d6, d6
      </Typography>
      <Typography>
        <strong>Iperspecializzato</strong>: d12, d8, d6, d6
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2">
        Ai lvl <strong>20</strong>, <strong>40</strong>, <strong>60</strong>{" "}
        puoi aumentare una caratteristica
      </Typography>
    </Card>
  );
}

export default ExplainAbilities;
