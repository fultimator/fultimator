import { useState } from "react";
import {
  Grid,
  TextField,
  Box, // used in expanded section and delete dialog
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import { TypeIcon } from "/src/components/types";
import Diamond from "/src/components/Diamond";
import { availableMagichantKeys } from "/src/libs/player/spellOptionData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";

export default function MagichantKeyItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const handleNameChange = (value) => {
    const key = availableMagichantKeys.find((k) => k.name === value);
    if (!key) return;
    onItemChange(itemIndex, "key", value);
    onItemChange(itemIndex, "type", key.type || "");
    onItemChange(itemIndex, "status", key.status || "");
    onItemChange(itemIndex, "attribute", key.attribute || "");
    onItemChange(itemIndex, "recovery", key.recovery || "");
    if (value !== "magichant_custom_name") {
      onItemChange(itemIndex, "customName", "");
    }
  };

  const isCustom =
    item.key === "magichant_custom_name" ||
    !availableMagichantKeys.find((k) => k.name === item.key);

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {},
  });

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "magichant_custom_name",
      customName: item.customName || (item.key ? t(item.key) : ""),
      type: typeof item.type === "string" ? t(item.type) : item.type,
      status: typeof item.status === "string" ? t(item.status) : item.status,
      attribute:
        typeof item.attribute === "string" ? t(item.attribute) : item.attribute,
      recovery:
        typeof item.recovery === "string" ? t(item.recovery) : item.recovery,
    });
  };

  const itemDisplayName =
    item.customName || t(item.key || "magichant_custom_name");

  const [expanded, setExpanded] = useState(false);

  const metaParts = [
    isCustom ? item.type : t(item.type || ""),
    isCustom ? item.status : t(item.status || ""),
    isCustom ? item.attribute : t(item.attribute || ""),
    isCustom ? item.recovery : t(item.recovery || ""),
  ].filter(Boolean);

  const rowLabel = (
    <Box
      sx={{
        fontFamily: "Antonio",
        fontWeight: 800,
        fontSize: "1rem",
        textTransform: "uppercase",
        lineHeight: 1.3,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0.5,
      }}
    >
      <span>{itemDisplayName}</span>
      {metaParts.map((part, i) => (
        <span
          key={i}
          style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
        >
          <Diamond />
          <span style={{ opacity: 0.75 }}>{part}</span>
        </span>
      ))}
    </Box>
  );

  return (
    <>
      <ItemRowCard
        label={rowLabel}
        variant="outlined"
        onClick={() => setExpanded((v) => !v)}
        actions={
          <>
            <Tooltip title={t("Clone to Custom")}>
              <IconButton onClick={handleCloneToCustom}>
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Delete")}>
              <IconButton onClick={handleDelete}>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        }
        paperSx={{ mb: 0.5 }}
      >
        {expanded && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("magichant_key")}</InputLabel>
                  <Select
                    value={item.key || "magichant_custom_name"}
                    onChange={(e) => handleNameChange(e.target.value)}
                    label={t("magichant_key")}
                  >
                    {availableMagichantKeys.map((option) => (
                      <MenuItem key={option.name} value={option.name}>
                        {t(option.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 7 }}>
                <TextField
                  fullWidth
                  label={t("magichant_name")}
                  value={isCustom ? item.customName || "" : t(item.key || "")}
                  onChange={(e) =>
                    isCustom &&
                    onItemChange(itemIndex, "customName", e.target.value)
                  }
                  slotProps={{
                    input: { readOnly: !isCustom },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                {isCustom ? (
                  <TextField
                    fullWidth
                    label={t("magichant_type")}
                    value={item.type || ""}
                    onChange={(e) =>
                      onItemChange(itemIndex, "type", e.target.value)
                    }
                  />
                ) : (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ height: "100%", minHeight: 40 }}
                  >
                    <TypeIcon type={item.type} />
                    <span style={{ textTransform: "capitalize" }}>
                      {item.type || ""}
                    </span>
                  </Stack>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t("magichant_status_effect")}
                  value={isCustom ? item.status || "" : t(item.status || "")}
                  onChange={(e) =>
                    isCustom &&
                    onItemChange(itemIndex, "status", e.target.value)
                  }
                  slotProps={{
                    input: { readOnly: !isCustom },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t("magichant_attribute")}
                  value={
                    isCustom ? item.attribute || "" : t(item.attribute || "")
                  }
                  onChange={(e) =>
                    isCustom &&
                    onItemChange(itemIndex, "attribute", e.target.value)
                  }
                  slotProps={{
                    input: { readOnly: !isCustom },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t("magichant_recovery")}
                  value={
                    isCustom ? item.recovery || "" : t(item.recovery || "")
                  }
                  onChange={(e) =>
                    isCustom &&
                    onItemChange(itemIndex, "recovery", e.target.value)
                  }
                  slotProps={{
                    input: { readOnly: !isCustom },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </ItemRowCard>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => onDeleteItem(itemIndex)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this item?")}
        itemPreview={<Box sx={{ fontWeight: "bold" }}>{itemDisplayName}</Box>}
      />
    </>
  );
}
