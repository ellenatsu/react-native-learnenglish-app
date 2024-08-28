import { View, Text, Button, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from "@react-navigation/native";
import { getLocalDate } from "@/utils/date";
import { useCustomUserContext } from "@/hooks/useCustomUserContext";
import { Redirect, router } from "expo-router";
import { getAuth } from "firebase/auth";

const HomePage: React.FC = () => {
  const todayDate = getLocalDate();

  //for calendar
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const [isTodayPracticed, setIsTodayPracticed] = useState(false);
  const { userData, loading, refetchUserData } = useCustomUserContext();

  // Use useFocusEffect to refetch data when the Home screen is focused
  useFocusEffect(
    useCallback(() => {
      refetchUserData(); // Refetch user data whenever the screen is focused
    }, [refetchUserData])
  );

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
  }, []);

  const handleSignOut = async () => {
    try {
      await getAuth().signOut();
      console.log("sign out successful");
      router.push("/auth/login");
    } catch (error) {
      console.log("error sign out", error);
    }
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
        <View className="w-full p-4 bg-gray-100 rounded-lg shadow-md mb-3">
          <Text className="text-lg">
            Practiced Days: {userData?.practicedDates.length}
          </Text>
          <Text className="text-lg">
            Words Practiced: {userData?.wordsPracticed.length}
          </Text>
        </View>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  );
};

export default HomePage;
