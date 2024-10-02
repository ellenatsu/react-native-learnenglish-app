import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import { create } from 'zustand';
import { useUserStore } from '@/store/useUserStore';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { register } = useUserStore();

  const handleSignUp = async () => {
    if (!email || !password || !name ) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      await register(email, password, name);
      router.push('/home'); // Redirect to Home on successful signup
    } catch (error) {
      Alert.alert('Signup Failed An error occurred.');
    }
  };

  return (
    <View className='flex p-5 align-center gap-3'>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        keyboardType="email-address"
        autoCapitalize="none"
        className='p-3 text-xl mb-3'
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className='p-3 text-xl mb-3'
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className='p-3 text-xl mb-3'
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      {error ? <Text>{error}</Text> : null}
      <TouchableOpacity
          className="p-2 "
          onPress={() => router.push('/auth/login')}
        >
            <Text className='text-xl'>Go Sign In</Text>
        </TouchableOpacity>
    </View>
  );
};

export default SignUp;
