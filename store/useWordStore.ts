import { create } from "zustand";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase"; // Firestore setup
import { LessonWord } from "@/types/types"; // Your LessonWord type
import AsyncStorage from "@react-native-async-storage/async-storage";

import { cacheWordData } from "@/utils/cacheData";

interface WordStore {
  words: LessonWord[];
  loading: boolean;
  fetchWords: () => Promise<void>;
  refreshWords: () => Promise<void>;
}

export const useWordStore = create<WordStore>((set) => ({
  words: [],
  loading: false,

  // Fetch words from Firestore and store in Zustand
  fetchWords: async () => {
    set({ loading: true });
    try {
        //check cache
        const cachedWords = await AsyncStorage.getItem("words");
        if (cachedWords) {
          set({ words: JSON.parse(cachedWords) });
          return;
        }
        
      const querySnapshot = await getDocs(collection(db, "textbook-words"));
      const wordList: LessonWord[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as LessonWord[];
      set({ words: wordList, loading: false });
    } catch (error) {
      console.log("Error fetching words:", error);
    } finally {
      set({ loading: false });
    }
  },

  refreshWords: async () => {
    set({ loading: true });
    try {
      //remove cache
      await AsyncStorage.removeItem("words");

      const querySnapshot = await getDocs(collection(db, "textbook-words"));
      const wordList: LessonWord[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as LessonWord[];
      set({ words: wordList, loading: false });
      
      await cacheWordData(wordList);

    } catch (error) {
      console.log("Error fetching words:", error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },
}));
