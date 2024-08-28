import React, { useState, useEffect } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { Audio } from "expo-av";
import Markdown from "react-native-markdown-display";
import { DictWord } from "@/types/types";

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
    const words = (lesson?.words as Array<string>);
    useEffect(() => {
      const fetchAndCacheWordDetails = async () => {
        const details : DictWord[] = [];
        //for not found
        const notFoundWords: string[] = [];
        for (const word of words) {
          //TODO: add caching
          // const cachedDetail = storage.getString(word);
          // if (cachedDetail) {
          //   // Use cached detail if available
          //   details[word] = JSON.parse(cachedDetail);
          // } else {
            // Fetch from Firestore if not cached
            const q = query(collection(db, 'dictionary'), where('word', '==', word));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              // Directly access the first document
              const doc = querySnapshot.docs[0];
              const data = doc.data();              
              details.push({
                word: data.word,
                meaning: data.mean,
                phonetic: data.phonetic_symbol,
              })
  
              // Cache the data in MMKV
              //storage.set(word, JSON.stringify(data));
            } else {
              notFoundWords.push(word);
              console.log(`No document found for word: ${word}`);
            }
          }
          setWordDetails(details);
          setRemainingWords(notFoundWords); 
      };

      if (!lesson || !lesson.words) {
        return; // If no lesson or words are available, exit early
      }
  
      fetchAndCacheWordDetails();
    }, [lesson]);
  


  //to load sound & handle pause/play
  //TODO: change it to AudioPlayer component.
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
        <View className="flex gap-2">
          <Text className="text-xl font-semibold mb-1">Words in CET 4</Text>
          {wordDetails.map((word, index) => (
            <Text className="text-base text-gray-900 p-1" id={index.toString()}>
              {word.word}  ({word.phonetic}):  {word.meaning}
            </Text>
          ))}
          <Text className="text-xl font-semibold mb-1">Rest Words</Text>
          {remainingWords.map((word, index) => (
            <Text key={index} className="text-base text-gray-700">{word}</Text>
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
