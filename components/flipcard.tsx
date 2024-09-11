import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { collection, doc, getDocs, query, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { LessonWord } from "@/types/types";
import { useRouter } from "expo-router";
import { getLocalDate } from "@/utils/date";
import AudioPlayer from "./audioplayer";
import { useUserStore } from "@/store/useUserStore";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface FlipCardProps {
  wordList: LessonWord[];
}

//pass to flipcard component: words list and user id
//in this component:
//retrieve words and meaning from words collection.
//update bookmark status in users collection.

const FlipCard = ({ wordList } : FlipCardProps) => {
  //params
  const { userData, updateBookmarkedWords, updatePracticedDates } =
    useUserStore();
  const bookmarkedWords = userData?.bookmarkedWords || [];
  //flipcard
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  //practice finished?
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const router = useRouter();

  //handle finish and upload practice data
  const handleFinish = async () => {
    setPracticeCompleted(true); // Mark practice as completed

    const today = getLocalDate();

    if (!userData) {
      console.error("User data not found");
      return;
    }
    //update practiced dates
    updatePracticedDates(today);
    console.log("Practice data updated successfully");

    // Redirect to finish page
    router.push("/practice/finish");
  };

  //handle flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  //handle next/previous
  const length = wordList.length;

  //last one need to go finish the practice
  const handleNext = () => {
    if (currentWordIndex === length - 1) {
      handleFinish();
    } else {
      setIsFlipped(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % length);
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentWordIndex((prevIndex) => (prevIndex - 1 + length) % length);
  };

  const currentWord = wordList[currentWordIndex];

  if (length === 0) {
    return <Text className="text-3xl m-10">No words found</Text>;
  }

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <View className="flex flex-row justify-between mb-3">
        <Text className="text-xl p-2">
          {currentWordIndex + 1} / {length}
        </Text>
        <TouchableOpacity
          className="p-2 "
          onPress={() => updateBookmarkedWords(currentWord.word)}
        >
          <FontAwesomeIcon
            icon={faStar}
            size={36}
            color={
              bookmarkedWords.find((word) => word === currentWord.word)
                ? "gold"
                : "gray"
            }
          />
        </TouchableOpacity>
      </View>
      <View className="mb-6">
        <TouchableOpacity
          className="bg-gray-200 p-6 rounded-lg w-64 h-64 justify-center items-center"
          onPress={toggleFlip}
        >
          {isFlipped ? (
            <View>
              <View className="flex flex-row bg-white p-2">
                <Text className="text-3xl font-bold text-center">
                  {currentWord.word}
                </Text>
                {currentWord.audioUrl && (
                  <AudioPlayer
                    audioUri={currentWord.audioUrl}
                    title=""
                    size={24}
                    mode="short"
                  />
                )}
              </View>

              {currentWord.phonetic && (
                <Text className="text-xl text-center">
                  {currentWord.phonetic}
                </Text>
              )}
              <Text className="text-xl text-center">{currentWord.meaning}</Text>
            </View>
          ) : (
            <View>
              <Text className="text-3xl font-bold text-center">
                {currentWord.word}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between w-full px-10">
        <TouchableOpacity
          className="bg-gray-100 p-4 rounded-lg"
          onPress={handlePrevious}
          disabled={currentWordIndex === 0}
        >
          <Text
            className={`${
              currentWordIndex === 0
                ? "text-white text-lg"
                : "text-black text-lg"
            }`}
          >
            Previous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 p-4 rounded-lg"
          onPress={handleNext}
        >
          <Text className="text-black text-lg">
            {currentWordIndex === length - 1 ? "Finish" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FlipCard;
