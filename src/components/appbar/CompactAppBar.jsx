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
import { useNpc } from "../npc/NpcContext";
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
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid  textAlign="left" size={3}>
            {showGoBackButton && (
              <IconButton color="inherit" onClick={handleNavigation}>
                <ArrowBack />
              </IconButton>
            )}
          </Grid>
          <Grid  textAlign="center" size={6}>
            <Grid container justifyContent="center">
              <ExplainSkillsSimplified npc={npcTemp} />
            </Grid>
          </Grid>
          <Grid  textAlign="right" size={3}>
            <Grid container alignItems="center" justifyContent="flex-end">
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
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid  textAlign="left" size={3}>
            {showGoBackButton && (
              <IconButton color="inherit" onClick={handleNavigation}>
                <ArrowBack />
              </IconButton>
            )}
          </Grid>
          <Grid  textAlign="center" size={6}>
            <Grid container justifyContent="center">
              <span>{t("Character Designer")}</span>
            </Grid>
          </Grid>
          <Grid  textAlign="right" size={3}>
            <Grid container alignItems="center" justifyContent="flex-end">
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
