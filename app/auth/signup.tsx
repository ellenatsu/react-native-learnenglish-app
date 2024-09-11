import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/utils/firebase/firebase';
import { create } from 'zustand';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Navigate to the main part of the app or show success message
      const user = userCredential.user;
      //create user in database
      try {
        await addDoc(collection(db, 'users'), {
            uid: user.uid,
            name: name,
            email: user.email,
            practicedDates: [],
            bookmarkedWords: [],
            createdNotes: [],
        });
  
        console.log('User saved successfully');

      } catch (error) {
        console.error('Error uploading lesson:', error);
      }
      
      router.push('/home');
    } catch (error) {
        console.log("error sign in", error);
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
