import { Stack, useNavigationContainerRef } from "expo-router";
import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import { TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchModal from "@/components/searchmodal";

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

  //for global modal
  const [isModalVisible, setModalVisible] = useState(false);
  const handleSearch = () => {
    setModalVisible(true); // Open the modal when the search icon is clicked
  };

  const handleModalClose = () => {
    setModalVisible(false); // Close the modal
  };

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <>
      <Stack
        screenOptions={{
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={handleSearch}
            >
              <FontAwesomeIcon icon={faSearch} size={24} color="black" />
            </TouchableOpacity>
          ),
          // Other header options (optional)
          headerStyle: {
            backgroundColor: "#fff", // Customize your header style here
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
\

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
        <Stack.Screen
          name="profile/allwords"
          options={{ title: "All Words" }}
        />

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
            title: `Lesson ${(route.params as { id: string })?.id}`,
          })}
        />
        <Stack.Screen
          name="lesson/grammar/[id]"
          options={({ route }) => ({
            title: `Grammar Lesson ${(route.params as { id: string })?.id}`,
          })}
        />
      </Stack>

      {/* Render the global SearchModal */}
      <SearchModal visible={isModalVisible} onClose={handleModalClose} />
    </>
  );
}
export default Sentry.wrap(RootLayout);
