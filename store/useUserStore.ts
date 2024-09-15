import { UserData } from "@/types/types";
import { db } from "@/utils/firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import * as Sentry from "@sentry/react-native";

import { cacheUserData } from "@/utils/cacheData";

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

      const q = query(collection(db, "users"), where("uid", "==", userId));
      const querySnapshot = await getDocs(q);
      //if cannot find user data
      if (querySnapshot.empty) {
        console.log("No user data found in Firestore");
        Sentry.captureMessage(`No user data found for userId: ${userId}`);
      } else {
        const userdoc = querySnapshot.docs[0];
        const fetchedData = {
          id: userdoc.id as string,
          ...userdoc.data(),
        } as UserData;
        // Store data in Zustand
        set({ userData: fetchedData, loading: false });

        // Attempt to cache the fetched data
        await cacheUserData(userId, fetchedData); // Cache the fetched data
      }
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

      const q = query(collection(db, "users"), where("uid", "==", userId));
      const querySnapshot = await getDocs(q);
      //if cannot find user data
      if (querySnapshot.empty) {
        console.log("No user data found");
      } else {
        const userdoc = querySnapshot.docs[0];
        const fetchedData = {
          id: userdoc.id as string,
          ...userdoc.data(),
        } as UserData;
        // Store data in Zustand
        set({ userData: fetchedData, loading: false });

        // resset cache
        await cacheUserData(userId, fetchedData); // Cache the fetched data
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },

  // Update the bookmarked words list
  updateBookmarkedWords: (newWord: string) =>
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

      // Persist the update to Firestore
      const updateFirestore = async () => {
        try {
          const userDocRef = doc(db, "users", state.userData!.id);
          await updateDoc(userDocRef, {
            bookmarkedWords: updatedWords,
          });

          //track
          // Capture success breadcrumb in Sentry
          Sentry.addBreadcrumb({
            category: "firestore",
            message: `Bookmarked words successfully updated for user ${
              state.userData!.id
            }`,
            level: "info",
          });

          console.log("Bookmarked words updated in Firestore successfully");
        } catch (error) {
          console.error("Error updating bookmarked words in Firestore:", error);
          Sentry.captureException(error);
        }
      };

      // Call Firestore update function
      updateFirestore();

      return newState; // Return the updated state
    }),

  // Update the practiced dates list
  updatePracticedDates: (newDate: string) =>
    set((state) => {
      if (!state.userData) return state;
      const { practicedDates } = state.userData;

      // Ensure no duplicates in practicedDates
      const updatedDates = [...new Set([...practicedDates, newDate])];

      // Update Zustand state
      set({
        userData: {
          ...state.userData,
          practicedDates: updatedDates,
        },
      });

      // Persist the update to Firestore
      const updateFirestore = async () => {
        try {
          const userDocRef = doc(db, "users", state.userData!.id);
          await updateDoc(userDocRef, {
            practicedDates: updatedDates,
          });
          console.log("Practiced dates updated in Firestore successfully");
        } catch (error) {
          console.error("Error updating practiced dates in Firestore:", error);
          Sentry.captureException(error);
        }
      };

      // Call Firestore update function
      updateFirestore();

      return state; // Return updated state
    }),

  // Logout function to clear user data
  logout: () => set({ userData: null }),
}));
