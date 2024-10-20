import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React from "react";
import { useUserStore } from "@/store/useUserStore";
import { useWordStore } from "@/store/useWordStore";
import { useState } from "react";
import { LessonWord } from "@/types/types";
import { useEffect } from "react";


const BookmarkPage = () => {
  //retrieve user data
  const { userData, updateBookmarkedWords } = useUserStore();
  const bookmarkedWords = userData?.bookmarkedWords || [];
  const { words } = useWordStore();  
  const [wordList, setWordList] = useState<LessonWord[]>(words);

  useEffect(() => {
    setWordList(
      words.filter((word: LessonWord ) => 
        bookmarkedWords.some((bookmarkedWord) => bookmarkedWord === word.word)
      )
    );
  }, [words, bookmarkedWords]);

  if(!userData){
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }


  if (bookmarkedWords.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">No bookmarked words found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
    <Text className="text-3xl font-bold mb-4">Bookmarked Words</Text>
    <FlatList
        data={wordList}
        keyExtractor={(item) => item.word}
        renderItem={({ item }) => (
          <View className="flex flex-row items-baseline gap-2 border-dotted border-b border-gray-300 mb-1">
            <View className="flex flex-row items-baseline ">
              <Text className="text-xl text-black p-1">{item.word}</Text>

              {item.phonetic && (
                <Text className="text-base text-gray-500">
                  ({item.phonetic})
                </Text>
              )}
              {item.audioUrl && (
                <AudioPlayer audioUri={item.audioUrl} title="" size={14} />
              )}
            </View>

            <Text className="text-l text-gray-800 " style={{ flex: 1 }}>
              {item.meaning}
            </Text>
            <TouchableOpacity
              className="pb-3"
              onPress={() => updateBookmarkedWords(item.word)}
            >
              <FontAwesomeIcon
                icon={faStar}
                size={24}
                color={
                  bookmarkedWords.includes(item.word)
                    ? "gold"
                    : "gray"
                }
              />
            </TouchableOpacity>
          </View>
        )}
      />

  </View>
  )
}

export default BookmarkPage