import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHtml from "react-native-render-html";
import axios from "axios";

interface GrammarLesson {
  id: string;
  title: string;
  content: string;
  quiz: string;
  answer: string;
}

const LessonPage: React.FC = () => {
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  // ************ Fetch & refetch lesson data from Firestore ************
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        //see if already cached
        const cachedLesson = await AsyncStorage.getItem(`book2_lesson_${id}`);
        if (cachedLesson) {
          setLesson(JSON.parse(cachedLesson));
          setLoading(false);
          return;
        }

        await refetchLessons();
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]);

  const refetchLessons = async () => {
    try {
      //TODO: query grammar lesson from server
      //fetch from server
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/grammarLessons/${id}`);
      const lesson: GrammarLesson = response.data;

      //cache the lesson
      await AsyncStorage.setItem(`book2_lesson_${id}`, JSON.stringify(lesson));

    } catch (error) {
      console.error("Error refetching lesson:", error);
    }
  };

  // ************ Handle refetching lesson data ********
  const handleRefetch = async () => {
    if (!lesson) {
      return;
    }
    //clear cache and list before refetch
    await refetchLessons();
  };

  if (loading) {
    return <Text className="text-center text-lg">Loading...</Text>;
  }

  if (!lesson) {
    return <Text className="text-center text-lg">Lesson not found</Text>;
  }

  return (
    <ScrollView>
      {/* Render the main content */}
      <View className="p-4 bg-white">
        <Text className="text-2xl font-bold mb-4">
          {lesson.id}. {lesson.title}
        </Text>
        <TouchableOpacity onPress={handleRefetch}>
          <Text className="pr-2 border-b border-gray-500">
            Refresh <FontAwesomeIcon icon={faArrowsRotate} />
          </Text>
        </TouchableOpacity>
        <RenderHtml contentWidth={width} source={{ html: lesson.content }} />
      </View>

      {/* Render the quiz section */}
      <View className="p-4 bg-gray-100 border border-gray-300 rounded-lg mt-6">
        <Text className="text-xl font-bold mb-2">Quiz</Text>
        <RenderHtml contentWidth={width} source={{ html: lesson.quiz }} />
      </View>

      {/* View Answer Button */}
      <TouchableOpacity
        onPress={() => {
          setShowAnswer(!showAnswer);
        }}
        className="p-4 bg-blue-500 rounded-lg m-4"
      >
        <Text className="text-white text-center">
          {showAnswer ? "Hide Answer" : "View Answer"}
        </Text>
      </TouchableOpacity>

      {/* Render the answer only if showAnswer is true */}
      {showAnswer && (
        <View className="p-4 bg-gray-200 border border-gray-300 rounded-lg mt-6">
          <Text className="text-xl font-bold mb-2">Answer</Text>
          <RenderHtml contentWidth={width} source={{ html: lesson.answer }} />
        </View>
      )}
    </ScrollView>
  );
};

export default LessonPage;
