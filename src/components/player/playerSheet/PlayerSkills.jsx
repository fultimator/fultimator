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
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { ChatOutlined, Info } from "@mui/icons-material";
import { SharedSkillCard } from "../../shared/itemCards";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";
import {
  getActiveMnemospheres,
  getMnemosphereSkillDescription,
} from "../classes/mnemosphereClassUtils";

export default function PlayerSkills({ player, isEditMode = false }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const addMessage = useChatMessagesStore((s) => s.addMessage);

  const [openModal, setOpenModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [openMnemoModal, setOpenMnemoModal] = useState(false);
  const [selectedMnemoSkill, setSelectedMnemoSkill] = useState(null);
  const rowHeight = 40;

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

  const groupedSkillsByClass = allSkills.reduce((acc, skill) => {
    const className = skill.className || t("Unknown");
    if (!acc[className]) acc[className] = [];
    acc[className].push(skill);
    return acc;
  }, {});
  const classGroupKeys = Object.keys(groupedSkillsByClass).sort((a, b) =>
    t(a).localeCompare(t(b)),
  );
  const classLevelByName = (player.classes || []).reduce((acc, cls) => {
    const className = cls?.name || "";
    if (!className) return acc;
    acc[className] = cls?.lvl ?? 0;
    return acc;
  }, {});

  const allMnemoSkills = getActiveMnemospheres(player)
    .flatMap((mnemo) =>
      (mnemo.skills ?? [])
        .filter((s) => (s.currentLvl ?? 0) > 0)
        .map((skill) => ({
          name: skill.name,
          description: getMnemosphereSkillDescription(mnemo, skill) ?? "",
          currentLvl: skill.currentLvl,
          maxLvl: skill.maxLvl,
          className: mnemo.class,
        })),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleOpenModal = (skill) => {
    setSelectedSkill(skill);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenMnemoModal = (skill) => {
    setSelectedMnemoSkill(skill);
    setOpenMnemoModal(true);
  };

  const handleCloseMnemoModal = () => {
    setOpenMnemoModal(false);
  };

  const sendSkillToChat = (skill, isMnemo = false) => {
    const baseName = isMnemo ? skill.name : skill.skillName;
    const level = skill.currentLvl ?? 0;
    const localizedName = isMnemo ? t(baseName) : skill.isHomebrew ? baseName : t(baseName);
    const localizedDescription = isMnemo
      ? skill.description || ""
      : skill.isHomebrew
        ? skill.description || ""
        : t(skill.description || "");
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "skill",
      name: `${localizedName} (SL${level})`,
      tags: [
        t("Skill"),
        skill.className || t("Unknown"),
        isMnemo ? t("Mnemospheres") : t("Class"),
      ],
      description: localizedDescription,
    });
  };

  const skillPillSx = {
    fontWeight: "bold",
    textTransform: "uppercase",
    backgroundColor: primary,
    px: "10px",
    paddingLeft: "10px",
    height: `${rowHeight}px`,
    color: "#fff",
    borderRadius: "8px 0 0 8px",
    display: "flex",
    alignItems: "center",
    width: "100%",
  };

  const skillInfoSx = {
    px: "8px",
    backgroundColor: ternary,
    borderRadius: "0 8px 8px 0",
    marginRight: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    height: `${rowHeight}px`,
    width: "100%",
  };

  return (
    <>
      {(allSkills.length > 0 || allMnemoSkills.length > 0) && (
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
              {(isEditMode
                ? classGroupKeys.flatMap((className, groupIndex) => [
                    <Grid key={`class-divider-${className}`} size={12}>
                      <Box
                        sx={{
                          mt: groupIndex === 0 ? 0 : 1,
                          mb: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Divider sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                          >
                            {t(className)}
                          </Typography>
                        </Divider>
                        <Box
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 0.75,
                            px: 0.75,
                            py: 0.1,
                            minWidth: 48,
                            textAlign: "center",
                            bgcolor: "background.paper",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ letterSpacing: 0.5 }}
                          >
                            {(classLevelByName[className] ?? 0)}/10
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>,
                    ...groupedSkillsByClass[className].map((skill, index) => (
                      <Grid
                        container
                        spacing={0}
                        key={`${className}-${index}`}
                        sx={{
                          display: "flex",
                          alignItems: "stretch",
                          height: `${rowHeight}px`,
                        }}
                        size={{ xs: 12, md: 6 }}
                      >
                        <Grid sx={{ display: "flex" }} size={10}>
                          <Typography variant="h2" sx={skillPillSx}>
                            {`${skill.isHomebrew ? skill.skillName : t(skill.skillName)} (SL${skill.currentLvl})`}
                          </Typography>
                        </Grid>
                        <Grid
                          sx={{
                            display: "flex",
                            alignItems: "stretch",
                            height: `${rowHeight}px`,
                          }}
                          size={2}
                        >
                          <div style={skillInfoSx}>
                            <Tooltip title={t("Info")}>
                              <IconButton
                                sx={{ padding: "0px" }}
                                onClick={() => handleOpenModal(skill)}
                              >
                                <Info />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("Send to chat")}>
                              <IconButton
                                sx={{ padding: "0px", marginLeft: "5px" }}
                                onClick={() => sendSkillToChat(skill)}
                              >
                                <ChatOutlined />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </Grid>
                      </Grid>
                    )),
                  ])
                : allSkills.map((skill, index) => (
                    <Grid
                      container
                      spacing={0}
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "stretch",
                        height: `${rowHeight}px`,
                      }}
                      size={{ xs: 12, md: 6 }}
                    >
                      <Grid sx={{ display: "flex" }} size={10}>
                        <Typography variant="h2" sx={skillPillSx}>
                          {`${skill.isHomebrew ? skill.skillName : t(skill.skillName)} (SL${skill.currentLvl})`}
                        </Typography>
                      </Grid>
                      <Grid
                        sx={{
                          display: "flex",
                          alignItems: "stretch",
                          height: `${rowHeight}px`,
                        }}
                        size={2}
                      >
                        <div style={skillInfoSx}>
                          <Tooltip title={t("Info")}>
                            <IconButton
                              sx={{ padding: "0px" }}
                              onClick={() => handleOpenModal(skill)}
                            >
                              <Info />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("Send to chat")}>
                            <IconButton
                              sx={{ padding: "0px", marginLeft: "5px" }}
                              onClick={() => sendSkillToChat(skill)}
                            >
                              <ChatOutlined />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </Grid>
                    </Grid>
                  )))}

              {allMnemoSkills.length > 0 && (
                <>
                  <Grid size={12}>
                    <Divider sx={{ mt: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                      >
                        {t("Mnemospheres")}
                      </Typography>
                    </Divider>
                  </Grid>
                  {allMnemoSkills.map((skill, index) => (
                    <Grid
                      container
                      spacing={0}
                      key={`mnemo-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "stretch",
                        height: `${rowHeight}px`,
                      }}
                      size={{ xs: 12, md: 6 }}
                    >
                      <Grid sx={{ display: "flex" }} size={10}>
                        <Typography variant="h2" sx={skillPillSx}>
                          {`${t(skill.name)} (SL${skill.currentLvl})`}
                        </Typography>
                      </Grid>
                      <Grid
                        sx={{
                          display: "flex",
                          alignItems: "stretch",
                          height: `${rowHeight}px`,
                        }}
                        size={2}
                      >
                        <div style={skillInfoSx}>
                          <Tooltip title={t("Info")}>
                            <IconButton
                              sx={{ padding: "0px" }}
                              onClick={() => handleOpenMnemoModal(skill)}
                            >
                              <Info />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("Send to chat")}>
                            <IconButton
                              sx={{ padding: "0px", marginLeft: "5px" }}
                              onClick={() => sendSkillToChat(skill, true)}
                            >
                              <ChatOutlined />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </Grid>
                    </Grid>
                  ))}
                </>
              )}
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
                  onClick={handleCloseModal}
                  fullWidth
                >
                  {t("Close")}
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={openMnemoModal}
              onClose={handleCloseMnemoModal}
              fullWidth
              maxWidth="sm"
            >
              <DialogContent>
                {selectedMnemoSkill && (
                  <>
                    <Typography variant="h2" sx={{ fontWeight: "bold", mb: 1 }}>
                      {t(selectedMnemoSkill.name)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      {t(selectedMnemoSkill.className)} ·{" "}
                      {selectedMnemoSkill.currentLvl}/
                      {selectedMnemoSkill.maxLvl}
                    </Typography>
                    <Typography component="div">
                      {t(selectedMnemoSkill.description)}
                    </Typography>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCloseMnemoModal}
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
