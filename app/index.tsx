import { Text, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import {Link } from 'expo-router';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center ">
      
      <Link href="/home" className="text-3xl bg-purple-300 p-2">Go to app</Link>
      <StatusBar style="auto" />
    </View>
  );
}
