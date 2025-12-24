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
  const router = useRouter()

  const [loading, setLoading] = useState(true);
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
    router.replace('/')
  };

  /* ================= DELETE ACCOUNT ================= */

  const handleDeleteAccount = async () => {
    if (!user) return;

    const ok = confirm("This will permanently delete your account. Continue?");
    if (!ok) return;

    await deleteUser(user);
    await updateDoc(doc(db, "users", user.uid), {});
    router.replace('/')
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="px-6 py-4 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your personal details and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              src={profile.photoURL || "/default-avatar.png"}
              alt="Profile photo"
              width={96}
              height={96}
              className="rounded-full object-cover border"
            />
            <label className="absolute bottom-1 right-1 bg-gray-900 text-white p-2 rounded-full cursor-pointer">
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

          <div className="flex-1 space-y-4">
            <EditableField
              label="Name"
              value={profile.name}
              onSave={(v: any) => updateField("name", v)}
              icon={<User className="h-4 w-4" />}
            />

            <ReadOnlyField
              label="Email"
              value={profile.email}
              icon={<Mail className="h-4 w-4" />}
            />

            <EditableField
              label="Phone"
              value={profile.phone}
              onSave={(v: any) => updateField("phone", v)}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      {/* <Card title="Preferences" icon={<Bell className="h-5 w-5" />}>
        <Toggle
          label="Email Notifications"
          icon={<Mail className="h-4 w-4" />}
          checked={profile.emailNotifications}
          onChange={() =>
            updateField("emailNotifications", !profile.emailNotifications)
          }
        />
        <Toggle
          label="WhatsApp Alerts"
          icon={<MessageCircle className="h-4 w-4" />}
          checked={profile.whatsappAlerts}
          onChange={() =>
            updateField("whatsappAlerts", !profile.whatsappAlerts)
          }
        />
        <Toggle
          label="SMS Alerts"
          icon={<Phone className="h-4 w-4" />}
          checked={profile.smsAlerts}
          onChange={() => updateField("smsAlerts", !profile.smsAlerts)}
        />
      </Card> */}

      {/* Organizer */}
      <Card title="Organizer Status" icon={<Shield className="h-5 w-5" />}>
        {profile.isOrganizerVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 /> Organizer Verified
          </div>
        ) : (
          <button
            onClick={() => updateField("isOrganizerVerified", true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Apply as Organizer
          </button>
        )}
      </Card>

      {/* Security */}
      <Card title="Security" icon={<Lock className="h-5 w-5" />}>
        <p className="text-sm text-gray-500">
          Password changes are managed by Firebase Authentication.
        </p>
      </Card>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h3 className="text-red-700 font-semibold mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <DangerButton
            icon={<LogOut />}
            label="Logout"
            onClick={handleLogout}
          />
          <DangerButton
            icon={<Trash2 />}
            label="Delete Account"
            solid
            onClick={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function Card({ title, icon, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {title && (
        <h3 className="flex items-center gap-2 font-medium">
          {icon} {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function EditableField({ label, value, onSave, icon }: any) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div>
      <label className="text-xs text-gray-500 flex items-center gap-1">
        {icon} {label}
      </label>
      {editing ? (
        <div className="flex gap-2">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="border rounded px-3 py-1 flex-1"
          />
          <button
            onClick={() => {
              onSave(val);
              setEditing(false);
            }}
            className="text-green-600 text-sm"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex justify-between">
          <span>{value || "—"}</span>
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-gray-500"
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
    <div>
      <label className="text-xs text-gray-500 flex items-center gap-1">
        {icon} {label}
      </label>
      <span>{value}</span>
    </div>
  );
}

function Toggle({ label, icon, checked, onChange }: any) {
  return (
    <label className="flex justify-between items-center">
      <span className="flex gap-2 text-sm">
        {icon} {label}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

function DangerButton({ label, icon, solid, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-2 rounded-md ${
        solid ? "bg-red-600 text-white" : "border border-red-300 text-red-700"
      }`}
    >
      {icon} {label}
    </button>
  );
}
