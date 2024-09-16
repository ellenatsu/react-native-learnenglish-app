// app/(tabs)/textbook/index.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const textbooks = [
  { id: "book1", name: "New Concept English 1" },
  { id: "book2", name: "Basic English Gramma" },
  // Add more textbooks
];

export default function TextbookList() {
  const router = useRouter();

  return (
    <View>
      {textbooks.map((textbook) => (
        <TouchableOpacity
          key={textbook.id}
          onPress={() => router.push(`/textbook/${textbook.id}`)}
        >
          <Text>{textbook.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
