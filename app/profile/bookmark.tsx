import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { UserData, LessonWord } from "@/types/types";
import { useUserStore } from "@/store/useUserStore";


const BookmarkPage = () => {
  //retrieve user data
  const { userData, updateBookmarkedWords } = useUserStore();
  const bookmarkedWords = userData?.bookmarkedWords || [];  



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
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <View className="p-4 mb-2 bg-gray-100 rounded-lg">
          <Text className="text-lg font-bold">{item}</Text>
          <TouchableOpacity
            onPress={() => updateBookmarkedWords(item)}
          ></TouchableOpacity>
        </View>
      )}
    />
  </View>
  )
}

export default BookmarkPage