import { LessonWord, UserData } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Utility function to handle caching user data in AsyncStorage
export const cacheUserData = async (userId: string, data: UserData) => {
    try {
      await AsyncStorage.setItem(`userData_${userId}`, JSON.stringify(data));
  
      
    } catch (error) {
      // Handle AsyncStorage caching error
      
      console.error(`Error caching user data for ${userId}:`, error);
    }
  };

  // Utility function to handle caching user data in AsyncStorage
export const cacheWordData = async (data: LessonWord[]) => {
  try {
    await AsyncStorage.setItem("words", JSON.stringify(data));

  } catch (error) {
    // Handle AsyncStorage caching error
    console.error('Error caching words', error);
  }
};
  
 
  