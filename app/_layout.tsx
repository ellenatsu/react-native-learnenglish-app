import { Stack } from "expo-router";
import { UserProvider } from "@/hooks/useCustomUserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="lesson/[id]"
          options={{ title: "Lesson Details" }}
        />

        <Stack.Screen name="auth/login" options={{ title: "Login" }} />
        <Stack.Screen name="auth/signup" options={{ title: "Signup" }} />

        <Stack.Screen
          name="practice/daily"
          options={{ title: "Daily Practice" }}
        />
        <Stack.Screen
          name="practice/marked-words"
          options={{ title: "Marked Words Practice" }}
        />
        <Stack.Screen
          name="practice/all-words"
          options={{ title: "All Words Practice" }}
        />
        <Stack.Screen name="practice/finish" options={{ title: "Congrats!" }} />

        <Stack.Screen
          name="profile/bookmark"
          options={{ title: "Bookmarked Words" }}
        />
        <Stack.Screen
          name="profile/practiced-words"
          options={{ title: "Practied All Words" }}
        />
      </Stack>
    </UserProvider>
  );
}
