import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import Markdown from "react-native-markdown-display";
import { LessonWord } from "@/types/types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  fa4,
  faArrowsRotate,
  faHandPointRight,
} from "@fortawesome/free-solid-svg-icons";
import AudioPlayer from "@/components/audioplayer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { set } from "date-fns";
import { useWordStore } from "@/store/useWordStore";
import FlipCard from "@/components/flipcard";

interface Lesson {
  id: string;
  title: string;
  text: string;
  words: string[];
  voiceTextFileUrl: string;
  voiceWordsFileUrl: string;
}

const LessonPage: React.FC = () => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const { words, fetchWords } = useWordStore();
  const [lessonWordsList, setLessonWordsList] = useState<LessonWord[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useLocalSearchParams();

  //for practice modal
  const [modalVisible, setModalVisible] = useState(false);

  // ************ Fetch & refetch lesson data from Firestore ************
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        //see if already cached
        const cachedLesson = await AsyncStorage.getItem(`lesson_${id}`);
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
      const docRef = doc(db, "lessons", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const lesson = {
          id: docSnap.id,
          ...docSnap.data(),
        } as Lesson;
        setLesson(lesson);
        //cache the lesson
        await AsyncStorage.setItem(`lesson_${id}`, JSON.stringify(lesson));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such lesson document!");
      }
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
        {/* TODO: Add practice words button */}
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
        onRequestClose={() => setModalVisible(false)}  // Close modal on back button
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
              <Text className="text-xl text-black">{word.word}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent background (50% opacity)
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
    elevation: 5,  // For shadow on Android
  },
};

export default LessonPage;
