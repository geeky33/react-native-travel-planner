import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

// ==========================================================
// UI HELPER  (React Native replacement for the Dart DomHelper)
//
// React Native has no browser DOM, so each DomHelper method is
// mapped to its React Native equivalent:
//
//   setPageTitle       -> screen/window title (document.title on web)
//   updateStatus       -> floating status box (<StatusToast />)
//   updateElementText  -> changes the text of a registered element
//   toggleClass        -> toggles a named style on a registered element
//   removeElement      -> hides a registered element
//
// Every call updates a small shared store and the components that
// subscribe to it re-render (state -> UI, the React way).
// ==========================================================

const listeners = new Set();

let state = {
  pageTitle: 'TravelMate',
  status: null, // { message, key }
  elements: {}, // id -> { text, removed, classes: [] }
};

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function patchElement(id, patch) {
  const current = state.elements[id] || { classes: [] };
  setState({
    elements: { ...state.elements, [id]: { ...current, ...patch } },
  });
}

export const UiHelper = {
  // ==========================================================
  // CHANGE PAGE TITLE
  // ==========================================================
  setPageTitle(title) {
    setState({ pageTitle: title });

    // Real browser title when running on web.
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = title;
    }
  },

  // ==========================================================
  // CREATE / UPDATE STATUS ELEMENT
  // ==========================================================
  updateStatus(message) {
    setState({ status: { message, key: Date.now() } });
  },

  // ==========================================================
  // UPDATE ELEMENT TEXT
  // ==========================================================
  updateElementText(id, text) {
    patchElement(id, { text });
  },

  // ==========================================================
  // TOGGLE CSS CLASS  (named style variant)
  // ==========================================================
  toggleClass(id, className) {
    const current = state.elements[id] || { classes: [] };
    const has = current.classes.includes(className);

    patchElement(id, {
      classes: has
        ? current.classes.filter((c) => c !== className)
        : [...current.classes, className],
    });
  },

  // ==========================================================
  // REMOVE ELEMENT
  // ==========================================================
  removeElement(id) {
    patchElement(id, { removed: true });
  },

  // ---------------- store plumbing ----------------
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState() {
    return state;
  },
};

// Backwards-compatible alias so the code reads like the Flutter version.
export const DomHelper = UiHelper;

export function useUiState() {
  return useSyncExternalStore(UiHelper.subscribe, UiHelper.getState);
}

// State of one registered element (see updateElementText etc.).
export function useUiElement(id) {
  const ui = useUiState();
  return ui.elements[id] || { classes: [] };
}
