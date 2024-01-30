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
  AccountCircle,
  Help,
  Logout,
  Login,
  SwitchAccount,
} from "@mui/icons-material";

import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, UserCredential } from "firebase/auth";
import { auth, googleAuthProvider } from "../../firebase";
import { signInWithPopup } from "@firebase/auth";

import ThemeSwitcher, { ThemeSwitcherProps } from "./ThemeSwitcher";
import LanguageMenu, { LanguageMenuProps } from "./LanguageMenu";

interface MenuOptionProps extends ThemeSwitcherProps, LanguageMenuProps {}

const MenuOption: React.FC<MenuOptionProps> = ({
  selectedTheme,
  onSelectTheme,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        setMessage("Signed Out");
        setIsSnackbarOpen(true);
        setIsAuthenticated(false);
      }
    } catch (error) {
      const errorMessage = (error as { message?: string })?.message || 'An error occurred';
      setMessage(`${errorMessagePrefix}: ${errorMessage}`);
      setIsSnackbarOpen(true);
    }
  };

  const handleSignOut = async () => {
    await handleAuthentication(() => firebaseSignOut(auth), "Signed Out", "Sign-out Error");
  };

  const signInWithGoogle = async () => {
    googleAuthProvider.setCustomParameters({
      prompt: 'select_account'
    });

    await handleAuthentication(
      () => signInWithPopup(auth, googleAuthProvider),
      "Signed In",
      "Sign-in Error"
    );
  };

  const switchGoogleAccount = async () => {
    googleAuthProvider.setCustomParameters({
      prompt: 'select_account'
    });

    await handleAuthentication(
      () => signInWithPopup(auth, googleAuthProvider),
      "Switched Google Account",
      "Account Switch Error"
    );
  };

  const handleSwitchAccount = async () => {
    handleClose();
    await switchGoogleAccount();
  };

  return (
    <>
      <IconButton size="medium" color="inherit" onClick={handleClick}>
        <MenuIcon sx={{ width: "32px", height: "32px" }} />
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
        {/* User Info */}
        {[(
          <MenuItem key="user-info">
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText primary="Username" />
          </MenuItem>
        ), <Divider key="user-info-divider" />]}

        {/* Switch Account */}
        <MenuItem onClick={handleSwitchAccount}>
          <ListItemIcon>
            <SwitchAccount />
          </ListItemIcon>
          <ListItemText primary="Switch Account" />
        </MenuItem>

        {/* Sign Out/Sign In */}
        {isAuthenticated ? (
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </MenuItem>
        ) : (
          <MenuItem onClick={signInWithGoogle}>
            <ListItemIcon>
              <Login />
            </ListItemIcon>
            <ListItemText primary="Sign In" />
          </MenuItem>
        )}
        <Divider key="sign-in-out-divider" />

        {/* ThemeSwitcher */}
        {[
          <ThemeSwitcher
            key="theme-switcher"
            selectedTheme={selectedTheme}
            onSelectTheme={onSelectTheme}
          />,
          <Divider key="theme-switcher-divider" />
        ]}

        {/* LanguageMenu */}
        {[
          <LanguageMenu
            key="language-menu"
            selectedLanguage={selectedLanguage}
            onSelectLanguage={onSelectLanguage}
          />,
          <Divider key="language-menu-divider" />
        ]}

        {/* Help & Feedback */}
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary="Help & Feedback" />
        </MenuItem>
      </Menu>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isSnackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={message}
      />
    </>
  );
};

export default MenuOption;
