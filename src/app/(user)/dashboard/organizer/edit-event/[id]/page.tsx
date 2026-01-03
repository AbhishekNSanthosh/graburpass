"use client";

import React, { useEffect, useState } from "react";
import NewEvent from "@/widgets/dashboard/organizer/NewEvent";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
import { toast } from "react-hot-toast";

export default function EditEventPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // We don't actually need to fetch data here because NewEvent handles it via logic we will add.
  // BUT, NewEvent currently only accepts 'draftId' via searchParams.
  // We should modify NewEvent to accept an optional 'initialData' or 'editId' prop.
  // OR, simpler: verify the ID exists here, then render NewEvent passing the ID as a prop.

  useEffect(() => {
    const verifyEvent = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "published_events", id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          toast.error("Event not found");
          router.push("/dashboard/organizer/manage-events");
        }
      } catch (error) {
        console.error("Error checking event:", error);
      } finally {
        setLoading(false);
      }
    };
    verifyEvent();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Reuse the NewEvent widget, but we need to tell it we are EDITING a PUBLISHED event.
  // We can pass a prop `editMode="published"` and `editId={id}`.
  return <NewEvent editId={id} />;
}
