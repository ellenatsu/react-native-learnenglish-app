// app/(tabs)/textbook/index.tsx
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

const textbooks = [
  { id: "english", name: "New Concept English 1", label: "新概念英语" },
  { id: "grammar", name: "Basic English Gramma", label: "英语基础语法" },
  // Add more textbooks
];

export default function TextbookList() {
  const router = useRouter();

  return (
    <ScrollView className="p-4">
      <View className="flex flex-row flex-wrap gap-3 ">
        {textbooks.map((book) => (
          <TouchableOpacity
            key={book.id}
            onPress={() => router.push(`/textbook/${book.id}`)}
            className="bg-blue-300 rounded-lg shadow-md shadow-blue-700 p-6 m-3 w-[40%]" // 45% width to have two items per row
          >
            <View className="flex justify-center items-center h-40">
              {/* This could be a placeholder for the book cover image */}
              <Text className="text-xl font-bold text-center">
                {book.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
