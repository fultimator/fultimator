import { Button } from "@mui/material";
import { auth, googleAuthProvider, signInWithPopup } from "@platform/db";

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
