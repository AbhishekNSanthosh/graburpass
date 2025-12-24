"use client";
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Ticket,
  Image,
  Save,
  Eye,
  Check,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/utils/configs/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
}

type TicketTypeInput = {
  name: string;
  price: number | "";
  quantity: number | "";
};

interface RegistrationField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[];
}

interface EventFormData {
  name: string;
  category: string;
  description: string;
  date: string;
  time: string;
  locationType: "online" | "offline";
  venueAddress: string;
  onlineLink: string;
  isPaid: boolean;
  platformFeePayer: "organizer" | "buyer";
  ticketTypes: TicketTypeInput[]; // ✅ INPUT TYPE
  registrationFields: RegistrationField[];
  poster: File | null;
  posterPreview: string | null;
}

export default function NewEvent() {
  const [step, setStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    category: "",
    description: "",
    date: "",
    time: "",
    locationType: "offline",
    venueAddress: "",
    onlineLink: "",
    isPaid: false,
    platformFeePayer: "buyer",
    ticketTypes: [{ name: "General", price: "", quantity: "" }],
    registrationFields: [
      { id: "firstName", label: "First Name", type: "text", required: true },
      { id: "lastName", label: "Last Name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
      { id: "phone", label: "Phone Number", type: "tel", required: true },
    ],
    poster: null,
    posterPreview: null,
  });

  const auth = getAuth();
  const user = auth.currentUser;

  console.log(formData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const categories = [
    "Conference",
    "Workshop",
    "Meetup",
    "Concert",
    "Seminar",
    "Other",
  ];

  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addTicketType = () => {
    updateFormData({
      ticketTypes: [
        ...formData.ticketTypes,
        { name: "New Ticket", price: "", quantity: "" },
      ],
    });
  };

  const removeTicketType = (index: number) => {
    if (formData.ticketTypes.length > 1) {
      updateFormData({
        ticketTypes: formData.ticketTypes.filter((_, i) => i !== index),
      });
    }
  };

  const updateTicketType = (
    index: number,
    updates: Partial<TicketTypeInput>
  ) => {
    const newTypes = [...formData.ticketTypes];
    newTypes[index] = { ...newTypes[index], ...updates };
    updateFormData({ ticketTypes: newTypes });
  };

  const addRegistrationField = () => {
    updateFormData({
      registrationFields: [
        ...formData.registrationFields,
        {
          id: `custom_${Date.now()}`,
          label: "",
          type: "text",
          required: false,
        },
      ],
    });
  };

  const removeRegistrationField = (index: number) => {
    updateFormData({
      registrationFields: formData.registrationFields.filter(
        (_, i) => i !== index
      ),
    });
  };

  const updateRegistrationField = (
    index: number,
    updates: Partial<RegistrationField>
  ) => {
    const newFields = [...formData.registrationFields];
    newFields[index] = { ...newFields[index], ...updates };
    updateFormData({ registrationFields: newFields });
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      updateFormData({ poster: file, posterPreview: preview });
    }
  };

  const SaveAsDraft = async () => {
    setIsSubmitting(true);

    const savePromise = async () => {
      let docRef;

      if (draftId) {
        // 🔁 Update existing draft
        docRef = doc(db, "event_drafts", draftId);
        await updateDoc(docRef, {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          locationType: formData.locationType,
          venueAddress: formData.venueAddress,
          onlineLink: formData.onlineLink,
          isPaid: formData.isPaid,
          platformFeePayer: formData.platformFeePayer,
          ticketTypes: formData.ticketTypes,
          registrationFields: formData.registrationFields,
          creatorEmail: user?.email,
          updatedAt: serverTimestamp(),
        });
      } else {
        // 🆕 Create new draft
        docRef = await addDoc(collection(db, "event_drafts"), {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          locationType: formData.locationType,
          venueAddress: formData.venueAddress,
          onlineLink: formData.onlineLink,
          isPaid: formData.isPaid,
          platformFeePayer: formData.platformFeePayer,
          ticketTypes: formData.ticketTypes,
          registrationFields: formData.registrationFields,
          posterUrl: null,
          creatorEmail: user?.email,
          status: "draft",
          createdAt: serverTimestamp(),
        });

        setDraftId(docRef.id); // ⭐ persist ID
      }

      // 🖼 Upload poster to Storage
      if (formData.poster) {
        const id = draftId ?? docRef.id;

        const posterRef = ref(
          storage,
          `event-posters/${id}/${formData.poster.name}`
        );

        await uploadBytes(posterRef, formData.poster);
        const posterUrl = await getDownloadURL(posterRef);

        await updateDoc(doc(db, "event_drafts", id), {
          posterUrl,
        });
      }
    };

    try {
      await toast.promise(savePromise(), {
        loading: "Saving draft...",
        success: "Draft saved successfully 💾",
        error: "Failed to save draft ❌",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const submitPromise = async () => {
      let docRef;

      // ✅ Extract only Firestore-safe fields
      const eventData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        locationType: formData.locationType,
        venueAddress: formData.venueAddress,
        onlineLink: formData.onlineLink,
        isPaid: formData.isPaid,
        platformFeePayer: formData.platformFeePayer,
        ticketTypes: formData.ticketTypes,
        creatorEmail: user?.email,
        registrationFields: formData.registrationFields,
        status: "published",
      };

      if (publishedId) {
        // 🔁 Update existing published event
        docRef = doc(db, "published_events", publishedId);
        await updateDoc(docRef, {
          ...eventData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // 🆕 Create new published event
        docRef = await addDoc(collection(db, "published_events"), {
          ...eventData,
          posterUrl: null,
          createdAt: serverTimestamp(),
        });

        setPublishedId(docRef.id);
      }

      // 🖼 Upload poster (Storage only)
      if (formData.poster) {
        const posterRef = ref(
          storage,
          `event-posters/${docRef.id}/${formData.poster.name}`
        );

        await uploadBytes(posterRef, formData.poster);
        const posterUrl = await getDownloadURL(posterRef);

        await updateDoc(doc(db, "published_events", docRef.id), {
          posterUrl,
        });
      }

      // 🧹 Delete draft after successful publish
      if (draftId) {
        await deleteDoc(doc(db, "event_drafts", draftId));
        setDraftId(null);
      }
    };

    router.prefetch("/dashboard/organizer/manage-events");
    try {
      await toast.promise(submitPromise(), {
        loading: "Publishing event...",
        success: "Event published successfully 🎉",
        error: "Failed to publish event ❌",
      });
      router.push("/dashboard/organizer/manage-events");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: Calendar },
    { id: 2, title: "Date & Time", icon: Clock },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Ticket Setup", icon: Ticket },
    { id: 5, title: "Registration Form", icon: User },
    { id: 6, title: "Media", icon: Image },
    { id: 7, title: "Publish", icon: Check },
  ];

  const isValidStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.category && formData.description;
      case 2:
        return formData.date && formData.time;
      case 3:
        return formData.locationType === "offline"
          ? formData.venueAddress
          : formData.onlineLink;
      case 4:
        return formData.ticketTypes.every(
          (t) => t.name && Number(t.quantity) > 0
        );
      case 5:
        return true; // Registration fields are customizable, always valid
      case 6:
        return true; // Media optional
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
        </div>

        {/* Stepper */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  step === s.id
                    ? "bg-red-600 text-white"
                    : step > s.id
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                }`}
              >
                <s.icon className="h-4 w-4" />
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-red-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., React Conf 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      updateFormData({ category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData({ description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Tell us about your event..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-red-600" />
                Date & Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    min="2025-12-13"
                    onChange={(e) => updateFormData({ date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => updateFormData({ time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-red-600" />
                Location
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => updateFormData({ locationType: "offline" })}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                    formData.locationType === "offline"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Offline</span>
                </button>
                <button
                  onClick={() => updateFormData({ locationType: "online" })}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                    formData.locationType === "online"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>Online</span>
                </button>
              </div>
              {formData.locationType === "offline" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Address
                  </label>
                  <input
                    type="text"
                    value={formData.venueAddress}
                    onChange={(e) =>
                      updateFormData({ venueAddress: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Full address including city"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Online Link
                  </label>
                  <input
                    type="url"
                    value={formData.onlineLink}
                    onChange={(e) =>
                      updateFormData({ onlineLink: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., https://zoom.us/j/123456789"
                  />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Ticket className="h-6 w-6 mr-2 text-red-600" />
                Ticket Setup
              </h2>

              {/* Free / Paid */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Is this a paid event?
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateFormData({ isPaid: false })}
                    className={`px-4 py-2 rounded-md ${
                      !formData.isPaid
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => updateFormData({ isPaid: true })}
                    className={`px-4 py-2 rounded-md ${
                      formData.isPaid
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>

              {/* Platform Fee Payer */}
              {formData.isPaid && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Who pays the platform service fee?
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() =>
                        updateFormData({ platformFeePayer: "organizer" })
                      }
                      className={`px-4 py-2 rounded-md text-sm ${
                        formData.platformFeePayer === "organizer"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Me (Organizer)
                    </button>
                    <button
                      onClick={() =>
                        updateFormData({ platformFeePayer: "buyer" })
                      }
                      className={`px-4 py-2 rounded-md text-sm ${
                        formData.platformFeePayer === "buyer"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Buyer
                    </button>
                  </div>
                </div>
              )}

              {/* Ticket Types */}
              <div className="space-y-4">
                {formData.ticketTypes.map((ticket, index) => {
                  const price = Number(ticket.price) || 0;
                  const quantity = Number(ticket.quantity) || 0;

                  const fee = Math.round(price * 0.04 * 100) / 100;
                  const buyerPays =
                    formData.platformFeePayer === "buyer" ? price + fee : price;
                  const organizerGets =
                    formData.platformFeePayer === "buyer" ? price : price - fee;

                  return (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-md space-y-4"
                    >
                      {/* Ticket Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ticket Name
                        </label>
                        <input
                          type="text"
                          value={ticket.name}
                          onChange={(e) =>
                            updateTicketType(index, { name: e.target.value })
                          }
                          placeholder="Eg: Premium, VIP"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>

                      {/* Price & Quantity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ticket Price (₹)
                          </label>
                          <input
                            type="number"
                            value={ticket.price}
                            onChange={(e) =>
                              updateTicketType(index, {
                                price:
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                              })
                            }
                            placeholder="Eg: 100"
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Quantity
                          </label>
                          <input
                            type="number"
                            value={ticket.quantity}
                            onChange={(e) =>
                              updateTicketType(index, {
                                quantity:
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                              })
                            }
                            placeholder="Eg: 50"
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      {formData.isPaid && price > 0 && (
                        <div className="bg-gray-100 rounded-md p-3 text-sm">
                          <h4 className="font-medium mb-2">
                            Ticket Cost Breakdown
                          </h4>
                          <div className="space-y-1 text-gray-700">
                            <div className="flex justify-between">
                              <span>Ticket Price</span>
                              <span>₹{price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Platform Fee (5%)</span>
                              <span>₹{fee}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-medium">
                              <span>Amount Paid by Buyer</span>
                              <span>₹{buyerPays}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Amount You Receive</span>
                              <span>₹{organizerGets}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => removeTicketType(index)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove Ticket
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={addTicketType}
                  className="flex items-center space-x-2 text-red-600 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Ticket Type</span>
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-6 w-6 mr-2 text-red-600" />
                Registration Form
              </h2>
              <p className="text-sm text-gray-600">
                Customize the fields attendees will fill when registering for
                your event.
              </p>
              <div className="space-y-4">
                {formData.registrationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-end space-x-4 p-4 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateRegistrationField(index, {
                            label: e.target.value,
                          })
                        }
                        placeholder="Field Label"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="grid grid-cols-2 gap-4 items-end">
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateRegistrationField(index, {
                              type: e.target.value as RegistrationField["type"],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="tel">Phone</option>
                          <option value="number">Number</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                        </select>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateRegistrationField(index, {
                                required: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">
                            Required
                          </span>
                        </label>
                      </div>
                      {field.type === "select" && (
                        <textarea
                          value={field.options?.join(", ") || ""}
                          onChange={(e) =>
                            updateRegistrationField(index, {
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Options separated by commas (e.g., Option 1, Option 2)"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => removeRegistrationField(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRegistrationField}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Field</span>
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Image className="h-6 w-6 mr-2 text-red-600" />
                Media
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Poster/Banner
                </label>
                {formData.posterPreview ? (
                  <div className="relative">
                    <img
                      src={formData.posterPreview}
                      alt="Poster Preview"
                      className="w-full max-w-md h-64 object-cover rounded-md"
                    />
                    <button
                      onClick={() =>
                        updateFormData({ poster: null, posterPreview: null })
                      }
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-red-400 transition-colors">
                    <div className="text-center">
                      <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500">
                        Click to upload poster (JPG, PNG up to 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterUpload}
                        className="hidden"
                      />
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Check className="h-6 w-6 mr-2 text-red-600" />
                Publish
              </h2>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Review your event details and choose an action below.
                </p>
                <button
                  onClick={() => window.open("/preview", "_blank")} // Mock preview
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview Event</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step < 7 ? (
              <>
                <button
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className="flex items-center space-x-2 px-6 py-3 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!isValidStep(step)}
                  className={`px-6 py-3 rounded-md text-sm font-medium ${
                    isValidStep(step)
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {step === 6 ? "Next: Publish" : "Next"}
                  <ChevronRight className="h-4 w-4 inline ml-2" />
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => SaveAsDraft()}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting || !isValidStep(4)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium ${
                    isSubmitting || !isValidStep(4)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {isSubmitting ? "Publishing..." : "Publish Event"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
