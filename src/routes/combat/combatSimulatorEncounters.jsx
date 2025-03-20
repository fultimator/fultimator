import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Paper,
  CardActions,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import Layout from "../../components/Layout";
import { useTheme } from "@mui/material/styles";
import CustomHeaderAlt from "../../components/common/CustomHeaderAlt";
import { SportsMartialArts, NavigateNext } from "@mui/icons-material";
import { t } from "../../translation/translate";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase";
import { SignIn } from "../../components/auth";
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

const MAX_ENCOUNTERS = 3;

export default function CombatSimulatorEncounters() {
  const [user, loading, error] = useAuthState(auth);
  console.debug("user, loading, error", user, loading, error);

  return (
    <Layout fullWidth={user}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            {t("You must be logged in to use this feature")}
          </Typography>
          <SignIn />
        </>
      )}
      {user && <CombatSimEncounters user={user} />}
    </Layout>
  );
}

const CombatSimEncounters = ({ user }) => {
  const encountersRef = collection(firestore, "encounters");
  const encountersQuery = query(encountersRef, where("uid", "==", user.uid));
  const [encountersList, loading] = useCollectionData(encountersQuery, {
    idField: "id",
  });

  const [encounters, setEncounters] = useState([]);
  const [encounterName, setEncounterName] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false); // State for settings dialog
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [autoUseMP, setAutoUseMP] = useState(() => {
    const storedSetting = localStorage.getItem("combatSimAutoUseMP");
    return storedSetting === null ? true : storedSetting === "true";
  });

  const [autoOpenLogs, setAutoOpenLogs] = useState(() => {
    const storedSetting = localStorage.getItem("combatSimAutoOpenLogs");
    return storedSetting === null ? true : storedSetting === "true";
  });

  useEffect(() => {
    const storedSetting = localStorage.getItem("combatSimAutoUseMP");
    if (storedSetting === null) {
      localStorage.setItem("combatSimAutoUseMP", "true"); // Set default value in localStorage
    }

    const storedSetting2 = localStorage.getItem("combatSimAutoOpenLogs");
    if (storedSetting2 === null) {
      localStorage.setItem("combatSimAutoOpenLogs", "true"); // Set default value in localStorage
    }
  }, []);

  useEffect(() => {
    if (!loading && encountersList) {
      const sortedEncounters = [...encountersList].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setEncounters(sortedEncounters);
    }
  }, [encountersList, loading]);

  const handleSaveSettings = () => {
    localStorage.setItem("combatSimAutoUseMP", autoUseMP);
    localStorage.setItem("combatSimAutoOpenLogs", autoOpenLogs);
    setSettingsOpen(false);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setAutoUseMP(localStorage.getItem("combatSimAutoUseMP") === "true");
    setAutoOpenLogs(localStorage.getItem("combatSimAutoOpenLogs") === "true");
  };

  const handleEncounterNameChange = (event) => {
    setEncounterName(event.target.value);
  };

  const handleSaveEncounter = async () => {
    if (!encounterName || encounters.length >= MAX_ENCOUNTERS) return;

    const newEncounter = {
      name: encounterName,
      round: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uid: user.uid,
      private: true,
    };

    // Add doc to firebase
    const docRef = collection(firestore, "encounters");
    try {
      const res = await addDoc(docRef, newEncounter);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }

    setEncounterName("");
  };

  const handleDeleteEncounter = async (id) => {
    const docRef = doc(firestore, "encounters", id);
    try {
      await deleteDoc(docRef);
    } catch (e) {
      console.debug(e);
    }
  };

  const handleNavigateToEncounter = (id) => {
    navigate(`/combat-sim/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, maxWidth: "1200px", margin: "auto" }}>
      <Paper
        elevation={isDarkMode ? 6 : 3}
        sx={{
          p: "14px",
          borderRadius: "8px",
          border: `2px solid ${theme.palette.secondary.main}`,
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Header with Settings Button */}

        <CustomHeaderAlt
          headerText={t("combat_sim_title")}
          icon={<SportsMartialArts fontSize="large" />}
        />

        <div style={{ paddingLeft: 10, paddingRight: 10 }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            {t("combat_sim_new_encounter")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label={t("combat_sim_encounter_name")}
                variant="outlined"
                fullWidth
                value={encounterName}
                onChange={handleEncounterNameChange}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSaveEncounter}
                disabled={!encounterName || encounters.length >= MAX_ENCOUNTERS}
                sx={{ height: "100%" }}
              >
                {t("combat_sim_create_encounter")}
              </Button>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            mt={2}
          >
            <Typography variant="h5" color="text.primary">
              {t("combat_sim_saved_encounters")} ({encounters.length}/
              {MAX_ENCOUNTERS})
            </Typography>
            <Tooltip title={t("Settings")}>
              <IconButton
                color={isDarkMode ? "white" : "primary"}
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </div>
      </Paper>

      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {encounters.map((encounter) => (
          <Grid item xs={12} sm={6} md={4} key={encounter.id}>
            <Card
              sx={{
                backgroundColor: isDarkMode
                  ? "#292929"
                  : theme.palette.background.paper,
                borderRadius: 3,
                boxShadow: isDarkMode ? 6 : 4,
                transition: "0.3s",
                "&:hover": {
                  boxShadow: isDarkMode ? 10 : 8,
                  transform: "scale(1.03)",
                },
                cursor: "pointer",
                color: theme.palette.text.primary,
                position: "relative",
              }}
              onClick={() => handleNavigateToEncounter(encounter.id)}
            >
              <CardContent sx={{ paddingBottom: "10px" }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "text.primary" }}
                >
                  {encounter.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("combat_sim_created")}:{" "}
                  {new Date(encounter.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("combat_sim_last_updated")}:{" "}
                  {new Date(encounter.updatedAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions
                sx={{ justifyContent: "flex-end", padding: "10px 16px" }}
              >
                <Tooltip
                  title={t("Delete")}
                  enterDelay={300}
                  leaveDelay={200}
                  enterNextDelay={300}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEncounter(encounter.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
              <Box
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.palette.text.secondary,
                }}
              >
                <NavigateNext fontSize="medium" />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{ "& .MuiDialog-paper": { borderRadius: 3, padding: 2 } }}
      >
        <DialogTitle
          variant="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "1px solid #ddd",
            pb: 1,
          }}
        >
          {t("combat_sim_settings")}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "left",
            mt: 1,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={autoUseMP}
                onChange={(e) => setAutoUseMP(e.target.checked)}
                sx={{
                  mt: 0,
                  "& .MuiSvgIcon-root": { fontSize: "1.5rem" },
                  "&.Mui-checked": {
                    color: isDarkMode
                      ? "white !important"
                      : "primary !important",
                  },
                }}
              />
            }
            label={t("combat_sim_auto_use_mp")}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={autoOpenLogs}
                onChange={(e) => setAutoOpenLogs(e.target.checked)}
                sx={{
                  mt: 0,
                  "& .MuiSvgIcon-root": { fontSize: "1.5rem" },
                  "&.Mui-checked": {
                    color: isDarkMode
                      ? "white !important"
                      : "primary !important",
                  },
                }}
              />
            }
            label={t("combat_sim_auto_open_logs")}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={() => handleCloseSettings()}
            color={isDarkMode ? "white" : "primary"}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {t("Close")}
          </Button>
          <Button
            onClick={handleSaveSettings}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
