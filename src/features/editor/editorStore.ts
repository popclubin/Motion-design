import { create } from 'zustand';
import { getAnimationEntry } from '../../animations/registry';
import { defaultValuesFromSchema, type ParamValues } from '../../animations/_core/params';

const STORAGE_KEY = 'motion-library:params';

function readStoredParams(): Record<string, ParamValues> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStoredParams(paramsBySlug: Record<string, ParamValues>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(paramsBySlug));
  } catch {
    // sessionStorage unavailable (private mode, quota) — params stay in-memory only.
  }
}

function defaultParamsFor(slug: string): ParamValues {
  const entry = getAnimationEntry(slug);
  return entry ? defaultValuesFromSchema(entry.schema) : {};
}

interface EditorState {
  activeSlug: string | null;
  paramsBySlug: Record<string, ParamValues>;
  restartCount: number;
  isPaused: boolean;
  setActiveSlug: (slug: string) => void;
  setParam: (key: string, value: ParamValues[string]) => void;
  setParams: (patch: ParamValues) => void;
  resetParams: () => void;
  restart: () => void;
  setPaused: (paused: boolean) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  activeSlug: null,
  paramsBySlug: readStoredParams(),
  restartCount: 0,
  isPaused: false,

  setActiveSlug: (slug) => {
    const existing = get().paramsBySlug[slug];
    if (existing) {
      set({ activeSlug: slug });
      return;
    }
    set((state) => {
      const paramsBySlug = { ...state.paramsBySlug, [slug]: defaultParamsFor(slug) };
      writeStoredParams(paramsBySlug);
      return { activeSlug: slug, paramsBySlug };
    });
  },

  setParam: (key, value) =>
    set((state) => {
      const slug = state.activeSlug;
      if (!slug) return state;
      const paramsBySlug = {
        ...state.paramsBySlug,
        [slug]: { ...state.paramsBySlug[slug], [key]: value },
      };
      writeStoredParams(paramsBySlug);
      return { paramsBySlug };
    }),

  setParams: (patch) =>
    set((state) => {
      const slug = state.activeSlug;
      if (!slug) return state;
      const paramsBySlug = {
        ...state.paramsBySlug,
        [slug]: { ...state.paramsBySlug[slug], ...patch },
      };
      writeStoredParams(paramsBySlug);
      return { paramsBySlug };
    }),

  resetParams: () =>
    set((state) => {
      const slug = state.activeSlug;
      if (!slug) return state;
      const paramsBySlug = { ...state.paramsBySlug, [slug]: defaultParamsFor(slug) };
      writeStoredParams(paramsBySlug);
      return { paramsBySlug };
    }),

  restart: () => set((state) => ({ restartCount: state.restartCount + 1 })),
  setPaused: (paused) => set({ isPaused: paused }),
}));

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    useEditorStore.getState().setPaused(document.visibilityState === 'hidden');
  });
}
