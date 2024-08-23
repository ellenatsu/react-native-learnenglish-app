import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const PracticeFinishPage = () => {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold mb-6">Congratulations!</Text>
      <Text className="text-xl mb-6">
        You have completed the practice session.
      </Text>
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg"
        onPress={() => router.push("/home")}
      >
        <Text className="text-white text-lg">Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PracticeFinishPage;
