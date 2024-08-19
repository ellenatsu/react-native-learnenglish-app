import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { collection, query, getDocs, addDoc } from "firebase/firestore";
import "firebase/firestore";
import { db } from "../../utils/firebase/firebase";

interface Lesson {
  id: string;
  title: string;
  words: string[];
}

const Textbook: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();


  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const q = query(collection(db, "lessons"));
        const querySnapshot = await getDocs(q);
        const lessonsList = querySnapshot.docs.map((doc) => ({
          id: doc.id as string,
          ...doc.data(),
        })) as Lesson[];

        setLessons(lessonsList);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);


 

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="p-4 bg-white">
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/lesson/${item.id}`)}>
            <View className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
              <Text className="text-lg font-bold mb-2">
                Lesson.{item.id} {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

};

export default Textbook;
