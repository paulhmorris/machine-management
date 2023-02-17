import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { ServerToast } from "~/utils/toast.server";

type Props = {
  serverToast: ServerToast | null;
};

export function Notifications({ serverToast }: Props) {
  useEffect(() => {
    if (!serverToast) return;
    switch (serverToast.type) {
      case "success":
        toast.success(serverToast.message);
        break;
      case "error":
        toast.error(serverToast.message);
        break;
    }
  }, [serverToast]);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "font-medium",
        style: {
          borderRadius: "6px",
          paddingInline: "1.125rem",
          border: "1px solid #0000001A",
        },
        success: {
          duration: 4000,
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fff",
          },
          style: {
            color: "#dc2626",
          },
        },
      }}
    />
  );
}
