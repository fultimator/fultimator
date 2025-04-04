import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Info } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

export default function PlayerSkills({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [openModal, setOpenModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  /* All skills with currentLvl > 0 from all classes */
  const allSkills = player.classes
    .flatMap((c) =>
      c.skills
        .concat(
          c.heroic && c.heroic.name !== ""
            ? [
                {
                  skillName: c.heroic.name,
                  description: c.heroic.description,
                  currentLvl: 1,
                  className: c.name,
                },
              ]
            : []
        )
        .map((skill) => ({
          ...skill,
          className: c.name,
          isHomebrew: c.isHomebrew === undefined ? true : c.isHomebrew,
        }))
    )
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
        <>
          <Divider sx={{ my: 1 }} />
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
                color: "#fff",
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
                      {skill.isHomebrew ? skill.skillName : t(skill.skillName)}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", alignItems: "stretch" }}
                  >
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
                      <Tooltip title={t("Info")}>
                        <IconButton
                          sx={{ padding: "0px" }}
                          onClick={() => handleOpenModal(skill)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <Dialog
              open={openModal}
              onClose={handleCloseModal}
              PaperProps={{ sx: { width: { xs: "90%", md: "80%" } } }}
            >
              <DialogTitle>
                <Typography
                  variant="h2"
                  sx={{ textTransform: "uppercase" }}
                  fontWeight="bold"
                >
                  {selectedSkill &&
                    (selectedSkill.isHomebrew
                      ? selectedSkill.skillName
                      : t(selectedSkill.skillName))}
                  {" - "}
                  {selectedSkill && t(selectedSkill.className)} {" -  "}
                  <Typography
                    component="span"
                    sx={{ ml: -1, mr: 0, fontSize: "1.2em" }}
                  >
                    【
                  </Typography>
                  {selectedSkill && t("SL") + " " + selectedSkill.currentLvl}
                  <Typography
                    component="span"
                    sx={{ mr: -0.7, fontSize: "1.2em" }}
                  >
                    】
                  </Typography>
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ marginTop: "10px" }}>
                <ReactMarkdown>
                  {selectedSkill &&
                    (selectedSkill.isHomebrew
                      ? selectedSkill.description
                      : t(selectedSkill.description))}
                </ReactMarkdown>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" onClick={handleOK} fullWidth>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
    </>
  );
}
