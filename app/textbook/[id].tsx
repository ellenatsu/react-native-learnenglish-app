//display a list of lessons

import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLessonsStore } from "@/store/useLessonsStore";


interface lessonList {
  id: string;
  title: string;
}
const LessonList: React.FC = () => {
  const { id }  = useLocalSearchParams();
  const [lessonlist, setLessonList] = useState<lessonList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const { engLessons, grammarLessons } = useLessonsStore();
  
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        let data : lessonList[] = [];

        switch(id){
          case 'english':
            if (engLessons) {
              engLessons.forEach((l) => data.push({id: l.id, title: l.title}));
            }
            break;
          case 'grammar':
            if (grammarLessons) {
              grammarLessons.forEach((l) => data.push({id: l.id, title: l.title}));
            }
            break;
        }

        // Sort the lessons by numeric part of the ID
        data.sort((a, b) => {
          const numA = parseInt(a.id.replace(/\D/g, ""), 10); // Extract number from 'l1', 'l2', etc.
          const numB = parseInt(b.id.replace(/\D/g, ""), 10);
          return numA - numB; // Compare numerically
        });

        setLessonList(data);
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
        data={lessonlist}
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
