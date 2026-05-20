import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  Typography,
} from "@mui/material";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { useTranslate } from "../../../../translation/translate";

export default function VehicleEnterDialog({
  open,
  onClose,
  vehicles = [],
  onEnter,
  title = null,
}) {
  const { t } = useTranslate();
  const defaultIndex = useMemo(() => {
    const activeIndex = vehicles.findIndex((vehicle) => vehicle?.enabled);
    return activeIndex >= 0 ? activeIndex : 0;
  }, [vehicles]);
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  useEffect(() => {
    if (open) setSelectedIndex(defaultIndex);
  }, [defaultIndex, open]);

  const canEnter = vehicles.length > 0 && selectedIndex >= 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PrecisionManufacturingIcon color="success" fontSize="small" />
        {title || t("Enter Vehicle")}
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        {vehicles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("No vehicles available.")}
          </Typography>
        ) : (
          <List dense>
            {vehicles.map((vehicle, index) => {
              const vehicleName = vehicle.customName || t("Vehicle");
              const frameName = vehicle.frame ? t(vehicle.frame) : "";
              const slots = vehicle.slots || {};
              const enabledCount = (vehicle.modules || []).filter((module) => {
                const key = module?.key ?? module?.name;
                return (
                  slots.main === key ||
                  slots.off === key ||
                  slots.armor === key ||
                  (slots.support || []).includes(key)
                );
              }).length;
              const moduleCount = (vehicle.modules || []).length;

              return (
                <ListItem key={`${vehicleName}-${index}`} disablePadding>
                  <ListItemButton
                    selected={selectedIndex === index}
                    onClick={() => setSelectedIndex(index)}
                    onDoubleClick={() => {
                      onEnter(index);
                      onClose();
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Radio
                        edge="start"
                        checked={selectedIndex === index}
                        disableRipple
                        size="small"
                        color="success"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={vehicleName}
                      secondary={[
                        frameName,
                        `${t("ClassFeatureVehicleActiveModules")}: ${enabledCount}/${moduleCount}`,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          {t("Cancel")}
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          disabled={!canEnter}
          onClick={() => {
            onEnter(selectedIndex);
            onClose();
          }}
        >
          {t("Enter")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
