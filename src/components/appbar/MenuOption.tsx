import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Help,
  Logout,
  Login,
  SwitchAccount,
  Info,
} from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";
import { IS_ELECTRON, SUPPORTS_LOCAL_DB } from "../../platform";
// Local DB export / import
import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
  auth,
  googleAuthProvider,
  syncToDrive,
  restoreFromDrive,
} from "@platform/db";
import type { UserCredential } from "@platform/db";
import { GoogleAuthProvider } from "firebase/auth";
import { storeAccessToken } from "@platform/db";
import { exportDatabase, importDatabase } from "../../utility/dbExportImport";
// Drive sync
import DarkModeToggle, { DarkModeToggleProps } from "./DarkModeToggle";
import ThemeSwitcher, { ThemeSwitcherProps } from "./ThemeSwitcher";
import LanguageMenu from "./LanguageMenu";
import HelpFeedbackDialog from "./HelpFeedbackDialog";
import DataSyncMenu from "./DataSyncMenu";

declare const __APP_VERSION__: string;

interface MenuOptionProps extends ThemeSwitcherProps, DarkModeToggleProps {}

const MenuOption: React.FC<MenuOptionProps> = ({
  selectedTheme,
  onSelectTheme,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportWarningOpen, setIsImportWarningOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [electronVersion, setElectronVersion] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userUUID, setUserUUID] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email || "");
        setUserUUID(user.uid);
      } else {
        setIsAuthenticated(false);
        setUserEmail("");
        setUserUUID("");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (IS_ELECTRON && window.electron) {
      window.electron.getVersion().then(setElectronVersion);
    }
  }, []);

  const displayVersion = IS_ELECTRON ? electronVersion : __APP_VERSION__;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
    handleClose();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  const notify = (msg: string) => {
    setMessage(msg);
    setIsSnackbarOpen(true);
  };

  // Auth

  const handleAuthentication = async (
    authAction: () => Promise<UserCredential | void>,
    successMessage: string,
    errorMessagePrefix: string,
  ): Promise<void> => {
    try {
      await authAction();
      notify(successMessage);
    } catch (error) {
      const errorMessage =
        (error as { message?: string })?.message ||
        t("An error occurred", true);
      notify(`${errorMessagePrefix}: ${errorMessage}`);
    }
  };

  const handleSignOut = async () => {
    await handleAuthentication(
      () => firebaseSignOut(auth),
      t("Signed Out", true),
      t("Sign-out Error", true),
    );
  };

  const signInWithGoogle = async () => {
    googleAuthProvider.setCustomParameters({ prompt: "select_account" });
    await handleAuthentication(
      async () => {
        const result = await signInWithPopup(auth, googleAuthProvider);
        if (!IS_ELECTRON) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) storeAccessToken(credential.accessToken);
        }
        return result;
      },
      t("Signed In", true),
      t("Sign-in Error", true),
    );
  };

  const switchGoogleAccount = async () => {
    googleAuthProvider.setCustomParameters({ prompt: "select_account" });
    await handleAuthentication(
      async () => {
        const result = await signInWithPopup(auth, googleAuthProvider);
        if (!IS_ELECTRON) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) storeAccessToken(credential.accessToken);
        }
        return result;
      },
      t("Switched Google Account", true),
      t("Account Switch Error", true),
    );
  };

  const handleSwitchAccount = async () => {
    handleClose();
    await switchGoogleAccount();
  };

  // Local DB export / import
  const handleLocalExport = async () => {
    setIsLoading(true);
    try {
      await exportDatabase();
      notify(t("Database exported successfully", true));
    } catch {
      notify(t("Failed to export database", true));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportClick = () => {
    setIsImportWarningOpen(true);
  };

  const handleImportConfirm = () => {
    setIsImportWarningOpen(false);
    fileInputRef.current?.click();
  };

  const handleImportCancel = () => {
    setIsImportWarningOpen(false);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      await importDatabase(file);
      notify(t("Database imported successfully", true));
    } catch {
      notify(t("Failed to import database", true));
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  // Drive sync
  const handleDriveExport = async () => {
    setIsLoading(true);
    try {
      await syncToDrive();
      notify(t("Exported to Google Drive", true));
    } catch (error) {
      notify((error as Error).message || t("Drive export failed", true));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriveImport = async () => {
    setIsLoading(true);
    try {
      await restoreFromDrive();
      notify(t("Restored from Google Drive", true));
    } catch (error) {
      notify((error as Error).message || t("Drive import failed", true));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <IconButton size="medium" color="inherit" onClick={handleClick}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* Account */}
        {isAuthenticated ? (
          <>
            <MenuItem onClick={handleSwitchAccount}>
              <ListItemIcon>
                <SwitchAccount />
              </ListItemIcon>
              <ListItemText primary={t("Switch Account")} />
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary={t("Sign Out")} />
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={signInWithGoogle}>
            <ListItemIcon>
              <Login />
            </ListItemIcon>
            <ListItemText primary={t("Sign In")} />
          </MenuItem>
        )}

        <Divider />

        <MenuItem>
          <DarkModeToggle
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        </MenuItem>

        <ThemeSwitcher
          selectedTheme={selectedTheme}
          onSelectTheme={onSelectTheme}
        />
        <Divider />

        <LanguageMenu />
        <Divider />

        <DataSyncMenu
          supportsLocalDb={SUPPORTS_LOCAL_DB}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          onLocalExport={handleLocalExport}
          onLocalImport={handleImportClick}
          onDriveExport={handleDriveExport}
          onDriveImport={handleDriveImport}
        />

        <Divider />

        <MenuItem onClick={handleDialogOpen}>
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary={t("Help & Feedback")} />
        </MenuItem>

        {/* App version */}
        {displayVersion && [
          <Divider key="version-divider" />,
          <MenuItem key="version" disabled>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText
              primary={`${t("Version")} ${displayVersion}${IS_ELECTRON ? "" : " (web)"}`}
            />
          </MenuItem>,
        ]}
      </Menu>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={message}
      />

      <HelpFeedbackDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        userEmail={userEmail}
        userUUID={userUUID}
        title={"Help & Feedback"}
        placeholder={t(
          "How can we help you today? Please leave a message in english!",
        )}
        onSuccess={() => console.log("Successfully submitted feedback")}
        webhookUrl={import.meta.env.VITE_DISCORD_FEEDBACK_WEBHOOK_URL || ""}
      />

      {/* Import confirmation dialog */}
      <Dialog open={isImportWarningOpen} onClose={handleImportCancel}>
        <DialogTitle>{t("Confirm Import")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "Are you sure you want to import? This will replace your current local database.",
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleImportCancel}
            color="secondary"
            variant="contained"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleImportConfirm}
            color="error"
            variant="contained"
          >
            {t("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MenuOption;
