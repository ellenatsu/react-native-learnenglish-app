import { Stack } from "expo-router";


export default function RootLayout() {
  return (

      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="lesson/[id]"
          options={({ route }) => ({ title: `Lesson ${(route.params as { id: string })?.id}` })}
        />

        <Stack.Screen name="auth/login" options={{ title: "Login" }} />
        <Stack.Screen name="auth/signup" options={{ title: "Signup" }} />

        <Stack.Screen
          name="practice/flipcard-practice"
          options={{ title: "FlipCard Practice" }}
        />
        <Stack.Screen name="practice/finish" options={{ title: "Congrats!" }} />

        <Stack.Screen
          name="profile/bookmark"
          options={{ title: "Bookmarked Words" }}
        />
        <Stack.Screen
          name="profile/allwords"
          options={{ title: "All Words" }}
        />
      </Stack>

  );
}
