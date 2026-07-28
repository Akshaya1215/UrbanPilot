import { create } from "zustand";

interface RouteStore {
  query: string;
  geographicResult: unknown;

  setQuery: (query: string) => void;
  setGeographicResult: (result: unknown) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  query: "",
  geographicResult: null,

  setQuery: (query) =>
    set({
      query,
    }),

  setGeographicResult: (result) =>
    set({
      geographicResult: result,
    }),
}));