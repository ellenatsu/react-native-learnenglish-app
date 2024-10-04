import { UserData } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import { cacheUserData } from "@/utils/cacheData";
import axios from "axios";
import { parseJwt } from "@/utils/jwt";

// Define the store interface
interface UserStore {
  userData: UserData | null;
  token: string | null; //jwt token
  loading: boolean;
  setUserData: (userData: UserData) => void;
  initializeUserData: () => Promise<void>;
  refreshUserData: (userId: string) => Promise<void>; // Function to refresh user data
  updateBookmarkedWords: (newWord: string) => void;
  updatePracticedDates: (newDate: string) => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the Zustand store
export const useUserStore = create<UserStore>((set, get) => ({
  userData: null,
  token: null,
  loading: false, //for refresh user data

  // Set the full user data, typically after fetching from Firestore
  setUserData: (userData: UserData) => set({ userData }),

  //init user data using jwt token and cache
  initializeUserData: async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const userData = await AsyncStorage.getItem("userData");

      if (token && userData) {
        const decodedToken = parseJwt(token);

        // Check if decoding was successful and decodedToken has an exp property
        if (decodedToken && decodedToken.exp) {
          const currentTime = Math.floor(Date.now() / 1000);

          if (decodedToken.exp < currentTime) {
            // Token has expired
            await get().logout();
            return;
          }
          // Update Zustand state
          set({ userData: JSON.parse(userData), token });
        } else {
          // Handle case where token is invalid or cannot be parsed
          console.log("error: Invalid token");
          await get().logout();
        }
      }else {
        // Handle case where no token or userData is found
        console.log("No token or user data found");
      }
    } catch (error) {
      console.log("Error initializing user:", error);
      // Optionally, clear storage or handle errors
    }
  },

  // Fetch the latest user data from server and update Zustand + cache
  refreshUserData: async (userId: string) => {
    const { token } = get();
    set({ loading: true });
    try {
      // Clear cache
      await AsyncStorage.removeItem(`userData`);

      //TODO: same thing from above, fetch data from backend server
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/{userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${state.userData.id}/updateBookmarkedWords`,
        {
          word: newWord,
          action: isBookmarked ? "remove" : "add",
        },
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
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
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${state.userData.id}/addDate`,
        {
          date: newDate,
        },
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

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

  // Register function to create a new user
  register: async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/register`,
        {
          email,
          password,
          name,
        }
      );
      //get token and userdata
      const { token, userdata } = response.data;
      //store jwt token
      await AsyncStorage.setItem("jwtToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userdata));
      // Update Zustand state
      set({ userData: userdata, token });
    } catch (error) {
      console.error("Error registering user:", error);
    }
  },

  // Login function to authenticate user
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/login`,
        {
          email,
          password,
        }
      );
      console.log("login resp", response.data);

      //get token and userdata
      const { token, userdata } = response.data;
      //store jwt token
      await AsyncStorage.setItem("jwtToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userdata));

      // Update Zustand state
      set({ userData: userdata, token });
    } catch (error) {
      console.error("Error logging in:", error);
    }
  },

  // Logout function to clear user data
  logout: () => async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem("jwtToken");
      await AsyncStorage.removeItem("userData");

      // Remove the token from axios headers
      delete axios.defaults.headers.common["Authorization"];

      // Update Zustand state
      set({ userData: null, token: null });
    } catch (error) {
      console.error("Logout error:", error);
      // Optionally, handle errors
    }
  },
}));
