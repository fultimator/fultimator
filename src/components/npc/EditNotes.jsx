import { RemoveCircleOutlined } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
} from "@mui/material";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from '../common/CustomTextarea';
import CustomHeader from '../common/CustomHeader';
import { Add } from "@mui/icons-material";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { useState } from "react";

export default function EditNotes({ npc, setNpc }) {
  const { t } = useTranslate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingNoteIndex, setPendingNoteIndex] = useState(null);
  const onChangeNotes = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.notes[i][key] = value;
      return newState;
    });
  };

  const addNotes = () => {
    setNpc((prevState) => ({
      ...prevState,
      notes: [
        ...(prevState.notes || []),
        {
        name: "",
        effect: "",
        },
      ],
    }));
  };

  const removeNotes = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      notes: (prevState.notes || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingNoteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader type="middle" addItem={addNotes} headerText={t("Notes")} icon={Add} />
      {npc.notes?.map((notes, i) => {
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
                  value={notes.name}
                  onChange={(e) => {
                    return onChangeNotes(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid  size={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField
                  id="effect"
                  label={t("Details:")}
                  value={notes.effect}
                  onChange={(e) => {
                    return onChangeNotes(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  label={t("Details:")}
                  value={notes.effect}
                  onChange={(e) => {
                    return onChangeNotes(i, "effect", e.target.value);
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
          setPendingNoteIndex(null);
        }}
        onConfirm={() => {
          if (pendingNoteIndex === null) return;
          removeNotes(pendingNoteIndex);
          setIsDeleteDialogOpen(false);
          setPendingNoteIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingNoteIndex !== null
            ? npc.notes?.[pendingNoteIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}
