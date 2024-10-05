import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LessonWord } from "@/types/types"; // Import your LessonWord type
import { getLocalDate } from "@/utils/date";
import { useUserStore } from "@/store/useUserStore";

const PracticeMultiChoicePage: React.FC = () => {
  const router = useRouter();
  const { words } = useLocalSearchParams(); // Get words from params
  const parsedWords: LessonWord[] = JSON.parse(words as string);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<null | string>(null);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<null | string>(null);
  const [wrongWords, setWrongWords] = useState<LessonWord[]>([]); // Track incorrect answers
  
  const currentWord = parsedWords[currentIndex];

  const { userData, updatePracticedDates } = useUserStore();

  const generateOptions = () => {
    const wrongOptions = parsedWords
      .filter((word) => word.meaning !== currentWord.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    return [...wrongOptions, currentWord].sort(() => 0.5 - Math.random());
  };

  const [options, setOptions] = useState(generateOptions());

  useEffect(() => {
    setOptions(generateOptions());
    setSelectedAnswer(null);
    setFeedback(null);
  }, [currentIndex]);

  const handleAnswer = (selected: string) => {
    if (selected === currentWord.meaning) {
      setScore((prev) => prev + 1);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
      setWrongWords((prev) => [...prev, currentWord]); // Add wrong words to track
    }
    setSelectedAnswer(selected);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < parsedWords.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!userData) {
        console.error("User data not found");
        setFinished(true);
        return;
      }
      //handle update practiced date
      const today = getLocalDate();
      updatePracticedDates(today);
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-xl font-bold">Test Finished!</Text>
        <Text className="text-2xl mt-2 p-4">
          You scored {score}/{parsedWords.length}
        </Text>
        <Button
          title="See Summary"
          onPress={() =>
            router.push({
              pathname: "/practice/summary",
              params: {
                score,
                total: parsedWords.length,
                wrongWords: JSON.stringify(wrongWords),
                words: JSON.stringify(parsedWords),
              },
            })
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-4 bg-white">
      <Text className="text-3xl font-bold mb-4 mt-5">{currentWord.word}</Text>
      <FlatList
        data={options}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleAnswer(item.meaning)}
            className={`p-4 w-80 mb-4 rounded-lg text-center border-2 ${
              selectedAnswer === item.meaning
                ? feedback === "correct"
                  ? "bg-green-500"
                  : "bg-red-500"
                : "bg-gray-50"
            }`}
          >
            <Text className="text-lg text-center p-2">{item.meaning}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.meaning}
      />

      {selectedAnswer && (
        <View className="absolute bottom-80 w-full items-center">
          <TouchableOpacity
          className="bg-gray-600 w-1/2 p-3 rounded-md"
          onPress={nextQuestion}
        >
          <Text className="text-white text-xl text-center">Next</Text>
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PracticeMultiChoicePage;
