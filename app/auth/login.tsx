import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';

import { router } from 'expo-router';




const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
     //TODO: post login to backend server
  };

  return (
    <View className='flex p-5 align-center gap-3'>
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
      <Button title="Login" onPress={handleLogin} />
      {error ? <Text>{error}</Text> : null}
      <TouchableOpacity
          className="p-3 text-xl mb-3"
          onPress={() => router.push('/auth/signup')}
        >
            <Text className='text-xl'>Don't have an account? Sign up</Text>
        </TouchableOpacity>
    </View>
  );
};

export default LoginPage;
