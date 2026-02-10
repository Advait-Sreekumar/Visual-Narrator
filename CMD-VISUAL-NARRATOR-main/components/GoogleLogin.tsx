import React from "react";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup } from "firebase/auth";
import { api } from "../services/api";
import { User } from "../types";

const GoogleLogin: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        const idToken = await user.getIdToken();
        const userProfile = await api.loginWithGoogle(idToken);
        onLogin(userProfile);
      }
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="py-3 px-6 bg-blue-500 text-white rounded-lg font-bold"
    >
      Sign in with Google
    </button>
  );
};

export default GoogleLogin;
