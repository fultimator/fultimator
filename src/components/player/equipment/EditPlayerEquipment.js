import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  Button,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import Weapons from "../../../routes/equip/weapons/Weapons";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Modal from "@mui/material/Modal";

export default function EditPlayerEquipment({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "auto",
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  const [openNewWeapon, setOpenNewWeapon] = React.useState(false);
  const handleOpenNewWeapon = () => setOpenNewWeapon(true);
  const handleCloseNewWeapon = () => setOpenNewWeapon(false);

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
                <CustomHeader type="top" headerText={t("Equipment")} />
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
          <Typography
            variant="h2"
            component="legend"
            sx={{
              color: primary,
              textTransform: "uppercase",
              padding: "5px 10px",
              borderRadius: 0,
              margin: "0 0 0 0",
              fontSize: "1.5em",
            }}
          >
            {t("Weapons")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
            {/* List all available Weapons */}
        </AccordionDetails>
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
          <Typography
            variant="h2"
            component="legend"
            sx={{
              color: primary,
              textTransform: "uppercase",
              padding: "5px 10px",
              borderRadius: 0,
              margin: "0 0 0 0",
              fontSize: "1.5em",
            }}
          >
            {t("Armor")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
            {/* List all available Armor */}
        </AccordionDetails>
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
          <Typography
            variant="h2"
            component="legend"
            sx={{
              color: primary,
              textTransform: "uppercase",
              padding: "5px 10px",
              borderRadius: 0,
              margin: "0 0 0 0",
              fontSize: "1.5em",
            }}
          >
            {t("Shields")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
            {/* List all available Shields */}
        </AccordionDetails>
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
          <Typography
            variant="h2"
            component="legend"
            sx={{
              color: primary,
              textTransform: "uppercase",
              padding: "5px 10px",
              borderRadius: 0,
              margin: "0 0 0 0",
              fontSize: "1.5em",
            }}
          >
            {t("Accessories")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
            {/* List all available Accessories */}
        </AccordionDetails>
      </Accordion>
      <Modal
        open={openNewWeapon}
        onClose={handleCloseNewWeapon}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Weapons id="modal-modal-description" />
        </Box>
      </Modal>
    </>
  );
}
