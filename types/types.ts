export interface UserData {
    id: string;
    uid: string;
    name: string;
    email: string;
    practicedDates: string[]; // Array of dates (e.g., ["2024-08-19"])
    bookmarkedWords: string[]; //Array of word strings
    createdNotes: string[]; // Array of note IDs
  }
  
  export interface Lesson {
    id: string;
    title: string;
    content: string;
    words: string[]; // Array of word strings
    voiceTextFileUrl: string;
    voiceWordsFileUrl: string;
  }
  
  export interface GrammarLesson {
    id: string;
    title: string;
    content: string;
    quiz: string;
    answer: string;
  }
  
  // export interface Word {
  //   id: string;
  //   name: string;
  //   chinese: string;
  //   english: string;
  // }

  export interface LessonWord {
    word: string;
    meaning: string;
    phonetic: string;
    audioUrl: string;
    ref: string;
  }
  