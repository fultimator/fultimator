import React, { useState } from "react";
import { Button, Grid, Typography } from "@mui/material";
import { ArrowBack, Delete } from "@mui/icons-material";
import { diceList } from "../../libs/rolls";
import Diamond from "../Diamond";
import { useTranslate } from "../../translation/translate";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

export default function PreparedRollsList({ rolls, handleRoll, handleDelete }) {
  const { t } = useTranslate();
  const [rollToDelete, setRollToDelete] = useState(null);

  const openDeleteDialog = (event, roll) => {
    event.stopPropagation();
    setRollToDelete(roll);
  };

  const closeDeleteDialog = () => {
    setRollToDelete(null);
  };

  const confirmDelete = () => {
    if (!rollToDelete) return;
    const maybeHandler = handleDelete(rollToDelete.id);
    if (typeof maybeHandler === "function") {
      maybeHandler();
    } else {
      handleDelete(rollToDelete.id);
    }
  };

  if (!rolls) {
    return null;
  }
  return (
    <>
      {rolls.map((roll, i) => {
        return (
          <Grid
            key={i}
            container
            spacing={1}
            rowSpacing={1}
            sx={{ my: 1, alignItems: "center" }}
          >
            <Grid>
              <Button
                variant="contained"
                startIcon={
                  <ArrowBack sx={{ display: { xs: "none", sm: "inline" } }} />
                }
                onClick={handleRoll(roll)}
              >
                {t("Roll")}
              </Button>
            </Grid>
            <Grid size="grow">
              <Typography
                sx={{
                  fontSize: "1.1rem",
                }}
              >
                <Roll roll={roll} /> {roll.label && <Diamond />} {roll.label}
              </Typography>
            </Grid>
            <Grid>
              <Button
                variant="outlined"
                color="red"
                startIcon={
                  <Delete sx={{ display: { xs: "none", sm: "inline" } }} />
                }
                onClick={(e) => openDeleteDialog(e, roll)}
              >
                {t("Remove")}
              </Button>
            </Grid>
          </Grid>
        );
      })}
      <DeleteConfirmationDialog
        open={Boolean(rollToDelete)}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title={t("Delete")}
        message={t("Are you sure you want to remove this prepared roll?")}
        itemPreview={
          rollToDelete && (
            <Typography variant="h4">
              {diceList(rollToDelete.dice, rollToDelete.modifier)}
              {rollToDelete.label ? ` ${rollToDelete.label}` : ""}
            </Typography>
          )
        }
      />
    </>
  );
}

function Roll({ roll }) {
  return (
    <Typography component="span" sx={{ fontWeight: "bold" }}>
      {diceList(roll.dice, roll.modifier)}
    </Typography>
  );
}
