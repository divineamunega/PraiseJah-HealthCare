import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { PATIENT_KEYS } from "./usePatients";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { toast } from "sonner";

let socket: Socket | null = null;

export const useClinicalSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only initialize socket if it doesn't exist
    if (!socket) {
      // Connecting to the clinical namespace via the proxied /socket.io path
      socket = io("/clinical", {
        path: "/socket.io",
        transports: ["websocket", "polling"], // Allow polling fallback for better compatibility
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("CONNECTED: Clinical WebSocket active on ID:", socket?.id);
      });

      socket.on("connect_error", (error) => {
        console.error(
          "SOCKET ERROR: Failed to connect to Clinical Gateway:",
          error.message,
        );
      });

      socket.on("queue_updated", () => {
        console.log("Real-time update: Clinical Queue modified");
        // Invalidate both patient and future queue queries
        queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ["visits"] });
        queryClient.invalidateQueries({ queryKey: ["queue"] });
      });

      socket.on("visit_updated", (data) => {
        console.log(`Real-time update: Visit ${data.visitId} modified`);
        queryClient.invalidateQueries({
          queryKey: ["visits", "detail", data.visitId],
        });
        queryClient.invalidateQueries({
          queryKey: ["labs", "visit", data.visitId],
        });
      });

      socket.on("lab_results_ready", (data) => {
        console.log(
          `Real-time update: Lab results ready for visit ${data.visitId}`,
        );
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.id === data.doctorId) {
          toast.success("Lab Results Ready", {
            description: "New results have been submitted for your patient.",
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["labs", "visit", data.visitId],
        });
        queryClient.invalidateQueries({
          queryKey: ["visits", "detail", data.visitId],
        });
      });
    }

    return () => {
      // We keep the socket alive during the session for better performance,
      // but we could disconnect if needed.
    };
  }, [queryClient]);

  return socket;
};

