"use client";
import React, { useState, useEffect } from "react";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  optionsAsString?: string;
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
  platformFeePercentage: number;
  ticketTypes: TicketTypeInput[]; // ✅ INPUT TYPE
  registrationFields: RegistrationField[];
  poster: File | null;
  posterPreview: string | null;
  mediaOrientation?: "poster" | "banner";
  organizerName: string;
  organizerDescription: string;
  termsAccepted: boolean;
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
    platformFeePayer: "organizer",
    platformFeePercentage: 2,
    ticketTypes: [{ name: "General", price: "", quantity: "" }],
    registrationFields: [
      { id: "firstName", label: "First Name", type: "text", required: true },
      { id: "lastName", label: "Last Name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
      { id: "phone", label: "Phone Number", type: "tel", required: true },
    ],
    poster: null,
    posterPreview: null,
    organizerName: "",
    organizerDescription: "",
    termsAccepted: false,
  });

  const auth = getAuth();
  const user = auth.currentUser;

  console.log(formData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedAddress, setDebouncedAddress] = useState(
    formData.venueAddress
  );
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setDebouncedAddress(formData.venueAddress);

      if (formData.venueAddress.length > 3) {
        setIsLoadingSuggestions(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              formData.venueAddress
            )}`
          );
          const data = await res.json();
          setAddressSuggestions(data || []);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setAddressSuggestions([]);
        setIsLoadingSuggestions(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.venueAddress]);

  const router = useRouter();
  const categories = [
    "Conference",
    "Techfest",
    "Workshop",
    "Meetup",
    "Concert",
    "Seminar",
    "Festival",
    "Exhibition",
    "Webinar",
    "Training",
    "Networking",
    "Sports",
    "Charity",
    "Competition",
    "Launch Event",
    "Awards Ceremony",
    "Trade Show",
    "Cultural Event",
    "Tech Talk",
    "Hackathon",
    "Panel Discussion",
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

      const img = new window.Image();
      img.onload = () => {
        const orientation = img.width >= img.height ? "banner" : "poster";
        updateFormData({
          poster: file,
          posterPreview: preview,
          mediaOrientation: orientation,
        });
      };
      img.src = preview;
    }
  };

  const SaveAsDraft = async (): Promise<string | undefined> => {
    setIsSubmitting(true);

    const savePromise = async () => {
      let docRefId = draftId;
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
          platformFeePercentage: formData.platformFeePercentage,
          mediaOrientation: formData.mediaOrientation || null,
          ticketTypes: formData.ticketTypes,
          registrationFields: formData.registrationFields,
          organizerName: formData.organizerName,
          organizerDescription: formData.organizerDescription,
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
          platformFeePercentage: formData.platformFeePercentage,
          mediaOrientation: formData.mediaOrientation || null,
          ticketTypes: formData.ticketTypes,
          registrationFields: formData.registrationFields,
          organizerName: formData.organizerName,
          organizerDescription: formData.organizerDescription,
          posterUrl: null,
          creatorEmail: user?.email,
          status: "draft",
          createdAt: serverTimestamp(),
        });

        setDraftId(docRef.id); // ⭐ persist ID
        docRefId = docRef.id;
      }

      // 🖼 Upload poster to Storage
      if (formData.poster && docRefId) {
        const id = docRefId;

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
      return docRefId;
    };

    try {
      const id = await toast.promise(savePromise(), {
        loading: "Saving draft...",
        success: "Draft saved successfully 💾",
        error: "Failed to save draft ❌",
      });
      return id || undefined;
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
        platformFeePercentage: formData.platformFeePercentage,
        mediaOrientation: formData.mediaOrientation || null,
        ticketTypes: formData.ticketTypes,
        creatorEmail: user?.email,
        registrationFields: formData.registrationFields,
        organizerName: formData.organizerName,
        organizerDescription: formData.organizerDescription,
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

  const handlePreview = async () => {
    let targetId = publishedId;

    if (!targetId) {
      const draft = await SaveAsDraft();
      targetId = draft || draftId;
    }

    if (targetId) {
      const url = publishedId
        ? `/events/${publishedId}`
        : `/events/${targetId}?preview=true`;
      window.open(url, "_blank");
    } else {
      toast.error(
        "Please provide minimal details (Name, Category, Description) to preview."
      );
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
        return (
          formData.name &&
          formData.category &&
          formData.description &&
          formData.organizerName
        );
      case 2:
        return formData.date && formData.time;
      case 3:
        return formData.locationType === "offline"
          ? formData.venueAddress
          : formData.onlineLink;
      case 4:
        return formData.ticketTypes.every((t) => {
          if (formData.isPaid) {
            return t.name && Number(t.quantity) > 0 && Number(t.price) > 0;
          }
          return t.name && Number(t.quantity) > 0;
        });
      case 5:
        return true; // Registration fields are customizable, always valid
      case 6:
        return true; // Media optional
      default:
        return true;
    }
  };

  return (
    <div className="h-auto bg-gray-50/50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Event
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details to publish your event
            </p>
          </div>
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              step === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Vertical Stepper for Mobile / Horizontal for Desktop */}
        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex items-center space-x-4 min-w-max">
            {steps.map((s, i) => {
              const canNavigate = (() => {
                for (let k = 1; k < s.id; k++) {
                  if (!isValidStep(k)) return false;
                }
                return true;
              })();

              const isCompleted = step > s.id;
              const isCurrent = step === s.id;

              return (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => canNavigate && setStep(s.id)}
                    disabled={!canNavigate}
                    className={`group flex items-center space-x-2 pr-4 ${
                      !canNavigate ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        isCurrent
                          ? "border-red-600 bg-red-600 text-white shadow-md ring-2 ring-red-100 ring-offset-2"
                          : isCompleted
                          ? "border-red-600 bg-red-50 text-red-600"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <s.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium whitespace-nowrap transition-colors ${
                        isCurrent
                          ? "text-gray-900"
                          : isCompleted
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-6 ${
                        isCompleted ? "bg-red-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white p-3 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {step === 1 && (
            <div className="p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 mr-3">
                    <Calendar className="h-5 w-5" />
                  </span>
                  Basic Information
                </h2>
                <p className="text-sm text-gray-500 mt-1 pl-13">
                  Give your event a catchy title and description.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                    placeholder="e.g., React Conf 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      updateFormData({ category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData({ description: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400 resize-none"
                  placeholder="Tell us what makes your event special..."
                />
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {formData.description.length} characters
                </p>
              </div>

              {/* Organizer Details Section */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Organizer Details
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Organizer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.organizerName}
                      onChange={(e) =>
                        updateFormData({ organizerName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                      placeholder="e.g., GDG San Francisco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Organizer Bio (Optional)
                    </label>
                    <textarea
                      value={formData.organizerDescription}
                      onChange={(e) =>
                        updateFormData({ organizerDescription: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400 resize-none"
                      placeholder="Briefly describe the organizer..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 mr-3">
                    <Clock className="h-5 w-5" />
                  </span>
                  Date & Time
                </h2>
                <p className="text-sm text-gray-500 mt-1 pl-13">
                  When is your event taking place?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.date ? new Date(formData.date) : null}
                    onChange={(date: Date | null) =>
                      updateFormData({
                        date: date ? date.toISOString().split("T")[0] : "",
                      })
                    }
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select event date"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                    wrapperClassName="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={
                      formData.time
                        ? new Date(`2000-01-01T${formData.time}`)
                        : null
                    }
                    onChange={(date: Date | null) => {
                      if (date) {
                        const hours = date
                          .getHours()
                          .toString()
                          .padStart(2, "0");
                        const minutes = date
                          .getMinutes()
                          .toString()
                          .padStart(2, "0");
                        updateFormData({ time: `${hours}:${minutes}` });
                      } else {
                        updateFormData({ time: "" });
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    placeholderText="Select start time"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 mr-3">
                    <MapPin className="h-5 w-5" />
                  </span>
                  Location
                </h2>
                <p className="text-sm text-gray-500 mt-1  pl-13">
                  where will your event be held?
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                  <button
                    onClick={() => updateFormData({ locationType: "offline" })}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      formData.locationType === "offline"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>In Person</span>
                  </button>
                  <button
                    onClick={() => updateFormData({ locationType: "online" })}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      formData.locationType === "online"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    <span>Virtual</span>
                  </button>
                </div>

                {formData.locationType === "offline" ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Venue Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.venueAddress}
                          onChange={(e) =>
                            updateFormData({ venueAddress: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                          placeholder="e.g., Moscone Center, 747 Howard St, San Francisco, CA"
                          autoComplete="off"
                        />
                        {(isLoadingSuggestions ||
                          (addressSuggestions.length > 0 &&
                            formData.venueAddress.length > 3)) && (
                          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-xl max-h-60 overflow-y-auto left-0">
                            {isLoadingSuggestions ? (
                              <li className="px-4 py-4 text-sm text-gray-500 text-center flex items-center justify-center">
                                <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent mr-2"></div>
                                Loading suggestions...
                              </li>
                            ) : (
                              addressSuggestions.map((s, i) => (
                                <li
                                  key={i}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-0 transition-colors"
                                  onClick={() => {
                                    updateFormData({
                                      venueAddress: s.display_name,
                                    });
                                    setAddressSuggestions([]);
                                  }}
                                >
                                  <div className="font-medium text-gray-900 truncate">
                                    {s.display_name.split(",")[0]}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {s.display_name}
                                  </div>
                                </li>
                              ))
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                    {debouncedAddress && debouncedAddress.length > 5 && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-64 w-full bg-gray-50 relative group">
                        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-500 shadow-sm pointer-events-none">
                          Map Preview
                        </div>
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            debouncedAddress
                          )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                          className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                        ></iframe>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Online Event Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.onlineLink}
                      onChange={(e) =>
                        updateFormData({ onlineLink: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                      placeholder="e.g., https://zoom.us/j/123456789"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Share the meeting link now or add it later.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 mr-3">
                    <Ticket className="h-5 w-5" />
                  </span>
                  Ticket Setup
                </h2>
                <p className="text-sm text-gray-500 mt-1  pl-13">
                  Manage your event pricing and availability.
                </p>
              </div>

              {/* Free / Paid */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">
                  Is this a paid event?
                </label>
                <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                  <button
                    onClick={() => updateFormData({ isPaid: false })}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      !formData.isPaid
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Free Event
                  </button>
                  <button
                    onClick={() => updateFormData({ isPaid: true })}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      formData.isPaid
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Paid Event
                  </button>
                </div>
              </div>

              {/* Platform Fee Payer */}
              {formData.isPaid && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                  <label className="block text-sm font-semibold text-blue-900 mb-4">
                    Who pays the platform service fee?
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() =>
                        updateFormData({ platformFeePayer: "organizer" })
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        formData.platformFeePayer === "organizer"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      Me (Organizer absorbs fee)
                    </button>
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg text-sm font-medium border transition-all bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      title="This feature is temporarily disabled"
                    >
                      Buyer (Pass fee to customer)
                    </button>
                  </div>
                </div>
              )}

              {/* Ticket Types */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ticket Types
                  </h3>
                  <button
                    onClick={addTicketType}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Ticket Type</span>
                  </button>
                </div>

                {formData.ticketTypes.map((ticket, index) => {
                  const price = Number(ticket.price) || 0;
                  const quantity = Number(ticket.quantity) || 0;

                  const feePercentage = formData.platformFeePercentage || 2;
                  const fee =
                    Math.round(price * (feePercentage / 100) * 100) / 100;
                  const buyerPays =
                    formData.platformFeePayer === "buyer" ? price + fee : price;
                  const organizerGets =
                    formData.platformFeePayer === "buyer" ? price : price - fee;

                  return (
                    <div
                      key={index}
                      className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-6 relative group hover:border-red-200 transition-all"
                    >
                      <button
                        onClick={() => removeTicketType(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Ticket"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-3">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ticket Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={ticket.name}
                            onChange={(e) =>
                              updateTicketType(index, { name: e.target.value })
                            }
                            placeholder="e.g., General Admission, VIP"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Price (₹){" "}
                            {formData.isPaid && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <input
                            type="number"
                            min="0"
                            onWheel={(e) => e.currentTarget.blur()}
                            value={ticket.price}
                            disabled={!formData.isPaid}
                            onChange={(e) =>
                              updateTicketType(index, {
                                price:
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                              })
                            }
                            placeholder={formData.isPaid ? "0.00" : "Free"}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            onWheel={(e) => e.currentTarget.blur()}
                            value={ticket.quantity}
                            onChange={(e) =>
                              updateTicketType(index, {
                                quantity:
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                              })
                            }
                            placeholder="e.g., 100"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      {formData.isPaid && price > 0 && (
                        <div className="bg-white rounded-xl p-5 text-sm border border-gray-200 shadow-sm/50">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            Revenue Breakdown
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium border border-gray-200">
                              ESTIMATE
                            </span>
                          </h4>
                          <div className="space-y-3 text-gray-700">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Ticket Price</span>
                              <span className="font-semibold">
                                ₹{price.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-red-600">
                              <span>
                                GraburPass Platform Fee ({feePercentage}%)
                              </span>
                              <span>-₹{fee.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-start pt-1">
                              <div>
                                <span className="text-gray-900">
                                  Payment Gateway Charges
                                </span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  (dependent on payment method)
                                </p>
                              </div>
                              <span className="text-gray-500 text-right text-xs bg-gray-100 px-2 py-1 rounded">
                                Calculated at checkout*
                              </span>
                            </div>

                            <div className="my-3 border-t-2 border-dashed border-gray-100" />

                            <div className="flex justify-between items-center font-bold text-base text-green-700">
                              <span>Estimated You Receive</span>
                              <span>₹{organizerGets.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-blue-50/50 rounded-lg text-xs text-blue-800 leading-relaxed border border-blue-100/50">
                            <span className="font-semibold mr-1">Note:</span>
                            Payment gateway charges vary by payment method
                            (UPI/Card/Netbanking) and will be adjusted from
                            settlement.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 mr-3">
                    <User className="h-5 w-5" />
                  </span>
                  Registration Form
                </h2>
                <p className="text-sm text-gray-500 mt-1  pl-13">
                  Customize the fields attendees will fill when registering.
                </p>
              </div>

              <div className="space-y-6">
                {formData.registrationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 relative group hover:border-red-200 transition-all"
                  >
                    <button
                      onClick={() => removeRegistrationField(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Field Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            updateRegistrationField(index, {
                              label: e.target.value,
                            })
                          }
                          placeholder="e.g., T-Shirt Size"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateRegistrationField(index, {
                              type: e.target.value as RegistrationField["type"],
                            })
                          }
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                        >
                          <option value="text">Short Text</option>
                          <option value="email">Email Address</option>
                          <option value="tel">Phone Number</option>
                          <option value="number">Number</option>
                          <option value="textarea">Long Text</option>
                          <option value="select">Dropdown Selection</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 pt-9">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateRegistrationField(index, {
                                required: e.target.checked,
                              })
                            }
                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Required?
                          </span>
                        </label>
                      </div>
                    </div>

                    {field.type === "select" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dropdown Options (Comma separated)
                        </label>
                        <textarea
                          value={
                            field.optionsAsString !== undefined
                              ? field.optionsAsString
                              : field.options?.join(", ") || ""
                          }
                          onChange={(e) =>
                            updateRegistrationField(index, {
                              optionsAsString: e.target.value,
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Small, Medium, Large, XL"
                          rows={2}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                        />
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={addRegistrationField}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Field</span>
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
            <div className="p-8 space-y-8">
              <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
                <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Review & Publish
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Double check everything before going live.
                  </p>
                </div>
              </div>

              {/* Event Preview Card */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row group">
                {/* Image Section */}
                <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-100 relative items-center justify-center flex overflow-hidden">
                  {formData.posterPreview ? (
                    <img
                      src={formData.posterPreview}
                      alt="Event Poster"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Image className="h-10 w-10 mb-2 opacity-50" />
                      <span className="text-xs font-medium">No Poster</span>
                    </div>
                  )}
                  {formData.category && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-800 uppercase tracking-wide shadow-sm">
                      {formData.category}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 md:w-2/3 space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {formData.name || "Untitled Event"}
                    </h3>
                    {formData.organizerName && (
                      <p className="text-sm font-medium text-red-600 mt-1 flex items-center">
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        by {formData.organizerName}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2 gap-4">
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />{" "}
                        {formData.date || "Date TBD"}
                      </div>
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400" />{" "}
                        {formData.time || "Time TBD"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {formData.locationType === "offline"
                        ? formData.venueAddress || "Venue TBD"
                        : "Online Event"}
                    </span>
                  </div>

                  <div className="pt-5 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Ticket className="h-4 w-4 mr-2" />
                      {formData.ticketTypes.length} Ticket Type
                      {formData.ticketTypes.length !== 1 ? "s" : ""}
                    </div>
                    <div
                      className={`font-medium px-3 py-1 rounded-full text-xs ${
                        formData.isPaid
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {formData.isPaid ? "Paid Event" : "Free Event"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={handlePreview}
                  className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview Public Page</span>
                </button>
              </div>

              {/* Terms and Conditions */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Terms & Conditions
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-60 overflow-y-auto text-xs text-gray-600 leading-relaxed mb-4">
                  <h4 className="font-bold mb-2">
                    📜 GraburPass – Organizer Terms & Conditions
                  </h4>
                  <p className="mb-2">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                  <p className="mb-4">
                    By creating and publishing an event on GraburPass, you
                    (“Organizer”) agree to the following terms and conditions.
                  </p>

                  <h5 className="font-bold mt-3">1. Platform Role</h5>
                  <p>
                    GraburPass is an event ticketing and discovery platform that
                    enables organizers to list events, sell tickets, and collect
                    payments through integrated payment gateways. GraburPass
                    does not organize events and is not responsible for event
                    execution.
                  </p>

                  <h5 className="font-bold mt-3">2. Event Responsibility</h5>
                  <p>
                    The Organizer is solely responsible for: Event content,
                    scheduling, venue, and execution; Accuracy of event details,
                    pricing, and ticket limits; Compliance with local laws,
                    permissions, and licenses. GraburPass is not liable for
                    event cancellation, postponement, or quality of service.
                  </p>

                  <h5 className="font-bold mt-3">3. Ticket Pricing & Sales</h5>
                  <p>
                    Ticket prices are set by the Organizer. All ticket sales are
                    processed through GraburPass’s authorized payment partners.
                    Customers pay the ticket price displayed at checkout.
                  </p>

                  <h5 className="font-bold mt-3">4. Platform Fee</h5>
                  <p>
                    GraburPass charges a platform service fee, as agreed during
                    event creation. The platform fee is deducted from the total
                    ticket revenue before settlement. Platform fees are
                    non-refundable, even in case of refunds or cancellations,
                    unless explicitly stated.
                  </p>

                  <h5 className="font-bold mt-3">5. Payment Gateway Charges</h5>
                  <p>
                    Payment gateway charges are applied by third-party payment
                    providers (e.g., Cashfree). Gateway charges vary based on
                    payment method (UPI, cards, net banking, wallets, etc.).
                    These charges are deducted from the Organizer’s settlement
                    amount. GraburPass does not control or guarantee gateway fee
                    rates.
                  </p>

                  <h5 className="font-bold mt-3">6. Settlements & Payouts</h5>
                  <p>
                    Ticket collections are settled to the Organizer’s registered
                    bank account. Settlement timelines depend on the payment
                    gateway (typically T+2 working days). Final payout = Total
                    Ticket Revenue – Platform Fee – Gateway Charges – Applicable
                    Deductions. GraburPass is not responsible for settlement
                    delays caused by banks, gateways, or compliance checks.
                  </p>

                  <h5 className="font-bold mt-3">
                    7. Free Events & Fixed Fees (If Applicable)
                  </h5>
                  <p>
                    For free events or special plans, GraburPass may charge a
                    fixed event listing fee. Applicable fees will be clearly
                    communicated before event publishing.
                  </p>

                  <h5 className="font-bold mt-3">8. Refunds & Cancellations</h5>
                  <p>
                    Refund policies are defined by the Organizer. In case of
                    refunds: Gateway charges may not be refundable; Platform
                    fees may be retained unless otherwise stated. GraburPass may
                    assist with refunds but is not liable for refund disputes.
                  </p>

                  <h5 className="font-bold mt-3">
                    9. Compliance & Verification
                  </h5>
                  <p>
                    Organizers must provide valid business and identity
                    documents (PAN, bank details, etc.). GraburPass reserves the
                    right to: Pause settlements; Request additional documents;
                    Suspend accounts in case of non-compliance or suspicious
                    activity.
                  </p>

                  <h5 className="font-bold mt-3">10. Prohibited Activities</h5>
                  <p>
                    Organizers must NOT: Sell illegal, misleading, or prohibited
                    services; Create fake or misleading events; Use GraburPass
                    for money laundering or fraudulent activities. Violation may
                    result in account suspension and withholding of payouts.
                  </p>

                  <h5 className="font-bold mt-3">
                    11. Limitation of Liability
                  </h5>
                  <p>
                    GraburPass shall not be liable for: Event failure or losses
                    incurred by the Organizer; Customer disputes beyond payment
                    facilitation; Technical failures beyond reasonable control.
                  </p>

                  <h5 className="font-bold mt-3">12. Agreement Acceptance</h5>
                  <p>
                    By clicking “Publish Event” or “Complete Event Setup”, the
                    Organizer confirms that they: Have read and understood these
                    terms; Agree to all fees, deductions, and settlement
                    conditions; Are legally authorized to conduct the event.
                  </p>

                  <h5 className="font-bold mt-3">13. Contact</h5>
                  <p>
                    For any queries related to payouts, fees, or compliance:
                    📧beondinnovations@gmail.com, 9946846101
                  </p>
                </div>

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) =>
                        updateFormData({ termsAccepted: e.target.checked })
                      }
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-red-600 checked:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors select-none">
                    I have read and agree to the{" "}
                    <span className="font-semibold text-gray-900">
                      Organizer Terms & Conditions
                    </span>
                    .
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`flex items-center space-x-2 px-6 py-3 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 ${
                step === 1 ? "invisible" : ""
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {step < 7 ? (
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
                  disabled={isSubmitting || !formData.termsAccepted}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium ${
                    isSubmitting || !formData.termsAccepted
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
