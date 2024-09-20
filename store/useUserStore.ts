import { UserData } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import { cacheUserData } from "@/utils/cacheData";
import {userJsonData }  from '../constants/theUser';


// Define the store interface
interface UserStore {
  userData: UserData | null;
  loading: boolean;
  setUserData: (userData: UserData) => void;
  fetchUserData: (userId: string) => Promise<void>;
  refreshUserData: (userId: string) => Promise<void>; // Function to refresh user data
  updateBookmarkedWords: (newWord: string) => Promise<void>;
  updatePracticedDates: (newDate: string) => Promise<void>;
  logout: () => void;
}

// Create the Zustand store
export const useUserStore = create<UserStore>((set) => ({
  userData: null,
  loading: false, //for refresh user data

  // Set the full user data, typically after fetching from Firestore
  setUserData: (userData: UserData) => set({ userData }),

  // Fetch user data from Firestore
  fetchUserData: async (userId: string) => {
    set({ loading: true });
    try {
      const cachedUserData = await AsyncStorage.getItem(`userData_${userId}`);

      if (cachedUserData) {
        // Use cached data
        set({ userData: JSON.parse(cachedUserData), loading: false });
        return; // Exit early
      }


      //load data from json
    
      // Store data in Zustand
      set({ userData: userJsonData, loading: false });

      // Attempt to cache the fetched data
      await cacheUserData(userId, userJsonData); // Cache the fetched data
    } catch (error) {
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

      //load data from json

      // Store data in Zustand
      set({ userData: userJsonData, loading: false });

      // resset cache
      await cacheUserData(userId, userJsonData); // Cache the fetched data
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },

  // Update the bookmarked words list
  updateBookmarkedWords: async (newWord: string) =>
    set((state) => {
      if (!state.userData) return state;

      const bookmarkedWords = state.userData.bookmarkedWords ?? [];
      const updatedWords = bookmarkedWords.includes(newWord)
        ? bookmarkedWords.filter((word) => word !== newWord)
        : [...bookmarkedWords, newWord];

      // Update Zustand state first
      const newState = {
        userData: {
          ...state.userData,
          bookmarkedWords: updatedWords,
        },
      };

      return newState; // Return the updated state
    }),

  // Update the practiced dates list
  updatePracticedDates: async (newDate: string) =>
    set((state) => {
      if (!state.userData) return state;
      const { practicedDates } = state.userData;

      // Ensure no duplicates in practicedDates
      const updatedDates = [...new Set([...practicedDates, newDate])];

      // Update Zustand state first
      const newState = {
        userData: {
          ...state.userData,
          practicedDates: updatedDates,
        },
      };

      return newState; // Return updated state
    }),

  // Logout function to clear user data
  logout: () => set({ userData: null }),
}));
