import { Stack,  useNavigationContainerRef } from "expo-router";
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  dsn: 'https://77f202d010891721a3bc6d0fcab98995@o4507947449909248.ingest.us.sentry.io/4507947452071936',
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
export default Sentry.wrap(RootLayout);