import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      <Stack.Screen name="lesson/[id]" options={{ title: 'Lesson Details' }} />
    </Stack>
  );
}
