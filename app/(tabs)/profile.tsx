import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

import { router } from "expo-router";
import { useUserStore } from "@/store/useUserStore";


const ProfilePage = () => {
  //retrieve user data
  const { userData } = useUserStore();


  if (!userData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">No user data available.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-lg mb-2">Name: {userData?.name}</Text>
      <Text className="text-lg mb-2">Email: {userData?.email}</Text>
      <Text className="text-lg mb-2">
        Practiced Days: {userData?.practicedDates.length}
      </Text>
      <TouchableOpacity
        className="bg-green-500 p-4 rounded-lg mt-6"
        onPress={() => router.push("/profile/allwords")}
      >
        <Text className="text-white text-center text-lg">View All Words</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg mt-6"
        onPress={() => router.push("/profile/bookmark")}
      >
        <Text className="text-white text-center text-lg">
          View Bookmarked Words
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfilePage;
