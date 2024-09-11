import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import FlipCard from "@/components/flipcard";
import { LessonWord } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { useUserStore } from "@/store/useUserStore";

const FlipCardPracticePage: React.FC = () => {
  const { mode } = useLocalSearchParams();
  const { userData } = useUserStore();
  const [allWords, setAllWords] = useState<LessonWord[]>([]);
  const [words, setWords] = useState<LessonWord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllWords = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "textbook-words"))
        );
        //if bookmarked words is null
        if (querySnapshot.empty) {
          setAllWords([]);
        }else{
          let wordsList = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
          })) as LessonWord[];
  
          setAllWords(wordsList);
  
          if(mode === "all"){
            setWords(wordsList);
          } else if(mode === "bookmarked"){
            const bookmarkedWords = userData?.bookmarkedWords || [];
            setWords(wordsList.filter((word) => bookmarkedWords.includes(word.word)));
          }
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }finally{
        setLoading(false);
      }
    };
    fetchAllWords();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }
  return (
    <View className="flex-1">
      {/* Render FlipCard component with the fetched words */}
      <FlipCard wordList={words} />
    </View>
  );
};

export default FlipCardPracticePage;
