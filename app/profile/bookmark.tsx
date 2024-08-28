import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { UserData, Word } from "@/types/types";
import { useCustomUserContext } from "@/hooks/useCustomUserContext";

const BookmarkPage = () => {
  //retrieve user data
  const { userData, loading } = useCustomUserContext();
  const [bookmarkedWords, setBookmarkedWords] = useState<Word[]>([]);


    // Use useEffect to set data
    useEffect(() => {
      if (userData) {
        setBookmarkedWords(userData.bookmarkedItems.words || []);
      }
    }, []);

  //toggle bookmark
    const toggleBookmark = async (currentWord: Word) => {
 //TODO: implement toggle bookmark
    };
    


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

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
      data={bookmarkedWords}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="p-4 mb-2 bg-gray-100 rounded-lg">
          <Text className="text-lg font-bold">{item.name}</Text>
          <Text className="text-sm">Chinese: {item.chinese}</Text>
          <Text className="text-sm">English: {item.english}</Text>
        </View>
      )}
    />
  </View>
  )
}

export default BookmarkPage