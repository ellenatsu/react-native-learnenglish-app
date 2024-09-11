import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";

import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { set } from "date-fns";
import AudioPlayer from "@/components/audioplayer";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

interface NewWord {
  id: string;
  word: string;
  meaning: string;
  phonetic: string;
  audioUrl: string;
}
const AllWordsPage = () => {
  //retrieve user data
  const [loading, setLoading] = useState(true);
  const [allWords, setAllWords] = useState<NewWord[]>([]);

  useEffect(() => {
    //fetch all words
    const fetchAllWords = async () => {
      //try fetch local cache
      const cachedWords = await AsyncStorage.getItem(`allWords`);
      if (cachedWords) {
        setAllWords(JSON.parse(cachedWords));
        setLoading(false);
        return;
      }

      handleRefetch();
    };

    fetchAllWords();
  }, []);

  const handleRefetch = async () => {
    try {
      const q = query(collection(db, "textbook-words"));
      const querySnapshot = await getDocs(q);
      //if cannot find user data
      if (querySnapshot.empty) {
        console.log("No user data found");
      } else {
        const wordsList = querySnapshot.docs.map((doc) => ({
          id: doc.id as string,
          ...doc.data(),
        })) as NewWord[];

        setAllWords(wordsList);
        //Check if the fetched data is different from the current data
          await AsyncStorage.setItem("allWords", JSON.stringify(wordsList));
      }
    } catch (error) {
      console.error("Error fetching all words:", error);
    }finally{
      setLoading(false);
    }
  };

  //TODO: implement toggle bookmark

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  if (allWords.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">No words found, start practicing!</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <TouchableOpacity onPress={handleRefetch}>
        <Text className="pr-2 border-b border-gray-500">Refresh  <FontAwesomeIcon icon={faArrowsRotate} /></Text>
      </TouchableOpacity>
      <FlatList
        data={allWords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex flex-row items-baseline gap-1 border-dotted border-b border-gray-300 p-2">
            <Text className="text-xl text-black">
              {item.word}
            </Text>

            {item.phonetic && (
              <Text className="text-base text-gray-500">({item.phonetic})</Text>
            )}
            {item.audioUrl && (<AudioPlayer audioUri={item.audioUrl} title="" size={16} />)}
            <Text className=" text-base text-gray-800" style={{ flex: 1 }}>
              {item.meaning}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default AllWordsPage;
