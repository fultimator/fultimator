import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: "2px 8px" });

const POSITIVE = ["admiration", "loyality", "affection"];
const NEGATIVE = ["inferiority", "mistrust", "hatred"];

function bondStrength(bond) {
  return [...POSITIVE, ...NEGATIVE].filter((s) => bond[s]).length;
}

export default function PlayerBonds({ player }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const bonds = player.info?.bonds ?? [];
  if (bonds.length === 0) return null;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              background: theme.primary,
              "& .MuiTypography-root": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                textTransform: "uppercase",
              },
            }}
          >
            <StyledTableCellHeader sx={{ width: 36 }} />
            <StyledTableCellHeader>
              <Typography variant="h4">{t("Bonds")}</Typography>
            </StyledTableCellHeader>
            <StyledTableCellHeader sx={{ width: 80 }} />
            <StyledTableCellHeader sx={{ width: 90 }}>
              <Typography variant="h4">{t("Sentiments")}</Typography>
            </StyledTableCellHeader>
            <StyledTableCellHeader sx={{ width: 100, textAlign: "center" }}>
              <Typography variant="h4">★</Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {bonds.map((bond, index) => {
            const positive = POSITIVE.filter((s) => bond[s]);
            const negative = NEGATIVE.filter((s) => bond[s]);
            const strength = bondStrength(bond);

            const sentimentNodes = [
              ...positive.map((s) => (
                <Typography
                  key={s}
                  component="span"
                  variant="body2"
                  sx={{ color: "success.main", textTransform: "uppercase" }}
                >
                  {t(s.charAt(0).toUpperCase() + s.slice(1))}
                </Typography>
              )),
              ...negative.map((s) => (
                <Typography
                  key={s}
                  component="span"
                  variant="body2"
                  sx={{ color: "error.main", textTransform: "uppercase" }}
                >
                  {t(s.charAt(0).toUpperCase() + s.slice(1))}
                </Typography>
              )),
            ].reduce((acc, node, i, arr) => {
              acc.push(node);
              if (i < arr.length - 1)
                acc.push(
                  <Typography key={`sep-${i}`} component="span" variant="body2">
                    {", "}
                  </Typography>
                );
              return acc;
            }, []);

            return (
              <TableRow key={index}>
                <StyledTableCell sx={{ width: 36 }} />
                <StyledTableCell>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ textTransform: "uppercase" }}
                  >
                    {bond.name}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 80 }} />
                <StyledTableCell sx={{ width: 90 }}>{sentimentNodes}</StyledTableCell>
                <StyledTableCell sx={{ width: 100, textAlign: "center" }}>
                  {strength > 0 && (
                    <Typography variant="body2" fontWeight="bold">
                      ★{strength}
                    </Typography>
                  )}
                </StyledTableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
