import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const PracticePage: React.FC = () => {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      
      <TouchableOpacity
        className="bg-blue-500 p-6 mb-6 rounded-lg w-3/4"
        onPress={() => router.push('/practice/daily')}
      >
        <Text className="text-white text-3xl text-center">Daily Practice</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-red-500 p-6 mb-6 rounded-lg w-3/4"
        onPress={() => router.push('/practice/marked-words')}
      >
        <Text className="text-white text-3xl text-center">Marked Words Practice</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-green-500 p-6 rounded-lg w-3/4"
        onPress={() => router.push('/practice/all-words')}
      >
        <Text className="text-white text-3xl text-center">All Words Practice</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PracticePage;
