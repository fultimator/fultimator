import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Tooltip,
  Collapse,
  Typography,
  Chip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { CompendiumPack } from "../../types/CompendiumPack";
import { useTranslate } from "../../translation/translate";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

interface ContentPacksTabProps {
  packs: CompendiumPack[];
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function itemCountSummary(pack: CompendiumPack): string {
  const counts: Record<string, number> = {};
  for (const item of pack.items) {
    counts[item.type] = (counts[item.type] ?? 0) + 1;
  }
  if (Object.keys(counts).length === 0) return "No items";
  return Object.entries(counts)
    .map(([type, n]) => `${n} ${type.replace(/-/g, " ")}`)
    .join(", ");
}

function PackRow({ pack, onSetActive, onDelete }: {
  pack: CompendiumPack;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useTranslate();
  const [expanded, setExpanded] = useState(false);
  const { isOpen: confirmDeleteOpen, closeDialog: setConfirmDeleteOpen, handleDelete } = useDeleteConfirmation({
    onConfirm: async () => {
      await onDelete(pack.id);
    },
  });
  const isActive = pack.active !== false;

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        {/* Expand */}
        <TableCell sx={{ width: 40, p: 0.5 }}>
          <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
        </TableCell>

        {/* Active */}
        <TableCell sx={{ width: 64 }}>
          <Switch
            size="small"
            checked={isActive}
            onChange={(e) => onSetActive(pack.id, e.target.checked)}
          />
        </TableCell>

        {/* Name */}
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{pack.name}</Typography>
          {pack.type === "supplement" && (
            <Chip label="supplement" size="small" color="secondary" sx={{ mt: 0.25, fontSize: "0.65rem", height: 16 }} />
          )}
        </TableCell>

        {/* Author */}
        <TableCell>
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>{pack.author ?? "—"}</Typography>
        </TableCell>

        {/* Version */}
        <TableCell>
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>{pack.version ?? "—"}</Typography>
        </TableCell>

        {/* Actions */}
        <TableCell sx={{ width: 96 }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={t("Delete")}>
              <IconButton
                size="small"
                color="error"
                onClick={handleDelete}
                disabled={pack.isPersonal || pack.locked}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("More actions (coming soon)")}>
              <span>
                <IconButton size="small" disabled>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      {/* Expanded metadata row */}
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0 }}>
          <Collapse in={expanded} unmountOnExit>
            <Box sx={{ px: 3, py: 1.5, bgcolor: "action.hover", display: "flex", flexDirection: "column", gap: 0.75 }}>
              {pack.description && (
                <Typography variant="body2">{pack.description}</Typography>
              )}
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                <strong>{t("Items")}:</strong> {itemCountSummary(pack)}
              </Typography>
              {pack.fultimatorMinVersion && (
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>
                  <strong>{t("Min version")}:</strong> {pack.fultimatorMinVersion}
                </Typography>
              )}
              {pack.homepageUrl && (
                <Typography variant="caption">
                  <strong>{t("Homepage")}:</strong>{" "}
                  <a
                    href={pack.homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
                  >
                    {pack.homepageUrl}
                    <OpenInNewIcon sx={{ fontSize: 12, ml: 0.25 }} />
                  </a>
                </Typography>
              )}
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                <strong>{t("Added")}:</strong> {formatDate(pack.createdAt)}
                {" · "}
                <strong>{t("Updated")}:</strong> {formatDate(pack.updatedAt)}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <DeleteConfirmationDialog
        open={confirmDeleteOpen}
        onClose={setConfirmDeleteOpen}
        onConfirm={async () => {
          await onDelete(pack.id);
        }}
        title={t("Delete module")}
        message={t("This cannot be undone.")}
        itemPreview={<Typography variant="h4">{pack.name}</Typography>}
      />
    </>
  );
}

export default function ContentPacksTab({ packs, onSetActive, onDelete }: ContentPacksTabProps) {
  const { t } = useTranslate();
  const managedPacks = packs.filter((p) => !p.isPersonal);

  if (managedPacks.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{
          color: "text.secondary"
        }}>{t("No modules installed. Use the Install Content tab to add one.")}</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 40 }} />
            <TableCell sx={{ width: 64 }}>{t("Active")}</TableCell>
            <TableCell>{t("Name")}</TableCell>
            <TableCell>{t("Author")}</TableCell>
            <TableCell>{t("Version")}</TableCell>
            <TableCell sx={{ width: 96 }}>{t("Actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {managedPacks.map((pack) => (
            <PackRow
              key={pack.id}
              pack={pack}
              onSetActive={onSetActive}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
