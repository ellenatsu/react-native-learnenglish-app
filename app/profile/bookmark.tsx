import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { UserData, Word } from "@/types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { router } from "expo-router";
import { set } from "date-fns";

const BookmarkPage = () => {
  //retrieve user data
  const user = getAuth().currentUser;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bookmarkedWords, setBookmarkedWords] = useState<Word[]>([]);

  //will refetch new data in bookmark component
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "users"), where("uid", "==", user?.uid))
        );
        //if cannot find user data
        if (querySnapshot.empty) {
          console.log("No user data found");
        }

        const userdoc = querySnapshot.docs[0];
        const fetchedUserData = {
          id: userdoc.id as string,
          ...userdoc.data(),
        } as UserData;

        if (fetchedUserData) {
            setUserData(fetchedUserData);
            setBookmarkedWords(fetchedUserData.bookmarkedItems.words || []);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [user]);

  //toggle bookmark
    const toggleBookmark = async (currentWord: Word) => {
 //TODO: implement toggle bookmark
    };
    

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Please login to view profile</Text>
        <View className="items-center pt-40">
          <TouchableOpacity
            className="p-2 bg-gray-200 rounded-lg"
            onPress={() => router.push("/auth/login")}
          >
            <Text className="text-xl">Go Sign In</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    );
  }

  if(user && !userData){
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