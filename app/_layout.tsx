import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      <Stack.Screen name="lesson/[id]" options={{ title: 'Lesson Details' }} />
      <Stack.Screen name="practice/daily" options={{ title: 'Daily Practice' }} />
      <Stack.Screen name="practice/marked-words" options={{ title: 'Marked Words Practice' }} />
      <Stack.Screen name="practice/all-words" options={{ title: 'All Words Practice' }} />
    </Stack>
  );
}
