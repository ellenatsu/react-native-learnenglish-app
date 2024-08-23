import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Button } from "react-native";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { getAuth } from "firebase/auth";
import { db } from "@/utils/firebase/firebase";
import { UserData, Word } from "@/types/types";
import { router, useRouter } from "expo-router";
import { getLocalDate } from "@/utils/date";

interface FlipCardProps {
  mode: "all-words" | "daily" | "marked-words";
}

//pass to flipcard component: words list and user id
//in this component:
//retrieve words and meaning from words collection.
//update bookmark status in users collection.

const FlipCard: React.FC<FlipCardProps> = ({ mode }) => {
  const user = getAuth().currentUser;
  //params
  const [userData, setUserData] = useState<UserData | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  //for bookmarked words
  const [bookmarkedWords, setBookmarkedWords] = useState<Word[]>([]);
  const bookmarkedWordsRef = useRef<Word[]>(bookmarkedWords); // Ref to keep track of bookmarked words
  const [loading, setLoading] = useState<boolean>(true);
  //flipcard
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  //practice finished?
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const router = useRouter();

  //get user data
  useEffect(() => {
    // Reset state on mode change
    setCurrentWordIndex(0);
    setIsFlipped(false);

    const fetchUser = async () => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const querySnapshot = await getDocs(q);
        //if cannot find user data
        if (querySnapshot.empty) {
          console.log("No user data found");
        }

        const userdoc = querySnapshot.docs[0];
        const fetchedUserData = {
          id: userdoc.id as string,
          ...userdoc.data(),
        } as UserData;

        //set bookmarked words
        setUserData(fetchedUserData);
        setBookmarkedWords(fetchedUserData.bookmarkedItems.words || []);
        bookmarkedWordsRef.current =
          fetchedUserData.bookmarkedItems.words || [];

        //set practiced words
        // Set words based on mode
        if (mode === "marked-words") {
          setWords(fetchedUserData.bookmarkedItems.words || []);
        } else {
          await fetchWords(mode); // Fetch words based on the mode
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user, mode]);

  //fetch words collection
  const fetchWords = async (mode: string) => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "words")));
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

      if (mode === "daily") {
        wordsList = shuffleAndPick(wordsList, 10);
      }
      setWords(wordsList);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  //handle mode
  const shuffleAndPick = (arr: Word[], num: number) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  //handle bookmark status
  const toggleBookmark = async (currentWord: Word) => {
    if (!userData) {
      console.error("User data not found");
      return;
    }
    try {
      //use ref to keep track, because useState set is async.
      let updatedBookmarkedWords;
      if (
        bookmarkedWordsRef.current.find((word) => word.id === currentWord.id)
      ) {
        updatedBookmarkedWords = bookmarkedWordsRef.current.filter(
          (word) => word.id !== currentWord.id
        );
      } else {
        updatedBookmarkedWords = [...bookmarkedWordsRef.current, currentWord];
      }

      // Update the ref and state
      bookmarkedWordsRef.current = updatedBookmarkedWords;
      setBookmarkedWords(updatedBookmarkedWords);

      // Update Firestore database with new bookmarked words
      const userRef = doc(db, "users", userData.id);
      await updateDoc(userRef, {
        "bookmarkedItems.words": updatedBookmarkedWords,
      });

      console.log("Bookmark updated successfully", updatedBookmarkedWords);
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  //handle finish and upload practice data
  const handleFinish = async () => {
    setPracticeCompleted(true); // Mark practice as completed

    const today = getLocalDate();
    const combinedWordsSet = new Set([
      ...(userData?.wordsPracticed || []), // Original wordsPracticed array
      ...words, // New words practiced in this session
    ]);
    const combinedWordsArray = Array.from(combinedWordsSet);
    const combinedDate = new Set([
      ...(userData?.practicedDates || []),
      today, //
    ]);
    const combinedDates = Array.from(combinedDate);

    if (!userData) {
      console.error("User data not found");
      return;
    }
    try {
      // Update user's practiced dates and words
      const userRef = doc(db, "users", userData.id);
      await updateDoc(userRef, {
        practicedDates: combinedDates,
        wordsPracticed: combinedWordsArray,
      });

      console.log("Practice data updated successfully");

      // Redirect to finish page
      router.push("/practice/finish");
    } catch (error) {
      console.error("Error updating practice data:", error);
    }
  };

  //handle flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  //handle next/previous
  const length = words.length;

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

  const currentWord = words[currentWordIndex];

  //if loading
  if (loading) {
    return <Text className="text-xl m-10">Loading...</Text>;
  }

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
          onPress={() => toggleBookmark(currentWord)}
        >
          <FontAwesomeIcon
            icon={faStar}
            size={36}
            color={
              bookmarkedWords.find((word) => word === currentWord)
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
              <Text className="text-xl text-center">{currentWord.chinese}</Text>
              {currentWord.english && (
                <Text className="text-xl text-center">
                  {currentWord.english}
                </Text>
              )}
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
