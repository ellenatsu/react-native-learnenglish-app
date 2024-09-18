import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import AudioPlayer from "@/components/audioplayer";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useWordStore } from "@/store/useWordStore";
import { useUserStore } from "@/store/useUserStore";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const AllWordsPage = () => {
  //retrieve user data
  const { userData, updateBookmarkedWords } = useUserStore();
  const { words } = useWordStore();

  const bookmarkedWords = userData?.bookmarkedWords || [];

  //TODO: implement toggle bookmark

  if (words.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">No words found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <FlatList
        data={words}
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
  );
};

export default AllWordsPage;
