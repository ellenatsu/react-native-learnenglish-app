import { useWordStore } from "@/store/useWordStore";
import { LessonWord } from "@/types/types";
import {
  faCircleXmark,
  faHandPointRight,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { set } from "date-fns";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ToastAndroid,
} from "react-native";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchModal = ({ visible, onClose }: SearchModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<LessonWord>();
  //useWordStore
  const { words, fetchWords } = useWordStore();

  const handleSearch = () => {
    if (words.length === 0) {
      fetchWords();
      ToastAndroid.show("Please search again!", ToastAndroid.SHORT);
    } else {
      //get word from the 1. dictionary, 2.lesson words
      setResult(
        words.find(
          (word) => word.word.toLowerCase() === inputValue.toLowerCase()
        )
      );
    }
  };

  const handleClose = () => {
    setInputValue("");
    setResult(undefined);
    onClose();
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-end bg-transparent">
          <View className="items-end w-full">
            <TouchableOpacity
              className="relative items-center m-2"
              onPress={handleClose}
            >
              <FontAwesomeIcon icon={faCircleXmark} size={36} color="black" />
            </TouchableOpacity>
          </View>

          <View className="bg-indigo-200 bg-opacity-10 w-full h-3/5 rounded-t-3xl p-6">
            {/* Input bar and Search Button */}
            <View className="flex-row items-center mb-4">
              <TextInput
                className="flex-1 border bg-gray-100 rounded-lg p-3 text-lg"
                placeholder="Search..."
                value={inputValue}
                onChangeText={(e) => {
                  setInputValue(e);
                }}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
              />
              {/* <TouchableOpacity
                className="ml-2 p-3 bg-gray-500 rounded-lg"
                onPress={handleSearch}
              >
                <FontAwesomeIcon icon={faSearch} color="white" size={24} />
              </TouchableOpacity> */}
            </View>

            {/* Search Result Section */}
            {result ? (
              <View className="flex flex-column gap-2">
                <Text className="text-xl font-semibold">{result.word}</Text>


                <Text className="text-lg text-gray-600">
                  {result.phonetic}
                  {""}
                  {result.meaning}
                </Text>
                <View className="flex flex-row gap-2">
                  <Text className="text-xl">
                    Learned at Lesson {result.ref}
                  </Text>
                  <TouchableOpacity
                    className="bg-blue-400 rounded-lg p-2"
                    onPress={() => {
                      router.replace({
                        pathname: `/lesson/english/${result.ref}`,
                        params: {q: result.word}
                      });
                      handleClose();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHandPointRight}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                {/* //TODO: Add more search features, show search history, search sentences, etc. */}
              </View>
            ) : (
              <Text className="text-gray-500 mt-4">No results found</Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SearchModal;
