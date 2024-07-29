import React, { useState } from 'react';
import { QACard } from './QACard';
import { Button } from '@/components/ui/button';

interface QuizModeProps {
  qaPairs: { question: string; answer: string }[];
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
    <div className="space-y-4">
      <div className="text-xl font-bold">
        Question {currentIndex + 1} of {qaPairs.length}
      </div>
      <div className="text-lg font-semibold">Score: {score}</div>
      <QACard
        question={qaPairs[currentIndex].question}
        answer={qaPairs[currentIndex].answer}
        showAnswer={showAnswer}
      />
      <div className="flex space-x-2">
        <Button onClick={handlePrevious}>Previous</Button>
        <Button onClick={handleNext}>Next</Button>
        {!showAnswer && <Button onClick={handleShowAnswer}>Show Answer</Button>}
      </div>
      {showAnswer && (
        <div className="flex space-x-2">
          <Button onClick={() => handleScore(true)} className="bg-green-500 hover:bg-green-600">
            Correct
          </Button>
          <Button onClick={() => handleScore(false)} className="bg-red-500 hover:bg-red-600">
            Incorrect
          </Button>
        </div>
      )}
    </div>
  );
}