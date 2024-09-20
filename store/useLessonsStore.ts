import { create } from "zustand";
import { GrammarLesson, Lesson } from "@/types/types"; // Your LessonWord type
import { englessonsData }  from '../constants/engLessons';
import { gralessonsData } from '../constants/grammarBook';


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
      // Use the imported data directly
      set({
        engLessons: englessonsData,
        grammarLessons: gralessonsData,
        loading: false,
      });
    } catch (error) {
      console.log('Error fetching lessons:', error);
    } finally {
      set({ loading: false });
    }
  },
  loading: false,
}));