import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Button } from "react-native";
import { useRouter } from "expo-router";
import { useWordStore } from "@/store/useWordStore";

const PracticePage: React.FC = () => {
  const router = useRouter();
  const [startLesson, setStartLesson] = useState("");
  const [endLesson, setEndLesson] = useState("");

  const { getRandomWords, getWordsFromLessons } = useWordStore();

  const startLessonTest = () => {
    const start = parseInt(startLesson);
    const end = parseInt(endLesson);
    const wordsList = getWordsFromLessons(start, end);
    router.push({
      pathname: "/practice/multichoice-practice",
      params: { mode: "random", words: JSON.stringify(wordsList) }, // Pass dataset via params
    });
  };

  const startRandomTest = () => {
    const wordsList = getRandomWords(20);
    router.push({
      pathname: "/practice/multichoice-practice",
      params: { mode: "lessons", words: JSON.stringify(wordsList) }, // Pass dataset via params
    });
  };
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold">Flip Card</Text>
      <Text className="text-lg">Select a practice mode</Text>
      <View className="flex flex-row gap-1 bg-white mb-10">
        <TouchableOpacity
          className="bg-blue-400 w-auto p-3 rounded-md"
          onPress={() =>
            router.push({
              pathname: "/practice/flipcard-practice",
              params: { mode: "bookmarked"}, 
          })
          }
        >
          <Text className="text-white text-xl text-center">Marked Words</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-blue-500 w-auto p-3 rounded-md"
          onPress={() => router.push(({
            pathname: "/practice/flipcard-practice",
            params: { mode: "all"}, 
        }))}
        >
          <Text className="text-white text-xl text-center">All Words</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-2xl font-bold">Multichoices</Text>

      <View className="w-3/4 rounded-lg items-center">
        <Text className="text-lg font-bold mt-4">1. random 20 words</Text>
        <Button
          title="Start Random Word Test"
          onPress={startRandomTest}
          color="#6A0DAD"
        />

        <Text className="text-lg font-bold mt-4">2. words from lessons:</Text>
        <View className="flex flex-row bg-white mb-2">
          <TextInput
            placeholder="Start at lesson #"
            value={startLesson}
            onChangeText={setStartLesson}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 mr-2"
          />
          <TextInput
            placeholder="End at lesson #"
            value={endLesson}
            onChangeText={setEndLesson}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 ml-2"
          />
        </View>

        <Button
          title="2. Start Lesson Test"
          onPress={startLessonTest}
          color="#6A0DAD"
        />
      </View>
    </View>
  );
};

export default PracticePage;
