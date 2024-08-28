import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

import { router } from "expo-router";

import { useCustomUserContext } from "@/hooks/useCustomUserContext";

const ProfilePage = () => {
  //retrieve user data
  // const user = getAuth().currentUser;
  const { userData, loading } = useCustomUserContext();


  // if (!user) {
  //   return (
  //     <View className="flex-1 justify-center items-center bg-white">
  //       <Text className="text-lg">Please login to view profile</Text>
  //       <View className="items-center pt-40">
  //         <TouchableOpacity
  //           className="p-2 bg-gray-200 rounded-lg"
  //           onPress={() => router.push("/auth/login")}
  //         >
  //           <Text className="text-xl">Go Sign In</Text>
  //         </TouchableOpacity>
  //       </View>
        
  //     </View>
  //   );
  // }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

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
      <Text className="text-lg mb-2">
        Words Practiced: {userData?.wordsPracticed.length}
      </Text>

      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg mt-6"
        onPress={() => router.push("/profile/bookmark")}
      >
        <Text className="text-white text-center text-lg">
          View Bookmarked Words
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-green-500 p-4 rounded-lg mt-6"
        onPress={() => router.push("/profile/practiced-words")}
      >
        <Text className="text-white text-center text-lg">View Practiced Words</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfilePage;
