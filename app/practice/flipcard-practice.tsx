import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import FlipCard from "@/components/flipcard";
import { LessonWord } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import { useUserStore } from "@/store/useUserStore";
import { useWordStore } from "@/store/useWordStore";
import { set } from "date-fns";

const FlipCardPracticePage: React.FC = () => {
  const { mode } = useLocalSearchParams();
  const { userData } = useUserStore();
  const { words } = useWordStore();
  const [pwords, setPwords] = useState<LessonWord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if(mode === "all"){
      setPwords(words);
    } else if(mode === "bookmarked"){
      const bookmarkedWords = userData?.bookmarkedWords || [];
      setPwords(words.filter((word) => bookmarkedWords.includes(word.word)));
    }

    setLoading(false);

  }, [mode, words, userData]);

  if (loading) {
    return <Text>Loading...</Text>;
  }
  return (
    <View className="flex-1">
      {/* Render FlipCard component with the fetched words */}
      <FlipCard wordList={pwords} />
    </View>
  );
};

export default FlipCardPracticePage;
