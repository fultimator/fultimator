import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Collapse,
  Stack,
} from "@mui/material";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";

/**
 * Generic migration dialog for NPCs or Players.
 *
 * Props:
 *   open          - boolean
 *   onClose       - () => void
 *   actors        - array of actors that need migration (already filtered)
 *   actorType     - 'npc' | 'player'  (used for display strings only)
 *   onMigrateAll  - async (actors) => void  - called with the full stale list
 *   getMigrations - (actor) => string[]  - returns pending migration step labels
 */
export default function MigrationDialog({
  open,
  onClose,
  actors,
  actorType,
  onMigrateAll,
  getMigrations,
}) {
  const { t } = useTranslate();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const labelPlural = actorType === "npc" ? t("NPCs") : t("Players");

  const handleMigrateAll = async () => {
    setRunning(true);
    try {
      await onMigrateAll(actors);
      setDone(true);
    } finally {
      setRunning(false);
    }
  };

  const handleClose = () => {
    setDone(false);
    setExpandedId(null);
    onClose();
  };

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          gap: 1,
          color:
            theme.palette.mode === "light"
              ? theme.palette.warning.dark
              : theme.palette.warning.light,
        })}
      >
        <SystemUpdateAltIcon fontSize="small" />
        {t("Migration needed")} - {actors.length} {labelPlural}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {done ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography
              sx={{
                color: "success.main",
                fontWeight: 700,
              }}
            >
              {t("Migration complete!")} {actors.length} {labelPlural}{" "}
              {t("updated.")}
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                px: 2,
                pt: 1.5,
                pb: 0.5,
              }}
            >
              {t("The following")} {labelPlural.toLowerCase()}{" "}
              {t(
                "have an outdated data format and will be updated when saved individually. You can migrate all of them now.",
              )}
            </Typography>
            <List dense sx={{ maxHeight: 360, overflowY: "auto" }}>
              {actors.map((a) => {
                const migrations = getMigrations ? getMigrations(a) : [];
                const isExpanded = expandedId === a.id;
                return (
                  <Box key={a.id}>
                    <ListItem
                      onClick={
                        migrations.length > 0
                          ? () => toggleExpand(a.id)
                          : undefined
                      }
                      sx={
                        migrations.length > 0
                          ? { cursor: "pointer", userSelect: "none" }
                          : {}
                      }
                      secondaryAction={
                        <Chip
                          label={
                            migrations.length > 0
                              ? `${migrations.length} ${t("steps")}`
                              : t("Needs migration")
                          }
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {migrations.length > 0 &&
                              (isExpanded ? (
                                <ExpandLessIcon
                                  fontSize="small"
                                  sx={{ color: "text.secondary" }}
                                />
                              ) : (
                                <ExpandMoreIcon
                                  fontSize="small"
                                  sx={{ color: "text.secondary" }}
                                />
                              ))}
                            <Typography
                              variant="body1"
                              component="span"
                              fontWeight={500}
                            >
                              {a.name || `(${t("unnamed")})`}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {migrations.length > 0 && (
                      <Collapse in={isExpanded} unmountOnExit>
                        <Stack spacing={0.5} sx={{ px: 3, pb: 1, pt: 0.5 }}>
                          {migrations.map((label, i) => (
                            <Typography
                              key={i}
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: "warning.main",
                                  flexShrink: 0,
                                  display: "inline-block",
                                }}
                              />
                              {label}
                            </Typography>
                          ))}
                        </Stack>
                      </Collapse>
                    )}
                  </Box>
                );
              })}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
          }}
        >
          {!done &&
            `${actors.length} ${labelPlural.toLowerCase()} ${t("will be updated in the database.")}`}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button onClick={handleClose} size="small">
            {t("Close")}
          </Button>
          {!done && (
            <Button
              onClick={handleMigrateAll}
              variant="contained"
              color="warning"
              size="small"
              disabled={running}
              startIcon={
                running ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <SystemUpdateAltIcon />
                )
              }
            >
              {running ? t("Migrating…") : t("Migrate All")}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
