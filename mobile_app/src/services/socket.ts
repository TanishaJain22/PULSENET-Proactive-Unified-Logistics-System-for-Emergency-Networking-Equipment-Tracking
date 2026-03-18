import { io } from 'socket.io-client';
import { ENV } from '../config/env';
import { Hospital } from '../types';

// Initialize the socket connection to the backend
// autoConnect is true by default, meaning it attempts connection as soon as imported
export const socket = io(ENV.SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

// Expected events (examples):
export const SOCKET_EVENTS = {
  JOIN_CASE: 'JOIN_CASE',
  NEW_EMERGENCY: 'NEW_EMERGENCY',
  AMBULANCE_LOCATION_UPDATE: 'AMBULANCE_LOCATION_UPDATE',
  HOSPITAL_ASSIGNED: 'HOSPITAL_ASSIGNED',
  STATUS_UPDATE: 'STATUS_UPDATE',
  DISPATCH_STATE_UPDATE: 'DISPATCH_STATE_UPDATE',
  TRANSFER_CONFIRMED: 'TRANSFER_CONFIRMED',
};

export const socketService = {
  connect: () => {
    console.log('[Socket] Connecting...');
    socket.connect();
  },
  disconnect: () => socket.disconnect(),

  onConnect: (callback: () => void) => socket.on('connect', callback),
  onDisconnect: (callback: (reason: string) => void) => socket.on('disconnect', callback),
  onReconnect: (callback: (attempt: number) => void) => socket.on('reconnect', callback),
  onConnectError: (callback: (error: any) => void) => socket.on('connect_error', callback),
  
  joinCase: (caseId: string) => {
    console.log(`[Socket] Joining case room: ${caseId}`);
    socket.emit(SOCKET_EVENTS.JOIN_CASE, { caseId });
  },

  emitLocationUpdate: (caseId: string, latitude: number, longitude: number) => {
    socket.emit(SOCKET_EVENTS.AMBULANCE_LOCATION_UPDATE, {
      caseId,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });
  },

  emitHospitalAssigned: (caseId: string, hospital: Hospital) => {
    socket.emit(SOCKET_EVENTS.HOSPITAL_ASSIGNED, { caseId, hospital });
  },

  emitStatusUpdate: (caseId: string, status: string, message: string) => {
    socket.emit(SOCKET_EVENTS.STATUS_UPDATE, { 
      caseId, 
      status, 
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  },

  emitDispatchStateUpdate: (caseId: string, state: string) => {
    socket.emit(SOCKET_EVENTS.DISPATCH_STATE_UPDATE, { caseId, state });
  },

  onStatusUpdate: (callback: (data: { status: string, message: string, timestamp: string }) => void) => {
    socket.on(SOCKET_EVENTS.STATUS_UPDATE, callback);
    return () => socket.off(SOCKET_EVENTS.STATUS_UPDATE, callback);
  },

  onDispatchStateUpdate: (callback: (data: { state: string }) => void) => {
    socket.on(SOCKET_EVENTS.DISPATCH_STATE_UPDATE, callback);
    return () => socket.off(SOCKET_EVENTS.DISPATCH_STATE_UPDATE, callback);
  },

  onHospitalAssigned: (callback: (data: { hospital: Hospital }) => void) => {
    socket.on(SOCKET_EVENTS.HOSPITAL_ASSIGNED, callback);
    return () => socket.off(SOCKET_EVENTS.HOSPITAL_ASSIGNED, callback);
  },

  onLocationUpdate: (callback: (data: { latitude: number, longitude: number }) => void) => {
    socket.on(SOCKET_EVENTS.AMBULANCE_LOCATION_UPDATE, callback);
    return () => socket.off(SOCKET_EVENTS.AMBULANCE_LOCATION_UPDATE, callback);
  },

  onCaseCreated: (callback: (data: { caseId: string }) => void) => {
    socket.on('CASE_CREATED', callback);
    return () => socket.off('CASE_CREATED', callback);
  },

  // ─── Dispatch events ────────────────────────────────────────────────────────
  joinDispatch: (dispatchId: string) => {
    console.log(`[Socket] Joining dispatch room: ${dispatchId}`);
    socket.emit('JOIN_DISPATCH', { dispatchId });
  },

  joinDriversRoom: () => {
    socket.emit('JOIN_DRIVERS');
  },

  onDispatchCreated: (callback: (data: any) => void) => {
    socket.on('DISPATCH_CREATED', callback);
    return () => socket.off('DISPATCH_CREATED', callback);
  },
};
