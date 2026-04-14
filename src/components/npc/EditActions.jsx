import { RemoveCircleOutlined } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from '../common/CustomTextarea';
import CustomHeader from '../common/CustomHeader';
import { Add } from "@mui/icons-material";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

export default function EditActions({ npc, setNpc }) {
  const { t } = useTranslate();
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingActionIndex, setPendingActionIndex] = useState(null);
  const onChangeActions = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.actions[i][key] = value;
      return newState;
    });
  };

  const addActions = () => {
    setNpc((prevState) => ({
      ...prevState,
      actions: [
        ...(prevState.actions || []),
        {
        name: "",
        effect: "",
        },
      ],
    }));
  };

  const removeActions = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      actions: (prevState.actions || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingActionIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader type="top" addItem={addActions} headerText={t("Other Actions")} icon={Add} openCompendium={() => setModalOpen(true)} />
      {npc.actions?.map((actions, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid  sx={{ p: 0, m: 0 }}>
              <IconButton onClick={() => openDeleteDialog(i)}>
                <RemoveCircleOutlined />
              </IconButton>
            </Grid>
            <Grid  size="grow">
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={actions.name}
                  onChange={(e) => {
                    return onChangeActions(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid  size={3}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="spCost"
                  label={t("SP Cost:")}
                  type="number"
                  value={actions?.spCost ?? 1}
                  onChange={(e) => onChangeActions(i, "spCost", e.target.value)}
                  size="small"
                  slotProps={{
                    htmlInput: { inputMode: "numeric", pattern: "[0-9]*" }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid  size={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField id="effect" label={t("Effect:")} value={actions.effect}
                  onChange={(e) => {
                    return onChangeActions(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={actions.effect}
                  onChange={(e) => {
                    return onChangeActions(i, "effect", e.target.value);
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
        initialType="actions"
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            actions: [
              ...(prev.actions || []),
              { name: item.name, effect: item.effect || "", spCost: item.spCost ?? 1 },
            ],
          }));
        }}
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingActionIndex(null);
        }}
        onConfirm={() => {
          if (pendingActionIndex === null) return;
          removeActions(pendingActionIndex);
          setIsDeleteDialogOpen(false);
          setPendingActionIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingActionIndex !== null
            ? npc.actions?.[pendingActionIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}
