import React, { useState, useEffect } from "react";
import { View, Text, Button, ScrollView } from "react-native";
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
import { Audio } from "expo-av";
import Markdown from "react-native-markdown-display";
import { DictWord } from "@/types/types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { fa4 } from "@fortawesome/free-solid-svg-icons";
import AudioPlayer from "@/components/audioplayer";

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
  const [wordDetails, setWordDetails] = useState<DictWord[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const docRef = doc(db, "lessons", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const lesson = {
            id: docSnap.id,
            ...docSnap.data(),
          } as Lesson;
          setLesson(lesson);
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
        }
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

  //fetch words in dictionary and get better definition
  const words = lesson?.words as Array<string>;
  useEffect(() => {
    const fetchAndCacheWordDetails = async () => {
      const details: DictWord[] = [];
      //for not found
      for (const word of words) {
        //TODO: add caching
        // const cachedDetail = storage.getString(word);
        // if (cachedDetail) {
        //   // Use cached detail if available
        //   details[word] = JSON.parse(cachedDetail);
        // } else {
        // Fetch from Firestore if not cached
        const q = query(
          collection(db, "dictionary"),
          where("word", "==", word)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Directly access the first document
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          details.push({
            word: data.word,
            meaning: data.mean,
            phonetic: data.phonetic_symbol,
          });
        } else {
          const q = query(collection(db, "words"), where("name", "==", word));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Directly access the first document
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            details.push({
              word: data.name,
              meaning: data.chinese,
              phonetic: "",
            });
          } else {
            console.log("Word not found in dictionary and word: ", word);
          }
        }
        //TODO: Cache the data in MMKV or AsyncStorage
      }

      setWordDetails(details);
    };

    if (!lesson || !lesson.words) {
      return; // If no lesson or words are available, exit early
    }

    fetchAndCacheWordDetails();
  }, [lesson]);


  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  if (loading) {
    return <Text className="text-center text-lg">Loading...</Text>;
  }

  if (!lesson) {
    return <Text className="text-center text-lg">Lesson not found</Text>;
  }

  return (
    <ScrollView className="p-6 bg-white ">
      <View className="flex g-3 mb-6">
        <Text className="text-3xl font-bold mb-4">
          {lesson.title}
        </Text>

        {lesson.voiceTextFileUrl && (
          <AudioPlayer audioUri={lesson.voiceTextFileUrl} title="Text Audio" />
        )}
        <View className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <Markdown style={markdownStyles}>{lesson.text}</Markdown>
        </View>
      </View>

      <View className="mb-10">
        {lesson.voiceWordsFileUrl && (
          <AudioPlayer
            audioUri={lesson.voiceWordsFileUrl}
            title="Word Audio"
          />
        )}
        <View className="flex gap-2">
          {wordDetails.map((word, index) => (
            <View
              className="flex flex-row items-baseline gap-2"
              key={index.toString()}
            >
              <Text className="text-xl text-ellipsis text-black">{word.word}</Text>
              {word.phonetic && (
                  <Text className="text-base text-gray-500">
                    ({word.phonetic})
                    <FontAwesomeIcon icon={fa4} style={{ color: "#d0398a" }} />
                  </Text>
              )}
              <Text className="pl-4 text-base text-gray-800">
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
