import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { UserData } from "@/types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { router } from "expo-router";

const ProfilePage = () => {
  //retrieve user data
  const user = getAuth().currentUser;
  const [userData, setUserData] = useState<UserData | null>(null);

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
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [user]);

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

  if (user && !userData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-lg mb-2">Name: {userData?.name}</Text>
      <Text className="text-lg mb-2">Email: {userData?.email}</Text>
      <Text className="text-lg mb-2">
        Practiced Days: {userData?.practicedDates.length}
      </Text>
      <Text className="text-lg mb-2">
        Words Practiced: {userData?.wordsPracticed.length}
      </Text>

      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg mt-6"
        onPress={() => router.push("/profile/bookmark")}
      >
        <Text className="text-white text-center text-lg">
          View Bookmarked Words
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfilePage;
