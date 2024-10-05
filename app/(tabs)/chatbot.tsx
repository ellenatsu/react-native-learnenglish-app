import { ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState } from "react";
import { View, Text, Button, TextInput, ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";

interface ChatMessage {
  sender: "user" | "bot";
  content: string;
}

const ChatbotPage = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async (): Promise<void> => {
    if (!userInput.trim()) return; // Prevent sending empty messages

    // Add the user's message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", content: userInput },
    ]);

    //loading phase
    setIsLoading(true);

    try {
      // Send the user's input to the backend AI API
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: userInput }), // Send user input to the backend
      });

      const data = await response.json();

      if (data.success) {
        // Add the AI's response to the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", content: data.aiResult.result },
        ]);
      } else {
        // Handle the error case if the API failed
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "bot",
            content: "Sorry, I could not process your request.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", content: "There was an error connecting to the AI." },
      ]);
    } finally {
      setIsLoading(false); // Set loading back to false when done
      setUserInput(""); // Clear the input field
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined} // Adjust behavior for iOS vs Android
      style={{ flex: 1 }}
    >
      <View className="flex-1 p-4 bg-white">
        <ScrollView className="flex-1 mb-4">
          {messages.map((message, index) => (
            <View
              key={index}
              className={`p-3 rounded-lg my-2 max-w-4/5 ${
                message.sender === "user"
                  ? "self-end bg-blue-500"
                  : "self-start bg-gray-200"
              }`}
            >
              {message.sender === "user" ? (
                <Text
                className={`${
                  message.sender === "user" ? "text-white" : "text-black"
                }`}
              >
                {message.content}
              </Text>

              ) : (
                <Markdown style={markdownStyles}>{message.content}</Markdown>
              )}
              
              
            </View>
          ))}
        </ScrollView>

        <View className="flex-row items-center justify-between py-2 border-t border-gray-300">
          <TextInput
            className="flex-1 h-10 px-3 border border-gray-300 rounded-lg mr-2"
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type your message..."
          />
          {isLoading ? (
            <ActivityIndicator size="small" color="#007bff" /> // Show loading spinner
          ) : (
            <Button title="Send" onPress={sendMessage} />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 10,
  },
};
export default ChatbotPage;
