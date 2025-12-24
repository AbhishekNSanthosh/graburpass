import { auth } from "@/utils/configs/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const provider = new GoogleAuthProvider();

export const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google login error", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
