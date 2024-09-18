import { View, Text, Button, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { getLocalDate } from "@/utils/date";
import { router } from "expo-router";
import * as Sentry from "@sentry/react-native";

import { auth} from "@/utils/firebase/firebase";
import { useUserStore } from "@/store/useUserStore";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowsRotate, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useWordStore } from "@/store/useWordStore";

import AudioPlayer from "@/components/audioplayer";

const HomePage: React.FC = () => {
  const todayDate = getLocalDate();
  //zustand user data
  const { userData, fetchUserData, refreshUserData, loading, logout } =
    useUserStore();

  const { fetchWords, refreshWords } = useWordStore();

  //for calendar
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const [isTodayPracticed, setIsTodayPracticed] = useState(false);

  //get user id
  const userId = auth.currentUser?.uid || ""; 

  //fetch user data
  useEffect(() => {
   // Start a manual transaction
  Sentry.startSpan(
    {
      name: "fetchUserData",
    },
    (span) => {
      fetchUserData(userId);
      // Finish the transaction
      if (span) {
        span.end();
      }
    }
  )
  }, [userId]);

  //fetch words
  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Use useEffect to update markedDates and isTodayPracticed when userData changes
  useEffect(() => {
    if (userData) {
      const newMarkedDates: { [date: string]: any } = {};

      // Mark dates from practicedDates
      userData.practicedDates.forEach((date) => {
        newMarkedDates[date] = {
          selected: true,
          marked: true,
          selectedColor: "#87ceeb", // Blue background
        };
      });

      // Check if today is practiced
      if (newMarkedDates[todayDate]) {
        setIsTodayPracticed(true);
      } else {
        setIsTodayPracticed(false);
        newMarkedDates[todayDate] = {};
      }

      // Always add a red dot for today
      newMarkedDates[todayDate].dots = [{ key: "today", color: "red" }];

      setMarkedDates(newMarkedDates);
    }
  }, [userData, todayDate]);
  
  //*** loading state sentry track */
  useEffect(() => {
    if (!loading && userData) {
      Sentry.addBreadcrumb({
        category: "loading",
        message: "Loading finished, user data is available",
        level: "info",
      });
    } else {
      Sentry.addBreadcrumb({
        category: "loading",
        message: "Still loading user data",
        level: "info",
      });
    }
  }, [loading, userData]);
  

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      //zustand logout
      logout();
      console.log("sign out successful");
      router.push("/auth/login");
    } catch (error) {
      console.log("error sign out", error);
    }
  };

  const handleUserRefresh = () => {
    refreshUserData(userId);
  };

  const handlePullUpdate = async () => {
    refreshWords();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  if (!loading && !userData) {
    return (
      <View className="flex items-center p-20">
        <TouchableOpacity
          className="p-3 text-xl mb-3"
          onPress={() => router.push("/auth/login")}
        >
          <Text className="text-xl">Go login in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="pt-20 flex gap-8">
      <View className="flex gap-3 text-xl p-2 items-center">
        <Text className="text-3xl font-bold mb-4">
          Welcome, {userData?.name}
        </Text>
        <AudioPlayer audioUri="./assets/audio/L1words" title="Listen to Text" size={32} />

        <TouchableOpacity
          onPress={handlePullUpdate}
          className="bg-purple-300 p-2"
        >
          <Text className="border-b text-xl">
            Get Latest Update <FontAwesomeIcon icon={faDownload} />
          </Text>
        </TouchableOpacity>

        {isTodayPracticed ? (
          <Text className="text-2xl font-semibold mb-4 text-green-600">
            You've done today's practice! Good job!
          </Text>
        ) : (
          <Text className="text-xl font-semibold mb-4">
            Keep up the good work!
          </Text>
        )}
        <Calendar
          current={todayDate} // Use the formatted date for current date
          markedDates={markedDates}
          markingType={"multi-dot"} // Use multi-dot for handling multiple dots (today + any others)
          theme={{
            todayTextColor: "#00adf5",
            arrowColor: "orange",
            monthTextColor: "#1e90ff",
            textMonthFontWeight: "bold",
          }}
        />
        <View className="flex flex-row gap-3 w-full p-4 bg-gray-100 rounded-lg shadow-md mb-3">
          <Text className="text-lg">
            Practiced Days: {userData?.practicedDates.length}
          </Text>
          <TouchableOpacity
            onPress={handleUserRefresh}
            className="bg-purple-200 p-2"
          >
            <Text className="border-b text-l">
              Refresh <FontAwesomeIcon icon={faArrowsRotate} />
            </Text>
          </TouchableOpacity>
        </View>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  );
};

export default HomePage;
