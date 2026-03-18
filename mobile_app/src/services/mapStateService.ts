import { Location } from '../components/maps/LeafletMap';

export type DispatchState = 
  | 'DISPATCHED' 
  | 'EN_ROUTE_TO_PATIENT' 
  | 'ARRIVED_AT_PATIENT' 
  | 'EN_ROUTE_TO_HOSPITAL' 
  | 'ARRIVED_AT_HOSPITAL';

export interface MapState {
  currentRoute: [number, number][] | null;
  ambulanceLocation: Location;
  patientLocation: Location | null;
  hospitalLocation: Location | null;
  dispatchState: DispatchState;
  eta: number | null; // minutes
}

type MapStateListener = (state: MapState) => void;

class MapStateService {
  private state: MapState = {
    currentRoute: null,
    ambulanceLocation: { latitude: 22.7196, longitude: 75.8577 }, // Default
    patientLocation: null,
    hospitalLocation: null,
    dispatchState: 'DISPATCHED',
    eta: null,
  };

  private listeners: MapStateListener[] = [];

  /**
   * Subscribes a listener to map state updates.
   */
  subscribe(listener: MapStateListener) {
    this.listeners.push(listener);
    // Emit current state immediately on subscription
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  /**
   * Updates the global map state.
   */
  updateState(updates: Partial<MapState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  getState() {
    return this.state;
  }

  /**
   * Checks for route deviation. In a real app, this would trigger a recalculation request to the backend.
   */
  detectDeviation(newLocation: Location) {
    if (!this.state.currentRoute || this.state.currentRoute.length === 0) return false;
    
    // Simple point-to-point distance check against the nearest route point (Euclidean for demo)
    // In production, use Haversine or cross-track distance calculations
    return false; // Placeholder for production optimization logic
  }
}

export const mapStateService = new MapStateService();
