import { View, Text } from 'react-native'
import React from 'react'

interface UserData {
  uid: string;
  email: string;
  practicedDays: number;
  wordsPracticed: string[]; // Array of word IDs or word strings
  bookmarkedItems: {
    words: string[]; // Array of bookmarked word IDs or word strings
    sentences: string[]; // Array of bookmarked sentence IDs or sentence strings
  };
}



const Profile = () => {
  return (
    <View>
      <Text>Profile page. record all bookmarks: for marked sentence and words, and save notes.</Text>
    </View>
  )
}

export default Profile