import React, { useState } from 'react';
import { QACard } from './QACard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface QuizModeProps {
  qaPairs: Array<{ question: string; answer: string; difficulty?: string; youtubeQuery?: string }>;
}

export function QuizMode({ qaPairs }: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % qaPairs.length);
    setShowAnswer(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + qaPairs.length) % qaPairs.length);
    setShowAnswer(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleScore = (correct: boolean) => {
    if (correct) {
      setScore((prevScore) => prevScore + 1);
    }
    handleNext();
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-xl font-bold text-white mb-2"
        animate={{ 
          textShadow: ['0 0 4px #fff', '0 0 8px #fff', '0 0 4px #fff'],
          transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
        }}
      >
        Question {currentIndex + 1} of {qaPairs.length}
      </motion.div>
      <motion.div 
        className="text-lg font-semibold text-green-400 mb-4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        Score: {score}
      </motion.div>
      <QACard
        question={qaPairs[currentIndex].question}
        answer={qaPairs[currentIndex].answer}
        showAnswer={showAnswer}
        difficulty={qaPairs[currentIndex].difficulty}
        youtubeQuery={qaPairs[currentIndex].youtubeQuery}
      />
      <div className="flex space-x-2">
        <Button onClick={handlePrevious} className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">Previous</Button>
        <Button onClick={handleNext} className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">Next</Button>
        {!showAnswer && (
          <Button onClick={handleShowAnswer} className="bg-purple-500 hover:bg-purple-600 transition-all duration-300 transform hover:scale-105">
            Show Answer
          </Button>
        )}
      </div>
      {showAnswer && (
        <motion.div 
          className="flex space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button onClick={() => handleScore(true)} className="bg-green-500 hover:bg-green-600 transition-all duration-300 transform hover:scale-105">
            Correct
          </Button>
          <Button onClick={() => handleScore(false)} className="bg-red-500 hover:bg-red-600 transition-all duration-300 transform hover:scale-105">
            Incorrect
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}