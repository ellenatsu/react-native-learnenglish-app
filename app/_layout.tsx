import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="lesson/[id]" options={{ title: 'Lesson Details' }} />

      <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
      <Stack.Screen name="auth/signup" options={{ title: 'Signup' }} />

      <Stack.Screen name="practice/daily" options={{ title: 'Daily Practice' }} />
      <Stack.Screen name="practice/marked-words" options={{ title: 'Marked Words Practice' }} />
      <Stack.Screen name="practice/all-words" options={{ title: 'All Words Practice' }} />
      <Stack.Screen name="practice/finish" options={{ title: 'Congrats!' }} />

      <Stack.Screen name="profile/bookmark" options={{ title: 'Bookmarked Words' }} />
    </Stack>
  );
}
