import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { PATIENT_KEYS } from './usePatients';

let socket: Socket | null = null;

export const useClinicalSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only initialize socket if it doesn't exist
    if (!socket) {
      // In development, the backend is likely at :3000
      // Since we use /api proxy in vite, we can try to connect to the base origin
      socket = io('/clinical', {
        path: '/socket.io',
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('Connected to Clinical WebSocket');
      });

      socket.on('queue_updated', () => {
        console.log('Real-time update: Clinical Queue modified');
        // Invalidate both patient and future queue queries
        queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['visits'] });
        queryClient.invalidateQueries({ queryKey: ['queue'] });
      });

      socket.on('visit_updated', (data) => {
        console.log(`Real-time update: Visit ${data.visitId} modified`);
        queryClient.invalidateQueries({ queryKey: ['visits', 'detail', data.visitId] });
      });
    }

    return () => {
      // We keep the socket alive during the session for better performance,
      // but we could disconnect if needed.
    };
  }, [queryClient]);

  return socket;
};
