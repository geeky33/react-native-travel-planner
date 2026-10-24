import { useSyncExternalStore } from 'react';

import { colors } from '../theme';

// ==========================================================
// TRIP DATA (shared singleton store - React Native version of
// the Flutter TripData ChangeNotifier)
// ==========================================================

let nextId = 1;

const makePlace = ({
  name,
  visited = false,
  color = colors.primary,
  icon = 'map-marker',
  latitude = 0,
  longitude = 0,
}) => ({
  id: nextId++,
  name,
  visited,
  color,
  icon,
  latitude,
  longitude,
});

const listeners = new Set();

const state = {
  places: [
    makePlace({
      name: 'Baga Beach',
      icon: 'beach',
      color: colors.sky,
      latitude: 15.5565,
      longitude: 73.7517,
    }),
    makePlace({
      name: 'Fort Aguada',
      icon: 'castle',
      color: colors.purple,
      latitude: 15.4925,
      longitude: 73.7737,
    }),
    makePlace({
      name: 'Dudhsagar Falls',
      icon: 'waterfall',
      color: colors.green,
      latitude: 15.3144,
      longitude: 74.3143,
    }),
    makePlace({
      name: 'Basilica of Bom Jesus',
      icon: 'church',
      color: colors.orange,
      latitude: 15.5009,
      longitude: 73.9116,
      visited: true,
    }),
    makePlace({
      name: 'Anjuna Beach',
      icon: 'umbrella-beach',
      color: colors.cyan,
      latitude: 15.5736,
      longitude: 73.7413,
      visited: true,
    }),
  ],
};

function emit() {
  listeners.forEach((listener) => listener());
}

export const tripData = {
  // ---------------- subscription ----------------
  // (equivalent of addListener / removeListener)
  addListener(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  removeListener(listener) {
    listeners.delete(listener);
  },

  // ---------------- getters ----------------
  get places() {
    return state.places;
  },

  get totalPlaces() {
    return state.places.length;
  },

  get visitedCount() {
    return state.places.filter((p) => p.visited).length;
  },

  get progress() {
    return state.places.length === 0
      ? 0
      : this.visitedCount / state.places.length;
  },

  get nextDestination() {
    return state.places.find((p) => !p.visited) || null;
  },

  // ---------------- actions ----------------
  addPlace(name) {
    state.places = [...state.places, makePlace({ name })];
    emit();
  },

  removePlace(index) {
    state.places = state.places.filter((_, i) => i !== index);
    emit();
  },

  restorePlace(index, place) {
    const next = [...state.places];
    next.splice(Math.min(index, next.length), 0, place);
    state.places = next;
    emit();
  },

  toggleVisited(index, visited) {
    state.places = state.places.map((p, i) =>
      i === index ? { ...p, visited } : p,
    );
    emit();
  },
};

// Re-renders the calling component whenever the trip data changes.
export function useTripData() {
  useSyncExternalStore(
    (cb) => tripData.addListener(cb),
    () => state.places,
  );
  return tripData;
}
