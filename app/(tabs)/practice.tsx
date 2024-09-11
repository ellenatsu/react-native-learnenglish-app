import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const PracticePage: React.FC = () => {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold">Flip Card</Text>
      <Text className="text-lg">Select a practice mode</Text>
      <View className="flex flex-row gap-1 bg-white mb-10">
        <TouchableOpacity
          className="bg-blue-400 w-auto p-3 rounded-md"
          onPress={() =>
            router.push("/practice/flipcard-practice?mode=bookmarked")
          }
        >
          <Text className="text-white text-xl text-center">Marked Words</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-blue-500 w-auto p-3 rounded-md"
          onPress={() => router.push("practice/flipcard-practice?mode=all")}
        >
          <Text className="text-white text-xl text-center">All Words</Text>
        </TouchableOpacity>
      </View>

      <Text className='text-2xl font-bold'>Multichoices</Text>
      <Text className='text-lg'>Select a practice mode</Text>
    </View>
  );
};

export default PracticePage;
