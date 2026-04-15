import React from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

const StyledTableCell = styled(TableCell)({ 
  padding: "2px 4px",
  fontSize: "0.8rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)"
});

export default function SpellMagichant({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const volumes = [
    { name: "magichant_volume_low", mp: 10, target: "magichant_volume_low_target" },
    { name: "magichant_volume_medium", mp: 20, target: "magichant_volume_medium_target" },
    { name: "magichant_volume_high", mp: 30, target: "magichant_volume_high_target" },
  ];

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Volumes Sub-header */}
        <TableRow sx={{ backgroundColor: theme.secondary }}>
          <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>{t("magichant_volume")}</StyledTableCell>
          <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0, textAlign: 'center' }}>{t("MP")}</StyledTableCell>
          <StyledTableCell colSpan={2} sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>{t("Target")}</StyledTableCell>
        </TableRow>
        {volumes.map((vol, i) => (
          <TableRow key={`vol-${i}`}>
            <StyledTableCell sx={{ fontWeight: 'bold' }}>{t(vol.name)}</StyledTableCell>
            <StyledTableCell sx={{ textAlign: 'center' }}>{vol.mp}</StyledTableCell>
            <StyledTableCell colSpan={2}>{t(vol.target)}</StyledTableCell>
          </TableRow>
        ))}

        {/* Keys Sub-header */}
        <TableRow sx={{ backgroundColor: theme.secondary }}>
          <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>{t("magichant_key")}</StyledTableCell>
          <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0, textAlign: 'center' }}>{t("Type")}</StyledTableCell>
          <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0, textAlign: 'center' }}>{t("Status")}</StyledTableCell>
          <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0, textAlign: 'center' }}>{t("Attr/Rec")}</StyledTableCell>
        </TableRow>
        {spell.keys?.map((key, i) => (
          <TableRow key={`key-${i}`}>
            <StyledTableCell sx={{ fontWeight: 'bold' }}>{key.name === "magichant_custom_name" ? key.customName : t(key.name)}</StyledTableCell>
            <StyledTableCell sx={{ textAlign: 'center', fontSize: '0.7rem' }}>{t(key.type)}</StyledTableCell>
            <StyledTableCell sx={{ textAlign: 'center', fontSize: '0.7rem' }}>{t(key.status)}</StyledTableCell>
            <StyledTableCell sx={{ textAlign: 'center', fontSize: '0.7rem' }}>{t(key.attribute)} / {t(key.recovery)}</StyledTableCell>
          </TableRow>
        ))}

        {/* Tones Sub-header */}
        <TableRow sx={{ backgroundColor: theme.secondary }}>
          <StyledTableCell colSpan={4} sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>
            {t("magichant_tone")}
          </StyledTableCell>
        </TableRow>
        {spell.tones?.map((tone, i) => (
          <TableRow key={`tone-${i}`}>
            <StyledTableCell sx={{ fontWeight: 'bold' }}>{tone.name === "magichant_custom_name" ? tone.customName : t(tone.name)}</StyledTableCell>
            <StyledTableCell colSpan={3} sx={{ fontSize: '0.75rem' }}>
              <ReactMarkdown components={{ p: ({ _node, ...props }) => <span {...props} /> }}>
                {tone.name === "magichant_custom_name" ? tone.effect : t(tone.effect)}
              </ReactMarkdown>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
