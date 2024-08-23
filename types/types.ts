export interface UserData {
    id: string;
    uid: string;
    email: string;
    practicedDates: string[]; // Array of dates (e.g., ["2024-08-19"])
    wordsPracticed: Word[]; // Array of word IDs or word strings
    bookmarkedItems: {
      words: Word[];
      sentences: string[];
    };
  }
  
  export interface Lesson {
    id: string;
    title: string;
    content: string;
    words: string[]; // Array of word IDs or word strings
    voiceTextFileUrl: string;
    voiceWordsFileUrl: string;
  }
  
  export interface Word {
    id: string;
    name: string;
    chinese: string;
    english: string;
  }
  