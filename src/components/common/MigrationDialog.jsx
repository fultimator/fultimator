import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, Typography,
  CircularProgress, Box, Chip,
} from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useState } from 'react';
import { useTranslate } from '../../translation/translate';

/**
 * Generic migration dialog for NPCs or Players.
 *
 * Props:
 *   open          - boolean
 *   onClose       - () => void
 *   actors        - array of actors that need migration (already filtered)
 *   actorType     - 'npc' | 'player'  (used for display strings only)
 *   onMigrateAll  - async (actors) => void  - called with the full stale list
 */
export default function MigrationDialog({ open, onClose, actors, actorType, onMigrateAll }) {
  const { t } = useTranslate();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const label = actorType === 'npc' ? t('NPC') : t('Player');
  const labelPlural = actorType === 'npc' ? t('NPCs') : t('Players');

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
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SystemUpdateAltIcon color="warning" fontSize="small" />
        {t('Migration needed')} - {actors.length} {labelPlural}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {done ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography
              sx={{
                color: "success.main",
                fontWeight: 700
              }}>
              {t('Migration complete!')} {actors.length} {labelPlural} {t('updated.')}
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
                pb: 0.5
              }}>
              {t('The following')} {labelPlural.toLowerCase()} {t('have an outdated data format and will be updated when saved individually. You can migrate all of them now.')}
            </Typography>
            <List dense sx={{ maxHeight: 320, overflowY: 'auto' }}>
              {actors.map((a) => (
                <ListItem key={a.id} secondaryAction={
                  <Chip label={t('Needs migration')} size="small" color="warning" variant="outlined" />
                }>
                  <ListItemText
                    primary={a.name || `(${t('unnamed')})`}
                    secondary={actorType === 'npc' ? `Lv ${a.lvl ?? '?'}` : `Lv ${a.lvl ?? '?'}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          {!done && `${actors.length} ${labelPlural.toLowerCase()} ${t('will be updated in the database.')}`}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1
          }}>
          <Button onClick={handleClose} size="small">{t('Close')}</Button>
          {!done && (
            <Button
              onClick={handleMigrateAll}
              variant="contained"
              color="warning"
              size="small"
              disabled={running}
              startIcon={running ? <CircularProgress size={14} color="inherit" /> : <SystemUpdateAltIcon />}
            >
              {running ? t('Migrating…') : t('Migrate All')}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
