import React from 'react'
import FlipCard from '@/components/flipcard';
import { LessonWord } from '@/types/types';

interface LessonPracticePageProps {
    wordList: LessonWord[];
}
const LessonPracticePage = ({wordList} : LessonPracticePageProps) => {
    return <FlipCard wordList={wordList} />;
}

export default LessonPracticePage