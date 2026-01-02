"use client";

import { googleLogin } from "@/libs/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/utils/configs/firebaseConfig";
import Header from "@/widgets/common/Header";
import Footer from "@/widgets/common/Footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [resetSent, setResetSent] = useState(false);

  const handlePostLogin = async (user: any) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        photoURL: user.photoURL || "",
        profileCompleted: false,
        createdAt: serverTimestamp(),
      });
      router.push("/dashboard/complete-profile");
    } else {
      router.push("/dashboard/profile");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handlePostLogin(result.user);
    } catch (err: any) {
      console.error(err);
      setError(err.code === 'auth/invalid-credential' ? "Invalid email or password" : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await googleLogin();
      if (user) await handlePostLogin(user);
    } catch (err) {
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError("Failed to send reset email. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6 pt-32 pb-20 animate-fade-in-up">
         <div className="w-full max-w-[400px] bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
             
             {/* Header */}
             <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2 text-foreground">
                  {view === 'login' ? 'Welcome back' : 'Reset Password'}
                </h1>
                <p className="text-muted text-sm">
                  {view === 'login' 
                    ? 'Enter your credentials to access your account' 
                    : 'We\'ll send you a link to reset your password'}
                </p>
             </div>

             {error && (
               <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
                 {error}
               </div>
             )}

             {view === 'login' ? (
               <form onSubmit={handleEmailLogin} className="space-y-4">
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
                    <div className="flex justify-between ml-1">
                      <label className="text-xs font-bold text-foreground">Password</label>
                      <button type="button" onClick={() => {setView('forgot'); setError("");}} className="text-[10px] font-bold text-primary hover:underline">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
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
                    Sign In
                  </button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5 dark:border-white/10"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted">Or continue with</span></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-surface-1 border border-transparent hover:border-black/5 text-foreground font-medium rounded-xl py-3.5 transition-all duration-200 hover:bg-surface-2"
                  >
                    <Image src="/google.png" alt="Google" width={20} height={20} className="w-5 h-5" />
                    Google
                  </button>
               </form>
             ) : (
               <div className="space-y-6">
                 {!resetSent ? (
                   <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground ml-1">Email Address</label>
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
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold rounded-xl py-3.5 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Send Reset Link
                      </button>

                      <button 
                        type="button" 
                        onClick={() => {setView('login'); setError("");}} 
                        className="w-full text-sm font-medium text-muted hover:text-foreground transition-colors"
                      >
                        Back to Login
                      </button>
                   </form>
                 ) : (
                   <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                        <Mail className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Check your email</h3>
                      <p className="text-muted text-sm mb-6">We've sent password reset instructions to <span className="text-foreground font-medium">{email}</span></p>
                      
                      <button 
                        onClick={() => {setView('login'); setResetSent(false); setError("");}} 
                        className="w-full bg-surface-1 text-foreground font-bold rounded-xl py-3.5 hover:bg-surface-2 transition-all"
                      >
                        Back to Login
                      </button>
                   </div>
                 )}
               </div>
             )}

             {view === 'login' && (
               <div className="mt-8 text-center text-xs text-muted">
                  Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up for free</Link>
               </div>
             )}
         </div>
      </div>
      
      <Footer />
    </main>
  );
}
