import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import FlipCard from "@/components/flipcard";
import { LessonWord } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import { useUserStore } from "@/store/useUserStore";
import { useWordStore } from "@/store/useWordStore";

const FlipCardPracticePage: React.FC = () => {
  const { mode } = useLocalSearchParams();
  const { userData } = useUserStore();
  const { words } = useWordStore();
  const [wordsList, setWordsList] = useState<LessonWord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllWords = async () => {
      setLoading(true);

            // Logging to debug mode and bookmarkedWords
            console.log("Mode:", mode);
            console.log("User Bookmarked Words:", userData?.bookmarkedWords);
      

      if (mode === "all") {
        setWordsList(words);
      } else if (mode === "bookmarked") {
        const bookmarkedWords:string[] = userData?.bookmarkedWords || [];
        setWordsList(
          words.filter((word: LessonWord ) => 
            bookmarkedWords.some((bookmarkedWord) => bookmarkedWord === word.word)
          )
        );
      }
      setLoading(false);
    };

    fetchAllWords();
  }, [mode, userData, words]);

  if (loading) {
    return <Text>Loading...</Text>;
  }
  return (
    <View className="flex-1">
      {/* Render FlipCard component with the fetched words */}
      <FlipCard wordList={wordsList} />
    </View>
  );
};

export default FlipCardPracticePage;
