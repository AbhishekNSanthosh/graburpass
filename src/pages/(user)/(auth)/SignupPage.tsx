"use client";

import { googleLogin } from "@/libs/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/utils/configs/firebaseConfig";
import Header from "@/widgets/common/Header";
import Footer from "@/widgets/common/Footer";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Eye, EyeOff, Lock, Mail, User, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePostSignup = async (user: any, displayName: string = "") => {
    const userRef = doc(db, "users", user.uid);
    // For signup, we assume new user, but check just in case
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: displayName || user.displayName || name || "User",
        photoURL: user.photoURL || "",
        profileCompleted: false,
        createdAt: serverTimestamp(),
      });
      router.push("/dashboard/complete-profile");
    } else {
      router.push("/dashboard/profile");
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name immediately
      await updateProfile(result.user, { displayName: name });
      await handlePostSignup(result.user, name);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
          setError("This email is already registered. Please login.");
      } else {
          setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await googleLogin();
      if (user) await handlePostSignup(user);
    } catch (err) {
      setError("Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <Header />
      
      {/* Signup Content */}
      <div className="flex-1 flex items-center justify-center p-6 pt-32 pb-20 animate-fade-in-up">
         <div className="w-full max-w-[400px] bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
             
             {/* Header */}
             <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2 text-foreground">Create your account</h1>
                <p className="text-muted text-sm">Get started with Graburpass for free</p>
             </div>

             {error && (
               <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
                 {error}
               </div>
             )}

             <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-surface-1 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-muted/50 text-sm font-medium"
                        required
                      />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-surface-1 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-muted/50 text-sm font-medium"
                        required
                      />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-surface-1 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl py-3 pl-11 pr-10 outline-none transition-all placeholder:text-muted/50 text-sm font-medium"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-muted hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-foreground text-background font-bold rounded-xl py-3.5 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Account
                </button>
             </form>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5 dark:border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted">Or continue with</span></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-surface-1 border border-transparent hover:border-black/5 text-foreground font-medium rounded-xl py-3.5 transition-all duration-200 hover:bg-surface-2"
            >
              <Image src="/google.png" alt="Google" width={20} height={20} className="w-5 h-5" />
              Google
            </button>
            
            <div className="mt-8 text-center text-xs text-muted">
               Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
            </div>
         </div>
      </div>
      
      <Footer />
    </main>
  );
}
