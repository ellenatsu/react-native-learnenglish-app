import { View, Text } from 'react-native'
import React from 'react'
import { Word } from '@/types/types'

interface WordListProps {
  words: Word[]
}
const WordList = () => {
  return (
    <View>
      <Text>render words</Text>
    </View>
  )
}

export default WordList