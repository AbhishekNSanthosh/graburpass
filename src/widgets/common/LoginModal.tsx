"use client";

import { googleLogin } from "@/libs/auth";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();

  if (!open) return null;

  const handleGoogleLogin = async () => {
    try {
      const user = await googleLogin();
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 🆕 New user
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "",
          photoURL: user.photoURL || "",
          profileCompleted: false,
          createdAt: serverTimestamp(),
        });

        onClose();
        router.push("/dashboard/complete-profile");
      }
      // 👤 Existing user
      else {
        onClose();
        router.push("/dashboard/profile");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Google login failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-[90%] max-w-md p-6 shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-2xl font-semibold mb-2">
          Welcome back 👋
        </h2>
        <p className="text-gray-500 mb-6">
          Sign in to continue to GraburPass
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border rounded-lg py-3 hover:bg-gray-50 transition"
        >
          <img src="/google.svg" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
