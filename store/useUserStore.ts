import { UserData } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";
import * as Sentry from "@sentry/react-native";

import { cacheUserData } from "@/utils/cacheData";
import axios from "axios";

// Define the store interface
interface UserStore {
  userData: UserData | null;
  loading: boolean;
  setUserData: (userData: UserData) => void;
  fetchUserData: (userId: string) => Promise<void>;
  refreshUserData: (userId: string) => Promise<void>; // Function to refresh user data
  updateBookmarkedWords: (newWord: string) => void;
  updatePracticedDates: (newDate: string) => void;
  logout: () => void;
}

// Create the Zustand store
export const useUserStore = create<UserStore>((set, get) => ({
  userData: null,
  loading: false, //for refresh user data

  // Set the full user data, typically after fetching from Firestore
  setUserData: (userData: UserData) => set({ userData }),

  // Fetch user data from Firestore
  fetchUserData: async (userId: string) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const cachedUserData = await AsyncStorage.getItem(`userData_${userId}`);

      if (cachedUserData) {
        // Use cached data
        set({ userData: JSON.parse(cachedUserData), loading: false });
        return;
      }

      //TODO: query user data from server
      const response = await axios.get(`http://10.0.0.77:3000/users/${userId}`);
      console.log("user data", await response.data);
      const fetchedData: UserData = await response.data;
      // Store data in Zustand
      set({ userData: fetchedData, loading: false });

      // Attempt to cache the fetched data
      await cacheUserData(userId, fetchedData); // Cache the fetched data
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error fetching user:", error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch the latest user data from Firestore and update Zustand + cache
  refreshUserData: async (userId: string) => {
    set({ loading: true });
    try {
      // Clear cache
      await AsyncStorage.removeItem(`userData_${userId}`);

      //TODO: same thing from above, fetch data from backend server
      const response = await axios.get(
        "http://10.0.0.77:3000/users/IpHNykE9t4Wr5n0p55L1"
      );
      console.log("user data", await response.data);
      const fetchedData: UserData = await response.data;
      // Store data in Zustand
      set({ userData: fetchedData, loading: false });
      // Attempt to cache the fetched data
      await cacheUserData(userId, fetchedData); // Cache the fetched data
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },

  //TODO: rewrite the logic to change bookmark in backend server
  updateBookmarkedWords: async (newWord: string) => {
    const state = get();

    if (!state.userData) return;

    const bookmarkedWords = state.userData.bookmarkedWords ?? [];
    const isBookmarked = bookmarkedWords.includes(newWord);

    // Post to the backend server first
    try {
      await axios.post(
        `http://10.0.0.77:3000/users/${state.userData.id}/updateBookmarkedWords`,
        {
          word: newWord,
          action: isBookmarked ? "remove" : "add",
        }
      );

      // Update the state after successful server update
      const updatedWords = isBookmarked
        ? bookmarkedWords.filter((word) => word !== newWord)
        : [...bookmarkedWords, newWord];

      set({
        userData: {
          ...state.userData,
          bookmarkedWords: updatedWords,
        },
      });
    } catch (error) {
      console.error("Error updating bookmarked words on server:", error);
      // Optionally handle the error in the UI
    }
  },

  // Update the practiced dates list
  updatePracticedDates: async (newDate: string) => {
    const state = get();
    if (!state.userData) return state;
    const { practicedDates } = state.userData;

    // Ensure no duplicates in practicedDates
    const updatedDates = [...new Set([...practicedDates, newDate])];

    //post to server first
    try {
      await axios.post(`http://10.0.0.77:3000/users/${state.userData.id}/addDate`, {
        date: newDate,
      });

      // // Update the state after successful server update
      set({
        userData: {
          ...state.userData,
          practicedDates: updatedDates,
        },
      });
    } catch (error) {
      console.error("Error updating practiced dates on server:", error);
      // Optionally handle the error in the UI
    }
  },

  // Logout function to clear user data
  logout: () => set({ userData: null }),
}));
