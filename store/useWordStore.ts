import { create } from "zustand";
import { LessonWord } from "@/types/types"; // Your LessonWord type
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { cacheWordData } from "@/utils/cacheData";

interface WordStore {
  words: LessonWord[];
  loading: boolean;
  fetchWords: () => Promise<void>;
  refreshWords: () => Promise<void>;
  //for multiple choices
  getRandomWords: (count: number) => LessonWord[];
  getWordsFromLessons: (start: number, end: number) => LessonWord[];
}

export const useWordStore = create<WordStore>((set, get) => ({
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
      //fetch from server
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/words`
      );
      const wordList = response.data;
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
      //fetch from server
      const response = await axios.get("http://localhost:3000/words");
      console.log("words", response.data);
      const wordList = response.data;
      set({ words: wordList, loading: false });

      await cacheWordData(wordList);
    } catch (error) {
      console.log("Error fetching words:", error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },

  // Get random words
  getRandomWords: (count) => {
    const allWords = get().words;
    return allWords.sort(() => 0.5 - Math.random()).slice(0, count);
  },

  // Get words from specific lessons
  getWordsFromLessons: (start, end) => {
    const allWords = get().words;
    return allWords.filter((word) => {
      const lessonNumber = parseInt(word.ref); // Assuming `ref` contains lesson info
      return lessonNumber >= start && lessonNumber <= end;
    });
  },
}));
