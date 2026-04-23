import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      // Auth / User State
      token: null,
      user: null, // { id, name, step_length }
      storeId: null, // Default store for demo (from seed)
      isCalibrated: false,

      // Actions
      setAuth: (token, user) =>
        set({ token, user, isCalibrated: user?.step_length !== 0.75 }),
      logout: () => set({ token: null, user: null, isCalibrated: false }),
      setCalibration: (step_length) =>
        set((state) => ({
          user: { ...state.user, step_length },
          isCalibrated: true,
        })),
      setStoreId: (storeId) => set({ storeId }),
    }),
    {
      name: "ai-store-storage", // name of the item in the storage (must be unique)
    },
  ),
);

export default useStore;
