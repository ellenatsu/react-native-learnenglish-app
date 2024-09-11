import React, { useState, useEffect } from "react";
import { View, Text, Button, ScrollView, TouchableOpacity } from "react-native";
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
import { fa4, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import AudioPlayer from "@/components/audioplayer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { set } from "date-fns";

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
  const [wordDetails, setWordDetails] = useState<LessonWord[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        //see if already cached
        const cachedLesson = await AsyncStorage.getItem(`lesson_${id}`);
        if (cachedLesson) {
          setLesson(JSON.parse(cachedLesson));
          setLoading(false);
          return;
        }

        refetchLessons();
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
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  //fetch words in dictionary and get better definition
  const words = lesson?.words as Array<string>;

  useEffect(() => {
    const getWordDetails = async () => {
      if (lesson && lesson.words) {
        const details: LessonWord[] = [];

        for (const word of words) {
          //check cache
          const cachedDetail = await AsyncStorage.getItem(`word_${word}`);
          if (cachedDetail) {
            details.push(JSON.parse(cachedDetail));
          } else {
            // Fetch from Firestore if not cached
            refetchWordDetails(word, details);
          }
        }

        setWordDetails(details);
      }
    };

    getWordDetails();
  }, [lesson]);

  const handleRefetch = async () => {
    setWordDetails([]); // Clear previous word details before refetching
    await refetchLessons();

    const updatedLesson = lesson; // Ensure lesson is updated after refetch
    if (!updatedLesson) {
      return;
    }

    const words = updatedLesson.words as Array<string>;
    if (!words) {
      return;
    }

    for (const word of words) {
      refetchWordDetails(word, []);
    }
  };

  const refetchWordDetails = async (word: string, details: LessonWord[]) => {
    try {
      let wordData: LessonWord = {
        word: "",
        meaning: "",
        phonetic: "",
        audioUrl: "",
      };
      const q = query(
        collection(db, "textbook-words"),
        where("word", "==", word)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Directly access the first document
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        wordData = {
          word: data.word,
          meaning: data.meaning,
          phonetic: data.phonetic,
          audioUrl: data.audioUrl,
        } as LessonWord;

        setWordDetails((prevDetails) => [...prevDetails, wordData]);
        await AsyncStorage.setItem(`word_${word}`, JSON.stringify(wordData));
      }
    } catch (error) {
      console.error("Error fetching word details:", error);
    }
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
            title="Text Audio"
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
            title="Word Audio"
            size={32}
          />
        )}
        <View className="flex gap-2">
          {/* TODO: Add practice words button */}
          {/* <TouchableOpacity onPress={()=>{}}>
            <Text className="pr-2 border-b border-gray-500">
              Practice words
            </Text>
          </TouchableOpacity> */}
          {wordDetails.map((word, index) => (
            <View
              className="flex flex-row items-baseline gap-2 border-dotted border-b border-gray-300 p-2"
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

export default LessonPage;
