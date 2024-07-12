import React, { useEffect, useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Help,
  Logout,
  Login,
  SwitchAccount,
} from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";

import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  UserCredential,
} from "firebase/auth";
import { auth, googleAuthProvider } from "../../firebase";
import { signInWithPopup } from "@firebase/auth";

import ThemeSwitcher, { ThemeSwitcherProps } from "./ThemeSwitcher";
import LanguageMenu from "./LanguageMenu";
import HelpFeedbackDialog from "./HelpFeedbackDialog"; // Import the dialog component

interface MenuOptionProps extends ThemeSwitcherProps {}

const MenuOption: React.FC<MenuOptionProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility
  const [userEmail, setUserEmail] = useState("");
  const [userUUID, setUserUUID] = useState("");

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

  const handleAuthentication = async (
    authAction: () => Promise<UserCredential | void>,
    successMessage: string,
    errorMessagePrefix: string
  ): Promise<void> => {
    try {
      const userCredential = await authAction();
      if (userCredential) {
        setMessage(successMessage);
        setIsSnackbarOpen(true);
        setIsAuthenticated(true);
      } else {
        setMessage(t("Signed Out", true));
        setIsSnackbarOpen(true);
        setIsAuthenticated(false);
      }
    } catch (error) {
      const errorMessage =
        (error as { message?: string })?.message ||
        t("An error occurred", true);
      setMessage(`${errorMessagePrefix}: ${errorMessage}`);
      setIsSnackbarOpen(true);
    }
  };

  const handleSignOut = async () => {
    await handleAuthentication(
      () => firebaseSignOut(auth),
      t("Signed Out", true),
      t("Sign-out Error", true)
    );
  };

  const signInWithGoogle = async () => {
    googleAuthProvider.setCustomParameters({
      prompt: "select_account",
    });

    await handleAuthentication(
      () => signInWithPopup(auth, googleAuthProvider),
      t("Signed In", true),
      t("Sign-in Error", true)
    );
  };

  const switchGoogleAccount = async () => {
    googleAuthProvider.setCustomParameters({
      prompt: "select_account",
    });

    await handleAuthentication(
      () => signInWithPopup(auth, googleAuthProvider),
      t("Switched Google Account", true),
      t("Account Switch Error", true)
    );
  };

  const handleSwitchAccount = async () => {
    handleClose();
    await switchGoogleAccount();
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
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleSwitchAccount}>
          <ListItemIcon>
            <SwitchAccount />
          </ListItemIcon>
          <ListItemText primary={t("Switch Account")} />
        </MenuItem>

        {isAuthenticated ? (
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary={t("Sign Out")} />
          </MenuItem>
        ) : (
          <MenuItem onClick={signInWithGoogle}>
            <ListItemIcon>
              <Login />
            </ListItemIcon>
            <ListItemText primary={t("Sign In")} />
          </MenuItem>
        )}
        <Divider key="sign-in-out-divider" />

        <ThemeSwitcher
          key="theme-switcher"
          selectedTheme={selectedTheme}
          onSelectTheme={onSelectTheme}
        />
        <Divider key="theme-switcher-divider" />

        <LanguageMenu key="language-menu" />
        <Divider key="language-menu-divider" />

        <MenuItem onClick={handleDialogOpen}> {/* Open the dialog */}
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary={t("Help & Feedback")} />
        </MenuItem>
      </Menu>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isSnackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={message}
      />

      <HelpFeedbackDialog 
        open={isDialogOpen} 
        onClose={handleDialogClose} 
        userEmail={userEmail}
        userUUID={userUUID}
        title={"Help & Feedback"}
        placeholder={t("How can we help you today? Please leave a message in english!")}
        onSuccess={() => console.log("Successfully submitted feedback")}
        webhookUrl={process.env.REACT_APP_DISCORD_FEEDBACK_WEBHOOK_URL || ""}
      /> {/* Render the dialog */}
    </>
  );
};

export default MenuOption;
