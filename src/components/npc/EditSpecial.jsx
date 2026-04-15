import { RemoveCircleOutlined } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import { Add } from "@mui/icons-material";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

export default function EditSpecial({ npc, setNpc }) {
  const { t } = useTranslate();
  const isSmallScreen = useMediaQuery("(max-width: 899px)");
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingSpecialIndex, setPendingSpecialIndex] = useState(null);
  const onChangeSpecial = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.special[i][key] = value;
      return newState;
    });
  };

  const addSpecial = () => {
    setNpc((prevState) => ({
      ...prevState,
      special: [
        ...(prevState.special || []),
        {
          name: "",
          effect: "",
        },
      ],
    }));
  };

  const removeSpecial = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      special: (prevState.special || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingSpecialIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type={isSmallScreen ? "middle" : "top"}
        addItem={addSpecial}
        headerText={t("Special Rules")}
        icon={Add}
        openCompendium={() => setModalOpen(true)}
      />
      {npc.special?.map((special, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid sx={{ p: 0, m: 0 }}>
              <IconButton onClick={() => openDeleteDialog(i)}>
                <RemoveCircleOutlined />
              </IconButton>
            </Grid>
            <Grid size="grow">
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={special.name}
                  onChange={(e) => {
                    return onChangeSpecial(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid size={3}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="spCost"
                  label={t("SP Cost:")}
                  type="number"
                  value={special?.spCost ?? 1}
                  onChange={(e) => onChangeSpecial(i, "spCost", e.target.value)}
                  size="small"
                  slotProps={{
                    htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
                  }}
                />
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField id="effect" label={t("Effect:")} value={special.effect}
                  onChange={(e) => {
                    return onChangeSpecial(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={special.effect}
                  onChange={(e) => {
                    return onChangeSpecial(i, "effect", e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        );
      })}
      <CompendiumViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context="npc"
        initialType="special"
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            special: [
              ...(prev.special || []),
              {
                name: item.name,
                effect: item.effect || "",
                spCost: item.spCost ?? 1,
              },
            ],
          }));
        }}
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingSpecialIndex(null);
        }}
        onConfirm={() => {
          if (pendingSpecialIndex === null) return;
          removeSpecial(pendingSpecialIndex);
          setIsDeleteDialogOpen(false);
          setPendingSpecialIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingSpecialIndex !== null
            ? npc.special?.[pendingSpecialIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}
