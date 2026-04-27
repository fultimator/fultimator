import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Info } from "@mui/icons-material";
import { SharedSkillCard } from "../../shared/itemCards";

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
            : [],
        )
        .map((skill) => ({
          ...skill,
          className: c.name,
          isHomebrew: c.isHomebrew === undefined ? true : c.isHomebrew,
        })),
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
            <Grid
              container
              spacing={1}
              sx={{ padding: "1em", flex: 1, width: "100%" }}
            >
              {allSkills.map((skill, index) => (
                <Grid
                  container
                  spacing={0}
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    maxHeight: "40px",
                  }}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Grid sx={{ display: "flex" }} size={10}>
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
                    sx={{
                      display: "flex",
                      alignItems: "stretch",
                      maxHeight: "40px",
                    }}
                    size={2}
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
              fullWidth
              maxWidth="sm"
            >
              <DialogContent sx={{ p: 0 }}>
                {selectedSkill && <SharedSkillCard item={selectedSkill} />}
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOK}
                  fullWidth
                >
                  {t("Close")}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
    </>
  );
}
