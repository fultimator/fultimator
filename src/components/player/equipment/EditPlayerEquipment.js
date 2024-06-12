import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  Button,
  Divider,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import PlayerWeapons from "./PlayerWeapons";
import PlayerArmor from "./PlayerArmor";
import PlayerShields from "./PlayerShields";
import PlayerAccessories from "./PlayerAccessories";

import PlayerWeaponModal from "./PlayerWeaponModal";

export default function EditPlayerEquipment({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [openNewWeapon, setOpenNewWeapon] = React.useState(false);
  const handleOpenNewWeapon = () => setOpenNewWeapon(true);

  return (
    <>
      <div>EQUIPMENT IS PLACEHOLDER, AND NEEDS TO BE IMPLEMENTED</div>
      {isEditMode ? (
        <>
          {" "}
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomHeader
                  type="top"
                  headerText={t("Equipment")}
                  showIconButton={false}
                />
              </Grid>
              <Grid container justifyContent="center" spacing={2}>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button variant="contained" onClick={handleOpenNewWeapon}>
                    Add Weapon
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button variant="contained">Add Armor</Button>
                </Grid>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button variant="contained">Add Shield</Button>
                </Grid>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button variant="contained">Add Accessory</Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />{" "}
        </>
      ) : null}
      <Accordion
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          marginBottom: 3,
        }}
      >
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <PlayerWeapons />
        </AccordionSummary>
        <AccordionDetails>{/* List all available Weapons */}</AccordionDetails>
      </Accordion>
      <Accordion
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          marginBottom: 3,
        }}
      >
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <PlayerArmor />
        </AccordionSummary>
        <AccordionDetails>{/* List all available Armor */}</AccordionDetails>
      </Accordion>
      <Accordion
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          marginBottom: 3,
        }}
      >
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <PlayerShields />
        </AccordionSummary>
        <AccordionDetails>{/* List all available Shields */}</AccordionDetails>
      </Accordion>
      <Accordion
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          marginBottom: 3,
        }}
      >
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <PlayerAccessories />
        </AccordionSummary>
        <AccordionDetails>
          {/* List all available Accessories */}
        </AccordionDetails>
      </Accordion>
      <PlayerWeaponModal
        open={openNewWeapon}
        onClose={() => setOpenNewWeapon(false)}
      />
    </>
  );
}
