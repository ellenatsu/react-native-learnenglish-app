import { create } from "zustand";
import { GrammarLesson, Lesson,} from "@/types/types"; // Your LessonWord type
import * as FileSystem from 'expo-file-system';

interface LessonsStore {
  engLessons: Lesson[] | null;
  grammarLessons: GrammarLesson[] | null;
loadLessons: () => Promise<void>;
  loading: boolean;
}

export const useLessonsStore = create<LessonsStore>((set) => ({
  engLessons: null,
  grammarLessons: null,
  loadLessons: async () => {
    set({ loading: true });
    try {
      //load data from json
      const engfileUri = FileSystem.documentDirectory + 'assets/data/eng-lessons.json';
      const englessonsData = await FileSystem.readAsStringAsync(engfileUri);

      const grafileUri = FileSystem.documentDirectory + 'assets/data/grammar-book.json';
      const gralessonsData = await FileSystem.readAsStringAsync(grafileUri);

      set({ engLessons: JSON.parse(englessonsData), grammarLessons: JSON.parse(gralessonsData),loading: false });

    } catch (error) {
      console.log("Error fetching words:", error);
    } finally {
      set({ loading: false });
    }
  },
  loading: false,
}));
