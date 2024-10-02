import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Markdown from "react-native-markdown-display";
import { LessonWord } from "@/types/types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowsRotate,
  faHandPointRight,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import AudioPlayer from "@/components/audioplayer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FlipCard from "@/components/flipcard";

interface Lesson {
  id: string;
  title: string;
  text: string;
  Words: LessonWord[];
  voiceTextFileUrl: string;
  voiceWordsFileUrl: string;
}

const LessonPage: React.FC = () => {
  const [lesson, setLesson] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const { id, q } = useLocalSearchParams();
  const [searchWord, setSearchWord] = useState<string>("");

  //for highlight search result, q: search word
  useEffect(() => {
    if (q) {
      // If 'q' exists, trigger highlighting logic here
      setSearchWord(q as string);
    }
  }, [q]);

  //for practice modal
  const [modalVisible, setModalVisible] = useState(false);

  // ************ Fetch & refetch lesson data from Firestore ************
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        //see if already cached
        const cachedLesson = await AsyncStorage.getItem(`book1_lesson_${id}`);
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
      //TODO: query lesson with id from server
      //fetch from server
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/mainLessons/${id}`);

      const lesson: Lesson = await response.data;

      setLesson(lesson);
      //   //cache the lesson
        await AsyncStorage.setItem(
          `book1_lesson_${id}`,
          JSON.stringify(lesson)
        );

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
    await AsyncStorage.removeItem(`book1_lesson_${id}`);
    await refetchLessons();
  };

  if (loading) {
    return <Text className="text-center text-lg">Loading...</Text>;
  }

  if (!lesson) {
    return <Text className="text-center text-lg">Lesson not found</Text>;
  }

  return (
    <ScrollView className="p-6 bg-white ">
      <View className="flex g-3 mb-6">
        <Text className="text-3xl font-bold mb-4">{lesson.title}</Text>

        {lesson.voiceTextFileUrl && (
          <AudioPlayer
            audioUri={lesson.voiceTextFileUrl}
            title="Listen to Text"
            size={32}
          />
        )}
        <TouchableOpacity onPress={handleRefetch}>
          <Text className="pr-2 border-b border-gray-500">
            Refresh <FontAwesomeIcon icon={faArrowsRotate} />
          </Text>
        </TouchableOpacity>
        <View className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <Markdown style={markdownStyles}>{lesson.text}</Markdown>
        </View>
      </View>

      <View className="mb-10">
        {lesson.voiceWordsFileUrl && (
          <AudioPlayer
            audioUri={lesson.voiceWordsFileUrl}
            title="Listen to Words"
            size={32}
          />
        )}
        <TouchableOpacity
          className="bg-blue-400 items-center m-5"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-2xl pr-2 border-b border-gray-500">
            Go To Practice <FontAwesomeIcon icon={faHandPointRight} size={24} />
          </Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)} // Close modal on back button
        >
          <View style={styles.modalBackground}>
            {/* Modal Content */}
            <View style={styles.modalContent}>
              <FlipCard wordList={lesson.Words} modalMode={true} />

              {/* Button to close modal */}
              <TouchableOpacity
                className="bg-black m-10 p-4 rounded-lg mt-5 items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white text-lg">CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View className="flex gap-2">
          {lesson.Words.map((word, index) => (
            <View
              className="flex flex-row items-baseline gap-1 border-dotted border-b border-gray-300 pr-2"
              key={index.toString()}
            >
              <Text
                className={
                  searchWord && word.word === searchWord
                    ? "bg-yellow-400 text-xl text-black"
                    : "text-xl text-black"
                }
              >
                {word.word}
              </Text>
              {word.phonetic && (
                <Text className="text-base text-gray-500">
                  ({word.phonetic})
                </Text>
              )}
              {/* {word.audioUrl && (
                <AudioPlayer audioUri={word.audioUrl} title="" size={16} />
              )} */}
              <Text
                className="pl-2 text-base text-gray-800"
                style={{ flex: 1 }}
              >
                {word.meaning}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// Define markdownStyles as an object for styling different elements in Markdown
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 10,
  },
};

const styles = {
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background (50% opacity)
  },
  modalContent: {
    width: "90%",
    height: "70%",
    backgroundColor: "white",
    padding: 5,
    borderRadius: 10,
    elevation: 5, // For shadow on Android
  },
};

export default LessonPage;
