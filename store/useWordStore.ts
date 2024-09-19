import { create } from "zustand";
import { LessonWord } from "@/types/types"; // Your LessonWord type
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
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

      //load data from json
      const fileUri =
        FileSystem.documentDirectory + "assets/data/textbook-words.json";
      const lessonsData = await FileSystem.readAsStringAsync(fileUri);
      const parsedData = JSON.parse(lessonsData);

      set({ words: parsedData, loading: false });
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

      //load data from json
      const fileUri =
        FileSystem.documentDirectory + "assets/data/textbook-words.json";
      const lessonsData = await FileSystem.readAsStringAsync(fileUri);
      const parsedData = JSON.parse(lessonsData);

      set({ words: parsedData, loading: false });

      await cacheWordData(parsedData);
    } catch (error) {
      console.log("Error fetching words:", error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },
}));
