import { create } from "zustand";
import { GrammarLesson, Lesson, LessonWord } from "@/types/types"; // Your LessonWord type
import AsyncStorage from "@react-native-async-storage/async-storage";

import { cacheWordData } from "@/utils/cacheData";

interface LessonsStore {
  engLessons: Lesson[];
  grammarLessons: GrammarLesson[];
  loading: boolean;
}

export const useLessonsStore = create<LessonsStore>((set) => ({
  engLessons: require("../assets/data/eng-lessons.json"),
  grammarLessons: require("../assets/data/grammar-book.json"),
  loading: false,
}));
