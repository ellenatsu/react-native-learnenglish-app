import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LessonWord } from "@/types/types"; // Adjust import as necessary
import { useUserStore } from "@/store/useUserStore";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const PracticeSummaryPage: React.FC = () => {
  const { score, total, wrongWords, words } = useLocalSearchParams();
  const parsedWrongWords: LessonWord[] = JSON.parse(wrongWords as string);
  const parsedWords: LessonWord[] = JSON.parse(words as string);
  const { userData, updateBookmarkedWords } = useUserStore();
  const bookmarkedWords = userData?.bookmarkedWords || [];

  // Merge wrong words to the top, followed by correct words
  const sortedWords = [
    ...parsedWrongWords,
    ...parsedWords.filter(
      (word) => !parsedWrongWords.some((wrong) => wrong.word === word.word)
    ),
  ];

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold text-center mb-4">Test Summary</Text>
      <Text className="text-lg text-center mb-4">
        You scored {score}/{total}
      </Text>

      <FlatList
        data={sortedWords}
        renderItem={({ item }) => (
          <View
            className={`p-4 w-full mb-4 rounded-lg ${
              parsedWrongWords.some((wrong) => wrong.word === item.word)
                ? "bg-red-200"
                : "bg-green-200"
            }`}
          >
            <View className="flex flex-row items-center justify-between">
                
            <Text className="text-lg font-bold">{item.word}</Text>
            <Text className="text-md">{item.meaning}</Text>
            <TouchableOpacity onPress={() => updateBookmarkedWords(item.word)}>
              <FontAwesomeIcon
                icon={faStar}
                size={24}
                color={bookmarkedWords.includes(item.word) ? "gold" : "gray"}
              />
            </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.word}
      />
    </View>
  );
};

export default PracticeSummaryPage;
