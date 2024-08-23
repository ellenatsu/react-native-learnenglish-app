import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { Calendar } from "react-native-calendars";
import { UserData } from "@/types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { useFocusEffect } from "@react-navigation/native";
import { getLocalDate } from "@/utils/date";
import { useIsFocused } from "@react-navigation/native"; // Use this hook to check if the screen is focused

const HomePage: React.FC = () => {
  const user = getAuth().currentUser;
  const todayDate = getLocalDate();
  const [userData, setUserData] = useState<UserData | null>(null);
  //for calendar
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isTodayPracticed, setIsTodayPracticed] = useState(false);

  const isFocused = useIsFocused(); // Check if the screen is currently focused

  //fetch practiced date data
  useEffect(() => {
    if (isFocused) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const querySnapshot = await getDocs(
            query(collection(db, "users"), where("uid", "==", user?.uid))
          );
          //if cannot find user data
          if (querySnapshot.empty) {
            console.log("No user data found");
          }

          const userdoc = querySnapshot.docs[0];
          const fetchedUserData = {
            id: userdoc.id as string,
            ...userdoc.data(),
          } as UserData;

          if (fetchedUserData) {
            setUserData(fetchedUserData);
            markPracticedDates(userData?.practicedDates || [], todayDate);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [isFocused, user]); // Re-run this effect whenever the page is focused

  const markPracticedDates = (dates: string[], today: string) => {
    const newMarkedDates: { [date: string]: any } = {};
    console.log("today", today);

    // Add blue background for marked dates
    dates.forEach((date) => {
      newMarkedDates[date] = {
        selected: true,
        marked: true,
        selectedColor: "#87ceeb", // Blue background
      };
    });

    // Ensure today always has a red dot
    if (newMarkedDates[today]) {
      setIsTodayPracticed(true);
    } else {
      newMarkedDates[today] = {};
    }

    newMarkedDates[today].dots = [{ key: "today", color: "red" }]; // Red dot for today

    setMarkedDates(newMarkedDates);
  };

  const handleSignOut = async () => {
    try {
      await getAuth().signOut();
      console.log("sign out successful");
      router.push("/auth/login");
    } catch (error) {
      console.log("error sign out", error);
    }
  };

  if (user && (loading || !userData)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="pt-20 flex gap-8">
      {user ? (
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
          <TouchableOpacity
            className=" bg-gray-200 rounded-lg items-center p-2 mt-3"
            onPress={() => handleSignOut()}
          >
            <Text>Log out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center pt-40">
          <TouchableOpacity
            className="p-2 bg-gray-200 rounded-lg"
            onPress={() => router.push("/auth/login")}
          >
            <Text className="text-xl">Go Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HomePage;
