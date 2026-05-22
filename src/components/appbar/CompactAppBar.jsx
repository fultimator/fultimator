import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Grid,
  IconButton,
  Tooltip,
  Container,
} from "@mui/material";
import {
  ArrowBack,
  Search,
  ChatBubbleOutlineOutlined as ChatBubbleOutlineIcon,
} from "@mui/icons-material";
import MenuOption from "./MenuOption";
import { useNpc } from "../npc/useNpcContext";
import ExplainSkillsSimplified from "../npc/ExplainSkillsSimplified";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
import { t } from "../../translation/translate";

const NpcEditAppBar = ({
  //isNpcEdit,
  isPcEdit,
  selectedTheme,
  selectedStyleProfile,
  handleSelectTheme,
  handleSelectStyleProfile,
  isDarkMode,
  handleToggleDarkMode,
  showGoBackButton,
  handleNavigation,
  onOpenDrawer,
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
          <Grid sx={{ textAlign: "left", display: "flex", alignItems: "center" }}>
            {showGoBackButton && (
              <IconButton color="inherit" onClick={handleNavigation}>
                <ArrowBack />
              </IconButton>
            )}
            <Tooltip title="Open Compendium">
              <IconButton color="inherit" onClick={openCompendiumModal}>
                <Search />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid sx={{ flex: 1, minWidth: 0, px: 0.5 }}>
            <Grid container sx={{ justifyContent: "center", minWidth: 0 }}>
              <ExplainSkillsSimplified npc={npcTemp} />
            </Grid>
          </Grid>
          <Grid sx={{ textAlign: "right" }}>
            <Grid
              container
              sx={{ alignItems: "center", justifyContent: "flex-end" }}
            >
              {onOpenDrawer && (
                <Tooltip title="Open Chat">
                  <IconButton color="inherit" onClick={onOpenDrawer}>
                    <ChatBubbleOutlineIcon />
                  </IconButton>
                </Tooltip>
              )}
              <MenuOption
                selectedTheme={selectedTheme}
                selectedStyleProfile={selectedStyleProfile}
                onSelectTheme={handleSelectTheme}
                onSelectStyleProfile={handleSelectStyleProfile}
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
  selectedStyleProfile,
  handleSelectTheme,
  handleSelectStyleProfile,
  isDarkMode,
  handleToggleDarkMode,
  showGoBackButton,
  handleNavigation,
  onOpenDrawer,
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
          <Grid sx={{ textAlign: "left", display: "flex", alignItems: "center" }}>
            {showGoBackButton && (
              <IconButton color="inherit" onClick={handleNavigation}>
                <ArrowBack />
              </IconButton>
            )}
            <Tooltip title="Open Compendium">
              <IconButton color="inherit" onClick={openCompendiumModal}>
                <Search />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid sx={{ flex: 1, minWidth: 0, px: 0.5 }}>
            <Grid container sx={{ justifyContent: "center", minWidth: 0 }}>
              <span>{t("Character Designer")}</span>
            </Grid>
          </Grid>
          <Grid sx={{ textAlign: "right" }}>
            <Grid
              container
              sx={{ alignItems: "center", justifyContent: "flex-end" }}
            >
              {onOpenDrawer && (
                <Tooltip title="Open Chat">
                  <IconButton color="inherit" onClick={onOpenDrawer}>
                    <ChatBubbleOutlineIcon />
                  </IconButton>
                </Tooltip>
              )}
              <MenuOption
                selectedTheme={selectedTheme}
                selectedStyleProfile={selectedStyleProfile}
                onSelectTheme={handleSelectTheme}
                onSelectStyleProfile={handleSelectStyleProfile}
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
