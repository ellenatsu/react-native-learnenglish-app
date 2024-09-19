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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWordStore } from "@/store/useWordStore";
import FlipCard from "@/components/flipcard";
import { useLessonsStore } from "@/store/useLessonsStore";
import { Lesson } from "@/types/types";

const LessonPage: React.FC = () => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const { words, fetchWords } = useWordStore();
  const [lessonWordsList, setLessonWordsList] = useState<LessonWord[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const { id, q } = useLocalSearchParams();
  const [searchWord, setSearchWord] = useState<string>("");

  //for local lessons.
  const {  engLessons } = useLessonsStore();

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
      //force to fetch from database
      //load data from json
      const curLesson = engLessons ? engLessons.find((l) => l.id === id) : null;
      if (curLesson) {
        setLesson(curLesson);
      } else {
        setLesson(null);
      }
                    
        //cache the lesson
        await AsyncStorage.setItem(
          `book1_lesson_${id}`,
          JSON.stringify(curLesson)
        );
      
    } catch (error) {
      console.error("Error refetching lesson:", error);
    }
  };

  // ************ build words list with details from words store  ************
  useEffect(() => {
    if (lesson) {
      buildLessonWordsList(); // Build the words list once the lesson is set
    }
  }, [lesson, words]);
  //fetch words in dictionary and get better definition
  const buildLessonWordsList = async () => {
    if (!lesson) {
      return;
    }

    if (!words || words.length === 0) {
      console.error("No words available in the store, start fetching....");
      fetchWords();
      return;
    }

    const cachedLessonWords = await AsyncStorage.getItem(
      `lessonWords_${lesson.id}`
    );

    // If lesson words are already cached, use them
    if (cachedLessonWords) {
      setLessonWordsList(JSON.parse(cachedLessonWords));
      return;
    }

    const lessonWords = lesson.words;
    const lessonWordsList: LessonWord[] = [];

    lessonWords.forEach((word) => {
      const wordDetails = words.find((w) => w.word === word);
      if (wordDetails) {
        lessonWordsList.push(wordDetails);
      }
    });

    // Cache the lessonWordsList after building it
    if (lessonWordsList.length > 0) {
      await AsyncStorage.setItem(
        `lessonWords_${lesson.id}`,
        JSON.stringify(lessonWordsList)
      );
    }

    setLessonWordsList(lessonWordsList);
  };

  // ************ Handle refetching lesson data ********
  const handleRefetch = async () => {
    if (!lesson) {
      return;
    }
    //clear cache and list before refetch
    setLessonWordsList([]);
    await AsyncStorage.removeItem(`lessonWords_${lesson.id}`);
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
              <FlipCard wordList={lessonWordsList} modalMode={true} />

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
          {lessonWordsList.map((word, index) => (
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
