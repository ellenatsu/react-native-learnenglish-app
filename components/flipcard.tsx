import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button } from "react-native";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { db } from "@/utils/firebase/firebase";

interface Word {
  id: string;
  name: string;
  chinese: string;
  english: string;
  bookmarked: boolean;
}

interface FlipCardPracticeProps {
    numWords: number | 'all';
    markedOnly?: boolean;
}

const FlipCardPractice: React.FC<FlipCardPracticeProps> = ({ numWords, markedOnly = false }) => {
  //params
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  //handle mode
  const shuffleAndPick = (arr: Word[], num: number) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  //fetch words collection
  useEffect(() => {
    const fetchWords = async () => {
      try {
        let q;

        //apply filter to get bookmarked words only
        if(markedOnly){
            q = query(collection(db, "words"), where("bookmarked", "==", true));
        }else{
            q = query(collection(db, "words"));
        }
        const querySnapshot = await getDocs(q);

        //if bookmarked words is null
        if (querySnapshot.empty) {
          setWords([]);
          return;
        }

        //apply numbers on words to show in flipcard
        let wordsList = querySnapshot.docs.map((doc) => ({
          id: doc.id as string,
          ...doc.data(),
        })) as Word[];

        if (numWords !== 'all') {
            wordsList = shuffleAndPick(wordsList, numWords);
        }
        setWords(wordsList);

      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  //handle bookmark
  const toggleBookmark = async (
    wordId: string,
    currentBookmarkStatus: boolean
  ) => {
    const newBookmarkStatus = !currentBookmarkStatus;

    try {
      //update the bookmark status in the database
      const wordRef = doc(db, "words", wordId);
      await updateDoc(wordRef, {
        bookmarked: newBookmarkStatus,
      });

      setWords((prevWords) =>
        prevWords.map((word) =>
          word.id === wordId ? { ...word, bookmarked: newBookmarkStatus } : word
        )
      );
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  //handle flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  //handle next/previous
  const length = words.length;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentWordIndex((prevIndex) => (prevIndex - 1 + length) % length);
  };

  const currentWord = words[currentWordIndex];

  //if loading
  if (loading) {
    return <Text className="text-xl m-10">Loading...</Text>;
  }

  if(length === 0){
    return <Text className="text-3xl m-10">No words found</Text>;
  }


  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <View className="flex flex-row justify-between mb-3">
        <Text className="text-xl p-2">{currentWordIndex + 1} / {length}</Text>
        <TouchableOpacity
          className="p-2 "
          onPress={() => toggleBookmark(currentWord.id, currentWord.bookmarked)}
        >
          <FontAwesomeIcon
            icon={faStar}
            size={36}
            color={currentWord.bookmarked ? "gold" : "gray"}
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
              <Text className="text-xl text-center">{currentWord.chinese}</Text>
              <Text className="text-xl text-center">{currentWord.english}</Text>
            </View>
          ) : (
            <View>
              <Text className="text-3xl font-bold text-center">
                {currentWord.name}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between w-full px-4">
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg"
          onPress={handlePrevious}
        >
          <Text className="text-white text-lg">Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg"
          onPress={handleNext}
        >
          <Text className="text-white text-lg">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FlipCardPractice;
