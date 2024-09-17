//display a list of lessons

import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";

interface Lesson {
  id: string;
  title: string;
}

const LessonList: React.FC = () => {
  const { id }  = useLocalSearchParams();
  let collectionName = "";

  switch(id){
    case "english":
      collectionName = "lessons";
      break;
    case "grammar":
      collectionName = "grammar-book";
      break;
    default:
      collectionName = "lessons";
  }
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);
        const lessonsList = querySnapshot.docs.map((doc) => ({
          id: doc.id as string,
          ...doc.data(),
        })) as Lesson[];

        // Sort the lessons by numeric part of the ID
        lessonsList.sort((a, b) => {
          const numA = parseInt(a.id.replace(/\D/g, ""), 10); // Extract number from 'l1', 'l2', etc.
          const numB = parseInt(b.id.replace(/\D/g, ""), 10);
          return numA - numB; // Compare numerically
        });

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
    <View className="pt-40 p-4 bg-white">
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/lesson/${id}/${item.id}`)}>
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

export default LessonList;
