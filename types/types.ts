export interface UserData {
    id: string; //identify ID .
    uid: string; //move out from firebase, now no use.
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
  

  export interface LessonWord {
    word: string;
    meaning: string;
    phonetic: string;
    audioUrl: string;
    ref: string;
  }
  