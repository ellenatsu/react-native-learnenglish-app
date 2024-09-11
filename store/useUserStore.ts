import { UserData } from "@/types/types";
import { db } from "@/utils/firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import {create } from "zustand";

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
        console.log("No user data found");
      } else {
        const userdoc = querySnapshot.docs[0];
        const fetchedData = {
          id: userdoc.id as string,
          ...userdoc.data(),
        } as UserData;
        // Store data in Zustand
        set({ userData: fetchedData , loading: false});

        // Cache the fetched user data
        await AsyncStorage.setItem(
          `userData_${userId}`,
          JSON.stringify(fetchedData)
        );
      }
    } catch (error) {
      console.error("Error fetching user:", error);
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
        set({ userData: fetchedData });

        // resset cache
        await AsyncStorage.setItem(`userData_${userId}`, JSON.stringify(fetchedData));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Update the bookmarked words list
  updateBookmarkedWords: (newWord: string) =>
    set((state) => {
      if (!state.userData) return state;
      const bookmarkedWords  = state.userData.bookmarkedWords ?? [];
      const updatedWords = bookmarkedWords.includes(newWord)
        ? bookmarkedWords.filter((word) => word !== newWord)
        : [...bookmarkedWords, newWord];

      return {
        userData: {
          ...state.userData,
          bookmarkedWords: updatedWords,
        },
      };
    }),

  // Update the practiced dates list
  updatePracticedDates: (newDate: string) =>
    set((state) => {
      if (!state.userData) return state;
      const { practicedDates } = state.userData;

      return {
        userData: {
          ...state.userData,
          practicedDates: [...new Set([...practicedDates, newDate])], // Avoid duplicates
        },
      };
    }),

  // Logout function to clear user data
  logout: () => set({ userData: null }),
}));
