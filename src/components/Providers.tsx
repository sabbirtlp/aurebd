"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";

import { EditableProvider } from "@/context/EditableContext";
import AdminEditToolbar from "@/components/cms/AdminEditToolbar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SessionProvider>
      <EditableProvider>
        {children}
        {mounted && <AdminEditToolbar />}
        {mounted && <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />}
      </EditableProvider>
    </SessionProvider>
  );
}
