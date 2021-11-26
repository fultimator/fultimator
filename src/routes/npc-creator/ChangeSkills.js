import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { calcSkillsCurrent, calcSkillsMax, skills } from "./skills/Skills";

function ChangeSkills({ npc, setnpc }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = () => {
    setDialogOpen(true);
  };

  const removeSkill = (i) => {
    return () => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.skills.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h6">
            Skills ({calcSkillsCurrent(npc)} / {calcSkillsMax(npc)})
            <IconButton color="primary" onClick={openDialog}>
              <FontAwesomeIcon icon={faPlus} />
            </IconButton>
          </Typography>
        </Grid>
        {npc.skills.map((skill, i) => {
          return (
            <React.Fragment key={i}>
              <Grid item xs={11}>
                {skills[skill.name]?.change({
                  npc: npc,
                  setnpc: setnpc,
                  i: i,
                })}
              </Grid>
              <Grid item xs={1}>
                <IconButton color="primary" onClick={removeSkill(i)}>
                  <FontAwesomeIcon icon={faMinus} />
                </IconButton>
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
      <SkillDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        npc={npc}
        setnpc={setnpc}
      ></SkillDialog>
    </>
  );
}

function SkillDialog({ open, setOpen, npc, setnpc }) {
  return (
    <Dialog open={open}>
      <DialogTitle>Choose Skill</DialogTitle>
      <Grid container>
        <Grid item xs={12}>
          <List>
            <ListItem button>
              <ListItemText>Attacco Speciale</ListItemText>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Dialog>
  );
}

export default ChangeSkills;
