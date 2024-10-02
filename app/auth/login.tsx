import React, { useState } from "react";
import { View, TextInput, Button, Text, TouchableOpacity, Alert } from "react-native";

import { router } from "expo-router";
import { useUserStore } from "@/store/useUserStore";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useUserStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      await login(email, password);
      router.push('/home'); // Redirect to Home on successful login
    } catch (error) {
      Alert.alert("Login Failed, an error occurred.");
    }
  };

  return (
    <View className="flex p-5 align-center gap-3">
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="p-3 text-xl mb-3"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="p-3 text-xl mb-3"
      />
      <Button title="Login" onPress={handleLogin} />
      {error ? <Text>{error}</Text> : null}
      <TouchableOpacity
        className="p-3 text-xl mb-3"
        onPress={() => router.push("/auth/signup")}
      >
        <Text className="text-xl">Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginPage;
