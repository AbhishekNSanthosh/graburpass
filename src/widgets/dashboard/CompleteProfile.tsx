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
import { User, Phone, Loader2, ArrowRight, Mail } from "lucide-react";
import Image from "next/image";

export default function CompleteProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        // Allow a small delay for auth to initialize if needed, or redirect
        // For now, assuming auth state is handled by parent or protected route
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      const prefillData = (data: any) => {
          let fName = data.firstName || "";
          let lName = data.lastName || "";
          
          if (!fName && data.name) {
              const nameParts = data.name.trim().split(" ");
              fName = nameParts[0];
              if (nameParts.length > 1) {
                  lName = nameParts.slice(1).join(" ");
              }
          }
          setFirstName(fName);
          setLastName(lName);
          setPhone(data.phone || "");
      };

      // Try fetching document by UID
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        prefillData(snap.data());
      } else if (user.email) {
        // Fallback: fetch by email
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          prefillData(querySnapshot.docs[0].data());
        } else {
            // No profile doc yet, but we might have display name from Auth
            if (user.displayName) {
                const nameParts = user.displayName.trim().split(" ");
                setFirstName(nameParts[0]);
                if (nameParts.length > 1) {
                    setLastName(nameParts.slice(1).join(" "));
                }
            }
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

    setSaving(true);

    const saveProfile = async () => {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim(), // Keep composite name in sync
          email,
          phone,
          profileCompleted: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    };

    try {
      await saveProfile();
      toast.success("Profile updated successfully 🎉");
      router.push("/dashboard/profile");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to save profile ❌");
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
       {/* Background decorations matching Login/Signup */}
       <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-[500px] bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
            Complete your profile
            </h1>
            <p className="text-muted text-sm">Please provide your details to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground ml-1">First Name</label>
                <div className="relative group">
                <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-surface-1 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl py-3 px-4 outline-none transition-all placeholder:text-muted/50 text-sm font-medium"
                />
                </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground ml-1">Last Name</label>
                <div className="relative group">
                <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-surface-1 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl py-3 px-4 outline-none transition-all placeholder:text-muted/50 text-sm font-medium"
                />
                </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground ml-1">Email Address</label>
            <div className="relative group opacity-60">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-muted" />
                <input
                type="email"
                value={email}
                disabled
                className="w-full bg-surface-1 border border-transparent rounded-xl py-3 pl-11 pr-4 outline-none text-sm font-medium text-muted cursor-not-allowed"
                />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground ml-1">Phone Number</label>
            <div className="relative group">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-surface-1 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-muted/50 text-sm font-medium"
                />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full mt-4 bg-primary text-white font-bold rounded-xl py-3.5 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save & Continue <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
