import { LessonWord, UserData } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";

// Utility function to handle caching user data in AsyncStorage
export const cacheUserData = async (userId: string, data: UserData) => {
    try {
      await AsyncStorage.setItem(`userData_${userId}`, JSON.stringify(data));
  
      // Log success in Sentry
      Sentry.addBreadcrumb({
        category: "cache",
        message: `User data cached successfully for ${userId}`,
        level: "info",
      });
    } catch (error) {
      // Handle AsyncStorage caching error
      Sentry.captureException(error);
      console.error(`Error caching user data for ${userId}:`, error);
    }
  };

  // Utility function to handle caching user data in AsyncStorage
export const cacheWordData = async (data: LessonWord[]) => {
  try {
    await AsyncStorage.setItem("words", JSON.stringify(data));

    // Log success in Sentry
    Sentry.addBreadcrumb({
      category: "cache",
      message: "Word data cached successfully",
      level: "info",
    });
  } catch (error) {
    // Handle AsyncStorage caching error
    Sentry.captureException(error);
    console.error('Error caching words', error);
  }
};
  
 
  