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
import { Info } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

export default function PlayerSkills({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [openModal, setOpenModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  /* All skills with currentLvl > 0 from all classes */
  const allSkills = player.classes
    .map((c) => c.skills)
    .flat()
    .filter((skill) => skill.currentLvl > 0)
    .sort((a, b) => a.skillName.localeCompare(b.skillName));
  

  const handleOpenModal = (skill) => {
    setSelectedSkill(skill);
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
      {allSkills.length > 0 && (
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
            {t("Skills")}
          </Typography>
          <Grid container spacing={1} sx={{ padding: "1em" }}>
            {allSkills.map((skill, index) => (
              <Grid
                item
                container
                xs={12}
                md={6}
                key={index}
                sx={{ display: "flex", alignItems: "stretch" }}
              >
                <Grid item xs={10} sx={{ display: "flex" }}>
                  <Typography
                    id="skill-left-name"
                    variant="h2"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      backgroundColor: primary,
                      padding: "5px",
                      paddingLeft: "10px",
                      color: "#fff",
                      borderRadius: "8px 0 0 8px",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {skill.skillName}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ display: "flex", alignItems: "stretch" }}>
                  <div
                    id="skill-right-controls"
                    style={{
                      padding: "10px",
                      backgroundColor: ternary,
                      borderRadius: "0 8px 8px 0",
                      marginRight: "15px",
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                    className="skill-right-controls"
                  >
                    <IconButton
                      sx={{ padding: "0px" }}
                      onClick={() => handleOpenModal(skill)}
                    >
                      <Info />
                    </IconButton>
                  </div>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="skill-description"
            aria-describedby="skill-description"
          >
            <Paper
              sx={{
                position: "absolute",
                width: { xs: "90%", md: 400},
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
                {selectedSkill && selectedSkill.name}
              </Typography>
              <ReactMarkdown>
                {selectedSkill && selectedSkill.description}
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
      <style jsx>{`
        @media (max-width: 600px) {
          .skill-right-controls {
            flex-direction: column !important;
          }
          .skill-right-controls .MuiIconButton-root {
            margin-left: 0 !important;
            margin-top: 5px !important;
          }
        }
      `}</style>
    </>
  );
}
