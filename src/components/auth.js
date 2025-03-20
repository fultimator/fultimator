import { Button } from "@mui/material";
import { auth, googleAuthProvider } from "../firebase";

import { signInWithPopup } from "@firebase/auth";

export function SignIn() {
  const signInWithGoogle = () => {
    signInWithPopup(auth, googleAuthProvider);
  };

  return (
    <Button variant="contained" onClick={signInWithGoogle}>
      Sign in with Google
    </Button>
  );
}
