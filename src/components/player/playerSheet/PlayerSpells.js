import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Modal,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Casino, Info } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

export default function PlayerSpells({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [openModal, setOpenModal] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState(null);

  /* All spells from all classes */
  const allSpells = player.classes
    .map((c) => c.spells)
    .flat()
    .filter((spell) => spell !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleOpenModal = (spell) => {
    setSelectedSpell(spell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOK = () => {
    handleCloseModal();
  };

  return (
    <>
      {allSpells.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
            display: "flex",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              writingMode: "vertical-lr",
              textTransform: "uppercase",
              marginLeft: "-1px",
              marginRight: "10px",
              marginTop: "-1px",
              marginBottom: "-1px",
              paddingY: "10px",
              backgroundColor: primary,
              color: ternary,
              borderRadius: "0 8px 8px 0",
              transform: "rotate(180deg)",
              fontSize: "2em",
            }}
            align="center"
          >
            {t("Spells")}
          </Typography>
          <Grid container spacing={1} sx={{ padding: "1em" }}>
            {allSpells.map((spell, index) => (
              <Grid item container xs={12} md={6} key={index}>
                <Grid item xs={10}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      backgroundColor: primary,
                      padding: "5px",
                      paddingLeft: "10px",
                      color: "#fff",
                      borderRadius: "8px 0 0 8px",
                    }}
                  >
                    {spell.name}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      padding: "10px",
                      backgroundColor: ternary,
                      borderRadius: "0 8px 8px 0",
                      marginRight: "15px",
                    }}
                  >
                    <IconButton
                      sx={{ padding: "0px" }}
                      onClick={() => handleOpenModal(spell)}
                    >
                      <Info />
                    </IconButton>
                    {spell.isOffensive && (
                      <IconButton sx={{ padding: "0px", marginLeft: "5px" }}>
                        <Casino
                          onClick={() => {
                            alert("Rolls not yet implemented");
                          }}
                        />
                      </IconButton>
                    )}
                  </div>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="spell-description"
            aria-describedby="spell-description"
          >
            <Paper
              sx={{
                position: "absolute",
                width: 400,
                bgcolor: "#fff",
                border: "2px solid",
                borderColor: secondary,
                borderRadius: "8px",
                boxShadow: 24,
                padding: 2,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Typography variant="h4">
                {selectedSpell && selectedSpell.name}
              </Typography>
              <ReactMarkdown>
                {selectedSpell && selectedSpell.description}
              </ReactMarkdown>
              <Button
                variant="contained"
                onClick={handleOK}
                sx={{ marginTop: 2, width: "100%" }}
              >
                OK
              </Button>
            </Paper>
          </Modal>
        </Paper>
      )}
    </>
  );
}
