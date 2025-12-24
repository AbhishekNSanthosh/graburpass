"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/utils/configs/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CompleteProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      // Try fetching document by UID
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhone(data.phone || "");
      } else if (user.email) {
        // Fallback: fetch by email
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setPhone(data.phone || "");
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    const saveProfile = async () => {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          firstName,
          lastName,
          email,
          phone,
          profileCompleted: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    };

    try {
      await toast.promise(saveProfile(), {
        loading: "Saving your profile...",
        success: "Profile updated successfully 🎉",
        error: "Failed to save profile ❌",
      });

      router.push("/dashboard/profile");
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Complete your profile
        </h1>
        <p className="text-gray-500 mb-6">Tell us a little more about you</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 rounded-lg bg-primary py-3 text-white font-medium hover:bg-primary/90 transition"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
