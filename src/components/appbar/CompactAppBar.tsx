import React from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Grid,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import MenuOption from "./MenuOption";
import { useNpc } from "../../components/npc/NpcContext"; // Import the context
import ExplainSkillsSimplified from "../../components/npc/ExplainSkillsSimplified";

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Midnight";

interface CompactAppBarProps {
  isNpcEdit: boolean;
  selectedTheme: ThemeValue;
  handleSelectTheme: (theme: ThemeValue) => void;
  showGoBackButton: boolean;
  handleNavigation: () => void;
}

const CompactAppBar: React.FC<CompactAppBarProps> = ({
  isNpcEdit,
  selectedTheme,
  handleSelectTheme,
  showGoBackButton,
  handleNavigation,
}) => {
  const { npcTemp } = useNpc(); // Use the context to get npcTemp data

  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid
            item
            xs={2}
            textAlign="left"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {showGoBackButton && (
              <IconButton color="inherit" onClick={handleNavigation}>
                <ArrowBack sx={{ width: "32px", height: "32px" }} />
              </IconButton>
            )}
          </Grid>

          <Grid
            item
            xs={8}
            textAlign="center"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Display ExplainSkillsSimplified */}
            {npcTemp && <ExplainSkillsSimplified npc={npcTemp} />}
          </Grid>

          <Grid item xs={2} sx={{ textAlign: "right" }}>
            <Grid
              container
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <MenuOption
                selectedTheme={selectedTheme}
                onSelectTheme={handleSelectTheme}
              />
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    </MuiAppBar>
  );
};

export default CompactAppBar;
