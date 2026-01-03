"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  Bell,
  MessageCircle,
  CheckCircle2,
  Shield,
  LogOut,
  Trash2,
  LayoutDashboard,
  User as UserIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  ShieldAlert,
} from "lucide-react";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/utils/configs/firebaseConfig";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MyProfile() {
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [showDanger, setShowDanger] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
    isOrganizerVerified: false,
    emailNotifications: true,
    whatsappAlerts: false,
    smsAlerts: true,
  });

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setProfile(snap.data() as any);
      } else {
        const newProfile = {
          name: user.displayName || "",
          email: user.email!,
          phone: "",
          photoURL: user.photoURL || "",
          isOrganizerVerified: false,
          emailNotifications: true,
          whatsappAlerts: false,
          smsAlerts: true,
        };
        await setDoc(doc(db, "users", user.uid), newProfile);
        setProfile(newProfile);
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  /* ================= UPDATE FIELD ================= */

  const updateField = async (key: string, value: any) => {
    if (!user) return;
    setProfile((p) => ({ ...p, [key]: value }));
    await updateDoc(doc(db, "users", user.uid), { [key]: value });
    toast.success("Profile updated");
  };

  /* ================= PHOTO UPLOAD ================= */

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;

    const storage = getStorage();
    const photoRef = ref(storage, `avatars/${user.uid}`);

    await uploadBytes(photoRef, file);
    const url = await getDownloadURL(photoRef);

    await updateField("photoURL", url);
  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  /* ================= DELETE ACCOUNT ================= */

  const handleDeleteAccount = async () => {
    if (!user) return;

    const ok = confirm("This will permanently delete your account. Continue?");
    if (!ok) return;

    await deleteUser(user);
    await updateDoc(doc(db, "users", user.uid), {});
    router.replace("/");
  };

  if (loading)
    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-gray-500 font-medium">
            Manage your personal details and account settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100 flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
                <Image
                  src={profile.photoURL || "/default-avatar.png"}
                  alt="Profile photo"
                  fill
                  className="object-cover"
                />
              </div>
              <label className="absolute bottom-1 right-1 bg-gray-900 text-white p-2.5 rounded-full cursor-pointer hover:bg-black transition-colors shadow-lg hover:scale-110 active:scale-95 duration-200">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handlePhotoUpload(e.target.files[0])
                  }
                />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile.name || "User"}
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                {profile.email}
              </p>
            </div>
            <div className="w-full pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-gray-50">
                <span className="block text-xs uppercase font-bold text-gray-400">
                  Status
                </span>
                <span className="block text-sm font-bold text-primary">
                  {profile.isOrganizerVerified ? "Organizer" : "Attendee"}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <span className="block text-xs uppercase font-bold text-gray-400">
                  Verified
                </span>
                <span className="block text-sm font-bold text-green-600">
                  Yes
                </span>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">Security</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Password and authentication methods are managed securely via
              Google Firebase.
            </p>
            <button
              disabled
              className="w-full py-2.5 rounded-lg bg-gray-50 text-gray-400 font-bold text-sm cursor-not-allowed"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-lg p-8 border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2 bg-red-50 rounded-lg text-primary">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  Personal Information
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Update your personal details here.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <EditableField
                label="Full Name"
                value={profile.name}
                onSave={(v: any) => updateField("name", v)}
                icon={<UserIcon className="h-4 w-4" />}
              />
              <ReadOnlyField
                label="Email Address"
                value={profile.email}
                icon={<MailIcon className="h-4 w-4" />}
              />
              <EditableField
                label="Phone Number"
                value={profile.phone}
                onSave={(v: any) => updateField("phone", v)}
                icon={<PhoneIcon className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Organizer Section */}
          <div className="bg-white rounded-lg p-8 border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  Organizer Account
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Manage your event creator status.
                </p>
              </div>
            </div>

            {profile.isOrganizerVerified ? (
              <div className="bg-green-50 rounded-2xl p-6 flex items-center gap-4 text-green-800">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Verified Organization</p>
                  <p className="text-sm opacity-80">
                    You can create and manage events.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">Become an Organizer</p>
                  <p className="text-sm text-gray-500">
                    Unlock features to host your own events.
                  </p>
                </div>
                <button
                  onClick={() => updateField("isOrganizerVerified", true)}
                  className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div>
            <div
              className={`p-1 rounded-lg border transition-all duration-300 ${
                showDanger
                  ? "border-red-200 bg-red-50"
                  : "border-red-100 bg-red-50/30"
              }`}
            >
              <button
                onClick={() => setShowDanger(!showDanger)}
                className="w-full flex items-center justify-between px-4 py-3 text-red-900 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Account Actions
                </span>
                <span className="text-xs uppercase tracking-wider opacity-60">
                  {showDanger ? "Collapse" : "Expand"}
                </span>
              </button>

              {/* Simplified Danger Zone for cleaner UI */}
              {showDanger && (
                <div className="grid grid-cols-2 gap-4 p-4 animate-fade-in-up">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white border border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

/* ---------- Modern Components ---------- */

function EditableField({ label, value, onSave, icon }: any) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div className="group bg-gray-50/50 hover:bg-gray-50 rounded-lg p-4 border border-transparent hover:border-gray-100 transition-all">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
        {icon} {label}
      </label>
      {editing ? (
        <div className="flex gap-3">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            autoFocus
          />
          <button
            onClick={() => {
              onSave(val);
              setEditing(false);
            }}
            className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
          >
            Save
          </button>
          <button
            onClick={() => {
              setVal(value);
              setEditing(false);
            }}
            className="bg-white text-gray-500 text-sm font-bold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-gray-800">
            {value || <span className="text-gray-400 italic">Not set</span>}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value, icon }: any) {
  return (
    <div className="bg-gray-50/50 rounded-lg p-4 cursor-default">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2 opacity-70">
        {icon} {label}
      </label>
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-gray-600">{value}</span>
        <Lock className="w-3.5 h-3.5 text-gray-300" />
      </div>
    </div>
  );
}
