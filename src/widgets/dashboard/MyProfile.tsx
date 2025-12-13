"use client";

import React, { useState } from "react";
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

export default function MyProfile() {
  const [profile, setProfile] = useState({
    name: "Abhishek",
    email: "abhishek@example.com",
    phone: "+91 98765 43210",
    photo: null as string | null,
    isOrganizerVerified: false,
    emailNotifications: true,
    whatsappAlerts: false,
    smsAlerts: true,
  });

  const updateField = (key: string, value: string | boolean) =>
    setProfile((p) => ({ ...p, [key]: value }));

  return (
    <div className=" px-6 py-4 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your personal details and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={profile.photo || "/default-avatar.png"}
              className="h-24 w-24 rounded-full object-cover border"
            />
            <label className="absolute bottom-1 right-1 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-black">
              <Camera className="h-4 w-4" />
              <input type="file" hidden />
            </label>
          </div>

          <div className="flex-1 space-y-4">
            <EditableField
              label="Name"
              value={profile.name}
              onSave={(v) => updateField("name", v)}
              icon={<User className="h-4 w-4" />}
            />
            <EditableField
              label="Email"
              value={profile.email}
              onSave={(v) => updateField("email", v)}
              icon={<Mail className="h-4 w-4" />}
            />
            <EditableField
              label="Phone"
              value={profile.phone}
              onSave={(v) => updateField("phone", v)}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card title="Preferences" icon={<Bell className="h-5 w-5" />}>
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
      </Card>

      {/* Organizer Status */}
      <Card title="Organizer Status" icon={<Shield className="h-5 w-5" />}>
        {profile.isOrganizerVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Organizer Verified
          </div>
        ) : (
          <button
            onClick={() => updateField("isOrganizerVerified", true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Apply as Organizer
          </button>
        )}
      </Card>

      {/* Security */}
      <Card title="Security" icon={<Lock className="h-5 w-5" />}>
        <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
          Change Password
        </button>
      </Card>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h3 className="text-red-700 font-semibold mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <DangerButton icon={<LogOut />} label="Logout" />
          <DangerButton icon={<Trash2 />} label="Delete Account" solid />
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

function Card({
  title,
  icon,
  children,
}: {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      {title && (
        <h3 className="flex items-center gap-2 font-medium text-gray-800">
          {icon}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function EditableField({
  label,
  value,
  onSave,
  icon,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  icon: React.ReactNode;
}) {
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
            className="text-sm text-green-600"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span>{value}</span>
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-gray-500 hover:text-black"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm">
        {icon} {label}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

function DangerButton({
  label,
  icon,
  solid = false,
}: {
  label: string;
  icon: React.ReactNode;
  solid?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center justify-center gap-2 py-2 rounded-md ${
        solid
          ? "bg-red-600 text-white hover:bg-red-700"
          : "border border-red-300 text-red-700 hover:bg-red-100"
      }`}
    >
      {icon} {label}
    </button>
  );
}
