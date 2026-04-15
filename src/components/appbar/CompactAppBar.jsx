import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Grid,
  IconButton,
  Tooltip,
  Container,
} from "@mui/material";
import { ArrowBack, Search } from "@mui/icons-material";
import MenuOption from "./MenuOption";
import { useNpc } from "../npc/useNpcContext";
import ExplainSkillsSimplified from "../npc/ExplainSkillsSimplified";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
import { t } from "../../translation/translate";

const NpcEditAppBar = ({
  //isNpcEdit,
  isPcEdit,
  selectedTheme,
  handleSelectTheme,
  isDarkMode,
  handleToggleDarkMode,
  showGoBackButton,
  handleNavigation,
}) => {
  const { npcTemp } = useNpc(); // Use the context to get npcTemp data

  const [modalOpen, setModalOpen] = useState(false);

  const openCompendiumModal = () => setModalOpen(true);

  const closeCompendiumModal = () => setModalOpen(false);

  return (
    <MuiAppBar position="fixed">
      <Container>
        <Grid
          container
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Grid size={3} sx={{ textAlign: "left" }}>
            {showGoBackButton && (
              <IconButton color="inherit" onClick={handleNavigation}>
                <ArrowBack />
              </IconButton>
            )}
          </Grid>
          <Grid size={6} sx={{ textAlign: "center" }}>
            <Grid container sx={{ justifyContent: "center" }}>
              <ExplainSkillsSimplified npc={npcTemp} />
            </Grid>
          </Grid>
          <Grid size={3} sx={{ textAlign: "right" }}>
            <Grid
              container
              sx={{ alignItems: "center", justifyContent: "flex-end" }}
            >
              {showGoBackButton && !isPcEdit && (
                <Tooltip title="Open Compendium">
                  <IconButton color="inherit" onClick={openCompendiumModal}>
                    <Search />
                  </IconButton>
                </Tooltip>
              )}
              <MenuOption
                selectedTheme={selectedTheme}
                onSelectTheme={handleSelectTheme}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <CompendiumViewerModal
        open={modalOpen}
        onClose={closeCompendiumModal}
        viewOnly
      />
    </MuiAppBar>
  );
};

const PcEditAppBar = ({
  //isNpcEdit,
  //isPcEdit,
  selectedTheme,
  handleSelectTheme,
  isDarkMode,
  handleToggleDarkMode,
  showGoBackButton,
  handleNavigation,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openCompendiumModal = () => setModalOpen(true);
  const closeCompendiumModal = () => setModalOpen(false);

  return (
    <MuiAppBar position="fixed">
      <Container>
        <Grid
          container
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Grid size={3} sx={{ textAlign: "left" }}>
            {showGoBackButton && (
              <IconButton color="inherit" onClick={handleNavigation}>
                <ArrowBack />
              </IconButton>
            )}
          </Grid>
          <Grid size={6} sx={{ textAlign: "center" }}>
            <Grid container sx={{ justifyContent: "center" }}>
              <span>{t("Character Designer")}</span>
            </Grid>
          </Grid>
          <Grid size={3} sx={{ textAlign: "right" }}>
            <Grid
              container
              sx={{ alignItems: "center", justifyContent: "flex-end" }}
            >
              {showGoBackButton && (
                <Tooltip title="Open Compendium">
                  <IconButton color="inherit" onClick={openCompendiumModal}>
                    <Search />
                  </IconButton>
                </Tooltip>
              )}
              <MenuOption
                selectedTheme={selectedTheme}
                onSelectTheme={handleSelectTheme}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <CompendiumViewerModal
        open={modalOpen}
        onClose={closeCompendiumModal}
        viewOnly
      />
    </MuiAppBar>
  );
};

const CompactAppBar = (props) => {
  const { isNpcEdit, isPcEdit } = props;

  if (isNpcEdit && !isPcEdit) {
    return <NpcEditAppBar {...props} />;
  } else {
    return <PcEditAppBar {...props} />;
  }
};

export default CompactAppBar;
