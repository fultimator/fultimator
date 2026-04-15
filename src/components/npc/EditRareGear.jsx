import { RemoveCircleOutlined } from "@mui/icons-material";

import { Grid, FormControl, IconButton, TextField } from "@mui/material";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import { Add } from "@mui/icons-material";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { useState } from "react";

export default function EditRareGear({ npc, setNpc }) {
  const { t } = useTranslate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingGearIndex, setPendingGearIndex] = useState(null);
  const onChangeRareGear = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.raregear[i][key] = value;
      return newState;
    });
  };

  const addRareGear = () => {
    setNpc((prevState) => ({
      ...prevState,
      raregear: [
        ...(prevState.raregear || []),
        {
          name: "",
          effect: "",
        },
      ],
    }));
  };

  const removeRareGear = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      raregear: (prevState.raregear || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingGearIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="middle"
        addItem={addRareGear}
        headerText={t("Rare Equipment")}
        icon={Add}
      />
      {npc.raregear?.map((raregear, i) => {
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
                  value={raregear.name}
                  onChange={(e) => {
                    return onChangeRareGear(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField id="effect" label={t("Effect:")} ={raregear.effect}
                  onChange={(e) => {
                    return onChangeRareGear(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={raregear.effect}
                  onChange={(e) => {
                    return onChangeRareGear(i, "effect", e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        );
      })}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingGearIndex(null);
        }}
        onConfirm={() => {
          if (pendingGearIndex === null) return;
          removeRareGear(pendingGearIndex);
          setIsDeleteDialogOpen(false);
          setPendingGearIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingGearIndex !== null
            ? npc.raregear?.[pendingGearIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}
