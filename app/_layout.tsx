import { Stack, useNavigationContainerRef } from "expo-router";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  integrations: [
    new Sentry.ReactNativeTracing({
      // Pass instrumentation to be used as `routingInstrumentation`
      routingInstrumentation,
      enableNativeFramesTracking: !isRunningInExpoGo(),
      // ...
    }),
  ],
});

function RootLayout() {
  // Capture the NavigationContainer ref and register it with the instrumentation.
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Authentication Routes */}
      <Stack.Screen name="auth/login" options={{ title: "Login" }} />
      <Stack.Screen name="auth/signup" options={{ title: "Signup" }} />

      {/* Practice */}
      <Stack.Screen
        name="practice/flipcard-practice"
        options={{ title: "FlipCard Practice" }}
      />
      <Stack.Screen name="practice/finish" options={{ title: "Congrats!" }} />

      {/* Profile */}
      <Stack.Screen
        name="profile/bookmark"
        options={{ title: "Bookmarked Words" }}
      />
      <Stack.Screen name="profile/allwords" options={{ title: "All Words" }} />

      {/* Textbook & lesson */}
      <Stack.Screen
        name="textbook/[id]"
        options={({ route }) => ({
          title: `Textbook ${(route.params as { id: string })?.id}`,
        })}
      />
      <Stack.Screen
        name="lesson/english/[id]"
        options={({ route }) => ({
          title: `Textbook lesson ${(route.params as { id: string })?.id}`,
        })}
      />
      <Stack.Screen
        name="lesson/grammar/[id]"
        options={({ route }) => ({
          title: `Grammar lesson ${(route.params as { id: string })?.id}`,
        })}
      />
    </Stack>
  );
}
export default Sentry.wrap(RootLayout);
