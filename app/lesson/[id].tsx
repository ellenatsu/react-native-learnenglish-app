import React, { useState, useEffect } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { Audio } from "expo-av";
import Markdown from "react-native-markdown-display";

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

  //to load sound & handle pause/play
  const handlePlayPause = async (url: string) => {
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      if (sound) {
        await sound.playAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
        setSound(newSound);
        await newSound.playAsync();
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  //deal with words
  const words = (lesson?.words as Array<string>) || "No words found";

  if (loading) {
    return <Text className="text-center text-lg">Loading...</Text>;
  }

  if (!lesson) {
    return <Text className="text-center text-lg">Lesson not found</Text>;
  }

  return (
    <ScrollView className="p-6 bg-white">
      <View className="mb-6">
        <Text className="text-3xl font-bold mb-4">Lesson.{lesson.id} {lesson.title}</Text>

        {lesson.voiceTextFileUrl && (
          <View className="mb-3 flex flex-row justify-between">
            <Text className="text-xl font-semibold">Listen to Text:</Text>

            <Button
              title={isPlaying ? "Pause Text Audio" : "Play Text Audio"}
              onPress={() => handlePlayPause(lesson.voiceTextFileUrl)}
            />
          </View>
        )}
        <View className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <Markdown style={markdownStyles}>{lesson.text}</Markdown>
        </View>
      </View>

      {lesson.voiceWordsFileUrl && (
        <View className="mb-3 flex flex-row justify-between">
          <Text className="text-xl font-semibold">Listen to Words:</Text>

          <Button
            title={isPlaying ? "Pause Words Audio" : "Play Words Audio"}
            onPress={() => handlePlayPause(lesson.voiceWordsFileUrl)}
          />
        </View>
      )}

      <View className="mb-10">
        <Text className="text-xl font-semibold mb-2">Words:</Text>
        <View className="flex gap-2">
          {words.map((word, index) => (
            <Text className="text-base text-gray-700" id={index.toString()}>
              {word}
            </Text>
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
