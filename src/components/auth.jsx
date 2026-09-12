import { Button } from "@mui/material";
import { auth, googleAuthProvider, signInWithPopup } from "@platform/db";
import { IS_CAPACITOR } from "../platform";

export function SignIn() {
  const signInWithGoogle = async () => {
    if (IS_CAPACITOR) {
      // Web OAuth popup/redirect does not work in the Capacitor WebView; use the
      // native Google sign-in plugin instead.
      const { signInWithGoogleNative } = await import("../nativeAuth");
      await signInWithGoogleNative();
      return;
    }
    signInWithPopup(auth, googleAuthProvider);
  };

  return (
    <Button variant="contained" onClick={signInWithGoogle}>
      Sign in with Google
    </Button>
  );
}
